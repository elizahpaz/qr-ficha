import styles from './Funcionamento.module.css';

const Funcionamento = () => {
  return (
    <div id='funcionamento' className={styles.grandeContainer}>
        <h1 className={styles.title}>Como funciona</h1>

        <div className={styles.cardContainer}>
            <div className={styles.card}>
                <img className={styles.img} src="https://img.freepik.com/vetores-gratis/perfil-pessoal-de-mulher-empregador-segurando-o-curriculo-do-candidato-a-emprego-funcionario-curriculo-elemento-de-design-plano-isolado-clinica-medica-ilustracao-de-conceito-de-cartao-de-paciente-de-hospital_335657-1660.jpg?t=st=1760123263~exp=1760126863~hmac=c8bf02f5f66b0c01c9d2a32ad92e5f246e8e41c49afbaa8d1b7d880e0d26732c&w=1060" alt="" />
                <div className={styles.cardBody}>
                    <p>1. Cadastre sua instituição, seus eventos e itens a serem vendidos</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="https://img.freepik.com/vetores-gratis/processamento-de-pagamento-de-compras-transacao-com-cartao-de-credito-operacao-financeira-transferencia-eletronica-de-dinheiro-comprador-usando-e-pagamento-com-cartao-de-credito-sem-contato_335657-2382.jpg?t=st=1760129617~exp=1760133217~hmac=e6063e706c907749268f9bf7657f81e2d9f255df660176100275233d03086e38&w=1060" alt="" />
                <div className={styles.cardBody}>
                    <p>2. Carregue as fichas dos participantes com o valor pago no caixa</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="https://img.freepik.com/vetores-gratis/leitura-de-codigo-qr-em-smartphone_23-2148624200.jpg?t=st=1760122261~exp=1760125861~hmac=c37420a05fd0a5c63d4c805bdcf47570bc11e5c3e6fd6fa2dff078fdcb47a0c8&w=1060" alt="" />
                <div className={styles.cardBody}>
                    <p>3. Use o QR Code da ficha para todas as transações do evento</p>
                </div>
            </div>

            <div className={styles.card}>
                <img className={styles.img} src="https://img.freepik.com/vetores-gratis/formulario-de-documento-online-acordo-digital-contrato-eletronico-questionario-na-internet-para-fazer-a-lista-observe-cedula-de-votacao-ilustracao-de-conceito-de-elemento-de-design-plano-de-votacao_335657-2013.jpg?t=st=1760122434~exp=1760126034~hmac=7a065a5baf84e7cd2be9c22988cd2139e8091f5c27840f368f7a8244b3814720&w=1060" alt="" />
                <div className={styles.cardBody}>
                    <p>4. Acesse o relatório de vendas e tenha total controle da contabilidade do evento</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Funcionamento;