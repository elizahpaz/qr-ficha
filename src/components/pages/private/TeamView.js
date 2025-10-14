import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../database/supabaseClient';
import Scanner from './Scanner';
import Recarga from './Recarga';
import Venda from './Venda';

const TeamView = () => {
  const { teamToken } = useParams();
  const [eventoValido, setEventoValido] = useState(null);
  const [fichaEscaneada, setFichaEscaneada] = useState(null);
  const [telaAtual, setTelaAtual] = useState('menu_inicial'); // 'menu_inicial', 'scanner', 'ficha_escaneada', 'recarga', 'venda'
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

  const handleScannerError = (errorMessage) => {
    console.error('Erro no scanner:', errorMessage);
  };

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

  const abrirVenda = () => {
    setTelaAtual('venda');
  };

  const fecharScanner = () => {
    setTelaAtual('menu_inicial');
  };

  const handleRecargaSuccess = (fichaAtualizada) => {
    setFichaEscaneada(fichaAtualizada);
    voltarParaMenu();
  };

  const handleVendaSuccess = (fichaAtualizada) => {
    setFichaEscaneada(fichaAtualizada);
    voltarParaMenu();
  };

  const handleVoltarDeRecarga = () => {
    setTelaAtual('ficha_escaneada');
  };

  const handleVoltarDeVenda = () => {
    setTelaAtual('ficha_escaneada');
  };

  if (loading && !eventoValido) {
    return (
      <div>
        <div>
          <div></div>
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <h2>Acesso Negado</h2>
          <p>{error}</p>
          <p>Solicite um novo link à organização do evento.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Sistema da Equipe</h1>
        <h2>{eventoValido.nome}</h2>
      </header>

      {telaAtual === 'menu_inicial' && (
        <div>
          <button onClick={abrirScanner}>
            Escanear Ficha
          </button>
        </div>
      )}

      {telaAtual === 'scanner' && (
        <Scanner 
          onQRCodeRead={handleQRCodeRead}
          onClose={fecharScanner}
        />
      )}

      {telaAtual === 'ficha_escaneada' && fichaEscaneada && (
        <div>
          <div>
            <h3>Ficha Identificada</h3>
            <div>
              <p><strong>Cliente:</strong> {fichaEscaneada.nome_titular}</p>
              <p><strong>Contato:</strong> {fichaEscaneada.contato}</p>
              <p><strong>Saldo:</strong> R$ {fichaEscaneada.saldo.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <button onClick={abrirRecarga}>
              Fazer Recarga
            </button>
            <button onClick={abrirVenda}>
              Processar Venda
            </button>
          </div>

          <button onClick={voltarParaMenu}>
            Voltar ao Menu
          </button>
        </div>
      )}

      {telaAtual === 'recarga' && fichaEscaneada && (
        <Recarga 
          fichaEscaneada={fichaEscaneada}
          onRecargaSuccess={handleRecargaSuccess}
          onVoltar={handleVoltarDeRecarga}
        />
      )}

      {telaAtual === 'venda' && fichaEscaneada && (
        <Venda 
          fichaEscaneada={fichaEscaneada}
          eventoId={eventoValido.id}
          onVendaSuccess={handleVendaSuccess}
          onVoltar={handleVoltarDeVenda}
        />
      )}

      {loading && telaAtual !== 'menu_inicial' && (
        <div>
          <div>
            <div></div>
            <p>Processando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;