import { useState } from 'react';
import { supabase } from '../../../database/supabaseClient';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import styles from './Recarga.module.css';

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

      //Atualizar saldo na tabela fichaEvento
      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) {
        console.error('Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      // Registrar recarga na tabela Recarga
      const { data: recargaData, error: recargaError } = await supabase
        .from('Recarga')
        .insert({
          id_ficha: fichaEscaneada.id_ficha,
          id_evento: fichaEscaneada.id_evento,
          valor: valorRecarga
        })
        .select();

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
    <div className={styles.recargaContainer}>
      <div className={styles.infoBox}>
        <h3 className={styles.title}>FAZER RECARGA</h3>
        <p className={styles.infoText}>Titular: <span>{fichaEscaneada.nome_titular}</span></p>
        <p className={styles.saldoAtual}>Saldo atual: <span className={styles.saldoValue}>R$ {fichaEscaneada.saldo.toFixed(2)}</span></p>
      </div>

      <form onSubmit={handleRecarga} className={styles.recargaForm}>
        <div className={styles.inputWrapper}>
          <Input id="valorRecarga" type="number" text="Valor da recarga"
            step="0.01" min="0.01" placeholder="Ex: 25.50"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={loading} required autoFocus />
        </div>

          {valor && parseFloat(valor) > 0 && (
            <div className={styles.novoSaldoBox}>
              Novo saldo: <span className={styles.novoSaldoValue}>R$ {(fichaEscaneada.saldo + parseFloat(valor)).toFixed(2)}</span>
            </div>
          )}

          <div className={styles.actionButtons}>
            <SubmitButton type="submit" text="CONFIRMAR RECARGA" 
              disabled={loading || !valor || parseFloat(valor) <= 0} />

            <button type="button" onClick={onVoltar} disabled={loading} className={styles.backButton}>
              Voltar
            </button>
          </div>
        </form>
    </div>
  );
};

export default Recarga;