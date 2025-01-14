import React, { useState } from 'react';
import { QuotationProduct } from '../../types/quotation';
import { formatDate } from '../../utils/helpers';
import { Check, AlertCircle, Truck } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DeliveryStatusProps {
  product: QuotationProduct;
  onUpdateDelivery: (updatedProduct: QuotationProduct) => void;
}

export default function DeliveryStatus({ product, onUpdateDelivery }: DeliveryStatusProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deliveredQty, setDeliveredQty] = useState(product.delivered_qty || 0);
  const [notes, setNotes] = useState(product.delivery_notes || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(product.expected_delivery_date || '');
  const [courierName, setCourierName] = useState(product.courier_details?.courier_name || '');
  const [trackingNumber, setTrackingNumber] = useState(product.courier_details?.tracking_number || '');
  const [dispatchDate, setDispatchDate] = useState(product.courier_details?.dispatch_date || '');

  const handleSave = () => {
    const status: 'pending' | 'partial' | 'delivered' = 
      deliveredQty === 0 ? 'pending' :
      deliveredQty < product.qty ? 'partial' : 'delivered';

    const currentDate = new Date().toISOString();
    
    // Create new delivery history entry
    const newHistoryEntry = {
      date: currentDate,
      status,
      quantity: deliveredQty,
      notes: notes || '',
      updated_by: 'user' // TODO: Replace with actual user info
    };

    // Ensure delivery_history is an array
    const deliveryHistory = Array.isArray(product.delivery_history) 
      ? [...product.delivery_history, newHistoryEntry]
      : [newHistoryEntry];

    const updatedProduct: QuotationProduct = {
      ...product,
      delivered_qty: deliveredQty,
      delivery_notes: notes || '',
      delivery_status: status,
      last_delivery_date: currentDate,
      expected_delivery_date: expectedDeliveryDate || currentDate,
      courier_details: {
        courier_name: courierName || '',
        tracking_number: trackingNumber || '',
        dispatch_date: dispatchDate || currentDate
      },
      delivery_history: deliveryHistory
    };
    onUpdateDelivery(updatedProduct);
    setIsEditing(false);
  };

  const getStatusColor = () => {
    switch (product.delivery_status) {
      case 'delivered':
        return 'text-green-600';
      case 'partial':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (product.delivery_status) {
      case 'delivered':
        return <Check className="h-5 w-5" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">
            {product.delivery_status === 'delivered' ? 'Delivered' :
             product.delivery_status === 'partial' ? 'Partially Delivered' :
             'Pending'}
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-800"
        >
          {isEditing ? 'Cancel' : 'Update Status'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivered Quantity
              </label>
              <Input
                type="number"
                min="0"
                max={product.qty}
                value={deliveredQty}
                onChange={(e) => setDeliveredQty(Number(e.target.value))}
              />
              <div className="text-sm text-gray-500 mt-1">
                Total Quantity: {product.qty}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <Input
                type="date"
                value={expectedDeliveryDate.split('T')[0]}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Courier Name
              </label>
              <Input
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="Enter courier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispatch Date
            </label>
            <Input
              type="date"
              value={dispatchDate.split('T')[0]}
              onChange={(e) => setDispatchDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional notes about the delivery"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Delivered:</span>{' '}
            {product.delivered_qty || 0} of {product.qty} units
          </div>
          {product.expected_delivery_date && (
            <div className="text-sm">
              <span className="font-medium">Expected Delivery:</span>{' '}
              {formatDate(new Date(product.expected_delivery_date))}
            </div>
          )}
          {product.courier_details?.courier_name && (
            <div className="text-sm">
              <span className="font-medium">Courier:</span>{' '}
              {product.courier_details.courier_name}
              {product.courier_details.tracking_number && (
                <> (Tracking: {product.courier_details.tracking_number})</>
              )}
            </div>
          )}
          {product.courier_details?.dispatch_date && (
            <div className="text-sm">
              <span className="font-medium">Dispatched:</span>{' '}
              {formatDate(new Date(product.courier_details.dispatch_date))}
            </div>
          )}
          {product.delivery_notes && (
            <div className="text-sm">
              <span className="font-medium">Notes:</span>{' '}
              {product.delivery_notes}
            </div>
          )}
          {product.last_delivery_date && (
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(new Date(product.last_delivery_date))}
            </div>
          )}
          {product.delivery_history && product.delivery_history.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery History</h4>
              <div className="space-y-2">
                {product.delivery_history.map((entry, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{formatDate(new Date(entry.date))}</span>
                      <span className="font-medium">{entry.status}</span>
                    </div>
                    <div>Quantity: {entry.quantity}</div>
                    {entry.notes && <div className="text-gray-500">{entry.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 