import React, { useState } from 'react';
import { Invoice } from '../../types/invoice';
import { Download, Send } from 'lucide-react';
import InvoicePDFModal from '../invoice/InvoicePDFModal';
import { X } from 'lucide-react';
import { format } from 'date-fns';

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
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const handleDownload = () => {
    setIsPDFModalOpen(true);
  };

  const handleSend = () => {
    // TODO: Implement email sending functionality
    console.log('Sending invoice...');
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Invoice Details</h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Invoice Number: {invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">Date: {format(invoice.date, 'dd/MM/yyyy')}</p>
                  <p className="text-sm text-gray-500">Client: {clientName}</p>
                  <p className="text-sm text-gray-500">Total Amount: ₹{invoice.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500">Status: 
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      </div>

      <InvoicePDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        invoice={invoice}
        clientName={clientName}
      />
    </div>
  );
};
