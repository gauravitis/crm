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
  const { items, getItems, addItem: addItemToDatabase } = useItems();
  const { clients, getClients, addClient } = useClients();
  const [loading, setLoading] = useState(false);
  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [formData, setFormData] = useState({
    referenceNo: '',
    clientName: '',
    clientId: '',
    clientAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
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

  const handleClientChange = async (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientAddress: selectedClient.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        clientPhone: selectedClient.phone || '',
        clientEmail: selectedClient.email || ''
      }));
    }
  };

  const handleAddNewClient = async () => {
    try {
      const newClient = {
        name: formData.clientName,
        address: formData.clientAddress,
        phone: formData.clientPhone,
        email: formData.clientEmail
      };
      
      const addedClient = await addClient(newClient);
      if (addedClient) {
        setFormData(prev => ({
          ...prev,
          clientId: addedClient.id
        }));
        toast.success('Client added successfully');
        await getClients(); // Refresh clients list
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleAddNewItem = async (index: number) => {
    try {
      const currentItem = formData.items[index];
      const newItem = {
        name: currentItem.description,
        price: currentItem.unitPrice,
        sku: currentItem.casNumber,
        catalogueId: currentItem.catalogueId
      };
      
      const addedItem = await addItemToDatabase(newItem);
      if (addedItem) {
        const newItems = [...formData.items];
        newItems[index] = {
          ...currentItem,
          itemId: addedItem.id
        };
        setFormData(prev => ({
          ...prev,
          items: newItems
        }));
        toast.success('Item added successfully');
        await getItems(); // Refresh items list
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleItemChange = (index: number, field: keyof ManualOrderItem, value: string | number) => {
    const newItems = [...formData.items];
    const currentItem = { ...newItems[index] };

    currentItem[field] = value;

    if (field === 'quantity' || field === 'unitPrice' || field === 'gstPercent') {
      const { subtotal, gstValue, total } = calculateItemTotal(
        currentItem.quantity,
        currentItem.unitPrice,
        currentItem.gstPercent
      );
      currentItem.total = total;
      currentItem.gstValue = gstValue;
    }

    if (field === 'itemId' && value) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        currentItem.description = selectedItem.name;
        currentItem.unitPrice = selectedItem.price || 0;
        currentItem.casNumber = selectedItem.sku || '';
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
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addNewItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          gstPercent: 18,
          gstValue: 0,
          casNumber: '',
          catalogueId: '',
          itemId: ''
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If new client, add them first
      if (isNewClient && !formData.clientId) {
        await handleAddNewClient();
      }

      // Add any new items
      for (let i = 0; i < formData.items.length; i++) {
        if (isNewItem && !formData.items[i].itemId) {
          await handleAddNewItem(i);
        }
      }

      const quotationData = {
        quotationRef: formData.referenceNo,
        quotationDate: formData.poDate,
        dueDate: formData.dueDate,
        billTo: {
          id: formData.clientId,
          name: formData.clientName,
          address: formData.clientAddress,
          phone: formData.clientPhone,
          email: formData.clientEmail
        },
        items: formData.items.map(item => ({
          ...item,
          id: item.itemId
        })),
        notes: formData.notes,
        status: 'APPROVED',
        subtotal: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        gstTotal: formData.items.reduce((sum, item) => sum + item.gstValue, 0),
        grandTotal: formData.items.reduce((sum, item) => sum + item.total, 0)
      };

      await addQuotation(quotationData);
      toast.success('Order created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Create Manual Order</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Reference Number"
                value={formData.referenceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                required
              />
              <Input
                type="date"
                placeholder="PO Date"
                value={formData.poDate}
                onChange={(e) => setFormData(prev => ({ ...prev, poDate: e.target.value }))}
                required
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Client Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewClient(!isNewClient)}
                >
                  {isNewClient ? 'Select Existing Client' : 'Add New Client'}
                </Button>
              </div>

              {isNewClient ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Client Name"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  />
                  <Input
                    placeholder="Street Address"
                    value={formData.clientAddress.street}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      clientAddress: { ...prev.clientAddress, street: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="City"
                    value={formData.clientAddress.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      clientAddress: { ...prev.clientAddress, city: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="State"
                    value={formData.clientAddress.state}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      clientAddress: { ...prev.clientAddress, state: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Postal Code"
                    value={formData.clientAddress.postalCode}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      clientAddress: { ...prev.clientAddress, postalCode: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Country"
                    value={formData.clientAddress.country}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      clientAddress: { ...prev.clientAddress, country: e.target.value }
                    }))}
                  />
                </div>
              ) : (
                <Select
                  value={formData.clientId}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewItem(!isNewItem)}
                >
                  {isNewItem ? 'Select Existing Items' : 'Add New Items'}
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  {isNewItem ? (
                    <>
                      <Input
                        placeholder="Item Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="CAS Number"
                        value={item.casNumber}
                        onChange={(e) => handleItemChange(index, 'casNumber', e.target.value)}
                      />
                      <Input
                        placeholder="Catalogue ID"
                        value={item.catalogueId}
                        onChange={(e) => handleItemChange(index, 'catalogueId', e.target.value)}
                      />
                    </>
                  ) : (
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => handleItemChange(index, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="GST %"
                    value={item.gstPercent}
                    onChange={(e) => handleItemChange(index, 'gstPercent', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">Total: {item.total.toFixed(2)}</p>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addNewItemRow}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            {/* Notes */}
            <div>
              <Input
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
