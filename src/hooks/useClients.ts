import { useState, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types';

export function useClients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClients = useCallback(async () => {
    setLoading(true);
    try {
      const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(clientsQuery);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Client[];
      return clientsData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        createdAt: Timestamp.fromDate(new Date()),
      });

      const newClient: Client = {
        ...clientData,
        id: docRef.id,
        createdAt: new Date(),
      };

      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client');
      console.error('Error adding client:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    setLoading(true);
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, clientData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      console.error('Error updating client:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'clients', id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      console.error('Error deleting client:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getClients,
    addClient,
    updateClient,
    deleteClient,
  };
}