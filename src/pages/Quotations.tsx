import React, { useState, useEffect } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import QuotationDetails from '../components/quotations/QuotationDetails';
import { Quotation } from '../types';
import { format } from 'date-fns';
import { Search, Eye, Trash2, X } from 'lucide-react';

export default function Quotations() {
  const { quotations, deleteQuotation } = useQuotations();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localQuotations, setLocalQuotations] = useState<Quotation[]>(quotations);

  // Update local quotations when the main quotations list changes
  useEffect(() => {
    setLocalQuotations(quotations);
  }, [quotations]);

  const handleDelete = (e: React.MouseEvent, quotation: Quotation) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(quotation.id);
      if (selectedQuotation?.id === quotation.id) {
        setSelectedQuotation(null);
      }
    }
  };

  const handleQuotationUpdate = (updatedQuotation: Quotation) => {
    // Update the local state immediately
    setLocalQuotations(prev => 
      prev.map(q => q.id === updatedQuotation.id ? updatedQuotation : q)
    );
    setSelectedQuotation(updatedQuotation);
  };

  const filteredQuotations = localQuotations.filter(quotation => 
    quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const formatTotal = (total: number | undefined) => {
    return total !== undefined ? total.toFixed(2) : '0.00';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Quotations</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ref no. or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredQuotations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredQuotations.map((quotation) => (
              <li
                key={quotation.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedQuotation(quotation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        Ref: {quotation.id}
                      </p>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        statusColors[quotation.status as keyof typeof statusColors]
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        Client: {quotation.clientId}
                      </p>
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
                      Total: ₹{formatTotal(quotation.total)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuotation(quotation);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-5 w-5" />
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
          <p className="text-gray-500">
            {searchTerm 
              ? 'No quotations found matching your search.'
              : 'No quotations found. Create a quotation from the Quotation Generator page!'
            }
          </p>
        </div>
      )}

      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quotation Details</h2>
            </div>
            <QuotationDetails 
              quotation={selectedQuotation}
              onClose={() => setSelectedQuotation(null)}
              onSave={handleQuotationUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}