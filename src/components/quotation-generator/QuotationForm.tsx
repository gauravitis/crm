import React, { useState } from 'react';
import { QuotationFormData, QuotationItemData } from '../../types/quotation-generator';
import { Plus, Trash2 } from 'lucide-react';

interface QuotationFormProps {
  onSubmit: (data: QuotationFormData) => void;
  onCancel: () => void;
}

const defaultItem: QuotationItemData = {
  id: '',
  catalogNo: '',
  packSize: '',
  description: '',
  quantity: 1,
  unitRate: 0,
  gst: 18,
  leadTime: '1-2 weeks'
};

export default function QuotationForm({ onSubmit, onCancel }: QuotationFormProps) {
  const [formData, setFormData] = useState<QuotationFormData>({
    clientDetails: {
      name: '',
      company: '',
      address: '',
      phone: '',
      email: ''
    },
    items: [{ ...defaultItem, id: '1' }],
    terms: [
      'Payment: Payment within 15 days.',
      'Validity: 30Days',
      'Please check specification before order'
    ],
    bankDetails: {
      bankName: 'HDFC BANK LTD.',
      accountNo: '50200017511430',
      ifscCode: 'HDFC0000590',
      branchCode: '0590'
    }
  });

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      clientDetails: {
        ...prev.clientDetails,
        [name]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItemData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...defaultItem, id: String(prev.items.length + 1) }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Client Details Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.clientDetails.name}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              name="company"
              value={formData.clientDetails.company}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={formData.clientDetails.address}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.clientDetails.phone}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.clientDetails.email}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>
        
        {formData.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-8 gap-4 mb-4 items-end">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Cat No.</label>
              <input
                type="text"
                value={item.catalogNo}
                onChange={(e) => handleItemChange(index, 'catalogNo', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Pack Size</label>
              <input
                type="text"
                value={item.packSize}
                onChange={(e) => handleItemChange(index, 'packSize', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Rate</label>
              <input
                type="number"
                value={item.unitRate}
                onChange={(e) => handleItemChange(index, 'unitRate', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GST %</label>
              <input
                type="number"
                value={item.gst}
                onChange={(e) => handleItemChange(index, 'gst', Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="inline-flex items-center text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Quotation
        </button>
      </div>
    </form>
  );
}
