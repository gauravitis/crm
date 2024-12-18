import React from 'react';
import { Invoice } from '../../types/invoice';
import { X, Download, Send } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
  onDownload?: () => void;
  onSend?: () => void;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  onClose,
  onDownload,
  onSend,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            {onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            )}
            {onSend && invoice.status === 'DRAFT' && (
              <button
                onClick={onSend}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </button>
            )}
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
                  <span className="font-medium">Date:</span> {format(invoice.date, 'dd/MM/yyyy')}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Due Date:</span> {format(invoice.dueDate, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                {invoice.type === 'SALES' ? 'Client' : 'Vendor'} Details
              </h4>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Name:</span> {invoice.partyName}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Address:</span> {invoice.partyAddress}
                </p>
                {invoice.partyGST && (
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">GST Number:</span> {invoice.partyGST}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HSN Code
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.hsnCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.taxRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{item.amount.toLocaleString('en-IN')}
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
                <span>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Tax Amount:</span>
                <span>₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                <span>Total Amount:</span>
                <span>₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-900">
                <span>Payment Received:</span>
                <span>₹{invoice.paymentReceived.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-red-600">
                <span>Balance Due:</span>
                <span>₹{(invoice.totalAmount - invoice.paymentReceived).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
