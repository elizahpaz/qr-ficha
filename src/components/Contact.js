import styles from './Contact.module.css';

const Contact = () => {
  return (
    <div className={styles.container}>
        <div className={styles.formSection}>
            <h2 className={styles.title}>Fale com a gente</h2>
            <p className={styles.subtitle}>
            Tem alguma dúvida sobre o QR Ficha? Envie uma mensagem!
            </p>
            <form className={styles.contactForm}>
            <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Seu e-mail</label>
                <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="seuemail@exemplo.com"
                required
                />
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
            <button type="submit" className={styles.button}>Enviar</button>
            </form>
        </div>
    </div>
  )
}

export default Contact;