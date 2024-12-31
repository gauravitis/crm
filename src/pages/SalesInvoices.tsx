import React, { useState, useRef } from 'react';
import { Invoice } from '../types/invoice';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { InvoiceDetails } from '../components/invoices/InvoiceDetails';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { Plus } from 'lucide-react';

export const SalesInvoices = () => {
  const { addInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { clients } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const listRef = useRef<{ loadInvoices: () => Promise<void> }>();

  const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addInvoice(invoiceData);
    setShowForm(false);
    setSelectedInvoice(undefined);
    listRef.current?.loadInvoices();
  };

  const handleUpdateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData);
      setShowForm(false);
      setSelectedInvoice(undefined);
      listRef.current?.loadInvoices();
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(invoice.id);
      listRef.current?.loadInvoices();
    }
  };

  const getClientName = (invoice: Invoice) => {
    // First try to use the partyName from the invoice
    if (invoice.partyName) {
      return invoice.partyName;
    }
    
    // If partyName is not available, try to find the client by partyId
    const client = clients.find(c => c.id === invoice.partyId);
    return client ? client.name : 'Unknown Client';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Invoices</h1>
        <button
          onClick={() => {
            setSelectedInvoice(undefined);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Sales Invoice
        </button>
      </div>

      <InvoiceList
        ref={listRef}
        type="SALES"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <InvoiceForm
          type="SALES"
          invoice={selectedInvoice}
          onSubmit={selectedInvoice ? handleUpdateInvoice : handleAddInvoice}
          onClose={() => {
            setShowForm(false);
            setSelectedInvoice(undefined);
          }}
        />
      )}

      {showDetails && selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetails(false);
            setSelectedInvoice(undefined);
          }}
          clientName={getClientName(selectedInvoice)}
        />
      )}
    </div>
  );
};
