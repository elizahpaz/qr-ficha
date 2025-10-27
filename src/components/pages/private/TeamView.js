import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../database/supabaseClient';
import Scanner from './Scanner';
import Recarga from './Recarga';
import Venda from './Venda';

import Input from '../../form/Input';
import SubmitButton from '../../form/SubmitButton';
import styles from './TeamView.module.css';

const TeamView = () => {
  const { teamToken } = useParams();
  const [eventoValido, setEventoValido] = useState(null);
  const [fichaEscaneada, setFichaEscaneada] = useState(null);
  const [telaAtual, setTelaAtual] = useState('menu_inicial'); // 'menu_inicial', 'scanner', 'input_manual', 'ficha_escaneada', 'recarga', 'venda'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [idFichaManual, setIdFichaManual] = useState('');

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

      await buscarFichaPorId(dadosQR.fichaId);

    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      alert('QR Code inválido ou erro ao processar');
      setTelaAtual('menu_inicial');
    } finally {
      setLoading(false);
    }
  };

  const buscarFichaPorId = async (fichaId) => {
    try {
      const { data: fichaEventoData, error } = await supabase
        .from('fichaEvento')
        .select('*')
        .eq('id_ficha', fichaId)
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
      console.error('Erro ao buscar ficha:', error);
      alert('Erro ao buscar ficha. Verifique o ID e tente novamente.');
      setTelaAtual('menu_inicial');
    }
  };

  const handleBuscarManual = async (e) => {
    e.preventDefault();
    
    if (!idFichaManual || !idFichaManual.trim()) {
      alert('Digite o ID da ficha');
      return;
    }

    setLoading(true);
    await buscarFichaPorId(parseInt(idFichaManual));
    setLoading(false);
    setIdFichaManual('');
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

  const abrirInputManual = () => {
    setTelaAtual('input_manual');
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
    <div className={styles.equipeContainer}>
    <header className={styles.header}>
        <h1 className={styles.mainTitle}>Sistema da Equipe</h1>
        <h2 className={styles.eventTitle}>{eventoValido.nome}</h2>
    </header>

    {telaAtual === 'menu_inicial' && (
        <div className={styles.menuContainer}>
            <button className={styles.primaryButton} onClick={abrirScanner}>
                Escanear QR Code
            </button>
            <button className={styles.secondaryButton} onClick={abrirInputManual}>
                Digitar ID da ficha
            </button>
        </div>
    )}

    {telaAtual === 'scanner' && (
        <Scanner 
          onQRCodeRead={handleQRCodeRead}
          onClose={fecharScanner}
        />
    )}

    {telaAtual === 'input_manual' && (
        <div className={styles.inputManualContainer}>
            <h3 className={styles.sectionTitle}>BUSCAR FICHA POR ID</h3>
            <p className={styles.descriptionText}>Digite o ID da ficha:</p>
            
            <form onSubmit={handleBuscarManual} className={styles.inputForm}>
                <Input name="ID da Ficha" type="number"
                  placeholder="Ex: 123" value={idFichaManual}
                  onChange={(e) => setIdFichaManual(e.target.value)}
                  disabled={loading} autoFocus required />
                <SubmitButton type="submit" text="BUSCAR" disabled={loading || !idFichaManual} />
            </form>

            <button onClick={voltarParaMenu} disabled={loading} className={styles.tertiaryButton}>
                Voltar
            </button>
        </div>
    )}

    {telaAtual === 'ficha_escaneada' && fichaEscaneada && (
        <div className={styles.fichaEscaneadaContainer}>
            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Ficha identificada</h3>
                <div className={styles.fichaDetails}>
                    <p>ID da Ficha: <span>{fichaEscaneada.id_ficha}</span></p>
                    <p>Titular: <span>{fichaEscaneada.nome_titular}</span></p>
                    <p>Contato: <span>{fichaEscaneada.contato}</span></p>
                    <p className={styles.saldo}>Saldo: <span className={styles.saldoValue}>R$ {fichaEscaneada.saldo.toFixed(2)}</span></p>
                </div>
            </div>

            <div className={styles.actionButtons}>
                <button onClick={abrirRecarga} className={styles.actionButtonRecarga}>
                    RECARREGAR
                </button>
                <button onClick={abrirVenda} className={styles.actionButtonVenda}>
                    VENDER
                </button>
            </div>

            <button onClick={voltarParaMenu} className={styles.tertiaryButton}>
                Voltar ao menu
            </button>
        </div>
    )}

      {telaAtual === 'recarga' && fichaEscaneada && (
        <Recarga 
          fichaEscaneada={fichaEscaneada}
          eventoId={eventoValido.id}
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