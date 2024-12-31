import React from 'react';
import { QuotationFormData } from '../../types/quotation-generator';
import { generatePDF, generateWord } from '../../utils/documentGenerator';

interface QuotationPreviewProps {
  data: QuotationFormData;
  onEdit: () => void;
  onDownload: (format: 'pdf' | 'docx') => void;
}

export default function QuotationPreview({ data, onEdit, onDownload }: QuotationPreviewProps) {
  const calculateSubtotal = (item: typeof data.items[0]) => {
    return item.quantity * item.unitRate;
  };

  const calculateGST = (item: typeof data.items[0]) => {
    return (calculateSubtotal(item) * item.gst) / 100;
  };

  const calculateTotal = (item: typeof data.items[0]) => {
    return calculateSubtotal(item) + calculateGST(item);
  };

  const grandTotal = data.items.reduce((sum, item) => sum + calculateTotal(item), 0);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Quotation Preview</h2>
      </div>

      {/* Client Details */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Client Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{data.clientDetails.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{data.clientDetails.company}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">{data.clientDetails.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{data.clientDetails.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{data.clientDetails.email}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cat No.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pack Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">GST</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm">{item.catalogNo}</td>
                  <td className="px-4 py-2 text-sm">{item.packSize}</td>
                  <td className="px-4 py-2 text-sm">{item.description}</td>
                  <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-right">₹{item.unitRate.toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right">₹{calculateSubtotal(item).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right">₹{calculateGST(item).toFixed(2)}</td>
                  <td className="px-4 py-2 text-sm text-right font-medium">₹{calculateTotal(item).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={7} className="px-4 py-2 text-right font-medium">Grand Total:</td>
                <td className="px-4 py-2 text-right font-bold">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms and Conditions */}
      {data.terms && data.terms.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Terms and Conditions</h3>
          <ul className="list-disc list-inside space-y-1">
            {data.terms.map((term, index) => (
              <li key={index} className="text-sm text-gray-600">{term}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bank Details */}
      {data.bankDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Bank Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">{data.bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account No.</p>
              <p className="font-medium">{data.bankDetails.accountNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IFSC Code</p>
              <p className="font-medium">{data.bankDetails.ifscCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Branch Code</p>
              <p className="font-medium">{data.bankDetails.branchCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onEdit}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={() => generatePDF(data)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Download PDF
        </button>
        <button
          onClick={() => generateWord(data)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Download DOCX
        </button>
      </div>
    </div>
  );
}
