import React from 'react';
import { Item } from '../../types/item';

interface ItemFormProps {
  onSubmit: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Item;
}

export default function ItemForm({ onSubmit, onCancel, initialData }: ItemFormProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    catalogueId: initialData?.catalogueId || '',
    sku: initialData?.sku || '',
    packSize: initialData?.packSize || '',
    price: initialData?.price || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Item Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="catalogueId" className="block text-sm font-medium text-gray-700">
          Catalogue ID
        </label>
        <input
          type="text"
          name="catalogueId"
          id="catalogueId"
          required
          value={formData.catalogueId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
          SKU
        </label>
        <input
          type="text"
          name="sku"
          id="sku"
          required
          value={formData.sku}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="packSize" className="block text-sm font-medium text-gray-700">
          Pack Size
        </label>
        <input
          type="text"
          name="packSize"
          id="packSize"
          required
          value={formData.packSize}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          name="price"
          id="price"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Add'} Item
        </button>
      </div>
    </form>
  );
}
