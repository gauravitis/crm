import React, { useState, useEffect } from 'react';
import { Client, Item, QuotationItem } from '../../types';
import { useItems } from '../../hooks/useItems';
import { useClients } from '../../hooks/useClients';

interface QuotationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function QuotationForm({ onSubmit, initialData }: QuotationFormProps) {
  const { items } = useItems();
  const { clients } = useClients();
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil 
      ? new Date(initialData.validUntil).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>(
    initialData?.items || [{ description: '', quantity: 1, price: 0, discount: 0, gst: 18, total: 0 }]
  );
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

  const calculateItemTotal = (item: QuotationItem) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * item.gst) / 100;
    return afterDiscount + gstAmount;
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...quotationItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    // Recalculate total whenever any field changes
    newItems[index].total = calculateItemTotal(newItems[index]);
    setQuotationItems(newItems);
  };

  const handleAddItem = () => {
    setQuotationItems([
      ...quotationItems,
      { description: '', quantity: 1, price: 0, discount: 0, gst: 18, total: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clientId,
      status,
      validUntil: new Date(validUntil),
      items: quotationItems,
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    handleItemChange(index, 'description', value);
    
    // Filter items for suggestions
    if (value.trim()) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.catalogueId.toLowerCase().includes(value.toLowerCase()) ||
        item.sku.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (index: number, item: Item) => {
    handleItemChange(index, 'description', item.name);
    handleItemChange(index, 'price', item.price);
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Valid Until</label>
        <input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Items</label>
        <div className="mt-2">
          {/* Headers for the columns */}
          <div className="flex space-x-2 mb-2 px-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700">GST (%)</label>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">Total (₹)</label>
            </div>
            <div className="w-16"></div> {/* Space for remove button */}
          </div>

          <div className="space-y-2">
            {quotationItems.map((item, index) => (
              <div key={index} className="flex space-x-2 items-start">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    onFocus={() => setFocusedItemIndex(index)}
                    placeholder="Enter item description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {focusedItemIndex === index && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(index, suggestion)}
                        >
                          {suggestion.name} - {suggestion.catalogueId} ({suggestion.sku})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  placeholder="Qty"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="1"
                />
                
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                />

                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  max="100"
                />

                <input
                  type="number"
                  value={item.gst}
                  onChange={(e) => handleItemChange(index, 'gst', parseFloat(e.target.value) || 0)}
                  placeholder="18"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  min="0"
                  max="100"
                />

                <div className="w-24 text-right font-medium text-gray-900 pt-2">
                  ₹{item.total.toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800 w-16 pt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        
        <button
          type="button"
          onClick={handleAddItem}
          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Item
        </button>
      </div>
    </div>

      <div className="text-right text-lg font-medium">
        Total: ₹{quotationItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Quotation
        </button>
      </div>
    </form>
  );
}