import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QuotationData } from '../types/quotation-generator';

const COLLECTION_NAME = 'quotations';

const convertTimestampToString = (timestamp: any): string => {
  if (!timestamp) return '';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return timestamp;
};

export const quotationService = {
  async getQuotations() {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          quotationRef: data.quotationRef || data.id || doc.id,
          billTo: data.billTo || {
            name: data.clientId || 'Unknown',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || ''
          },
          employee: data.employee || {
            id: '',
            name: 'N/A',
            email: '',
            phone: '',
            designation: ''
          },
          document: data.document ? {
            filename: data.document.filename,
            data: data.document.data
          } : undefined,
          quotationDate: convertTimestampToString(data.quotationDate) || convertTimestampToString(data.createdAt) || new Date().toISOString(),
          validTill: convertTimestampToString(data.validTill) || convertTimestampToString(data.validUntil) || '',
          items: data.items || [],
          subTotal: data.subTotal || data.subtotal || 0,
          tax: data.tax || 0,
          grandTotal: data.grandTotal || data.total || 0,
          paymentTerms: data.paymentTerms || '',
          notes: data.notes || '',
          status: (data.status || 'PENDING').toUpperCase(),
          createdAt: convertTimestampToString(data.createdAt) || new Date().toISOString()
        } as QuotationData;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  },

  async addQuotation(quotation: Omit<QuotationData, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...quotation,
      status: quotation.status || 'PENDING',
      createdAt: new Date().toISOString(),
    });
    return {
      ...quotation,
      id: docRef.id,
    };
  },

  async updateQuotation(id: string, quotation: Partial<QuotationData>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, quotation);
    return {
      ...quotation,
      id,
    };
  },

  async deleteQuotation(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },
};
