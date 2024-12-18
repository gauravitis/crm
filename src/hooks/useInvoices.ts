import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Invoice } from '../types/invoice';
import { Client } from '../types/client';
import { Vendor } from '../types/vendor';

export const useInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInvoices = useCallback(async (type?: 'SALES' | 'PURCHASE') => {
    setLoading(true);
    setError(null);
    try {
      const invoicesRef = collection(db, 'invoices');
      const constraints = [orderBy('createdAt', 'desc')];
      
      if (type) {
        constraints.push(where('type', '==', type));
      }
      
      const q = query(invoicesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const invoices: Invoice[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let partyDetails = null;
        
        // Fetch client/vendor details
        if (data.partyId) {
          const partyRef = doc(db, type === 'SALES' ? 'clients' : 'vendors', data.partyId);
          const partyDoc = await getDoc(partyRef);
          if (partyDoc.exists()) {
            partyDetails = {
              id: partyDoc.id,
              ...partyDoc.data()
            } as (Client | Vendor);
          }
        }
        
        invoices.push({
          id: docSnapshot.id,
          ...data,
          date: data.date.toDate(),
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          client: type === 'SALES' ? partyDetails : undefined,
          vendor: type === 'PURCHASE' ? partyDetails : undefined,
        } as Invoice);
      }
      
      return invoices;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInvoiceNumber = useCallback(async (type: 'SALES' | 'PURCHASE') => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(
        invoicesRef,
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
      );
      const querySnapshot = await getDocs(q);
      const lastInvoice = querySnapshot.docs[0];

      const prefix = type === 'SALES' ? 'SI' : 'PI';
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

      if (!lastInvoice) {
        return `${prefix}/${year}${month}/0001`;
      }

      const lastNumber = parseInt(lastInvoice.data().invoiceNumber.split('/')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(4, '0');
      return `${prefix}/${year}${month}/${newNumber}`;
    } catch (err) {
      console.error('Error generating invoice number:', err);
      return null;
    }
  }, []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        date: Timestamp.fromDate(new Date(invoiceData.date)),
        dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate)),
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add invoice');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'invoices', id);
      const updateData = {
        ...invoiceData,
        updatedAt: Timestamp.now(),
      };
      
      if (invoiceData.date) {
        updateData.date = Timestamp.fromDate(new Date(invoiceData.date));
      }
      if (invoiceData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(new Date(invoiceData.dueDate));
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'invoices', id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInvoices,
    generateInvoiceNumber,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  };
};
