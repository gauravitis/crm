import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { z } from 'zod';

// Generic type for API responses
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Generic CRUD operations
export const apiClient = {
  // Get all documents from a collection
  getAll: async <T>(collectionName: string): Promise<ApiResponse<T[]>> => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  },

  // Add a new document
  create: async <T>(collectionName: string, data: T): Promise<ApiResponse<T>> => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { data: { ...data, id: docRef.id } as T };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  },

  // Update a document
  update: async <T>(collectionName: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data as any);
      return { data: { id, ...data } as T };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  },

  // Delete a document
  delete: async (collectionName: string, id: string): Promise<ApiResponse<void>> => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }
};
