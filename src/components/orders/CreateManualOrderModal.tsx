import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuotations } from '../../hooks/useQuotations';
import { useItems } from '../../hooks/useItems';
import { useClients } from '../../hooks/useClients';
import { toast } from 'react-toastify';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManualOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  gstPercent: number;
  gstValue: number;
  casNumber?: string;
  catalogueId?: string;
  itemId?: string;
}

interface CreateManualOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateManualOrderModal({ onClose, onSuccess }: CreateManualOrderModalProps) {
  const { addQuotation } = useQuotations();
  const { items, getItems } = useItems();
  const { clients, getClients } = useClients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    referenceNo: '',
    clientName: '',
    clientId: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    poDate: '',
    dueDate: '',
    items: [{ 
      description: '', 
      quantity: 1, 
      unitPrice: 0, 
      total: 0, 
      gstPercent: 18, 
      gstValue: 0,
      casNumber: '',
      catalogueId: '',
      itemId: ''
    }] as ManualOrderItem[],
    notes: ''
  });

  useEffect(() => {
    getItems();
    getClients();
  }, [getItems, getClients]);

  const calculateItemTotal = (quantity: number, unitPrice: number, gstPercent: number) => {
    const subtotal = quantity * unitPrice;
    const gstValue = (subtotal * gstPercent) / 100;
    return {
      subtotal,
      gstValue,
      total: subtotal + gstValue
    };
  };

  const handleItemChange = (index: number, field: keyof ManualOrderItem, value: string | number) => {
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index] };

    // Update the changed field
    currentItem[field] = value;

    // If changing quantity, unit price, or GST percent, recalculate totals
    if (field === 'quantity' || field === 'unitPrice' || field === 'gstPercent') {
      const { subtotal, gstValue, total } = calculateItemTotal(
        currentItem.quantity,
        currentItem.unitPrice,
        currentItem.gstPercent
      );
      currentItem.total = total;
      currentItem.gstValue = gstValue;
    }

    // If selecting an existing item
    if (field === 'itemId' && value) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        currentItem.description = selectedItem.name;
        currentItem.unitPrice = selectedItem.price || 0;
        currentItem.casNumber = selectedItem.sku || ''; // Use sku field for CAS number
        currentItem.catalogueId = selectedItem.catalogueId || '';
        
        const { subtotal, gstValue, total } = calculateItemTotal(
          currentItem.quantity,
          currentItem.unitPrice,
          currentItem.gstPercent
        );
        currentItem.total = total;
        currentItem.gstValue = gstValue;
      }
    }

    newItems[index] = currentItem;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData({
        ...formData,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientAddress: selectedClient.company || '', 
        clientPhone: selectedClient.phone || '',
        clientEmail: selectedClient.email || ''
      });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { 
        description: '', 
        quantity: 1, 
        unitPrice: 0, 
        total: 0, 
        gstPercent: 18, 
        gstValue: 0,
        casNumber: '',
        catalogueId: '',
        itemId: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.referenceNo || !formData.clientName || !formData.poDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const quotationData = {
        quotationRef: formData.referenceNo,
        billTo: {
          id: formData.clientId,
          name: formData.clientName,
          address: formData.clientAddress,
          phone: formData.clientPhone,
          email: formData.clientEmail
        },
        quotationDate: formData.poDate,
        validTill: formData.dueDate,
        items: formData.items.map(item => ({
          product_description: item.description,
          qty: item.quantity,
          unit_rate: item.unitPrice,
          total_price: item.total,
          gst_percent: item.gstPercent,
          gst_value: item.gstValue,
          cas_number: item.casNumber,
          catalogue_id: item.catalogueId,
          item_id: item.itemId
        })),
        notes: formData.notes,
        status: 'APPROVED',
        grandTotal: formData.items.reduce((sum, item) => sum + item.total, 0)
      };

      await addQuotation(quotationData);
      toast.success('Manual order created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating manual order:', error);
      toast.error('Failed to create manual order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create Manual Order</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Reference No*</label>
              <Input
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                placeholder="Enter reference number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Client*</label>
              <Select onValueChange={handleClientSelect} value={formData.clientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Address</label>
              <Input
                value={formData.clientAddress}
                onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                placeholder="Enter client address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Phone</label>
              <Input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="Enter client phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Email</label>
              <Input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="Enter client email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PO Date*</label>
              <Input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Select Item</label>
                      <Select
                        onValueChange={(value) => handleItemChange(index, 'itemId', value)}
                        value={item.itemId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((existingItem) => (
                            <SelectItem key={existingItem.id} value={existingItem.id}>
                              {existingItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Description*</label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity*</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Unit Price*</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">GST %</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.gstPercent}
                        onChange={(e) => handleItemChange(index, 'gstPercent', Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">GST Value</label>
                      <Input
                        type="number"
                        value={item.gstValue}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Total</label>
                      <Input
                        type="number"
                        value={item.total}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">CAS Number</label>
                      <Input
                        value={item.casNumber}
                        onChange={(e) => handleItemChange(index, 'casNumber', e.target.value)}
                        placeholder="Enter CAS number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Catalogue ID</label>
                      <Input
                        value={item.catalogueId}
                        onChange={(e) => handleItemChange(index, 'catalogueId', e.target.value)}
                        placeholder="Enter catalogue ID"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total Amount: ₹{formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
