import { useState, useEffect } from 'react';
import { supabase } from '../../../database/supabaseClient';

const Venda = ({ fichaEscaneada, eventoId, onVendaSuccess, onVoltar }) => {
  const [itens, setItens] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    async function buscarItens() {
      try {
        const { data, error } = await supabase
          .from('Item')
          .select('*')
          .eq('id_evento', eventoId);

        if (error) throw error;

        console.log('Itens carregados:', data); // Debug: ver estrutura dos itens
        setItens(data || []);
      } catch (error) {
        console.error('Erro ao buscar itens:', error);
        alert('Erro ao carregar itens do evento');
      } finally {
        setLoading(false);
      }
    }

    buscarItens();
  }, [eventoId]);

  const adicionarAoCarrinho = (item) => {
    const itemExistente = carrinho.find(i => i.id === item.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(i => 
        i.id === item.id 
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { ...item, quantidade: 1 }]);
    }
  };

  const removerDoCarrinho = (itemId) => {
    setCarrinho(carrinho.filter(i => i.id !== itemId));
  };

  const alterarQuantidade = (itemId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(itemId);
      return;
    }

    setCarrinho(carrinho.map(i => 
      i.id === itemId 
        ? { ...i, quantidade: novaQuantidade }
        : i
    ));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      const preco = item.preco || item.valor || 0; // Verificar nome da coluna
      return total + (preco * item.quantidade);
    }, 0);
  };

  const handleVenda = async (e) => {
    e.preventDefault();

    if (carrinho.length === 0) {
      alert('Adicione itens ao carrinho');
      return;
    }

    const valorTotal = calcularTotal();

    if (fichaEscaneada.saldo < valorTotal) {
      alert(`Saldo insuficiente!\nValor da compra: R$ ${valorTotal.toFixed(2)}\nSaldo disponível: R$ ${fichaEscaneada.saldo.toFixed(2)}`);
      return;
    }

    try {
      setProcessando(true);

      const novoSaldo = fichaEscaneada.saldo - valorTotal;

      // 1. Atualizar saldo na fichaEvento
      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) {
        console.error('Erro ao atualizar saldo:', updateError);
        throw updateError;
      }

      // 2. Inserir registro na tabela Compra (com id_ficha e id_evento)
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

      console.log('Compra registrada:', compraData);

      // 3. Inserir itens na tabela itemCompra
      const itensCompra = carrinho.map(item => ({
        id_compra: compraData.id,
        id_item: item.id,
        qtde: item.quantidade
      }));

      const { error: itensError } = await supabase
        .from('itemCompra')
        .insert(itensCompra);

      if (itensError) {
        console.error('Erro ao registrar itens da compra:', itensError);
        console.error('Detalhes:', itensError.message, itensError.details, itensError.hint);
        alert('Compra registrada, mas erro ao salvar itens no histórico');
      } else {
        console.log('Itens da compra registrados com sucesso');
      }

      alert(`Venda processada com sucesso!\nTotal: R$ ${valorTotal.toFixed(2)}\nNovo saldo: R$ ${novoSaldo.toFixed(2)}`);

      onVendaSuccess({
        ...fichaEscaneada,
        saldo: novoSaldo
      });

      setCarrinho([]);

    } catch (error) {
      console.error('Erro ao processar venda:', error);
      alert('Erro ao processar venda. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return <div><p>Carregando itens...</p></div>;
  }

  if (itens.length === 0) {
    return (
      <div>
        <h3>⚠️ Nenhum item cadastrado</h3>
        <p>Não há itens disponíveis para venda neste evento.</p>
        <button onClick={onVoltar}>Voltar</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h3>🛒 Processar Venda</h3>
        <p><strong>Cliente:</strong> {fichaEscaneada.nome_titular}</p>
        <p><strong>Saldo disponível:</strong> R$ {fichaEscaneada.saldo.toFixed(2)}</p>
      </div>

      <div>
        <h4>Itens disponíveis:</h4>
        <ul>
          {itens.map(item => {
            const preco = item.preco || item.valor || 0;
            return (
              <li key={item.id}>
                <div>
                  <strong>{item.nome}</strong> - R$ {preco.toFixed(2)}
                  {item.descricao && <span> - {item.descricao}</span>}
                </div>
                <button 
                  onClick={() => adicionarAoCarrinho(item)}
                  disabled={processando}
                >
                  Adicionar
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {carrinho.length > 0 && (
        <div>
          <h4>Carrinho:</h4>
          <ul>
            {carrinho.map(item => {
              const preco = item.preco || item.valor || 0;
              return (
                <li key={item.id}>
                  <div>
                    <strong>{item.nome}</strong> - R$ {preco.toFixed(2)}
                  </div>
                  <div>
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                      disabled={processando}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => alterarQuantidade(item.id, parseInt(e.target.value) || 0)}
                      disabled={processando}
                    />
                    <button 
                      onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                      disabled={processando}
                    >
                      +
                    </button>
                    <button 
                      onClick={() => removerDoCarrinho(item.id)}
                      disabled={processando}
                    >
                      Remover
                    </button>
                  </div>
                  <div>
                    <strong>Subtotal:</strong> R$ {(preco * item.quantidade).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            <p><strong>Total da compra:</strong> R$ {calcularTotal().toFixed(2)}</p>
            <p><strong>Saldo após compra:</strong> R$ {(fichaEscaneada.saldo - calcularTotal()).toFixed(2)}</p>
          </div>

          <form onSubmit={handleVenda}>
            <button type="submit" disabled={processando}>
              {processando ? 'Processando...' : 'Confirmar Venda'}
            </button>
            <button type="button" onClick={() => setCarrinho([])} disabled={processando}>
              Limpar Carrinho
            </button>
          </form>
        </div>
      )}

      <div>
        <button onClick={onVoltar} disabled={processando}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default Venda;