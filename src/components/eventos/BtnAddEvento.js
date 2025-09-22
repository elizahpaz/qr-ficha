import { Link } from 'react-router-dom';
import { RiAddLargeFill } from 'react-icons/ri';
import styles from './BtnAddEvento.module.css'; 

const AddEvento = () => {
  return (
    <div className={styles.addEvento}>
      <Link to="/cadastroEvento" className={styles.button}>
        <RiAddLargeFill className={styles.icon} />
      </Link>
      <p className={styles.text}>NOVO EVENTO</p>
    </div>
  )
}

export default AddEvento;