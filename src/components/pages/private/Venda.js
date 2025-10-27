import { useState, useEffect } from 'react';
import { supabase } from '../../../database/supabaseClient';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import styles from './Venda.module.css';

const Venda = ({ fichaEscaneada, eventoId, onVendaSuccess, onVoltar }) => {
  const [itens, setItens] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [vendaRealizada, setVendaRealizada] = useState(false);

  useEffect(() => {
    async function buscarItens() {
      try {
        const { data, error } = await supabase
          .from('Item')
          .select('*')
          .eq('id_evento', eventoId);

        if (error) throw error;

        setItens(data || []);
        
        const quantidadesIniciais = {};
        (data || []).forEach(item => {
          quantidadesIniciais[item.id] = 0;
        });
        setQuantidades(quantidadesIniciais);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        alert('Erro ao carregar itens do evento');
      } finally {
        setLoading(false);
      }
    }

    buscarItens();
  }, [eventoId]);

  const alterarQuantidade = (itemId, valor) => {
    const novaQuantidade = parseInt(valor) || 0;
    setQuantidades(prev => ({
      ...prev,
      [itemId]: novaQuantidade >= 0 ? novaQuantidade : 0
    }));
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const preco = item.preco || item.valor || 0;
      const quantidade = quantidades[item.id] || 0;
      return total + (preco * quantidade);
    }, 0);
  };

  const handleConfirmarVenda = async () => {
    const valorTotal = calcularTotal();

    // Verifica se há itens com quantidade > 0
    const itensComQuantidade = Object.values(quantidades).some(q => q > 0);
    if (!itensComQuantidade) {
      alert('Adicione ao menos um item à venda');
      return;
    }

    // Verifica saldo
    if (fichaEscaneada.saldo < valorTotal) {
      alert(`Saldo insuficiente!\nValor da compra: R$ ${valorTotal.toFixed(2)}\nSaldo disponível: R$ ${fichaEscaneada.saldo.toFixed(2)}`);
      return;
    }

    try {
      setProcessando(true);

      const novoSaldo = fichaEscaneada.saldo - valorTotal;

      //Atualizar saldo na fichaEvento
      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) {
        console.error('Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      //Inserir registro na tabela Compra
      const { data: compraData, error: compraError } = await supabase
        .from('Compra')
        .insert({
          id_ficha: fichaEscaneada.id_ficha,
          id_evento: eventoId,
          total: valorTotal
        })
        .select()
        .single();

      if (compraError) {
        console.error('Erro ao registrar compra:', compraError);
        throw compraError;
      }

      //Inserir itens na tabela itemCompra (apenas os com quantidade > 0)
      const itensCompra = itens
        .filter(item => quantidades[item.id] > 0)
        .map(item => ({
          id_compra: compraData.id,
          id_item: item.id,
          qtde: quantidades[item.id]
        }));

      if (itensCompra.length > 0) {
        const { error: itensError } = await supabase
          .from('itemCompra')
          .insert(itensCompra);

        if (itensError) {
          console.error('Erro ao registrar itens da compra:', itensError);
          alert('Compra registrada, mas erro ao salvar itens no histórico');
        }
      }

      // Exibe mensagem de sucesso
      setVendaRealizada(true);

      // Aguarda 2 segundos e retorna
      setTimeout(() => {
        onVendaSuccess({
          ...fichaEscaneada,
          saldo: novoSaldo
        });
      }, 1000);

    } catch (error) {
      console.error('Erro ao processar venda:', error);
      alert('Erro ao processar venda. Tente novamente.');
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Carregando itens...</p>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h3>Nenhum item cadastrado</h3>
        <p>Não há itens disponíveis para venda neste evento.</p>
        <button onClick={onVoltar} style={{ padding: '10px 20px', marginTop: '10px' }}>
          Voltar
        </button>
      </div>
    );
  }

  if (vendaRealizada) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f0f9ff',
          borderRadius: '10px',
          border: '2px solid #3b82f6'
        }}>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Venda Realizada!</h2>
          <p>A transação foi processada com sucesso.</p>
        </div>
      </div>
    );
  }

  const valorTotal = calcularTotal();

  return (
    <div className={styles.vendaContainer}>
    
    {/* Bloco de Informações do Cliente */}
    <div className={styles.clienteInfoBox}>
        <h3 className={styles.infoTitle}>Processar Venda</h3>
        <p><strong>Cliente:</strong> {fichaEscaneada.nome_titular}</p>
        <p><strong>Saldo disponível:</strong> R$ {fichaEscaneada.saldo.toFixed(2)}</p>
    </div>

    <div className={styles.itensGrid}>
        {itens.map(item => {
            const preco = item.preco || item.valor || 0;
            const quantidade = quantidades[item.id] || 0;
            const subtotal = preco * quantidade;

            return (
                <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                        <h4 className={styles.itemName}>{item.nome}</h4>
                        <p className={styles.itemPrice}>
                            R$ {preco.toFixed(2)}
                        </p>
                    </div>
                    
                    <div className={styles.itemControls}>
                        <label htmlFor={`qtd-${item.id}`} className={styles.itemLabel}>
                            Quantidade:
                        </label>
                        <Input id={`qtd-${item.id}`} type="number" min="0"
                            value={quantidade}
                            onChange={(e) => alterarQuantidade(item.id, e.target.value)}
                            disabled={processando} />
                        {quantidade > 0 && (
                            <p className={styles.itemSubtotal}> Subtotal: R$ {subtotal.toFixed(2)} </p>
                        )}
                    </div>
                </div>
            );
        })}
    </div>

    {/* Footer Sticky (Total e Botões) */}
    <div className={styles.footerSticky}>
        <div className={styles.totalInfo}>
            <div className={styles.totalRow}>
                <p className={styles.totalLabel}>Total da compra:</p>
                <p className={styles.totalValue}>
                    R$ {valorTotal.toFixed(2)}
                </p>
            </div>
            <p className={styles.saldoAposCompra}>
                Saldo após compra: R$ {(fichaEscaneada.saldo - valorTotal).toFixed(2)}
            </p>
        </div>

        <div className={styles.footerActions}>
            <button 
                onClick={onVoltar} 
                disabled={processando}
                className={styles.voltarButton}
            >
                Voltar
            </button>
            <SubmitButton text="VENDER" onClick={handleConfirmarVenda} disabled={processando} />
        </div>
    </div>
</div>
  );
};

export default Venda;