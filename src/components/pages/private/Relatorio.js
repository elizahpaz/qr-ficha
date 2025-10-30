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
  const { idEvento } = useParams();
  
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
        const { data: eventoData, error: eventoError } = await supabase
          .from('Evento')
          .select('nome')
          .eq('id', idEvento)
          .single();

        if (eventoError) throw eventoError;
        setNomeEvento(eventoData.nome);

        const { data: reportData, error: rpcError } = await supabase
          .rpc('get_sales_report', {
            id_evento_param: idEvento 
          });

        if (rpcError) throw rpcError;
        setItensVendidos(reportData || []);

        const { data: recargaData, error: recargaError } = await supabase
          .from('Recarga')
          .select('valor')
          .eq('id_evento', idEvento);
        
        if (recargaError) throw recargaError;
        const totalRecargas = recargaData.reduce((acc, item) => acc + item.valor, 0);

        const { data: compraData, error: compraError } = await supabase
          .from('Compra')
          .select('total')
          .eq('id_evento', idEvento);
        
        if (compraError) throw compraError;
        const totalVendas = compraData.reduce((acc, item) => acc + item.total, 0);

        setTotais({ recargas: totalRecargas, vendas: totalVendas });

      } catch (err) {
        console.error("Erro ao buscar relatório:", err);
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

  return (
    <div className={styles.relatorioContainer}>
      <Link to="/dashboard" className={styles.backButton}>Voltar</Link>
      
      <h2>Relatório do Evento</h2>
      <h3>{nomeEvento}</h3>

        <div className={styles.totalCard}>
          <h4>Total de recargas</h4>
          <span className={styles.valorPositivo}>{formatCurrency(totais.recargas)}</span>
        </div>

      <hr className={styles.divider} />

      <h3>DETALHES DAS VENDAS</h3>
      
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