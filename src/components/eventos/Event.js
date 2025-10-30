import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Event.module.css';

const Event = ({ evento, onUpdateStatus, onDeleteEvent }) => {

  const eventUrl = `${window.location.origin}/team-view/${evento.team_token}`;
  
  const [isCopied, setIsCopied] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja exluir o evento? O relatório também será excluído.')) {
      alert(`Função de deletar (ID: ${evento.id}) ainda não implementada.`);
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
              onClick={handleDelete} 
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