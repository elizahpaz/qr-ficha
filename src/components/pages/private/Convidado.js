import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../../database/supabaseClient';
import Input from '../../form/Input';
import SubmitButton from '../../form/SubmitButton';
import styles from '../../eventos/AddItem.module.css'

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

        // 2. Verificar se há dados salvos localmente
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
                // Restaurar dados com saldo atualizado
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

      // 1. Buscar fichas da organização
      const { data: todasFichas, error: fichasError } = await supabase
        .from('Ficha')
        .select('*')
        .eq('id_org', idOrg);

      if (fichasError) throw fichasError;

      // 2. Buscar fichas já usadas no evento
      const { data: fichasUsadas, error: usadasError } = await supabase
        .from('fichaEvento')
        .select('id_ficha')
        .eq('id_evento', eventoAtivo.id);

      if (usadasError) throw usadasError;

      // 3. Encontrar ficha livre
      const idsUsadas = fichasUsadas.map(f => f.id_ficha);
      let fichaLivre = todasFichas.find(f => !idsUsadas.includes(f.id));

      // 4. Criar nova ficha se necessário
      if (!fichaLivre) {
        const qrCodeData = JSON.stringify({
          fichaId: null,
          orgId: idOrg,
          type: 'ficha_digital'
        });

        const { data: novaFicha, error: criarFichaError } = await supabase
          .from('Ficha')
          .insert({
            qr_code: qrCodeData,
            id_org: idOrg
          })
          .select()
          .single();

        if (criarFichaError) throw criarFichaError;
        fichaLivre = novaFicha;
      }

      // 5. Criar registro em fichaEvento
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

      // 6. Gerar QR Code visual
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fichaLivre.qr_code)}`;
      
      // 7. Definir dados da ficha
      const novaFicha = {
        id: fichaLivre.id,
        nome_titular: nome,
        contato: contato,
        saldo: 0,
        qrCode: fichaLivre.qr_code
      };

      setFichaAtribuida(novaFicha);
      setQrCodeUrl(qrUrl);

      // 8. Salvar no localStorage
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
      {loading && <div>Carregando...</div>}
      
      {error && (
        <div>
          <h2>Ops!</h2>
          <p>{error}</p>
        </div>
      )}

      {eventoAtivo && !fichaAtribuida && !loading && (
        <div>
          <h2>Cadastro para: {eventoAtivo.nome}</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleCadastro(formData.get('nome'), formData.get('contato'));
          }}>
            <input name="nome" placeholder="Seu nome completo" required />
            <input name="contato" placeholder="Seu telefone/email" required />
            <button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}

      {fichaAtribuida && eventoAtivo && (
        <div>
          <h2>Sua Ficha Digital</h2>
          <p><strong>Evento:</strong> {eventoAtivo.nome}</p>
          <p><strong>Nome:</strong> {fichaAtribuida.nome_titular}</p>
          <p><strong>Saldo:</strong> R$ {fichaAtribuida.saldo.toFixed(2)}</p>
          
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <img src={qrCodeUrl} alt="Sua Ficha Digital" style={{ maxWidth: '300px' }} />
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p><strong>Instruções:</strong></p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Apresente este QR Code para fazer recargas</li>
              <li>Apresente este QR Code para comprar nos stands</li>
              <li>Atualize a página para ver seu saldo atual</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Convidado;