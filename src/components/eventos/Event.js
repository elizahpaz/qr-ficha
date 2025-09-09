import styles from './Event.module.css';

import defaultImage from '../../assets/dafault-event.jpg';

function Event({ coverImage, name, buttonText1, buttonText2 }) {
  const imageToDisplay = coverImage || defaultImage;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={imageToDisplay} alt={`Capa do evento ${name}`} className={styles.coverImage} />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.eventName}>{name}</h3>
        <div className={styles.buttonContainer}>
          <button className={styles.button}>{buttonText1}</button>
          <button className={`${styles.button} ${styles.secondaryButton}`}>{buttonText2}</button>
        </div>
      </div>
    </div>
  );
}

export default Event;