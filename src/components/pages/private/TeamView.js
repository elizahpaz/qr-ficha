import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../database/supabaseClient';
import Scanner from './Scanner';
import Recarga from './Recarga';

const TeamView = () => {
  const { teamToken } = useParams();
  const [eventoValido, setEventoValido] = useState(null);
  const [fichaEscaneada, setFichaEscaneada] = useState(null);
  const [telaAtual, setTelaAtual] = useState('menu_inicial'); // 'menu_inicial', 'scanner', 'ficha_escaneada', 'recarga'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function validarAcesso() {
      try {
        const { data: evento, error } = await supabase
          .from('Evento')
          .select('*')
          .eq('team_token', teamToken)
          .eq('status', true)
          .single();

        if (error || !evento) {
          setError('Link inválido ou evento não está mais ativo');
        } else {
          setEventoValido(evento);
        }
      } catch (error) {
        setError('Erro ao verificar acesso');
      } finally {
        setLoading(false);
      }
    }

    if (teamToken) {
      validarAcesso();
    } else {
      setError('Token de acesso não fornecido');
      setLoading(false);
    }
  }, [teamToken]);

  const handleQRCodeRead = async (qrData) => {
    try {
      setLoading(true);
      
      const dadosQR = JSON.parse(qrData);
      
      if (dadosQR.type !== 'ficha_digital') {
        alert('QR Code inválido para este sistema');
        setTelaAtual('menu_inicial');
        return;
      }

      // Buscar dados da ficha no evento atual
      const { data: fichaEventoData, error } = await supabase
        .from('fichaEvento')
        .select('*')
        .eq('id_ficha', dadosQR.fichaId)
        .eq('id_evento', eventoValido.id)
        .single();

      if (error) {
        console.error('Erro ao buscar ficha:', error);
        throw error;
      }

      if (!fichaEventoData) {
        alert('Ficha não encontrada neste evento');
        setTelaAtual('menu_inicial');
        return;
      }

      setFichaEscaneada(fichaEventoData);
      setTelaAtual('ficha_escaneada');

    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      alert('QR Code inválido ou erro ao processar');
      setTelaAtual('menu_inicial');
    } finally {
      setLoading(false);
    }
  };

  // Navegação
  const voltarParaMenu = () => {
    setTelaAtual('menu_inicial');
    setFichaEscaneada(null);
  };

  const abrirScanner = () => {
    setTelaAtual('scanner');
  };

  const abrirRecarga = () => {
    setTelaAtual('recarga');
  };

  const fecharScanner = () => {
    setTelaAtual('menu_inicial');
  };

  const handleRecargaSuccess = (fichaAtualizada) => {
    setFichaEscaneada(fichaAtualizada);
    voltarParaMenu();
  };

  const handleVoltarDeRecarga = () => {
    setTelaAtual('ficha_escaneada');
  };

  if (loading && !eventoValido) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #4CAF50',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '2rem',
          border: '2px solid #f44336',
          borderRadius: '8px',
          backgroundColor: '#ffebee'
        }}>
          <h2 style={{ color: '#c62828', margin: '0 0 1rem 0' }}>
            🚫 Acesso Negado
          </h2>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{error}</p>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#999' }}>
            Solicite um novo link à organização do evento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {/* HEADER */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#2c3e50',
          fontSize: '1.8rem'
        }}>
          🎪 Sistema da Equipe
        </h1>
        <h2 style={{ 
          margin: '0', 
          color: '#7f8c8d', 
          fontSize: '1.2rem',
          fontWeight: 'normal'
        }}>
          {eventoValido.nome}
        </h2>
      </header>

      {/* TELA: MENU INICIAL */}
      {telaAtual === 'menu_inicial' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={abrirScanner}
            style={{
              padding: '1.5rem 2rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '300px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            📱 Escanear Ficha
          </button>
        </div>
      )}

      {/* TELA: SCANNER */}
      {telaAtual === 'scanner' && (
        <Scanner 
          onQRCodeRead={handleQRCodeRead}
          onClose={fecharScanner}
        />
      )}

      {/* TELA: FICHA ESCANEADA */}
      {telaAtual === 'ficha_escaneada' && fichaEscaneada && (
        <div>
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            border: '2px solid #4CAF50',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
          }}>
            <h3 style={{ 
              color: '#2e7d32', 
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✅ Ficha Identificada
            </h3>
            <div style={{ fontSize: '1.1rem' }}>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Cliente:</strong> {fichaEscaneada.nome_titular}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Contato:</strong> {fichaEscaneada.contato}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Saldo:</strong> 
                <span style={{ 
                  color: fichaEscaneada.saldo > 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {' '}R$ {fichaEscaneada.saldo.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={abrirRecarga}
              style={{
                width: '100%',
                padding: '1.2rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#45a049';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#4CAF50';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              💰 Fazer Recarga
            </button>
          </div>

          <button
            onClick={voltarParaMenu}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            🔙 Voltar ao Menu
          </button>
        </div>
      )}

      {/* TELA: RECARGA */}
      {telaAtual === 'recarga' && fichaEscaneada && (
        <Recarga 
          fichaEscaneada={fichaEscaneada}
          onRecargaSuccess={handleRecargaSuccess}
          onVoltar={handleVoltarDeRecarga}
        />
      )}

      {/* LOADING OVERLAY */}
      {loading && telaAtual !== 'menu_inicial' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #4CAF50',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <p style={{ margin: '0', fontSize: '1.2rem', color: '#333' }}>
              Processando...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;