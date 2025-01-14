import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { Item } from '../../types/item';
import { useItems } from '../../hooks/useItems';
import { useClients } from '../../hooks/useClients';
import { toast } from 'react-toastify';
import { getFirestore } from 'firebase/firestore';

interface ExtendedItem extends Item {
  isNew?: boolean;
}

interface QuotationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface QuotationItem {
  sno: number;
  cat_no: string;
  pack_size: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit_rate: number;
  discount_percent: number;
  discount_value: number;
  gst_percent: number;
  gst_value: number;
  total: number;
}

export default function QuotationForm({ onSubmit, initialData }: QuotationFormProps) {
  const { items, loading, error, addItem } = useItems();
  const { clients } = useClients();
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil 
      ? new Date(initialData.validUntil).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>(
    initialData?.items || [{
      sno: 1,
      cat_no: '',
      pack_size: '',
      description: '',
      hsn_code: '',
      quantity: 1,
      unit_rate: 0,
      discount_percent: 0,
      discount_value: 0,
      gst_percent: 18,
      gst_value: 0,
      total: 0
    }]
  );
  const [suggestions, setSuggestions] = useState<ExtendedItem[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

  // Debug log for items and loading state
  useEffect(() => {
    console.group('Items Debug Info');
    console.log('Loading state:', loading);
    console.log('Error state:', error);
    console.log('Items from database:', items);
    console.log('Number of items:', items?.length || 0);
    console.groupEnd();

    // Check Firebase connection
    try {
      const db = getFirestore();
      console.log('Firebase Firestore instance:', db);
    } catch (error) {
      console.error('Firebase connection error:', error);
    }
  }, [items, loading, error]);

  // Debug log for component mount
  useEffect(() => {
    console.log('QuotationForm mounted');
    return () => console.log('QuotationForm unmounted');
  }, []);

  const calculateItemTotal = (item: QuotationItem) => {
    const subtotal = item.quantity * item.unit_rate;
    const discountAmount = (subtotal * item.discount_percent) / 100;
    item.discount_value = Number(discountAmount.toFixed(2));
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * item.gst_percent) / 100;
    item.gst_value = Number(gstAmount.toFixed(2));
    return Number((afterDiscount + gstAmount).toFixed(2));
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
    const newSno = quotationItems.length + 1;
    setQuotationItems([
      ...quotationItems,
      {
        sno: newSno,
        cat_no: '',
        pack_size: '',
        description: '',
        hsn_code: '',
        quantity: 1,
        unit_rate: 0,
        discount_percent: 0,
        discount_value: 0,
        gst_percent: 18,
        gst_value: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = quotationItems.filter((_, i) => i !== index);
    // Update serial numbers
    newItems.forEach((item, i) => {
      item.sno = i + 1;
    });
    setQuotationItems(newItems);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    console.group('Description Change Debug');
    console.log('Description changed:', value);
    console.log('Current items:', items);
    console.log('Current suggestions:', suggestions);
    console.log('Focused item index:', focusedItemIndex);
    console.groupEnd();

    handleItemChange(index, 'description', value);
    
    // Filter items for suggestions
    if (value.trim()) {
      const searchValue = value.toLowerCase().trim();
      console.group('Search Debug');
      console.log('Search value:', searchValue);
      console.log('Items available:', items?.length || 0);
      
      // Add new item suggestion
      const newItem = {
        id: 'new',
        name: value,
        catalogueId: generateCatalogueId(),
        sku: '',
        price: 0,
        quantity: 0,
        isNew: true,
        casNumber: '',
        packSize: '',
        hsnCode: '',
        batchNo: '',
        brand: ''
      } as ExtendedItem;

      // Always show new item suggestion first
      const newSuggestions = [newItem];

      // Add matching items if they exist
      if (items && items.length > 0) {
        const matches = items.filter(item => {
          const itemMatches = 
            item.name?.toLowerCase().includes(searchValue) ||
            item.catalogueId?.toLowerCase().includes(searchValue) ||
            item.casNumber?.toLowerCase().includes(searchValue) ||
            item.hsnCode?.toLowerCase().includes(searchValue);
          
          console.log(`Item "${item.name}" matches: ${itemMatches}`);
          return itemMatches;
        });

        newSuggestions.push(...matches);
      }

      console.log('Setting suggestions:', newSuggestions);
      console.groupEnd();

      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Add effect to log suggestions changes
  useEffect(() => {
    console.log('Suggestions updated:', suggestions);
  }, [suggestions]);

  // Add effect to log focused item changes
  useEffect(() => {
    console.log('Focused item index:', focusedItemIndex);
  }, [focusedItemIndex]);

  const handleSuggestionClick = async (index: number, item: ExtendedItem) => {
    try {
      if (item.isNew) {
        // Show loading state
        const loadingToast = toast.loading('Adding new item to database...');

        // Basic validation
        if (!item.name.trim()) {
          toast.error('Item name is required');
          toast.dismiss(loadingToast);
          return;
        }

        // Check if an item with the same name already exists
        const existingItem = items.find(i => 
          i.name.toLowerCase() === item.name.toLowerCase() ||
          (i.catalogueId && i.catalogueId.toLowerCase() === item.catalogueId?.toLowerCase())
        );

        if (existingItem) {
          toast.error('An item with this name or catalogue ID already exists');
          toast.dismiss(loadingToast);
          return;
        }

        // Create a new item in the database with more fields
        const newItem = await addItem({
          name: item.name,
          catalogueId: item.catalogueId || generateCatalogueId(),
          sku: '',
          price: 0,
          quantity: 0,
          casNumber: '',
          packSize: '',
          hsnCode: '',
          batchNo: '',
          brand: '',
          mfgDate: null,
          expDate: null
        });

        if (!newItem) {
          toast.error('Failed to add new item to database');
          toast.dismiss(loadingToast);
          return;
        }

        // Update toast to success
        toast.dismiss(loadingToast);
        toast.success('New item added successfully');
        item = newItem;
      }

      // Update the quotation item with the selected item's details
      const newItems = [...quotationItems];
      newItems[index] = {
        ...newItems[index],
        cat_no: item.catalogueId || '',
        pack_size: item.packSize || '',
        description: item.name,
        hsn_code: item.hsnCode || '',
        unit_rate: item.price || 0,
        total: calculateItemTotal({
          ...newItems[index],
          description: item.name,
          unit_rate: item.price || 0,
          quantity: newItems[index].quantity,
          discount_percent: newItems[index].discount_percent,
          gst_percent: newItems[index].gst_percent
        })
      };
      setQuotationItems(newItems);
      setSuggestions([]);
      setFocusedItemIndex(null);
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add item: ${errorMessage}`);
      
      // Log the error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', error);
      }
    }
  };

  // Helper function to generate a catalogue ID
  const generateCatalogueId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 5);
    return `CAT-${timestamp}-${randomStr}`.toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === clientId);
    
    const quotationData = {
      clientId,
      clientName: selectedClient?.name || 'Unknown Client',
      status,
      validUntil: new Date(validUntil),
      items: quotationItems,
      total: quotationItems.reduce((sum, item) => sum + item.total, 0),
      createdAt: new Date(),
    };

    onSubmit(quotationData);
  };

  const handleSaveQuotation = () => {
    const selectedClient = clients.find(c => c.id === clientId);
    
    const quotationData = {
      clientId,
      clientName: selectedClient?.name || 'Unknown Client',
      status,
      validUntil: new Date(validUntil),
      items: quotationItems,
      total: quotationItems.reduce((sum, item) => sum + item.total, 0),
      createdAt: new Date(),
    };

    onSubmit(quotationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Show loading and error states */}
      {loading && (
        <div className="text-center text-gray-500 py-2">
          Loading items from database...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-2 bg-red-50 rounded-md">
          Error loading items: {error}
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 mb-4">
          Items loaded: {items?.length || 0} | 
          Loading: {loading ? 'Yes' : 'No'} | 
          Error: {error ? 'Yes' : 'No'}
        </div>
      )}

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
          <div className="grid grid-cols-12 gap-4 mb-2 px-1">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">S.No</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Cat No.</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Pack Size</label>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Description</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">HSN Code</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Qty</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Unit Rate</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Discount %</label>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
            </div>
          </div>

          <div className="space-y-2">
            {quotationItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-1">
                  <input
                    type="text"
                    value={item.sno}
                    readOnly
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={item.cat_no}
                    onChange={(e) => handleItemChange(index, 'cat_no', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    value={item.pack_size}
                    onChange={(e) => handleItemChange(index, 'pack_size', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-3 relative">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    onFocus={() => {
                      console.log('Input focused, setting focusedItemIndex to:', index);
                      setFocusedItemIndex(index);
                    }}
                    onBlur={() => {
                      console.log('Input blurred, will clear focusedItemIndex');
                      // Delay hiding suggestions to allow for click events
                      setTimeout(() => {
                        console.log('Clearing focusedItemIndex');
                        setFocusedItemIndex(null);
                      }, 200);
                    }}
                    placeholder="Enter item description"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute right-0 top-0 text-xs text-gray-400">
                      Focused: {focusedItemIndex === index ? 'Yes' : 'No'}, 
                      Suggestions: {suggestions.length}
                    </div>
                  )}
                  {focusedItemIndex === index && suggestions.length > 0 && (
                    <div 
                      className="absolute z-[100] w-[150%] left-0 bg-white mt-1 rounded-md shadow-xl max-h-60 overflow-auto border border-gray-200"
                      style={{ minWidth: '400px' }}
                    >
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={`px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                            suggestion.isNew ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => {
                            console.log('Suggestion clicked:', suggestion);
                            handleSuggestionClick(index, suggestion);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{suggestion.name}</span>
                              {suggestion.catalogueId && (
                                <span className="ml-2 text-sm text-gray-500">({suggestion.catalogueId})</span>
                              )}
                            </div>
                            {suggestion.isNew && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                New Item
                              </span>
                            )}
                          </div>
                          {!suggestion.isNew && (
                            <div className="mt-1.5 text-sm">
                              <div className="text-gray-600">
                                {suggestion.packSize && (
                                  <span className="inline-flex items-center mr-3">
                                    <span className="font-medium text-gray-500">Pack:</span>
                                    <span className="ml-1">{suggestion.packSize}</span>
                                  </span>
                                )}
                                {suggestion.hsnCode && (
                                  <span className="inline-flex items-center mr-3">
                                    <span className="font-medium text-gray-500">HSN:</span>
                                    <span className="ml-1">{suggestion.hsnCode}</span>
                                  </span>
                                )}
                                {suggestion.casNumber && (
                                  <span className="inline-flex items-center">
                                    <span className="font-medium text-gray-500">CAS:</span>
                                    <span className="ml-1">{suggestion.casNumber}</span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex justify-between items-center">
                                <span className="text-gray-900 font-medium">
                                  ₹{suggestion.price || 0}
                                </span>
                                {suggestion.quantity > 0 && (
                                  <span className="text-green-600 text-sm">
                                    In Stock: {suggestion.quantity}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {suggestion.isNew && (
                            <div className="text-sm text-gray-500 mt-1.5">
                              Click to add as a new item to your inventory
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  <input
                    type="text"
                    value={item.hsn_code}
                    onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.unit_rate}
                    onChange={(e) => handleItemChange(index, 'unit_rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={item.discount_percent}
                    onChange={(e) => handleItemChange(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-right text-sm text-gray-600">
          Sub Total: ₹{quotationItems.reduce((sum, item) => sum + (item.quantity * item.unit_rate), 0).toFixed(2)}
        </div>
        <div className="text-right text-sm text-gray-600">
          Total GST: ₹{quotationItems.reduce((sum, item) => sum + item.gst_value, 0).toFixed(2)}
        </div>
        <div className="text-right text-lg font-medium">
          Grand Total: ₹{quotationItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={() => {
            setClientId('');
            setQuotationItems([{
              sno: 1,
              cat_no: '',
              pack_size: '',
              description: '',
              hsn_code: '',
              quantity: 1,
              unit_rate: 0,
              discount_percent: 0,
              discount_value: 0,
              gst_percent: 18,
              gst_value: 0,
              total: 0
            }]);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Data
        </button>
        <button
          type="button"
          onClick={handleSaveQuotation}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Quotation
        </button>
        <button
          type="button"
          onClick={() => {
            // Generate Word functionality
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Generate Word
        </button>
      </div>
    </form>
  );
}