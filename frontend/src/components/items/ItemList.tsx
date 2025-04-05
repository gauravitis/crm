import React from 'react';
import { Item } from '../../types/item';
import { Edit2, Trash2, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { VisuallyHidden } from '../../components/ui/visually-hidden';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  sortField?: keyof Item;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: keyof Item) => void;
}

// Helper function to safely format price
const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return '₹0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '₹0.00' : `₹${numPrice.toFixed(2)}`;
};

// Helper function to format date
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '-';
  return format(date, 'dd/MM/yyyy');
};

export default function ItemList({ 
  items, 
  onEdit, 
  onDelete,
  sortField = 'name',
  sortDirection = 'asc',
  onSort 
}: ItemListProps) {
  // Function to render sort indicator
  const renderSortIndicator = (field: keyof Item) => {
    if (!onSort) return null;
    
    return sortField === field ? (
      <span className="ml-1 inline-flex">
        {sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />}
        <VisuallyHidden>
          {sortDirection === 'asc' ? 'sorted ascending' : 'sorted descending'}
        </VisuallyHidden>
      </span>
    ) : null;
  };

  // Sort header click handler
  const handleSortClick = (field: keyof Item) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Function to render sortable column header
  const SortableHeader = ({ field, label }: { field: keyof Item, label: string }) => (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider 
        ${onSort ? 'cursor-pointer hover:bg-gray-200' : ''}`}
      onClick={onSort ? () => handleSortClick(field) : undefined}
    >
      <div className="flex items-center">
        {label}
        {renderSortIndicator(field)}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="name" label="Name" />
            <SortableHeader field="catalogueId" label="Catalogue ID" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CAS Number
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pack Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              HSN Code
            </th>
            <SortableHeader field="brand" label="Brand/Make" />
            <SortableHeader field="price" label="Price" />
            <SortableHeader field="quantity" label="Quantity" />
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.catalogueId || '-'}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.casNumber || '-'}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.packSize || '-'}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.hsnCode || '-'}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.brand || '-'}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 mr-2">{item.quantity || 0}</span>
                  {item.quantity === 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Out of stock
                    </span>
                  ) : item.quantity <= 5 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low stock
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="ml-1 sr-only md:not-sr-only">Edit</span>
                </button>
                <button
                  onClick={() => onDelete(item.id!)}
                  className="text-red-600 hover:text-red-900 inline-flex items-center"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="ml-1 sr-only md:not-sr-only">Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
