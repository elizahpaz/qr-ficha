import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../database/supabaseClient';
import styles from './Perfil.module.css';
import Input from '../../form/Input';
import SubmitButton from '../../form/SubmitButton';

const Perfil = () => {
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    async function fetchOrgData() {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Nenhum usuário logado.');
        setLoading(false);
        return;
      }
      
      const userId = session.user.id;
      
      const { data: orgData, error: orgError } = await supabase
        .from('Organização')
        .select('cnpj, razao_social')
        .eq('id', userId)
        .single();
        
      if (orgError) {
        setError(orgError.message);
      } else {
        setCnpj(orgData.cnpj || '');
        setRazaoSocial(orgData.razao_social || '');
      }
      
      setEmail(session.user.email);
      setLoading(false);
    }
    
    fetchOrgData();
  }, []);

  useEffect(() => {
    if (cnpj.length === 14) {
      fetchCnpjData(cnpj);
    } else if (cnpj.length < 14) {
      setRazaoSocial('');
      setError(null);
      }
    }, [cnpj]);

  const fetchCnpjData = async (numericCnpj) => {
    setRazaoSocial('');
    setLoadingCnpj(true);
    setError(null);

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${numericCnpj}`);
      
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
      setRazaoSocial('');
      console.error('Erro ao buscar CNPJ:', err);
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("E-mail na sessão atual:", session?.user?.email); 
      const userId = session.user.id;

      console.log("E-mail que será enviado para atualização:", email);

        if (!session) {
            throw new Error('Usuário não autenticado.');
        }

      const { error: updateOrgError } = await supabase
        .from('Organização')
        .update({ cnpj: cnpj })
        .eq('id', userId);

      const { error: updateAuthError } = await supabase.auth.updateUser({ email: email });

        if (updateAuthError) {
            throw new Error(`Erro ao atualizar e-mail: ${updateAuthError.message}`);
        }
        
        alert('Dados atualizados com sucesso!');
        
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando dados...</div>;
  }
  const handleDeletarConta = async () => {
    try {
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada. Faça login novamente.');
      }

      const userId = session.user.id;
      const { error: orgError } = await supabase
        .from('Organização')
        .delete()
        .eq('id', userId);
      
      if (orgError) throw orgError;

      console.log('Organização deletada (cascata ativada)');
      console.log('Deletando usuário da autenticação...');
      
      const { error: deleteUserError } = await supabase.rpc('delete_user');
      
      if (deleteUserError) {
        console.error('Erro ao deletar usuário:', deleteUserError);
        // Mesmo com erro, fazer logout
        await supabase.auth.signOut();
      }
      console.log('Conta deletada com sucesso!');
      alert('Conta deletada com sucesso! Todos os seus dados foram removidos.');
      navigate('/login');

    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Dados da conta</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        
        <Input id="cnpj" text="CNPJ" type="text" value={cnpj}
        onChange={(e) => setCnpj(e.target.value)}
        onBlur={() => {
          if (cnpj.length === 14) {
            fetchCnpjData(cnpj);
          }
        }}
        maxLength={14} required />
        {loadingCnpj && <p>Buscando Razão Social...</p>}

        <Input id="razaoSocial" text="Razão Social" type="text"
        value={razaoSocial} disabled />
      
        <Input id="email" text="E-mail" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />

        <div className={styles.btnSection}>
          <SubmitButton text={"Salvar"} type submit/>
          <button 
            onClick={handleDeletarConta}
            className={styles.button}
            disabled={loading}
          >
            Deletar Conta
          </button>
        </div>
      </form>

      {error && <div className={styles.errorMessage}>{`Erro: ${error}`}</div>}

    </div>
  );
};

export default Perfil;