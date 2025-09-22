import { useState } from 'react';
import { supabase } from '../../../database/supabaseClient';
import { authService } from '../../../database/authService';
import { Link, useNavigate } from 'react-router-dom';

import styles from '../../form/Form.module.css';
import Logo from '../../../assets/logo.png';
import Input from '../../form/Input';
import SubmitButton from '../../form/SubmitButton';

const Register = () => {

    const [cnpj, setCnpj] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpjValidado, setCnpjValidado] = useState(false);
    const [loadingCnpj, setLoadingCnpj] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const numericCnpj = cnpj.replace(/\D/g, '');

    const navigate = useNavigate();

    // Função que faz a busca do CNPJ na API
    const fetchCnpjData = async () => {
        setRazaoSocial('');
        if (!cnpj) return;
        setLoadingCnpj(true);
        setCnpjValidado(false);
        setError(null);

        if (numericCnpj.length !== 14) {
        setError('Por favor, digite um CNPJ válido.');
        return;
        }
        setLoadingCnpj(true);
        try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${numericCnpj}`);
        setCnpjValidado(true)   
        if (!response.ok) {
            throw new Error('CNPJ não encontrado. Verifique o número.');
        }
        const data = await response.json(); 
        if (data.razao_social) {
            setRazaoSocial(data.razao_social);
        } else {
            throw new Error('Dados incompletos. Tente novamente.');
        }

        } catch (err) {
        setError(err.message);
        setCnpjValidado(false);
        console.error('Erro ao buscar CNPJ:', err);
        } finally {
        setLoadingCnpj(false);
        }
    };

    // Função que envia os dados p/ o banco
    async function handleRegister(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!cnpjValidado) {
      setError('Por favor, valide o CNPJ antes de prosseguir.');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await authService.signUp(email, password);

      const { error: insertError } = await supabase
        .from('Organização')
        .insert([
          {
            id: user.id,
            cnpj: cnpj,
            razao_social: razaoSocial,
          },
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
      console.error('Erro no registro:', err);
    } finally {
      setIsLoading(false);
    }
  }
    

  return (

    <div className={styles.container}>        
      <div className={styles.formSection}>
        <div className={styles.logo}>
          <img src={Logo} alt="Logo QR Ficha" />
        </div>
        <h2 className={styles.title}>Cadastrar</h2>
        <form className={styles.loginForm} onSubmit={handleRegister}>
        <div className={styles.inputGroup}>
          <Input type="text" id="cnpj" text="CNPJ" placeholder="00.000.000/0000-00" value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          onBlur={fetchCnpjData}
          maxLength="18" required />
          {loadingCnpj && <p>Buscando dados...</p>}
          {error && <p>{error}</p>}

          <Input className={styles.disabled} type="text" id="razaoSocial" text="Nome"
          placeholder="Informe o CNPJ" value={razaoSocial}
          onChange={(e) => setRazaoSocial(e.target.value)} required
          readOnly={loadingCnpj || cnpjValidado} />

          <Input type="email" id="email" text="E-mail" placeholder="seuemail@gmail.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required />

          <Input id="password" text="Senha" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        </div>
        
          <SubmitButton text={"Cadastrar"} type="submit" disabled={isLoading || loadingCnpj || !cnpjValidado}/>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <Link to="/login" className={styles.link}>Já tem cadastro? Entre na sua conta!</Link>
        </form>
      </div>
    </div>
  )
}

export default Register