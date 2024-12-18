import React, { useEffect, useState } from 'react';
import { Invoice } from '../../types/invoice';
import { useInvoices } from '../../hooks/useInvoices';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceListProps {
  type: 'SALES' | 'PURCHASE';
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ type, onView, onEdit, onDelete }) => {
  const { getInvoices, loading, error } = useInvoices();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadInvoices();
  }, [type]);

  const loadInvoices = async () => {
    const fetchedInvoices = await getInvoices(type);
    setInvoices(fetchedInvoices);
  };

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

  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading invoices...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Party Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invoice.invoiceNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.partyName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(invoice.date, 'dd/MM/yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₹{invoice.totalAmount.toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button
                  onClick={() => onView(invoice)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Eye className="h-5 w-5" />
                </button>
                {invoice.status === 'DRAFT' && (
                  <>
                    <button
                      onClick={() => onEdit(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(invoice)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
