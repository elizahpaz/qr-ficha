import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from '../../../database/supabaseClient';
import Event from "../../eventos/Event";
import BtnAddEvento from "../../eventos/BtnAddEvento";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [eventos, setEventos] = useState([]);


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
        .select ('*')
        .eq ('id_org', idOrg);

      if (eventosError) {
        console.log('Erro ao buscar eventos cadastrados', eventosError);
      } else {
        setEventos(eventosData);
      }
    }

    fetchData();
  }, []);

  const handleUpdateStatus = async(idEvento) => {
    const { error } = await supabase
      .from ('Evento')
      .update ({ status: true })
      .eq ('id', idEvento);

    if (error) {
      console.log('Erro ao iniciar evento', error);
      return;
    }

    setEventos (prevEventos =>
      prevEventos.map(evento =>
        evento.id === idEvento ? { ... evento, status: true } : evento
      )
    );
  }

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
    </div>
  )
}

export default Dashboard;