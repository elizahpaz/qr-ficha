import { Link } from 'react-router-dom';
import styles from './Event.module.css';

const Event = ({ evento, onUpdateStatus }) => {

  // URL para a equipe do evento
  const eventUrl = `${window.location.origin}/team-view/${evento.team_token}`;

  const handleButtonClick = () => {
    if (evento.status) {
      onUpdateStatus(evento.id, false);
    } else {
      onUpdateStatus(evento.id, true);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h3>{evento.nome}</h3>
        
        <button onClick={handleButtonClick} className={styles.actionButton}>
          {evento.status ? 'Finalizar' : 'Iniciar'}
        </button>

        {evento.status ? (
          <div className={styles.shareSection}>
            <span className={styles.urlText}>
              Link: <a href={eventUrl} target="_blank" rel="noopener noreferrer">{eventUrl}</a>
            </span>
          </div>
        ) : (
          <Link to={`/add-itens/${evento.id}`} className={styles.button}>
            Editar
          </Link>
        )}
      </div>
    </>
  );
};

export default Event;