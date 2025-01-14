import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { useQuotations } from '../../hooks/useQuotations';
import { QuotationData } from '../../types/quotation-generator';

interface QuotationDetailsProps {
  quotation: QuotationData;
  onClose: () => void;
  onSave: (quotation: QuotationData) => void;
}

export default function QuotationDetails({ quotation, onClose, onSave }: QuotationDetailsProps) {
  const { updateQuotation } = useQuotations();
  const [currentStatus, setCurrentStatus] = useState(quotation.status || 'PENDING');
  const [hasChanges, setHasChanges] = useState(false);

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'SENT', label: 'Sent' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const updatedQuotation = {
        ...quotation,
        status: currentStatus
      };
      await updateQuotation(updatedQuotation);
      setHasChanges(false);
      onSave(updatedQuotation);
      toast.success('Quotation status updated successfully');
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation status');
    }
  };

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-purple-100 text-purple-800',
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, 'PP');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatNumber = (value: any, decimals: number = 2): string => {
    const num = Number(value || 0);
    return isNaN(num) ? '0' : num.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      {/* Reference and Status */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">Reference Number</h3>
          <p className="text-gray-600">{quotation.quotationRef || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Status</h3>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[currentStatus as keyof typeof statusColors] || statusColors.PENDING
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
        <div className="space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">Company: </span>
            {quotation.billTo?.company || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Contact Person: </span>
            {quotation.billTo?.contactPerson || quotation.billTo?.name || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Address: </span>
            {quotation.billTo?.address && typeof quotation.billTo.address === 'object' 
              ? `${quotation.billTo.address.street || ''}, 
                 ${quotation.billTo.address.city || ''}, 
                 ${quotation.billTo.address.state || ''} 
                 ${quotation.billTo.address.postalCode || ''}, 
                 ${quotation.billTo.address.country || ''}`.replace(/\s+/g, ' ').trim()
              : quotation.billTo?.address || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone: </span>
            {quotation.billTo?.phone || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email: </span>
            {quotation.billTo?.email || 'N/A'}
          </p>
        </div>
      </div>

      {/* Employee Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">Created By</h3>
        <div className="space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">Name: </span>
            {quotation.employee?.name || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone: </span>
            {quotation.employee?.phone || quotation.employee?.mobile || 'N/A'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email: </span>
            {quotation.employee?.email || 'N/A'}
          </p>
          {quotation.employee?.designation && (
            <p className="text-gray-600">
              <span className="font-medium">Designation: </span>
              {quotation.employee.designation}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium">Created Date</h3>
          <p className="text-gray-600">{formatDate(quotation.quotationDate)}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Valid Until</h3>
          <p className="text-gray-600">{formatDate(quotation.validTill)}</p>
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
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discounted Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">GST %</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(quotation.items || []).map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{item.product_description || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatNumber(item.qty, 0)}</td>
                  <td className="px-4 py-2 text-sm text-right">₹{formatNumber(item.unit_rate)}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatNumber(item.discount_percent, 0)}%</td>
                  <td className="px-4 py-2 text-sm text-right">₹{formatNumber(item.discounted_value)}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatNumber(item.gst_percent, 0)}%</td>
                  <td className="px-4 py-2 text-sm text-right">₹{formatNumber(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right">Sub Total:</td>
                <td className="px-4 py-2 text-sm text-right">₹{formatNumber(quotation.subTotal)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right">Tax:</td>
                <td className="px-4 py-2 text-sm text-right">₹{formatNumber(quotation.tax)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-sm font-medium text-right">Grand Total:</td>
                <td className="px-4 py-2 text-sm text-right font-bold">₹{formatNumber(quotation.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Payment Terms</h3>
          <p className="text-gray-600">{quotation.paymentTerms || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Notes</h3>
          <p className="text-gray-600">{quotation.notes || 'N/A'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
