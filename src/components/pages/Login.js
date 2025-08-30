import Logo from '../../assets/logo.png'
import styles from '../form/Form.module.css'
import SubmitButton from '../form/SubmitButton'
import Input from '../form/Input';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className={styles.container}>
        
        <div className={styles.formSection}>
            <div className={styles.logo}>
                <img src={Logo} alt="Logo QR Ficha" />
            </div>
            <h2 className={styles.title}>Entrar</h2>
            <form className={styles.loginForm}>
            <div className={styles.inputGroup}>
                <Input type="email" text="E-mail" name="email"
                placeholder="seuemail@exemplo.com"
                required />
            </div>
            <div className={styles.inputGroup}>
                <Input type="password" text="Senha" name="senha" required />
                <a href="#" className={styles.link}>Esqueci a senha</a>
            </div>
            <SubmitButton text={"Entrar"}/>
            <Link to="/cadastro" className={styles.link}>
          Não tem cadastro? Faça agora!
        </Link>
            </form>
        </div>
    </div>
  )
}

export default Login;