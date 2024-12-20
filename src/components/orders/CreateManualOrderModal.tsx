import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useQuotations } from '../../hooks/useQuotations';
import { toast } from 'react-toastify';

interface ManualOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CreateManualOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateManualOrderModal({ onClose, onSuccess }: CreateManualOrderModalProps) {
  const { addQuotation } = useQuotations();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    referenceNo: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    poDate: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as ManualOrderItem[],
    notes: ''
  });

  const calculateTotal = (items: ManualOrderItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleItemChange = (index: number, field: keyof ManualOrderItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'quantity' || field === 'unitPrice' 
        ? (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0)
        : newItems[index].total
    };
    
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
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
          gst_percent: 0,
          gst_value: 0,
          discount_percent: 0,
          discounted_value: 0
        })),
        subTotal: calculateTotal(formData.items),
        tax: 0,
        grandTotal: calculateTotal(formData.items),
        paymentTerms: '',
        notes: formData.notes,
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        isManualOrder: true
      };

      await addQuotation(quotationData);
      toast.success('Order created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Create Manual Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference No. *
                </label>
                <Input
                  required
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  placeholder="Enter reference number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <Input
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Address
                </label>
                <Input
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Enter client address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Phone
                </label>
                <Input
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="Enter client phone"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Email
              </label>
              <Input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="Enter client email"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Date *
                </label>
                <Input
                  required
                  type="date"
                  value={formData.poDate}
                  onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Items *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>
                
              {/* Item Headers */}
              <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 mb-2">
                <div className="text-sm font-medium text-gray-700">Description</div>
                <div className="text-sm font-medium text-gray-700">Quantity</div>
                <div className="text-sm font-medium text-gray-700">Unit Price (₹)</div>
                <div className="text-sm font-medium text-gray-700">Total (₹)</div>
                <div className="w-10"></div>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-start">
                    <div>
                      <Input
                        required
                        placeholder="Enter item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        required
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Input
                        readOnly
                        value={`₹${item.total.toFixed(2)}`}
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <p className="text-lg font-semibold">
                  Total Amount: ₹{calculateTotal(formData.items).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
