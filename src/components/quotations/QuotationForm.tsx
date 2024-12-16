import React, { useState, useRef, useEffect } from 'react';
import { Quotation, QuotationItem, Client, Item } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface QuotationFormProps {
  clients: Client[];
  items: Item[];
  onSubmit: (data: Omit<Quotation, 'id' | 'createdAt' | 'total'>) => void;
  initialData?: Partial<Quotation>;
}

export default function QuotationForm({ clients, items, onSubmit, initialData }: QuotationFormProps) {
  const [formData, setFormData] = useState({
    clientId: initialData?.clientId || '',
    items: initialData?.items || [],
    status: initialData?.status || 'draft',
    validUntil: initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '',
  });

  const [newItem, setNewItem] = useState<Partial<QuotationItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDescriptionChange = (value: string) => {
    setNewItem(prev => ({ ...prev, description: value }));
    if (value.trim()) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.catalogueId.toLowerCase().includes(value.toLowerCase()) ||
        item.sku.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleItemSelect = (item: Item) => {
    setNewItem(prev => ({
      ...prev,
      description: item.name,
      unitPrice: item.price,
    }));
    setShowSuggestions(false);
  };

  const addItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) return;
    
    const item: QuotationItem = {
      id: Math.random().toString(36).substring(2),
      description: newItem.description!,
      quantity: newItem.quantity!,
      unitPrice: newItem.unitPrice!,
      total: newItem.quantity! * newItem.unitPrice!,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));

    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="client" className="block text-sm font-medium text-gray-700">
          Client
        </label>
        <select
          id="client"
          value={formData.clientId}
          onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} - {client.company}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
        <div className="space-y-4">
          {formData.items.map(item => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onFocus={() => newItem.description && setShowSuggestions(true)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              {showSuggestions && (
                <div 
                  ref={suggestionRef}
                  className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                >
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer hover:bg-blue-50 px-4 py-2"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku} | Price: {formatCurrency(item.price)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No items found</div>
                  )}
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
          Valid Until
        </label>
        <input
          type="date"
          id="validUntil"
          value={formData.validUntil}
          onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Quotation['status'] }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Quotation
        </button>
      </div>
    </form>
  );
}