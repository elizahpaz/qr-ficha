import Logo from '../../../assets/logo.png'
import styles from '../../form/Form.module.css'
import SubmitButton from '../../form/SubmitButton'
import Input from '../../form/Input';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../database/authService';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      navigate('/dashboard');

    } catch (err) {
      setError('Dados incorretos. Verifique seu e-mail e senha.');
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
        
      <div className={styles.formSection}>
        <div className={styles.logo}>
          <img src={Logo} alt="Logo QR Ficha" />
        </div>
        <h2 className={styles.title}>Entrar</h2>
        <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <Input type="email" id="email" text="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seuemail@exemplo.com"
          required />
        </div>
        <div className={styles.inputGroup}>
          <Input type="password" id="password" text="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
          <a href="#" className={styles.link}>Esqueci a senha</a>
        </div>
        
        <SubmitButton text={"Entrar"} type="submit" disabled={loading}/>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Link to="/cadastro" className={styles.link}>
        Não tem cadastro? Faça agora!
        </Link>
        </form>
      </div>
    </div>
  )
}

export default Login;