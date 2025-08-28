import React, { useState } from 'react';
import { FaCommentAlt, FaBars, FaTimes } from 'react-icons/fa';
import styles from './Navbar.module.css';
import Logo from '../assets/logo.png';


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
        
        <a href="#">Início</a>
        <a href="#">Como funciona</a>
        <a href="#">Contato</a>
        <a href="#">< FaCommentAlt /></a>

        <button className={styles.button}>Entrar</button>
      </div>

    </nav>
  )
}

export default Navbar