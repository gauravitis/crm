import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '../../types/invoice';
import { useInvoices } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { useVendors } from '../../hooks/useVendors';
import { useItems } from '../../hooks/useItems';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { CreateItemModal } from '../items/CreateItemModal';

interface InvoiceFormProps {
  type: 'SALES' | 'PURCHASE';
  invoice?: Invoice;
  onSubmit: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ type, invoice, onSubmit, onClose }) => {
  const { generateInvoiceNumber } = useInvoices();
  const { getClients } = useClients();
  const { getVendors } = useVendors();
  const { items: availableItems } = useItems();
  
  const [parties, setParties] = useState<any[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>({
    type,
    invoiceNumber: 'Loading...',
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    status: 'DRAFT',
    partyId: '',
    partyName: '',
    partyAddress: '',
    partyGST: '',
    items: [],
    subtotal: 0,
    taxAmount: 0,
    deliveryCharges: 0,
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
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.taxAmount || 0,
        deliveryCharges: invoice.deliveryCharges || 0,
        totalAmount: invoice.totalAmount || 0,
        paymentDue: invoice.paymentDue || 0,
        paymentReceived: invoice.paymentReceived || 0,
        items: invoice.items?.map(item => ({
          ...item,
          quantity: item.quantity || 0,
          price: item.price || 0,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          amount: item.amount || 0,
          deliveryCharges: item.deliveryCharges || 0,
        })) || [],
      });
    } else {
      generateNewInvoiceNumber();
    }
  }, [invoice]);

  const loadInitialData = async () => {
    try {
      if (type === 'SALES') {
        const clients = await getClients();
        setParties(clients);
      } else {
        const vendors = await getVendors();
        setParties(vendors);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generateNewInvoiceNumber = async () => {
    const number = await generateInvoiceNumber(type);
    if (number) {
      setFormData(prev => ({ ...prev, invoiceNumber: number }));
    }
  };

  const handlePartyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.id === partyId);
    
    if (selectedParty) {
      setFormData(prev => ({
        ...prev,
        partyId: selectedParty.id,
        partyName: selectedParty.name,
        partyAddress: selectedParty.address || '',
        partyGST: selectedParty.gstNumber || '',
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: '', // This will be set when an item is selected
          itemId: '',
          name: '',
          quantity: 1,
          price: 0,
          hsnCode: '',
          taxRate: 18,
          taxAmount: 0,
          amount: 0,
          deliveryCharges: 0,
        },
      ],
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };

      if (field === 'itemId') {
        // When an item is selected from the dropdown
        const selectedItem = availableItems.find(i => i.id === value);
        if (selectedItem) {
          item.id = selectedItem.id;
          item.itemId = selectedItem.id;
          item.name = selectedItem.name;
          item.price = selectedItem.price;
          item.hsnCode = selectedItem.hsnCode;
        }
      } else {
        item[field] = value;
      }

      // Ensure numeric values
      if (field === 'quantity') item.quantity = parseInt(value) || 0;
      if (field === 'price') item.price = parseFloat(value) || 0;
      if (field === 'taxRate') item.taxRate = parseFloat(value) || 0;
      if (field === 'deliveryCharges') item.deliveryCharges = parseFloat(value) || 0;

      // Recalculate amounts
      item.amount = (item.quantity || 0) * (item.price || 0);
      item.taxAmount = (item.amount * (item.taxRate || 0)) / 100;

      newItems[index] = item;

      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxAmount = newItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const deliveryCharges = newItems.reduce((sum, item) => sum + (item.deliveryCharges || 0), 0);
      const totalAmount = subtotal + taxAmount + deliveryCharges + prev.deliveryCharges;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        deliveryCharges,
        totalAmount,
        paymentDue: totalAmount,
      };
    });
  };

  const handleDeliveryChargesChange = (value: string) => {
    const deliveryCharges = parseFloat(value) || 0;
    setFormData(prev => {
      const totalAmount = prev.subtotal + prev.taxAmount + deliveryCharges;
      return {
        ...prev,
        deliveryCharges,
        totalAmount,
        paymentDue: totalAmount,
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const taxAmount = newItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      const deliveryCharges = newItems.reduce((sum, item) => sum + (item.deliveryCharges || 0), 0);
      const totalAmount = subtotal + taxAmount + deliveryCharges + prev.deliveryCharges;

      return {
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        deliveryCharges,
        totalAmount,
        paymentDue: totalAmount,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.partyId) {
      alert('Please select a ' + (type === 'SALES' ? 'client' : 'vendor'));
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // Validate items have required fields
    const invalidItems = formData.items.filter(item => !item.itemId || !item.quantity || !item.price);
    if (invalidItems.length > 0) {
      alert('Please fill in all item details');
      return;
    }

    onSubmit(formData);
  };

  const handleNewItemCreated = (newItem: any) => {
    // Add the new item to the current invoice
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newItem.id,
          itemId: newItem.id,
          name: newItem.name,
          quantity: 1,
          price: newItem.price,
          hsnCode: newItem.hsnCode || '',
          taxRate: 18,
          taxAmount: (newItem.price * 18) / 100,
          amount: newItem.price,
          deliveryCharges: 0,
        },
      ],
    }));
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
                readOnly
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
                value={formData.partyGST || ''}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Items</label>
            <div className="mt-2 space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end border p-4 rounded-md">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Item</label>
                    <select
                      value={item.itemId || ''}
                      onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Item</option>
                      {availableItems.map(availableItem => (
                        <option key={availableItem.id} value={availableItem.id}>
                          {availableItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 0}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price || 0}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.taxRate || 0}
                      onChange={(e) => handleItemChange(index, 'taxRate', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Charges</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.deliveryCharges || 0}
                      onChange={(e) => handleItemChange(index, 'deliveryCharges', e.target.value)}
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

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateItemModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Item
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{(formData.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Amount:</span>
                <span>₹{(formData.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charges:</span>
                <div className="flex items-center">
                  <span className="mr-2">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deliveryCharges || 0}
                    onChange={(e) => handleDeliveryChargesChange(e.target.value)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Amount:</span>
                <span>₹{(formData.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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

      {showCreateItemModal && (
        <CreateItemModal
          onClose={() => setShowCreateItemModal(false)}
          onItemCreated={(item) => {
            handleNewItemCreated(item);
            setShowCreateItemModal(false);
          }}
        />
      )}
    </div>
  );
};
