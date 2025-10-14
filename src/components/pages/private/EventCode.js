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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('Erro na sessão:', sessionError);
          return;
        }

        const idOrg = session.user.id;
        setOrganizationId(idOrg);

        const guestRegistrationUrl = `${window.location.origin}/convidado/${idOrg}`;
        
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
        <h2>QR CODE DE CADASTRO</h2>
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
          <ol>
            <li>Seus convidados escaneiam o código e fazem seu cadastro</li>
            <li>O sistema gera uma ficha digital para cada convidado</li>
            <li>A ficha é válida somente enquanto o evento estiver ativo</li>
          </ol>
        </div>
        
        <div className={styles.alert}>
          <h4>ATENÇÃO:</h4>
          <ul>
            <li>Este QR Code só funciona se houver um evento ativo</li>
            <li>Este QR Code pode ser reutilizado para TODOS os eventos</li>
            <li>Cada convidado receberá uma ficha digital única</li>
            <li>Os dados das fichas são apagados quando o evento é finalizado</li>
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