import { Link } from 'react-router-dom';
import styles from './Event.module.css';

const Event = ({ evento, onUpdateStatus, onDeleteEvent }) => {
  // URL para a equipe do evento, agora só é relevante se o evento estiver INICIADO
  const eventUrl = `${window.location.origin}/team-view/${evento.team_token}`;

  /**
   * Função para deletar o evento.
   * Você precisará implementar essa lógica no componente pai, 
   * assim como fez com 'onUpdateStatus'.
   */
  const handleDelete = () => {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este evento?\n' +
      'TODOS os dados (relatórios, recargas, compras) serão PERDIDOS PERMANENTEMENTE.\n\n' +
      'Esta ação não pode ser desfeita.'
    );
    
    if (confirmar) {
      // onDeleteEvent(evento.id); // <- Você precisará criar esta função no componente pai
      alert(`Função de deletar (ID: ${evento.id}) ainda não implementada.`);
    }
  };

  /**
   * Renderiza os botões de ação corretos com base no status atual do evento.
   */
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
            
            {/* A ação "Compartilhar" é esta seção de link */}
            <div className={styles.shareSection}>
              <span className={styles.urlText}>
                Link: <a href={eventUrl} target="_blank" rel="noopener noreferrer">{eventUrl}</a>
              </span>
            </div>
          </>
        );

      // Estado: FINALIZADO
      case 'FINALIZADO':
        return (
          <>
            <button 
              onClick={handleDelete} 
              className={`${styles.actionButton} ${styles.deleteButton}`} // Recomendo um estilo customizado para perigo
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