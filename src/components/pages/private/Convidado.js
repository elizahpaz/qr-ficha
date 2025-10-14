import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../database/supabaseClient';
import Input from '../../form/Input';
import SubmitButton from '../../form/SubmitButton';
import styles from '../../eventos/AddItem.module.css';

const Convidado = () => {
  const { idOrg } = useParams();
  const [eventoAtivo, setEventoAtivo] = useState(null);
  const [fichaAtribuida, setFichaAtribuida] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const localStorageKey = `ficha_convidado_${idOrg}`;

  useEffect(() => {
    async function verificarEventoECarregarFicha() {
      try {

        const { data: evento, error: eventoError } = await supabase
          .from('Evento')
          .select('*')
          .eq('id_org', idOrg)
          .eq('status', true)
          .single();

        if (eventoError && eventoError.code !== 'PGRST116') {
          setError('Erro ao verificar eventos ativos');
          return;
        } else if (!evento) {
          setError('Não há eventos ativos no momento');
          return;
        }

        setEventoAtivo(evento);

        // Verificar se há dados salvos localmente
        const dadosSalvos = localStorage.getItem(localStorageKey);
        
        if (dadosSalvos) {
          try {
            const fichaLocal = JSON.parse(dadosSalvos);
            
            // Verificar se a ficha é do evento atual
            if (fichaLocal.eventoId === evento.id) {
              // Buscar saldo atualizado
              const { data: fichaAtualizada, error: fichaError } = await supabase
                .from('fichaEvento')
                .select('saldo')
                .eq('id_ficha', fichaLocal.fichaId)
                .eq('id_evento', evento.id)
                .single();

              if (!fichaError && fichaAtualizada) {
                setFichaAtribuida({
                  id: fichaLocal.fichaId,
                  nome_titular: fichaLocal.nome_titular,
                  contato: fichaLocal.contato,
                  saldo: fichaAtualizada.saldo,
                  qrCode: fichaLocal.qrCode
                });
                setQrCodeUrl(fichaLocal.qrCodeUrl);
              }
            } else {
              // Limpar dados de evento anterior
              localStorage.removeItem(localStorageKey);
            }
          } catch (parseError) {
            localStorage.removeItem(localStorageKey);
          }
        }

      } catch (error) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    }

    if (idOrg) {
      verificarEventoECarregarFicha();
    }
  }, [idOrg, localStorageKey]);

  const handleCadastro = async (nome, contato) => {
  try {
    setLoading(true);

    const { data: todasFichas, error: fichasError } = await supabase
      .from('Ficha')
      .select('*')
      .eq('id_org', idOrg);

    if (fichasError) throw fichasError;

    const { data: fichasUsadas, error: usadasError } = await supabase
      .from('fichaEvento')
      .select('id_ficha')
      .eq('id_evento', eventoAtivo.id);

    if (usadasError) throw usadasError;

    const idsUsadas = fichasUsadas.map(f => f.id_ficha);
    let fichaLivre = todasFichas.find(f => !idsUsadas.includes(f.id));

    if (!fichaLivre) {
      const { data: novaFicha, error: criarFichaError } = await supabase
        .from('Ficha')
        .insert({
          qr_code: '', 
          id_org: idOrg
        })
        .select()
        .single();

      if (criarFichaError) throw criarFichaError;

      const qrCodeData = JSON.stringify({
        fichaId: novaFicha.id, 
        orgId: idOrg,
        type: 'ficha_digital'
      });

      const { error: updateError } = await supabase
        .from('Ficha')
        .update({ qr_code: qrCodeData })
        .eq('id', novaFicha.id);

      if (updateError) throw updateError;

      fichaLivre = {
        ...novaFicha,
        qr_code: qrCodeData
      };
    }

    const { error: eventoError } = await supabase
      .from('fichaEvento')
      .insert({
        id_ficha: fichaLivre.id,
        id_evento: eventoAtivo.id,
        nome_titular: nome,
        contato: contato,
        saldo: 0
      });

    if (eventoError) throw eventoError;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fichaLivre.qr_code)}`;

    const novaFicha = {
      id: fichaLivre.id,
      nome_titular: nome,
      contato: contato,
      saldo: 0,
      qrCode: fichaLivre.qr_code
    };

    setFichaAtribuida(novaFicha);
    setQrCodeUrl(qrUrl);

    const dadosParaSalvar = {
      fichaId: fichaLivre.id,
      eventoId: eventoAtivo.id,
      nome_titular: nome,
      contato: contato,
      qrCode: fichaLivre.qr_code,
      qrCodeUrl: qrUrl
    };
    localStorage.setItem(localStorageKey, JSON.stringify(dadosParaSalvar));

  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
    setError('Erro ao processar cadastro');
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      
      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}

      {eventoAtivo && !fichaAtribuida && !loading && (
        <div className={styles.card}>
          <h2 className={styles.title}>CADASTRO PARA: </h2>
          <h2 className={styles.title}>{eventoAtivo.nome}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleCadastro(formData.get('nome'), formData.get('contato'));
          }}>
            <Input name="nome" placeholder="Seu nome completo" required />
            <Input name="contato" placeholder="Seu telefone" required />
            <SubmitButton type="submit" text="GERAR FICHA" />
          </form>
        </div>
      )}

      {fichaAtribuida && eventoAtivo && (
        <div className={styles.fichaContainer}>
          <h2 className={styles.title}>QR FICHA</h2>
          <p className={styles.infoText}>{eventoAtivo.nome}</p>
          <p className={styles.infoText}>Titular da ficha: {fichaAtribuida.nome_titular}</p>
          <p className={styles.saldoText}>
            Saldo: <span className={styles.saldoValue}>R$ {fichaAtribuida.saldo.toFixed(2)}</span>
          </p>

          <div className={styles.qrCodeWrapper}>
            <img src={qrCodeUrl} alt="Sua Ficha Digital"/>
          </div>

          <div className={styles.instructions}>
            <p className={styles.instructionsTitle}>Instruções</p>
            <ul className={styles.instructionsList}>
              <li>Apresente este QR Code para fazer recargas e compras</li>
              <li>Atualize a página para ver seu saldo atual</li>
            </ul>
          </div>
      </div>  
      )}
    </div>
  );
};

export default Convidado;