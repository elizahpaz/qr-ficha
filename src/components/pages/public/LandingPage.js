import { Link } from 'react-router-dom';
import Funcionamento from './Funcionamento';
import Contact from "./Contact";
import styles from './LandingPage.module.css';
import Navbar from './Navbar';

const LandingPage = () => {
  return (
    <div>
      <div id='home' className={styles.container}>
        <Navbar />

        <div className={styles.bannerContainer}>
          <div className={styles.textContainer}>
            <h1>QR FICHA</h1>
            <p>A solução digital para pagamentos em eventos comunitários!</p>

            <Link to="/cadastro" className={styles.button}>TESTE AGORA</Link>
          </div>
          </div>   
        </div>
        <Funcionamento />
        <Contact />
      <div className={styles.containerFooter}>
        <p className={styles.copy}>&copy; 2025 QR FICHA</p>
      </div>
    </div>
  )
}

export default LandingPage;