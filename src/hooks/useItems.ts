import { useState, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item } from '../types/item';

export function useItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getItems = useCallback(async () => {
    setLoading(true);
    try {
      const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(itemsQuery);
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Item[];
      return itemsData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    setLoading(true);
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

      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      console.error('Error adding item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id: string, itemData: Partial<Omit<Item, 'id' | 'createdAt'>>) => {
    setLoading(true);
    try {
      const itemRef = doc(db, 'items', id);
      await updateDoc(itemRef, itemData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      console.error('Error updating item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'items', id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getItems,
    addItem,
    updateItem,
    deleteItem,
  };
}
