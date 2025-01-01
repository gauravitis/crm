import React from 'react';
import { Item } from '../../types/client';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { X, Package, Barcode, Calendar, DollarSign, Box, Archive, Hash } from 'lucide-react';

interface ItemDetailsProps {
  item: Item;
  onClose: () => void;
}

export default function ItemDetails({ item, onClose }: ItemDetailsProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <div className="mt-2 text-sm text-gray-500">
            Added {formatDate(item.createdAt)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-gray-700">
            <Package className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Catalogue ID</div>
              <div className="text-sm">{item.catalogueId}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Barcode className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">SKU</div>
              <div className="text-sm">{item.sku}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Hash className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">HSN Code</div>
              <div className="text-sm">{item.hsnCode}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Box className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Pack Size</div>
              <div className="text-sm">{item.packSize}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Price</div>
              <div className="text-sm">{formatCurrency(item.price)}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Archive className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Quantity in Stock</div>
              <div className="text-sm">{item.quantity}</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-3 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">Added On</div>
              <div className="text-sm">{formatDate(item.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
