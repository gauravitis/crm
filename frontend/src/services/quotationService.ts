import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Quotation } from '../types/quotation';

const COLLECTION_NAME = 'quotations';

export const quotationService = {
  async getQuotations(): Promise<Quotation[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Quotation));
  },

  async addQuotation(quotation: Omit<Quotation, 'id'>): Promise<Quotation> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), quotation);
    return {
      id: docRef.id,
      ...quotation
    };
  },

  async updateQuotation(id: string, quotation: Partial<Quotation>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, quotation);
  },

  async deleteQuotation(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
