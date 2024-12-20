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
    quantity: initialData?.quantity || 0,
    hsnCode: initialData?.hsnCode || '',
    batchNo: initialData?.batchNo || '',
    mfgDate: initialData?.mfgDate ? new Date(initialData.mfgDate).toISOString().split('T')[0] : '',
    expDate: initialData?.expDate ? new Date(initialData.expDate).toISOString().split('T')[0] : '',
    brand: initialData?.brand || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      mfgDate: formData.mfgDate ? new Date(formData.mfgDate) : null,
      expDate: formData.expDate ? new Date(formData.expDate) : null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="space-y-4 pb-4">
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
          <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700">
            HSN Code
          </label>
          <input
            type="text"
            name="hsnCode"
            id="hsnCode"
            required
            value={formData.hsnCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="batchNo" className="block text-sm font-medium text-gray-700">
            Batch Number
          </label>
          <input
            type="text"
            name="batchNo"
            id="batchNo"
            required
            value={formData.batchNo}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="mfgDate" className="block text-sm font-medium text-gray-700">
            Manufacturing Date
          </label>
          <input
            type="date"
            name="mfgDate"
            id="mfgDate"
            value={formData.mfgDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="expDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="date"
            name="expDate"
            id="expDate"
            value={formData.expDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            id="brand"
            required
            value={formData.brand}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity in Stock
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 bg-white pt-4 border-t mt-4">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {initialData ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </div>
    </form>
  );
}
