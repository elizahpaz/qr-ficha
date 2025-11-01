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
          .eq('status', 'INICIADO')
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

  /**
 * Processa o texto lido do QR Code.
 * Esta função foi refatorada para adicionar validação e depuração.
 */
const handleQRCodeRead = async (qrData) => {
  try {
    setLoading(true);

    // --- DEBUG 1: O que o scanner está lendo? ---
    // Verifique seu console (F12) para ver o texto puro que o scanner leu.
    console.log("QR Code lido (texto puro):", qrData);

    if (!qrData || typeof qrData !== 'string') {
      alert('Erro de leitura: O scanner não retornou um texto válido.');
      setTelaAtual('menu_inicial');
      return; // O 'finally' será chamado
    }
    // --- Fim Debug 1 ---

    let dadosQR;
    try {
      // Tenta converter o texto em um objeto JSON
      dadosQR = JSON.parse(qrData);
    } catch (parseError) {
      // Se falhar, o QR Code NÃO é JSON.
      console.error("Erro de JSON.parse:", parseError);
      alert(`QR Code não é um JSON válido. Conteúdo lido: ${qrData}`);
      setTelaAtual('menu_inicial');
      return; // O 'finally' será chamado
    }

    // --- DEBUG 2: O que o JSON contém? ---
    console.log("Objeto JSON parseado:", dadosQR);

    // Validação 1: O JSON tem o tipo correto?
    if (!dadosQR || dadosQR.type !== 'ficha_digital') {
      alert('QR Code inválido para este sistema (type não é "ficha_digital").');
      setTelaAtual('menu_inicial');
      return; // O 'finally' será chamado
    }

    // Validação 2: O JSON tem um fichaId válido?
    const fichaIdRecebida = dadosQR.fichaId;
    console.log("fichaId extraída do JSON:", fichaIdRecebida);

    if (!fichaIdRecebida) {
      // Este é o seu erro! O JSON foi lido, mas a chave "fichaId" é null, 0, ou undefined.
      alert(`QR Code lido com sucesso, mas o ID da ficha está NULO ou ausente no JSON.`);
      setTelaAtual('menu_inicial');
      return; // O 'finally' será chamado
    }

    // Se passou em todas as validações, busca a ficha
    await buscarFichaPorId(fichaIdRecebida);

  } catch (error) {
    // Este 'catch' agora só pega erros do 'buscarFichaPorId'
    console.error('Erro ao processar QR Code (na etapa buscarFichaPorId):', error);
    alert('Erro interno ao buscar dados da ficha.');
    setTelaAtual('menu_inicial');
  } finally {
    // Isso garante que o loading sempre pare, não importa o que aconteça
    setLoading(false);
  }
};

/**
 * Busca a ficha. Esta função está correta, pois funciona na busca manual.
 * Nenhuma refatoração necessária aqui.
 */
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