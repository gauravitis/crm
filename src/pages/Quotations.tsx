import React, { useState } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import QuotationForm from '../components/quotations/QuotationForm';
import QuotationDetails from '../components/quotations/QuotationDetails';
import { Quotation } from '../types';
import { format } from 'date-fns';
import { Trash2, Plus, X } from 'lucide-react';

export default function Quotations() {
  const { quotations, addQuotation, updateQuotation, deleteQuotation } = useQuotations();
  const [showForm, setShowForm] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  const handleSubmit = (data: any) => {
    if (editingQuotation) {
      updateQuotation(editingQuotation.id, data);
      setEditingQuotation(null);
    } else {
      addQuotation(data);
    }
    setShowForm(false);
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setShowForm(true);
    setSelectedQuotation(null);
  };

  const handleDelete = (e: React.MouseEvent, quotation: Quotation) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(quotation.id);
      if (selectedQuotation?.id === quotation.id) {
        setSelectedQuotation(null);
      }
    }
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <button
          onClick={() => {
            setEditingQuotation(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Quotation
        </button>
      </div>

      {quotations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <li
                key={quotation.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedQuotation(quotation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {quotation.clientName}
                      </p>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        statusColors[quotation.status as keyof typeof statusColors]
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        Created: {format(new Date(quotation.createdAt), 'PP')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valid until: {format(new Date(quotation.validUntil), 'PP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-900">
                      Total: ₹{quotation.total.toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => handleEdit(quotation)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, quotation)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No quotations found. Create your first quotation to get started!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {editingQuotation ? 'Edit Quotation' : 'New Quotation'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingQuotation(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <QuotationForm
              onSubmit={handleSubmit}
              initialData={editingQuotation}
            />
          </div>
        </div>
      )}

      {selectedQuotation && (
        <QuotationDetails
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
        />
      )}
    </div>
  );
}