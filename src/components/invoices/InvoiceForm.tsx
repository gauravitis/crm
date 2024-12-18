import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '../../types/invoice';
import { useInvoices } from '../../hooks/useInvoices';
import { useItems } from '../../hooks/useItems';
import { useClients } from '../../hooks/useClients';
import { useVendors } from '../../hooks/useVendors';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceFormProps {
  type: 'SALES' | 'PURCHASE';
  invoice?: Invoice;
  onSubmit: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ type, invoice, onSubmit, onClose }) => {
  const { generateInvoiceNumber } = useInvoices();
  const { getItems } = useItems();
  const { getClients } = useClients();
  const { getVendors } = useVendors();
  
  const [items, setItems] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const [formData, setFormData] = useState({
    type,
    invoiceNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    status: 'DRAFT',
    partyId: '',
    partyName: '',
    partyAddress: '',
    partyGST: '',
    items: [] as InvoiceItem[],
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    paymentTerms: 'Net 30',
    paymentStatus: 'UNPAID',
    paymentDue: 0,
    paymentReceived: 0,
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
  }, [type]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        date: format(new Date(invoice.date), 'yyyy-MM-dd'),
        dueDate: format(new Date(invoice.dueDate), 'yyyy-MM-dd'),
      });
    } else {
      generateNewInvoiceNumber();
    }
  }, [invoice]);

  const loadInitialData = async () => {
    const fetchedItems = await getItems();
    setItems(fetchedItems);

    if (type === 'SALES') {
      const clients = await getClients();
      setParties(clients);
    } else {
      const vendors = await getVendors();
      setParties(vendors);
    }
  };

  const generateNewInvoiceNumber = async () => {
    const number = await generateInvoiceNumber(type);
    if (number) {
      setFormData(prev => ({ ...prev, invoiceNumber: number }));
    }
  };

  const handlePartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const party = parties.find(p => p.id === e.target.value);
    if (party) {
      setFormData(prev => ({
        ...prev,
        partyId: party.id,
        partyName: party.name,
        partyAddress: party.address,
        partyGST: party.gstNumber || '',
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: '',
          name: '',
          quantity: 1,
          price: 0,
          hsnCode: '',
          taxRate: 18, // Default GST rate
          taxAmount: 0,
          amount: 0,
        },
      ],
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };

      // Recalculate amounts
      item.amount = item.quantity * item.price;
      item.taxAmount = (item.amount * item.taxRate) / 100;

      newItems[index] = item;

      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = newItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount,
        paymentDue: totalAmount,
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = newItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const totalAmount = subtotal + taxAmount;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount,
        paymentDue: totalAmount,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative bg-white rounded-lg shadow-xl mx-4 my-8 max-w-4xl md:mx-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">
            {invoice ? 'Edit' : 'Create'} {type === 'SALES' ? 'Sales' : 'Purchase'} Invoice
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {type === 'SALES' ? 'Client' : 'Vendor'}
              </label>
              <select
                value={formData.partyId}
                onChange={handlePartyChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select {type === 'SALES' ? 'Client' : 'Vendor'}</option>
                {parties.map(party => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">GST Number</label>
              <input
                type="text"
                value={formData.partyGST}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Items</label>
            <div className="mt-2 space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border p-4 rounded-md">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <select
                      value={item.itemId}
                      onChange={(e) => {
                        const selectedItem = items.find(i => i.id === e.target.value);
                        if (selectedItem) {
                          handleItemChange(index, 'itemId', selectedItem.id);
                          handleItemChange(index, 'name', selectedItem.name);
                          handleItemChange(index, 'price', selectedItem.price);
                          handleItemChange(index, 'hsnCode', selectedItem.hsnCode);
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{formData.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Amount:</span>
                <span>₹{formData.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>₹{formData.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {invoice ? 'Update' : 'Create'} Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
