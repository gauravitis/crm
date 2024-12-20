import React, { useState } from 'react';
import { Quotation } from '../../types';
import { format } from 'date-fns';
import { useQuotations } from '../../hooks/useQuotations';
import { toast } from 'react-toastify';

interface QuotationDetailsProps {
  quotation: Quotation;
  onClose: () => void;
  onSave: (updatedQuotation: Quotation) => void;
}

export default function QuotationDetails({ quotation, onClose, onSave }: QuotationDetailsProps) {
  const { updateQuotation } = useQuotations();
  const [currentStatus, setCurrentStatus] = useState(quotation.status);
  const [hasChanges, setHasChanges] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as Quotation['status']);
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving status:', currentStatus);
    const updatedQuotation = {
      ...quotation,
      status: currentStatus
    };
    updateQuotation(quotation.id, updatedQuotation);
    setHasChanges(false);
    toast.success('Changes saved successfully!');
    onSave(updatedQuotation);
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Reference and Status */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">Reference Number</h3>
          <p className="text-gray-600">{quotation.id}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Status</h3>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[currentStatus as keyof typeof statusColors]
            } border-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Client Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">Client Details</h3>
        <p className="text-gray-600">{quotation.clientId}</p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium">Created Date</h3>
          <p className="text-gray-600">{format(new Date(quotation.createdAt), 'PP')}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Valid Until</h3>
          <p className="text-gray-600">{format(new Date(quotation.validUntil), 'PP')}</p>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <h3 className="text-lg font-medium mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotation.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.discount}%</td>
                  <td className="px-4 py-2 text-sm text-right">{item.gst}%</td>
                  <td className="px-4 py-2 text-sm text-right">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-sm font-medium text-right">Total Amount:</td>
                <td className="px-4 py-2 text-sm font-medium text-right">₹{quotation.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
