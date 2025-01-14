import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../types/employee';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeeData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Employee[];
      setEmployees(employeeData);
      setLoading(false);
    } catch (err) {
      setError('Error fetching employees');
      setLoading(false);
    }
  };

  const createEmployee = async (input: CreateEmployeeInput) => {
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const newEmployee: Employee = {
        id: docRef.id,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEmployees([...employees, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError('Error creating employee');
      throw err;
    }
  };

  const updateEmployee = async (input: UpdateEmployeeInput) => {
    try {
      const { id, ...updateData } = input;
      await updateDoc(doc(db, 'employees', id), {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      const updatedEmployee: Employee = {
        ...input,
        createdAt: employees.find(e => e.id === id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEmployees(employees.map(emp => emp.id === id ? updatedEmployee : emp));
      return updatedEmployee;
    } catch (err) {
      setError('Error updating employee');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      setError('Error deleting employee');
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
