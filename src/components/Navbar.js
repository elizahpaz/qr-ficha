import styles from './Navbar.module.css';
import Logo from '../assets/logo.png';
import { FaCommentAlt } from "react-icons/fa";
import { HiHome, HiMiniQuestionMarkCircle } from "react-icons/hi2";
import { RiMessageFill, RiMenuFill, RiCloseLargeFill } from "react-icons/ri";
import { useState } from 'react';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuOpts = [
    {
      text: "Início",
      icon: <HiHome />,
    },
    {
      text: "Como funciona",
      icon: <HiMiniQuestionMarkCircle />,
    },
    {
      text: "Contato",
      icon: <RiMessageFill />,
    },
  ];

  return (
    <nav>
        <div className={styles.logo}>
            <img src={Logo} alt="Logo QR Ficha" />
        </div>

        <div className={styles.links}>
            <a href="#">Início</a>
            <a href="#">Como funciona</a>
            <a href="#">Contato</a>
            <a href="#">< FaCommentAlt /></a>

            <button className={styles.button}>Entrar</button>
        </div>

        <div className={styles.menu}>
          <RiMenuFill onClick={() => setOpenMenu(true)}/>

        </div>

        <RiCloseLargeFill open={openMenu} onClose={() => setOpenMenu(false)} anchor="right" />
    </nav>
  )
}

export default Navbar