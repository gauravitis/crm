import React, { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { Employee } from '../types/employee';
import EmployeeList from '../components/employees/EmployeeList';
import EmployeeForm from '../components/employees/EmployeeForm';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export default function Employees() {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      if (selectedEmployee) {
        await updateEmployee({ ...formData, id: selectedEmployee.id });
      } else {
        await createEmployee(formData);
      }
      setIsFormOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employee.id);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button
          onClick={() => {
            setSelectedEmployee(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <EmployeeList
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isFormOpen && (
        <EmployeeForm
          initialData={selectedEmployee}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}
