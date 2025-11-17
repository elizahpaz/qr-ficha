import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './Navbar.module.css';
import Logo from '../../../assets/logo.png';


const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav>
      <div className={styles.logo}>
        <img src={Logo} alt="Logo QR Ficha" />
      </div>

      <button className={styles.menuButton} onClick={toggleMenu}>
        <FaBars />
      </button>

      <div className={`${styles.links} ${isMenuOpen ? styles.open : ''}`}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          <FaTimes />
        </button>
        
        <a href="#home">Início</a>
        <a href="#funcionamento">Como funciona</a>
        <a href="#contato">Contato</a>

        <Link to="/login" className={styles.button}>
          Entrar
        </Link>
      </div>

    </nav>
  )
}

export default Navbar;