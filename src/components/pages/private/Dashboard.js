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

  // --- LÓGICA DE FINALIZAÇÃO ---
  if (newStatus === 'FINALIZADO') {
    const confirmar = window.confirm(
      'Ao finalizar o evento:\n' +
      'As fichas serão RESETADAS (deletadas) para serem usadas no próximo evento.\n\n' +
      'Deseja continuar?'
    );
    
    if (!confirmar) return;
  }

  setLoading(true);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const idOrg = session.user.id;

    if (newStatus === 'INICIADO') {
      
      const { data: activeEvent, error: checkError } = await supabase
        .from('Evento')
        .select('id, nome')
        .eq('id_org', idOrg)
        .eq('status', 'INICIADO')
        .maybeSingle(); // Tenta buscar um (e apenas um) evento ativo

      if (checkError) {
        console.error('Erro ao verificar eventos ativos:', checkError);
        throw checkError;
      }

      if (activeEvent) {
        // Se encontrou um evento ativo, bloqueia a ação
        alert(`Erro: O evento "${activeEvent.nome}" (ID: ${activeEvent.id}) já está INICIADO. Você deve finalizá-lo antes de iniciar um novo.`);
        throw new Error('Já existe um evento ativo.');
      }

      const teamToken = crypto.randomUUID();

      const { error } = await supabase
        .from('Evento')
        .update({ 
          status: 'INICIADO',
          team_token: teamToken
        })
        .eq('id', idEvento);

      if (error) throw error;
      setEventos(prevEventos =>
        prevEventos.map(evento => {
          if (evento.id !== idEvento) {
            if (evento.status === 'FINALIZADO') {
                return evento;
            }
            return { ...evento, status: 'CRIADO', team_token: null };
          } else {
            return { ...evento, status: 'INICIADO', team_token: teamToken };
          }
        })
      );
      
    } else if (newStatus === 'FINALIZADO') {
      
      const { error: deleteFichaEventoError } = await supabase
        .from('fichaEvento')
        .delete()
        .eq('id_evento', idEvento);

      if (deleteFichaEventoError) {
        console.error('Erro ao deletar ficha_evento:', deleteFichaEventoError);
        throw deleteFichaEventoError;
      }

      console.log('Fichas do evento resetadas (ficha_evento deletadas)');

      const { error: updateError } = await supabase
        .from('Evento')
        .update({ 
          status: 'FINALIZADO',
          team_token: null
        })
        .eq('id', idEvento);

      if (updateError) {
        console.error('Erro ao desativar evento:', updateError);
        throw updateError;
      }

      setEventos(prevEventos =>
        prevEventos.map(evento => 
          evento.id === idEvento ? { ...evento, status: 'FINALIZADO', team_token: null } : evento
        )
      );

      console.log(`Evento ${idEvento} finalizado com sucesso`);
      alert('Evento finalizado com sucesso!\n✅ Fichas resetadas\n✅ Dados do relatório mantidos (Recarga, Compra)');
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