import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useItems } from '../../hooks/useItems';
import { Item } from '../../types/item';

interface CreateItemModalProps {
  onClose: () => void;
  onItemCreated: (item: Item) => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({ onClose, onItemCreated }) => {
  const { addItem } = useItems();
  const [formData, setFormData] = useState({
    name: '',
    catalogueId: '',
    sku: '',
    packSize: '',
    price: 0,
    quantity: 0,
    hsnCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem = await addItem(formData);
    if (newItem) {
      onItemCreated(newItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catalogue ID</label>
            <input
              type="text"
              value={formData.catalogueId}
              onChange={(e) => setFormData(prev => ({ ...prev, catalogueId: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pack Size</label>
            <input
              type="text"
              value={formData.packSize}
              onChange={(e) => setFormData(prev => ({ ...prev, packSize: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">HSN Code</label>
            <input
              type="text"
              value={formData.hsnCode}
              onChange={(e) => setFormData(prev => ({ ...prev, hsnCode: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
