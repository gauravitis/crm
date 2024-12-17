import React from 'react';
import { Quotation } from '../../types';
import { useClients } from '../../hooks/useClients';
import { format } from 'date-fns';
import { generatePDF, generateDOCX } from '../../utils/documentGenerator';
import { FileText, FileType } from 'lucide-react';

interface QuotationDetailsProps {
  quotation: Quotation;
  onClose: () => void;
}

export default function QuotationDetails({ quotation, onClose }: QuotationDetailsProps) {
  const { clients } = useClients();
  const client = clients.find(c => c.id === quotation.clientId);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quotation Details</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => generatePDF(quotation)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FileType className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => generateDOCX(quotation)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Word
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-medium">{client?.name}</p>
            </div>
            <div>
              <span className={`px-2 py-1 rounded-full text-sm ${statusColors[(quotation.status || 'draft') as keyof typeof statusColors]}`}>
                {quotation.status 
                  ? quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)
                  : 'Draft'
                }
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Valid Until</p>
            <p className="font-medium">{format(new Date(quotation.validUntil), 'dd/MM/yyyy')}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Items</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">{item.description}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.discount}%</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.gst}%</td>
                      <td className="px-4 py-2 whitespace-nowrap">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold">₹{quotation.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
