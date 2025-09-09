import styles from './Home.module.css'
import Navbar from './Navbar';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
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
  )
}

export default Home;