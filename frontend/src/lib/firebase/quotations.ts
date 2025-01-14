import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { QuotationData } from '@/types/quotation-generator';

const QUOTATIONS_COLLECTION = 'quotations';

export const addQuotation = async (quotationData: QuotationData) => {
  try {
    const docRef = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
      ...quotationData,
      createdAt: new Date().toISOString(), // Store as ISO string for proper ordering
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding quotation:', error);
    throw error;
  }
};

export const getQuotations = async (): Promise<QuotationData[]> => {
  try {
    const q = query(
      collection(db, QUOTATIONS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const quotations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as QuotationData[];

    console.log('Retrieved quotations:', quotations.map(q => ({
      ref: q.quotationRef,
      employee: q.employee,
      document: q.document ? 'present' : 'missing',
      createdAt: q.createdAt
    })));

    return quotations;
  } catch (error) {
    console.error('Error getting quotations:', error);
    throw error;
  }
};
