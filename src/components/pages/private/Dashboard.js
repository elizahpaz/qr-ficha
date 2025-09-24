import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../../../database/supabaseClient';
import Event from "../../eventos/Event";
import BtnAddEvento from "../../eventos/BtnAddEvento";
import styles from "./Dashboard.module.css";
import { IoQrCodeSharp } from "react-icons/io5";

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Nenhum usuário logado ou erro na sessão:', sessionError);
        return;
      }

      const idOrg = session.user.id;

      const { data: orgData } = await supabase
        .from('Organização')
        .select('razao_social')
        .eq('id', idOrg)
        .single();

      if (orgData) {
        setUserName(orgData.razao_social);
      }

      const { data: eventosData, error: eventosError } = await supabase
        .from('Evento')
        .select('*')
        .eq('id_org', idOrg);

      if (eventosError) {
        console.log('Erro ao buscar eventos cadastrados', eventosError);
      } else {
        setEventos(eventosData);
      }
    }

    fetchData();
  }, []);

  const handleUpdateStatus = async (idEvento, newStatus) => {
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const idOrg = session.user.id;

      if (newStatus) {
        // Se está iniciando um evento, primeiro finalizar todos os outros
        await supabase
          .from('Evento')
          .update({ status: false })
          .eq('id_org', idOrg);
      }

      // Atualizar o evento específico
      const { error } = await supabase
        .from('Evento')
        .update({ status: newStatus })
        .eq('id', idEvento);

      if (error) {
        console.log('Erro ao atualizar status do evento', error);
        alert('Erro ao atualizar evento');
        return;
      }

      // Atualizar o estado local
      setEventos(prevEventos =>
        prevEventos.map(evento => {
          if (newStatus && evento.id !== idEvento) {
            // Se está iniciando um evento, desativar todos os outros
            return { ...evento, status: false };
          } else if (evento.id === idEvento) {
            // Atualizar o evento específico
            return { ...evento, status: newStatus };
          }
          return evento;
        })
      );

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar evento');
    } finally {
      setLoading(false);
    }
  };

  const finalizarEvento = async (eventoId) => {
  try {
    // Finalizar evento
    const { error: eventoError } = await supabase
      .from('Evento')
      .update({ status: false })
      .eq('id', eventoId);

    if (eventoError) throw eventoError;

    // Limpar dados temporários das fichas deste evento
    const { error: limparError } = await supabase
      .from('fichaEvento')
      .delete()
      .eq('id_evento', eventoId);

    if (limparError) throw limparError;

    console.log('Evento finalizado e fichas liberadas para reutilização');

  } catch (error) {
    console.error('Erro ao finalizar evento:', error);
  }
};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/perfil" className={styles.userName}>{userName}</Link>
      </header>

      <BtnAddEvento />
  
      {eventos.map(evento => (
        <Event 
          key={evento.id} 
          evento={evento} 
          onUpdateStatus={handleUpdateStatus}
        />
      ))}

      <Link to="/ficha-evento" className={styles.qrCode}><IoQrCodeSharp /></Link>
    </div>
  );
};

export default Dashboard;