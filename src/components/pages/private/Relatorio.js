import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../database/supabaseClient'; 
import styles from './Relatorio.module.css';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

const Relatorio = () => {
  const { idEvento } = useParams(); // Pega o ID do evento da URL
  
  const [itensVendidos, setItensVendidos] = useState([]);
  const [totais, setTotais] = useState({ recargas: 0, vendas: 0 });
  const [nomeEvento, setNomeEvento] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!idEvento) return;

      setLoading(true);
      setError(null);

      try {
        // --- 1. Buscar o nome do Evento ---
        const { data: eventoData, error: eventoError } = await supabase
          .from('Evento') // Use o nome correto da tabela
          .select('nome')
          .eq('id', idEvento)
          .single();

        if (eventoError) throw eventoError;
        setNomeEvento(eventoData.nome);

        // --- 2. Buscar Itens Vendidos (usando a Função RPC) ---
        const { data: reportData, error: rpcError } = await supabase
          .rpc('get_sales_report', {
            id_evento_param: idEvento 
          });

        if (rpcError) throw rpcError;
        setItensVendidos(reportData || []);

        // --- 3. Buscar Total de Recargas ---
        const { data: recargaData, error: recargaError } = await supabase
          .from('Recarga') // Use o nome correto da tabela
          .select('valor')
          .eq('id_evento', idEvento);
        
        if (recargaError) throw recargaError;
        const totalRecargas = recargaData.reduce((acc, item) => acc + item.valor, 0);

        // --- 4. Buscar Total de Vendas (para confirmar o total) ---
        const { data: compraData, error: compraError } = await supabase
          .from('Compra') // Use o nome correto da tabela
          .select('total') // 'total' da tabela Compra
          .eq('id_evento', idEvento);
        
        if (compraError) throw compraError;
        const totalVendas = compraData.reduce((acc, item) => acc + item.total, 0);

        setTotais({ recargas: totalRecargas, vendas: totalVendas });

      } catch (err) {
        console.error("Erro ao buscar relatório:", err);
        setError("Não foi possível carregar o relatório. Verifique se a função 'get_sales_report' foi criada no banco de dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [idEvento]);

  if (loading) {
    return <div>Carregando relatório...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Calcula o "lucro" (Saldo que sobrou nas fichas e não foi gasto)
  const saldoNaoUtilizado = totais.recargas - totais.vendas;

  return (
    <div className={styles.relatorioContainer}>
      <Link to="/dashboard-org" className={styles.backButton}>&larr; Voltar</Link>
      
      <h2>Relatório Final do Evento</h2>
      <h3>{nomeEvento} (ID: {idEvento})</h3>

      <div className={styles.totaisGrid}>
        <div className={styles.totalCard}>
          <h4>Total Arrecadado (Recargas)</h4>
          <span className={styles.valorPositivo}>{formatCurrency(totais.recargas)}</span>
        </div>
        <div className={styles.totalCard}>
          <h4>Total Consumido (Vendas)</h4>
          <span className={styles.valorNegativo}>{formatCurrency(totais.vendas)}</span>
        </div>
        <div className={styles.totalCard}>
          <h4>Saldo Não Utilizado (Lucro)</h4>
          <span className={styles.valorTotal}>{formatCurrency(saldoNaoUtilizado)}</span>
        </div>
      </div>

      <hr className={styles.divider} />

      <h3>Detalhamento de Itens Vendidos</h3>
      
      <table className={styles.reportTable}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtde. Vendida</th>
            <th>Valor Unitário</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {itensVendidos.length > 0 ? (
            itensVendidos.map((item) => (
              <tr key={item.nome_item}>
                <td>{item.nome_item}</td>
                <td>{item.qtde_total_vendida}</td>
                {/* --- CORRIGIDO AQUI --- */}
                <td>{formatCurrency(item.valor_unitario)}</td>
                <td>{formatCurrency(item.valor_total_item)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Nenhum item foi vendido neste evento.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">Total Geral das Vendas</td>
            <td>{formatCurrency(totais.vendas)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Relatorio;