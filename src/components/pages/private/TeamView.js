import { Link } from "react-router-dom";

const TeamView = () => {
  const { eventId } = useParams(); // Pegar da URL /team-view/:eventId
  const [fichaEscaneada, setFichaEscaneada] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQRScan = async (qrResult) => {
    try {
      setLoading(true);
      
      // Parse do QR Code
      const qrData = JSON.parse(qrResult);
      
      if (qrData.type !== 'ficha_digital') {
        alert('QR Code inválido');
        return;
      }

      // Buscar dados da ficha no evento atual
      const { data: fichaEventoData, error } = await supabase
        .from('fichaEvento')
        .select(`
          *,
          Ficha (
            id,
            qr-code
          )
        `)
        .eq('id_ficha', qrData.fichaId)
        .eq('id_evento', eventId)
        .single();

      if (error || !fichaEventoData) {
        alert('Ficha não encontrada neste evento');
        return;
      }

      setFichaEscaneada(fichaEventoData);

    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      alert('QR Code inválido');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const processarRecarga = async (valor) => {
    if (!fichaEscaneada || valor <= 0) return;

    try {
      setLoading(true);
      
      const novoSaldo = fichaEscaneada.saldo + valor;

      // Atualizar saldo na fichaEvento
      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) throw updateError;

      // Registrar transação (opcional - criar tabela Transacao)
      await supabase
        .from('Transacao')
        .insert({
          id_ficha_evento: fichaEscaneada.id,
          tipo: 'recarga',
          valor: valor,
          saldo_anterior: fichaEscaneada.saldo,
          saldo_atual: novoSaldo,
          created_at: new Date().toISOString()
        });

      setFichaEscaneada({ ...fichaEscaneada, saldo: novoSaldo });
      alert(`Recarga de R$ ${valor.toFixed(2)} processada com sucesso!`);

    } catch (error) {
      console.error('Erro ao processar recarga:', error);
      alert('Erro ao processar recarga');
    } finally {
      setLoading(false);
    }
  };

  const processarVenda = async (valor) => {
    if (!fichaEscaneada || valor <= 0) return;

    if (fichaEscaneada.saldo < valor) {
      alert('Saldo insuficiente!');
      return;
    }

    try {
      setLoading(true);
      
      const novoSaldo = fichaEscaneada.saldo - valor;

      const { error: updateError } = await supabase
        .from('fichaEvento')
        .update({ saldo: novoSaldo })
        .eq('id', fichaEscaneada.id);

      if (updateError) throw updateError;

      await supabase
        .from('Transacao')
        .insert({
          id_ficha_evento: fichaEscaneada.id,
          tipo: 'venda',
          valor: valor,
          saldo_anterior: fichaEscaneada.saldo,
          saldo_atual: novoSaldo,
          created_at: new Date().toISOString()
        });

      setFichaEscaneada({ ...fichaEscaneada, saldo: novoSaldo });
      alert(`Venda de R$ ${valor.toFixed(2)} processada com sucesso!`);

    } catch (error) {
      console.error('Erro ao processar venda:', error);
      alert('Erro ao processar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Sistema da Equipe</h2>
      
      {!fichaEscaneada ? (
        <div>
          <button 
            onClick={() => setIsScanning(true)} 
            disabled={loading || isScanning}
          >
            {isScanning ? 'Escaneando...' : 'Escanear QR Code da Ficha'}
          </button>
          
          {isScanning && (
            <div>
              {/* Implementar scanner aqui */}
              <p>Aponte a câmera para o QR Code da ficha</p>
              <button onClick={() => setIsScanning(false)}>Cancelar</button>
              
              {/* Simulação - remover em produção */}
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
                <p><strong>SIMULAÇÃO:</strong></p>
                <button onClick={() => handleQRScan(JSON.stringify({fichaId: 'test-123', type: 'ficha_digital'}))}>
                  Simular Scan
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3>Ficha Escaneada</h3>
            <p><strong>Titular:</strong> {fichaEscaneada.titular}</p>
            <p><strong>Contato:</strong> {fichaEscaneada.contato}</p>
            <p><strong>Saldo Atual:</strong> R$ {fichaEscaneada.saldo.toFixed(2)}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h4>💰 Recarga</h4>
              <input type="number" placeholder="Valor" id="valorRecarga" step="0.01" />
              <button 
                onClick={() => {
                  const valor = parseFloat(document.getElementById('valorRecarga').value);
                  processarRecarga(valor);
                }}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Fazer Recarga'}
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <h4>🛒 Venda</h4>
              <input type="number" placeholder="Valor" id="valorVenda" step="0.01" />
              <button 
                onClick={() => {
                  const valor = parseFloat(document.getElementById('valorVenda').value);
                  processarVenda(valor);
                }}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Processar Venda'}
              </button>
            </div>
          </div>

          <button onClick={() => setFichaEscaneada(null)}>
            Escanear Outra Ficha
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamView;