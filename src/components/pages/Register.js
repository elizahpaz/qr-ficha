import styles from '../form/Form.module.css';
import Logo from '../../assets/logo.png';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import { Link } from 'react-router-dom';
const Register = () => {
  return (
    <div className={styles.container}>        
        <div className={styles.formSection}>
            <div className={styles.logo}>
                <img src={Logo} alt="Logo QR Ficha" />
            </div>
            <h2 className={styles.title}>Cadastrar</h2>
            <form className={styles.loginForm}>
            <div className={styles.inputGroup}>
                <Input type="text" text="CNPJ" name="cnpj"
                placeholder="00.000.000/000-00"
                required />
                <Input type="text" text="Nome" name="nome"
                required />
                <Input type="email" text="E-mail" name="email" placeholder="seuemail@gmail.com"
                required />
                <Input type="password" text="Senha" name="senha"
                required />
            </div>
            <SubmitButton text={"Cadastrar"}/>
            <Link to="/login" className={styles.link}>Já tem cadastro? Entre na sua conta!</Link>
            </form>
        </div>
        </div>
  )
}

export default Register