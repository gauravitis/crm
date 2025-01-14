import React from 'react';
import { QuotationProduct } from '../../types/quotation';
import DeliveryStatus from './DeliveryStatus';

interface QuotationDeliveryStatusProps {
  products: QuotationProduct[];
  onUpdateProduct: (updatedProduct: QuotationProduct) => void;
}

export default function QuotationDeliveryStatus({
  products,
  onUpdateProduct,
}: QuotationDeliveryStatusProps) {
  const getOverallStatus = () => {
    const allDelivered = products.every(p => p.delivery_status === 'delivered');
    const anyDelivered = products.some(p => 
      p.delivery_status === 'delivered' || p.delivery_status === 'partial'
    );
    return allDelivered ? 'Completed' : anyDelivered ? 'Partially Delivered' : 'Pending';
  };

  const getStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Partially Delivered':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Delivery Status</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {getOverallStatus()}
        </span>
      </div>

      <div className="divide-y divide-gray-200">
        {products.map((product, index) => (
          <div key={index} className="py-4">
            <div className="mb-2">
              <h3 className="font-medium text-gray-900">{product.product_description}</h3>
              <div className="text-sm text-gray-500">
                Catalogue ID: {product.cat_no} | Pack Size: {product.pack_size}
              </div>
            </div>
            <DeliveryStatus
              product={product}
              onUpdateDelivery={onUpdateProduct}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 