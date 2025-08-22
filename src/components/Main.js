import styles from './Main.module.css'
import Navbar from './Navbar';

export const Main = () => {
  return (
    <div className={styles.container}>
        <Navbar />
    </div>
  )
}

export default Main;