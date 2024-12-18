import React from 'react';
import { Dialog } from '@headlessui/react';
import { XIcon } from 'lucide-react';
import { Invoice } from '../../types';
import InvoicePDF from './InvoicePDF';

interface InvoicePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  clientName: string;
}

const InvoicePDFModal: React.FC<InvoicePDFModalProps> = ({
  isOpen,
  onClose,
  invoice,
  clientName,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative mx-auto w-[90vw] max-w-4xl rounded-lg bg-white p-4 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-6 w-6" />
          </button>

          <div className="mt-4 h-[80vh]">
            <InvoicePDF invoice={invoice} clientName={clientName} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default InvoicePDFModal;
