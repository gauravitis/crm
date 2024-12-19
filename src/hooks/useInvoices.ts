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
import { useItems } from './useItems';

export const useInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateItemQuantities } = useItems();

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
            
            // Update party details with the latest data
            data.partyName = partyDetails.name;
            data.partyAddress = partyDetails.address || data.partyAddress;
            data.partyGST = partyDetails.gstNumber || data.partyGST;
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

      let sequence = 1;
      if (lastInvoice) {
        const lastNumber = lastInvoice.data().invoiceNumber;
        const lastSequence = parseInt(lastNumber.slice(-4));
        sequence = lastSequence + 1;
      }

      return `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`;
    } catch (err) {
      console.error('Error generating invoice number:', err);
      throw err;
    }
  }, []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      // First try to update item quantities
      const success = await updateItemQuantities(
        invoiceData.items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        invoiceData.type
      );

      if (!success) {
        throw new Error('Failed to update item quantities');
      }

      const now = new Date();
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        type: invoiceData.type, // Explicitly set the type
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        date: Timestamp.fromDate(new Date(invoiceData.date)),
        dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate)),
        items: invoiceData.items.map(item => ({
          ...item,
          id: item.id || item.itemId, // Ensure we have the item ID
        }))
      });

      return {
        id: docRef.id,
        ...invoiceData,
        createdAt: now,
        updatedAt: now,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add invoice';
      setError(errorMessage);
      console.error('Error adding invoice:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateItemQuantities]);

  const updateInvoice = useCallback(async (
    id: string, 
    invoiceData: Partial<Invoice>, 
    originalInvoice?: Invoice
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (invoiceData.items && originalInvoice) {
        // First revert the original quantities
        await updateItemQuantities(
          originalInvoice.items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          originalInvoice.type === 'SALES' ? 'PURCHASE' : 'SALES' // Reverse the operation
        );

        // Then apply the new quantities
        const success = await updateItemQuantities(
          invoiceData.items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          originalInvoice.type
        );

        if (!success) {
          throw new Error('Failed to update item quantities');
        }
      }

      const invoiceRef = doc(db, 'invoices', id);
      const updateData = {
        ...invoiceData,
        updatedAt: Timestamp.fromDate(new Date()),
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      console.error('Error updating invoice:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateItemQuantities]);

  const deleteInvoice = useCallback(async (id: string, invoice: Invoice) => {
    setLoading(true);
    setError(null);
    try {
      // First revert the quantities
      const success = await updateItemQuantities(
        invoice.items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        invoice.type === 'SALES' ? 'PURCHASE' : 'SALES' // Reverse the operation
      );

      if (!success) {
        throw new Error('Failed to update item quantities');
      }

      await deleteDoc(doc(db, 'invoices', id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      console.error('Error deleting invoice:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateItemQuantities]);

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
