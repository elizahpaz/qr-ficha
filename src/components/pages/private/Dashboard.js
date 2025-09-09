import { Link } from "react-router-dom";
import Event from "../../eventos/Event";
import BtnAddEvento from "../../eventos/BtnAddEvento";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/perfil" className={styles.userName}>nome da organização</Link>
      </header>

      <BtnAddEvento />
      <Event />
    </div>
  )
}

export default Dashboard;