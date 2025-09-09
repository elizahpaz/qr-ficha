import Input from "../form/Input";

const CadastroEvento = () => {
  return (
    <div className="containerContent">
        <h1>Criar novo evento</h1>
        <Input type="file" id="coverImg" />
        <Input type="text" id="nomeEvento" placeholder="Nome do evento" />

        <hr />

        <div className="listaItens">
            <h2>Itens a serem vendidos</h2>
            

        </div>
    </div>
  )
}

export default CadastroEvento