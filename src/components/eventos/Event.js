import { Link } from 'react-router-dom';
import styles from './Event.module.css';

const Event = ({ evento, onUpdateStatus }) => {
  //URL para a equipe da organização /team-view
  const eventUrl = "https://www.exemplo.com.br/evento/" + evento.id;

  const handleButtonClick = () => {
    onUpdateStatus(evento.id, !evento.status);
  };

  return (
    <div className={styles.container}>
      <h3>{evento.nome}</h3>
      
      <button onClick={handleButtonClick}>
        {evento.status ? 'Finalizar' : 'Iniciar'}
      </button>

      {evento.status ? (
        // Se o status for TRUE (iniciado), exibe a URL a ser compartilhada c/ equipe
        <span className={styles.urlText}>
          Link de acesso: <a href={eventUrl} target="_blank" rel="noopener noreferrer">{eventUrl}</a>
        </span>
      ) : (
        // Se o status for FALSE (não iniciado), exibe o Link de Editar
        <Link to={`/add-itens/${evento.id}`} className={styles.button}>
          Editar
        </Link>
      )}
    </div>
  );
};

export default Event;