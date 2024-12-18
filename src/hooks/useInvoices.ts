import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Invoice } from '../types/invoice';

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
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invoices.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Invoice);
      });
      
      return invoices;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const now = Timestamp.now();
      const invoiceRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        date: Timestamp.fromDate(new Date(invoiceData.date)),
        dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate)),
        createdAt: now,
        updatedAt: now,
      });
      
      return invoiceRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add invoice');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt'>>) => {
    setLoading(true);
    setError(null);
    try {
      const invoiceRef = doc(db, 'invoices', id);
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

      await updateDoc(invoiceRef, updateData);
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
    setError(null);
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

  const generateInvoiceNumber = useCallback(async (type: 'SALES' | 'PURCHASE') => {
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      
      const invoicesRef = collection(db, 'invoices');
      const q = query(
        invoicesRef,
        where('type', '==', type),
        orderBy('invoiceNumber', 'desc'),
        where('invoiceNumber', '>=', `${type === 'SALES' ? 'SI' : 'PI'}${year}${month}0000`),
        where('invoiceNumber', '<=', `${type === 'SALES' ? 'SI' : 'PI'}${year}${month}9999`)
      );
      
      const querySnapshot = await getDocs(q);
      const lastInvoice = querySnapshot.docs[0];
      
      if (!lastInvoice) {
        return `${type === 'SALES' ? 'SI' : 'PI'}${year}${month}0001`;
      }
      
      const lastNumber = parseInt(lastInvoice.data().invoiceNumber.slice(-4));
      const newNumber = (lastNumber + 1).toString().padStart(4, '0');
      return `${type === 'SALES' ? 'SI' : 'PI'}${year}${month}${newNumber}`;
    } catch (err) {
      console.error('Error generating invoice number:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    getInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoiceNumber,
  };
};
