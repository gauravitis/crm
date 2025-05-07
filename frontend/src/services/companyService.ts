import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { Company } from '../types/company';

const COLLECTION_NAME = 'companies';

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Company));
  },

  async getActiveCompanies(): Promise<Company[]> {
    const companies = await this.getCompanies();
    return companies.filter(company => company.active);
  },

  async getCompany(id: string): Promise<Company | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Company;
    }
    
    return null;
  },

  async addCompany(company: Omit<Company, 'id'>): Promise<Company> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), company);
    return {
      id: docRef.id,
      ...company
    };
  },

  async updateCompany(id: string, company: Partial<Company>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, company);
  },

  async deleteCompany(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
}; 