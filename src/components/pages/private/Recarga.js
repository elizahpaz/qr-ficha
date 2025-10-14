import { useState } from 'react';
import { supabase } from '../../../database/supabaseClient';

const Recarga = ({ fichaEscaneada, onRecargaSuccess, onVoltar }) => {
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecarga = async (e) => {
    e.preventDefault();
    
    const valorRecarga = parseFloat(valor);
    
    if (!valorRecarga || valorRecarga <= 0) {
      alert('Digite um valor válido para recarga');
      return;
    }

    if (!fichaEscaneada) {
      alert('Erro: ficha não identificada');
      return;
    }

    try {
      setLoading(true);

      const novoSaldo = fichaEscaneada.saldo + valorRecarga;

      // 1. Atualizar saldo na fichaEvento
      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) {
        console.error('Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      // 2. Registrar recarga na tabela Recarga
      const { data: recargaData, error: recargaError } = await supabase
        .from('Recarga')
        .insert({
          id_fichaEvento: fichaEscaneada.id,
          valor: valorRecarga
        })
        .select(); // Adicionar .select() para ver o que foi inserido

      if (recargaError) {
        console.error('Erro ao registrar recarga:', recargaError);
        console.error('Detalhes:', recargaError.message, recargaError.details, recargaError.hint);
        alert('Saldo atualizado, mas erro ao registrar no histórico');
      } else {
        console.log('Recarga registrada com sucesso:', recargaData);
      }

      alert(`Recarga de R$ ${valorRecarga.toFixed(2)} processada com sucesso!\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`);
      
      onRecargaSuccess({
        ...fichaEscaneada,
        saldo: novoSaldo
      });

      setValor('');

    } catch (error) {
      console.error('Erro ao processar recarga:', error);
      alert('Erro ao processar recarga. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h3>💰 Processar Recarga</h3>
        <p><strong>Cliente:</strong> {fichaEscaneada.nome_titular}</p>
        <p><strong>Saldo atual:</strong> R$ {fichaEscaneada.saldo.toFixed(2)}</p>
      </div>

      <form onSubmit={handleRecarga}>
        <div>
          <label htmlFor="valorRecarga">Valor da Recarga:</label>
          <input
            id="valorRecarga"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Ex: 25.00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={loading}
            required
            autoFocus
          />
        </div>

        {valor && parseFloat(valor) > 0 && (
          <div>
            <strong>Novo saldo será:</strong> R$ {(fichaEscaneada.saldo + parseFloat(valor)).toFixed(2)}
          </div>
        )}

        <div>
          <button type="submit" disabled={loading || !valor || parseFloat(valor) <= 0}>
            {loading ? 'Processando...' : 'Confirmar Recarga'}
          </button>

          <button type="button" onClick={onVoltar} disabled={loading}>
            Voltar
          </button>
        </div>
      </form>

      <div>
        <p>Valores rápidos:</p>
        <div>
          {[10, 20, 50, 100].map(valorSugerido => (
            <button
              key={valorSugerido}
              type="button"
              onClick={() => setValor(valorSugerido.toString())}
              disabled={loading}
            >
              R$ {valorSugerido}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recarga;