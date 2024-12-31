import { useState, useCallback, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types';

export function useClients() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const getClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(clientsQuery);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Client[];
      setClients(clientsData);
      return clientsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(errorMessage);
      console.error('Error fetching clients:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load clients on mount
  useEffect(() => {
    getClients();
  }, []);

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
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

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add client';
      setError(errorMessage);
      console.error('Error adding client:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (id: string, clientData: Partial<Client>) => {
    setLoading(true);
    setError(null);
    try {
      const clientRef = doc(db, 'clients', id);
      await updateDoc(clientRef, {
        ...clientData,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      setClients(prev => 
        prev.map(client => 
          client.id === id 
            ? { ...client, ...clientData }
            : client
        )
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client';
      setError(errorMessage);
      console.error('Error updating client:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(client => client.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client';
      setError(errorMessage);
      console.error('Error deleting client:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clients,
    loading,
    error,
    getClients,
    addClient,
    updateClient,
    deleteClient,
  };
}