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

  // No Dashboard.jsx - Função handleUpdateStatus ATUALIZADA

const handleUpdateStatus = async (idEvento, newStatus) => {
  if (!newStatus) {
    const confirmar = window.confirm(
      'Ao finalizar o evento:\n' +
      '✅ Dados do relatório serão MANTIDOS (itemCompra e Recarga)\n' +
      '❌ Fichas serão RESETADAS (fichaEvento)\n\n' +
      'Deseja continuar?'
    );
    
    if (!confirmar) return;
  }

  setLoading(true);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const idOrg = session.user.id;

    if (newStatus) {
      
      const teamToken = crypto.randomUUID();

      await supabase
        .from('Evento')
        .update({ status: false, team_token: null })
        .eq('id_org', idOrg);

      const { error } = await supabase
        .from('Evento')
        .update({ 
          status: true,
          team_token: teamToken
        })
        .eq('id', idEvento);

      if (error) throw error;

      setEventos(prevEventos =>
        prevEventos.map(evento => {
          if (evento.id !== idEvento) {
            return { ...evento, status: false, team_token: null };
          } else {
            return { ...evento, status: true, team_token: teamToken };
          }
        })
      );

      console.log(`Evento ${idEvento} iniciado com sucesso`);
      
    } else {
      
      console.log('Finalizando evento e mantendo dados do relatório...');
      
      const { error: deleteFichaEventoError } = await supabase
        .from('fichaEvento')
        .delete()
        .eq('id_evento', idEvento);

      if (deleteFichaEventoError) {
        console.error('Erro ao deletar fichaEvento:', deleteFichaEventoError);
        throw deleteFichaEventoError;
      }

      console.log('fichaEvento deletadas - fichas resetadas');

      // Desativar o evento
      const { error: updateError } = await supabase
        .from('Evento')
        .update({ 
          status: false,
          team_token: null
        })
        .eq('id', idEvento);

      if (updateError) {
        console.error('Erro ao desativar evento:', updateError);
        throw updateError;
      }

      setEventos(prevEventos =>
        prevEventos.map(evento => 
          evento.id === idEvento ? { ...evento, status: false, team_token: null } : evento
        )
      );

      console.log(`Evento ${idEvento} finalizado com sucesso`);
      alert('Evento finalizado com sucesso!\n✅ Fichas resetadas\n✅ Dados do relatório mantidos (Recarga, Compra, itemCompra)');
    }

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    alert('Erro ao atualizar evento: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/perfil" className={styles.userName}>{userName}</Link>
      </header>

      <div className={styles.eventList}>
        <BtnAddEvento />

          {eventos.map(evento => (
          <Event 
            key={evento.id} 
            evento={evento} 
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      
      <Link to="/ficha-evento" className={styles.qrCode}><IoQrCodeSharp /></Link>
    </div>
  );
};

export default Dashboard;