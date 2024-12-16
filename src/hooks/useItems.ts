import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item } from '../types/item';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(itemsQuery);
        const itemsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Item[];
        setItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const addItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'items'), {
        ...itemData,
        createdAt: Timestamp.fromDate(new Date()),
      });

      const newItem: Item = {
        ...itemData,
        id: docRef.id,
        createdAt: new Date(),
      };

      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      console.error('Error adding item:', err);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, data: Partial<Item>) => {
    try {
      const docRef = doc(db, 'items', id);
      await updateDoc(docRef, data);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating item:', err);
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
      throw err;
    }
  }, []);

  return { items, loading, error, addItem, updateItem, deleteItem };
}
