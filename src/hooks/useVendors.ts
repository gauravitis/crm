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
import { Vendor } from '../types/vendor';

export const useVendors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorsRef = collection(db, 'vendors');
      const q = query(vendorsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const vendors: Vendor[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vendors.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Vendor);
      });
      
      return vendors;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addVendor = useCallback(async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const now = Timestamp.now();
      const vendorRef = await addDoc(collection(db, 'vendors'), {
        ...vendorData,
        createdAt: now,
        updatedAt: now,
      });
      
      return vendorRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add vendor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (id: string, vendorData: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => {
    setLoading(true);
    setError(null);
    try {
      const vendorRef = doc(db, 'vendors', id);
      await updateDoc(vendorRef, {
        ...vendorData,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'vendors', id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getVendors,
    addVendor,
    updateVendor,
    deleteVendor,
  };
};
