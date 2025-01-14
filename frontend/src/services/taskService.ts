import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task } from '../types/task';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    const tasksRef = collection(db, COLLECTION_NAME);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  },

  async createTask(task: Omit<Task, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), task);
    return docRef.id;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, updates);
  },

  async deleteTask(taskId: string): Promise<void> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await deleteDoc(taskRef);
  }
};
