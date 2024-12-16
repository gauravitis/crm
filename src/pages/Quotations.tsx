import React, { useState } from 'react';
import { Quotation } from '../types';
import { useQuotations } from '../hooks/useQuotations';
import { useClients } from '../hooks/useClients';
import { useItems } from '../hooks/useItems';
import QuotationList from '../components/quotations/QuotationList';
import QuotationForm from '../components/quotations/QuotationForm';
import { Plus } from 'lucide-react';

export default function Quotations() {
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useQuotations();
  const { clients } = useClients();
  const { items } = useItems();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  const handleSubmit = (data: Omit<Quotation, 'id' | 'createdAt' | 'total'>) => {
    if (editingQuotation) {
      updateQuotation(editingQuotation.id, data);
    } else {
      addQuotation(data);
    }
    setIsFormOpen(false);
    setEditingQuotation(null);
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(id);
    }
  };

  const handleCreateSale = (quotation: Quotation) => {
    // TODO: Implement sale creation
    console.log('Creating sale from quotation:', quotation);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Quotations</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quotation
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
              <h2 className="text-lg font-medium mb-4">
                {editingQuotation ? 'Edit Quotation' : 'Add New Quotation'}
              </h2>
              <QuotationForm
                clients={clients}
                items={items}
                onSubmit={handleSubmit}
                initialData={editingQuotation || undefined}
              />
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingQuotation(null);
                }}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <QuotationList
            quotations={quotations}
            clients={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateSale={handleCreateSale}
          />
        </div>
      </div>
    </div>
  );
}