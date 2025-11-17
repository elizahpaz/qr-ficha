import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Event.module.css';
import { supabase } from './../../database/supabaseClient';

const Event = ({ evento, onUpdateStatus, onEventDeleted }) => {

  const eventUrl = `${window.location.origin}/team-view/${evento.team_token}`;
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


const handleDelete = async (eventId) => {
  if (!window.confirm("ATENÇÃO: Você tem certeza que deseja deletar este evento? Esta ação é irreversível e excluirá todos os dados relacionados (fichas, transações, etc.)")) {
    return;
  }

  try {
    const { error: eventError } = await supabase
      .from('Evento')
      .delete()
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Erro ao deletar o Evento:', eventError);
      throw eventError;
    }

    onEventDeleted(eventId);
    
    alert(`Evento ${eventId} deletado com sucesso. Todos os dados relacionados foram limpos.`);

  } catch (error) {
    console.error('Falha na deleção do evento:', error);
    setError(`Erro ao deletar o evento: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }).catch(err => {
      console.error('Falha ao copiar o link: ', err);
      alert('Falha ao copiar o link.');
    });
  };

  const renderActions = () => {
    switch (evento.status) {
      // Estado: CRIADO
      case 'CRIADO':
        return (
          <>
            <button 
              onClick={() => onUpdateStatus(evento.id, 'INICIADO')} 
              className={styles.actionButton}
            >
              Iniciar
            </button>
            <Link to={`/add-itens/${evento.id}`} className={styles.button}>
              Editar
            </Link>
          </>
        );

      // Estado: INICIADO
      case 'INICIADO':
        return (
          <>
            <button 
              onClick={() => onUpdateStatus(evento.id, 'FINALIZADO')} 
              className={styles.actionButton}
            >
              Finalizar
            </button>
            
              <button
                onClick={handleCopyLink}
                className={`${styles.button} ${isCopied ? styles.copySuccess : ''}`}
              >
                {isCopied ? 'Link Copiado!' : 'Copiar Link'}
              </button>
          </>
        );

      // Estado: FINALIZADO
      case 'FINALIZADO':
        return (
          <>
            <button 
              onClick={() => handleDelete(evento.id)}
              className={`${styles.actionButton} ${styles.deleteButton}`}
            >
              Excluir
            </button>
            <Link to={`/relatorio/${evento.id}`} className={styles.button}>
              Relatório
            </Link>
          </>
        );
      default:
        return <p>Status do evento inválido.</p>;
    }
  };

  return (
    <div className={styles.container}>
      <h3>{evento.nome}</h3>
      <div className={styles.actionsContainer}>
        {renderActions()}
      </div>
    </div>
  );
};

export default Event;