import Logo from '../assets/logo.png';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <div className={styles.container}>
        <img className={styles.logo} src={Logo} alt="Logo QR Ficha" />
        <p>Política de Privacidade e Termo de Uso</p>
        <p className={styles.copy}>&copy; 2025 QR FICHA</p>
    </div>
  )
}

export default Footer;