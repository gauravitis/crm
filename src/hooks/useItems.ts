import { useState, useCallback, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  Timestamp, 
  query, 
  orderBy,
  runTransaction,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Item } from '../types/item';

export function useItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const getItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsQuery = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(itemsQuery);
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Item[];
      setItems(itemsData);
      return itemsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch items';
      setError(errorMessage);
      console.error('Error fetching items:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on mount
  useEffect(() => {
    getItems();
  }, [getItems]);

  const addItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      console.error('Error adding item:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id: string, itemData: Partial<Item>) => {
    setLoading(true);
    setError(null);
    try {
      const itemRef = doc(db, 'items', id);
      await updateDoc(itemRef, {
        ...itemData,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...itemData }
            : item
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      console.error('Error updating item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'items', id));
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      console.error('Error deleting item:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to update item quantities in batch
  const updateItemQuantities = useCallback(async (
    items: Array<{ id: string; quantity: number }>, 
    type: 'PURCHASE' | 'SALES'
  ) => {
    try {
      await runTransaction(db, async (transaction) => {
        for (const item of items) {
          const itemRef = doc(db, 'items', item.id);
          const itemDoc = await transaction.get(itemRef);
          
          if (!itemDoc.exists()) {
            throw new Error(`Item with ID ${item.id} not found`);
          }

          const currentQuantity = itemDoc.data().quantity || 0;
          let newQuantity: number;

          if (type === 'PURCHASE') {
            // Add to inventory for purchases
            newQuantity = currentQuantity + item.quantity;
          } else {
            // Subtract from inventory for sales
            newQuantity = currentQuantity - item.quantity;
            if (newQuantity < 0) {
              throw new Error(`Insufficient quantity for item ${itemDoc.data().name}`);
            }
          }

          transaction.update(itemRef, { quantity: newQuantity });
        }
      });

      // Refresh items list after successful transaction
      await getItems();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item quantities';
      setError(errorMessage);
      console.error('Error updating item quantities:', err);
      return false;
    }
  }, [getItems]);

  return {
    items,
    loading,
    error,
    getItems,
    addItem,
    updateItem,
    deleteItem,
    updateItemQuantities
  };
}
