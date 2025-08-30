import styles from './Funcionamento.module.css';

const Funcionamento = () => {
  return (
    <div id='funcionamento' className={styles.grandeContainer}>
        <h1 className={styles.title}>Como funciona</h1>

        <div className={styles.cardContainer}>
            <div className={styles.card}>
                <img className={styles.img} src="" alt="" />
                <div className={styles.cardBody}>
                    <p>1. Crie seu evento e ative suas fichas digitais reutilizáveis</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="" alt="" />
                <div className={styles.cardBody}>
                    <p>2. Carregue as fichas dos participantes com o valor pago no caixa único</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="" alt="" />
                <div className={styles.cardBody}>
                    <p>3. Use o QR Code da ficha para todas as transações nos pontos de venda</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="" alt="" />
                <div className={styles.cardBody}>
                    <p>4. Acesse o relatório de vendas e tenha total controle da contabilidade do evento</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Funcionamento;