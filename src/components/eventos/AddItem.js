import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../database/supabaseClient';
import CardItem from './CardItem';
import SubmitButton from '../form/SubmitButton';
import styles from './AddItem.module.css';
import { RiAddLargeFill } from 'react-icons/ri';

function AddItem() {
  const { idEvento } = useParams();
  const [eventName, setEventName] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEventData();
  }, [idEvento]);

  const loadEventData = async () => {
    if (!idEvento) return;

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('Evento')
        .select('nome')
        .eq('id', idEvento)
        .single();

      if (eventError) throw eventError;
      setEventName(eventData.nome);

      const { data: itemsData, error: itemsError } = await supabase
        .from('Item')
        .select('*')
        .eq('id_evento', idEvento);

      if (itemsError) throw itemsError;
      
      const formattedItems = itemsData.map(item => ({
        id: item.id,
        id_evento: item.id_evento,
        nome_item: item.nome,
        preco: item.valor
      }));

      setItems(formattedItems);

    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    }
  };

  const handleAddItem = () => {
    const tempId = Date.now() + Math.random();
    setItems(prev => [...prev, { 
      id: tempId, 
      id_evento: idEvento, 
      nome_item: '', 
      preco: ''
    }]);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await supabase
        .from('Item')
        .delete()
        .eq('id', itemId);

      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError('Erro ao remover item: ' + err.message);
    }
  };
  
  const handleUpdateItem = (updatedItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleFinalizar = async () => {
    setLoading(true);
    setError('');

    try {
      await supabase
        .from('Item')
        .delete()
        .eq('id_evento', idEvento);

      const itensParaSalvar = items.map(item => ({
        id_evento: idEvento,
        nome: item.nome_item,
        valor: item.preco
      }));

      const { error } = await supabase
        .from('Item')
        .insert(itensParaSalvar);

      if (error) throw error;

      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirEvento = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o evento "${eventName}" e os itens? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await supabase
        .from('Item')
        .delete()
        .eq('id_evento', idEvento);

      const { error } = await supabase
        .from('Evento')
        .delete()
        .eq('id', idEvento);

      if (error) throw error;

      alert('Evento excluído com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao excluir evento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ITENS DO EVENTO:</h2>
      <h2 className={styles.title}>{eventName}</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {items.map((item) => (
        <CardItem
          key={item.id} id={item.id} initialData={item}
          onUpdate={handleUpdateItem} onRemove={handleRemoveItem}/>
      ))}

      <button className={styles.addItem} onClick={handleAddItem} disabled={loading}>
        <RiAddLargeFill className={styles.icon} />
      </button>

      <div className={styles.actionButtons}>
        <button className={styles.deleteEventButton} onClick={handleExcluirEvento} disabled={loading}>
          EXCLUIR EVENTO
        </button>

        <SubmitButton text={loading ? "Salvando..." : "SALVAR"} type="submit" 
          onClick={handleFinalizar} disabled={loading || items.length === 0} />
      </div>
      
    </div>
  );
}

export default AddItem;