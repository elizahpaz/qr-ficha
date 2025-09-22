import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../database/supabaseClient';
import SubmitButton from '../form/SubmitButton';
import Input from '../form/Input';
import styles from './AddItem.module.css';

function CadastroEvento() {
  const [nomeEvento, setNomeEvento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleCreateEvent(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Nenhum usuário logado. Por favor, faça login.');
      setLoading(false);
      return;
    }
    const idOrg = session.user.id;

    try {
      // Inserir o novo evento no banco
      const { data, error: insertError } = await supabase
        .from('Evento')
        .insert({
          id_org: idOrg,
          nome: nomeEvento,
          status: false,
        })
        .select('id');

      if (insertError) {
        throw new Error(insertError.message);
      }

      const idEventoCriado = data[0].id;

      // Direciona p/ o cadastro de itens
      navigate(`/add-itens/${idEventoCriado}`);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao cadastrar evento:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleCreateEvent}>
        <h2 className={styles.title}>Cadastrar Novo Evento</h2>

        <div className={styles.card}>
          <Input text="Nome do evento" id="nomeEvento"
            type="text"
            value={nomeEvento}
            onChange={(e) => setNomeEvento(e.target.value)}
            required />
        </div>

        <SubmitButton type="submit" text={"Prosseguir"} />

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default CadastroEvento;