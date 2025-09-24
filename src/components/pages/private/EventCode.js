import { useState, useEffect } from 'react';
import { supabase } from '../../../database/supabaseClient';
import styles from './EventCode.module.css';

const EventCode = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateQRCode() {
      try {
        // Pegar o ID da organização logada
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('Erro na sessão:', sessionError);
          return;
        }

        const idOrg = session.user.id;
        setOrganizationId(idOrg);

        // URL que sempre levará para o cadastro do convidado
        const guestRegistrationUrl = `${window.location.origin}/convidado/${idOrg}`;
        
        // API QR-Server gera o QR Code para a Organização
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(guestRegistrationUrl)}`;
        
        setQrCodeUrl(qrApiUrl);
        setLoading(false);

      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        setLoading(false);
      }
    }

    generateQRCode();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Gerando QR Code...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.qrSection}>
        <h2>QR Code de Cadastro</h2>
        <div className={styles.qrContainer}>
          <img 
            src={qrCodeUrl} 
            alt="QR Code para cadastro de convidados" 
            className={styles.qrImage}
          />
        </div>
      </div>

      <div className={styles.instructions}>
        <h3>Como funciona</h3>
        <div className={styles.instructionsList}>
          <p>1.Compartilhe este QR Code com os convidados do seu evento</p>
          <p>2.Convidados escaneiam o código e fazem seu cadastro</p>
          <p>3.Sistema gera uma ficha digital única para cada convidado</p>
          <p>4.Ficha é válida apenas durante eventos ativos</p>
        </div>
        
        <div className={styles.alert}>
          <h4>⚠️ ATENÇÃO:</h4>
          <ul>
            <li>Este QR Code só funciona se houver um evento ativo</li>
            <li>O mesmo QR Code pode ser reutilizado para TODOS os eventos</li>
            <li>Cada convidado receberá uma ficha digital única</li>
            <li>As fichas são automaticamente limpas ao finalizar um evento</li>
          </ul>
        </div>
      </div>

      <div className={styles.urlInfo}>
        <h4>URL do QR Code:</h4>
        <code className={styles.url}>
          {`${window.location.origin}/convidado/${organizationId}`}
        </code>
        <p className={styles.urlDescription}>
          Esta URL leva diretamente para a tela de cadastro do convidado
        </p>
      </div>
    </div>
  );
};

export default EventCode;