import { useState, useEffect } from 'react';
import styles from './CardItem.module.css';
import Input from '../form/Input';

function CardItem({ id, onUpdate, onRemove, initialData }) {
  const [nome, setNome] = useState(initialData?.nome_item || initialData?.nome || '');
  const [preco, setPreco] = useState(initialData?.preco || initialData?.valor || '');

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome_item || initialData.nome || '');
      setPreco(initialData.preco || initialData.valor || '');
    }
  }, [initialData?.id]); 

  useEffect(() => {
    if (onUpdate) {
      onUpdate({ 
        id, 
        nome_item: nome, 
        preco: preco 
      });
    }
  }, [nome, preco]);

  const handleDelete = () => {
    onRemove(id);
  };

  const handleNomeChange = (e) => {
    setNome(e.target.value);
  };

  const handlePrecoChange = (e) => {
    setPreco(e.target.value);
  };

  return (
    <div className={styles.container}>
      <form className={styles.cardForm} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.inputNome}>
          <Input type="text" id={`nome-${id}`} text="Nome do Item" 
            value={nome} onChange={handleNomeChange} required/>
        </div>

        <div className={styles.inputRow}>
          <Input type="number" id={`preco-${id}`} text="Valor" 
            value={preco} onChange={handlePrecoChange}
            step="0.01" min="0" required/>
          <button  type="button" 
            onClick={handleDelete} className={styles.deleteButton}>
            Excluir
          </button>
        </div>
      </form>
    </div>
  );
}

export default CardItem;