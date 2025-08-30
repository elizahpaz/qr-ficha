import styles from './Contact.module.css';
import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';

const Contact = () => {
  return (
    <div id='contato' className={styles.container}>
        <div className={styles.formSection}>
            <h2 className={styles.title}>Fale com a gente</h2>
            <p className={styles.subtitle}>
            Tem alguma dúvida sobre o QR Ficha? Envie uma mensagem!
            </p>
            <form className={styles.contactForm}>
            <div className={styles.inputGroup}>
              <Input type="email" text="Seu e-mail" name="email"
                placeholder="seuemail@exemplo.com"
                required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="message" className={styles.label}>Sua mensagem</label>
              <textarea
              id="message"
              className={styles.textarea}
              rows="5"
              placeholder="Escreva sua mensagem aqui..."
              required
              ></textarea>
            </div>
            <SubmitButton text={"Enviar"}/>
            </form>
        </div>
    </div>
  )
}

export default Contact;