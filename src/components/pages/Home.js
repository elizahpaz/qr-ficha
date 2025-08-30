import styles from './Home.module.css'
import Navbar from './Navbar';


const Home = () => {
  return (
    <div id='home' className={styles.container}>
        <Navbar />

        <div className={styles.bannerContainer}>
          <div className={styles.textContainer}>
            <h1>QR FICHA</h1>
            <p>A solução digital para pagamentos em eventos comunitários!</p>

            <button className={styles.button}>TESTE AGORA</button>
        </div>
        </div>   
    </div>
  )
}

export default Home;