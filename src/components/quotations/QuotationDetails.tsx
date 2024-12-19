import React from 'react';
import { Quotation } from '../../types';
import { useClients } from '../../hooks/useClients';
import { format } from 'date-fns';
import { generateWord } from '../../utils/documentGenerator';
import { FileText } from 'lucide-react';
import { QuotationFormData } from '../../types/quotation-generator';

interface QuotationDetailsProps {
  quotation: Quotation;
  onClose: () => void;
}

const calculateItemTotal = (item: any) => {
  const subtotal = item.quantity * item.price;
  const discountAmount = (subtotal * item.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = (afterDiscount * item.gst) / 100;
  return afterDiscount + gstAmount;
};

export default function QuotationDetails({ quotation, onClose }: QuotationDetailsProps) {
  const { clients } = useClients();
  const client = clients.find(c => c.id === quotation.clientId);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const convertToFormData = (quotation: Quotation, client: any): QuotationFormData => {
    return {
      clientDetails: {
        name: client.name || '',
        company: client.company || '',
        address: client.address || '',
        phone: client.phone || '',
        email: client.email || '',
      },
      items: quotation.items.map(item => ({
        id: item.id,
        catalogNo: item.catalogNo || '',
        packSize: item.packSize || '',
        description: item.description,
        quantity: item.quantity,
        unitRate: item.price,
        gst: item.gst,
      })),
      terms: [
        'Payment: Payment within 15 days.',
        'Validity: 30 Days',
        'Please check specification before order'
      ],
      bankDetails: {
        bankName: 'HDFC BANK LTD.',
        accountNo: '50200017511430',
        ifscCode: 'HDFC0000590',
        branchCode: '0590'
      }
    };
  };

  const handleGenerateWord = async () => {
    try {
      if (!client) {
        alert('Client information not found');
        return;
      }

      const formData = convertToFormData(quotation, client);
      await generateWord(formData);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Error generating Word document. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quotation Details</h2>
          <div className="space-x-2">
            <button
              onClick={handleGenerateWord}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Word
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
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
                      <td className="px-4 py-2 whitespace-nowrap">₹{calculateItemTotal(item).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold">₹{quotation.items.reduce((sum, item) => sum + calculateItemTotal(item), 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
