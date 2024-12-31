import React from 'react';
import { Invoice } from '../../types/invoice';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import InvoicePDF from '../invoice/InvoicePDF';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  clientName: string;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  onClose,
  clientName,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative bg-white rounded-lg shadow-xl mx-4 my-8 max-w-4xl md:mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium">Invoice Details</h3>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <InvoicePDF invoice={invoice} clientName={clientName} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Invoice Details</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Invoice Number:</span> {invoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Date:</span> {format(new Date(invoice.date), 'dd/MM/yyyy')}
                </p>
                {invoice.dueDate && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Client Details</h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Name:</span> {clientName}
                </p>
                {invoice.clientAddress && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Address:</span> {invoice.clientAddress}
                  </p>
                )}
                {invoice.clientGST && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">GST Number:</span> {invoice.clientGST}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatAmount(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatAmount(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {invoice.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <p className="text-sm text-gray-900">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-900">
                <span>Subtotal:</span>
                <span>{formatAmount(invoice.subtotal)}</span>
              </div>
              {(invoice.taxAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-gray-900">
                  <span>Tax Amount:</span>
                  <span>{formatAmount(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                <span>Total Amount:</span>
                <span>{formatAmount(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
