import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './AddItem.module.css';

function AddItem() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleAddItem(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: insertError } = await supabase
        .from('Item') 
        .insert([
          {
            nome: nome,
            valor: valor,
          },
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      setNome('');
      setFoto('');
      setPreco('');
      console.log('Item cadastrado:', data);

    } catch (err) {
      setError(err.message);
      console.error('Erro ao cadastrar item:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-container">
      <form onSubmit={handleCreateItem} className="card-form">
        <h2>Cadastrar Novo Item</h2>
        
        <div className="form-group">
          <label htmlFor="nome">Nome do Item</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="foto">URL da Foto</label>
          <input
            id="foto"
            type="url"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="preco">Preço</label>
          <input
            id="preco"
            type="number"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Item'}
        </button>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Item cadastrado com sucesso!</p>}
      </form>
    </div>
  );
}

export default AddItem;