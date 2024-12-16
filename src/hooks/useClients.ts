import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Client } from '../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsQuery = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(clientsQuery);
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Client[];
        setClients(clientsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clients');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
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
      setError(err instanceof Error ? err.message : 'Failed to add client');
      console.error('Error adding client:', err);
      throw err;
    }
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    try {
      const docRef = doc(db, 'clients', id);
      await updateDoc(docRef, data);
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...data } : client
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      console.error('Error updating client:', err);
      throw err;
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      console.error('Error deleting client:', err);
      throw err;
    }
  }, []);

  return { clients, loading, error, addClient, updateClient, deleteClient };
}