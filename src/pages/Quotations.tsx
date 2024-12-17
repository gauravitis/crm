import React, { useState } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import QuotationForm from '../components/quotations/QuotationForm';
import QuotationDetails from '../components/quotations/QuotationDetails';
import { Quotation } from '../types';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

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
            setShowForm(true);
            setEditingQuotation(null);
            setSelectedQuotation(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Quotation
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[1000px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingQuotation ? 'Edit Quotation' : 'New Quotation'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingQuotation(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <QuotationForm onSubmit={handleSubmit} initialData={editingQuotation} />
          </div>
        </div>
      )}

      {selectedQuotation && (
        <QuotationDetails
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
        />
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotations.map((quotation) => (
              <tr 
                key={quotation.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedQuotation(quotation)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {quotation.clientName || 'Unknown Client'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[(quotation.status || 'draft') as keyof typeof statusColors]}`}>
                    {quotation.status 
                      ? quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)
                      : 'Draft'
                    }
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(quotation.validUntil), 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₹{quotation.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(quotation);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, quotation)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}