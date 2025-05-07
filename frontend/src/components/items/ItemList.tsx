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
  const SortableHeader = ({ field, label, className }: { field: keyof Item, label: string, className?: string }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider 
        ${onSort ? 'cursor-pointer hover:bg-gray-200' : ''} ${className || ''}`}
      onClick={onSort ? () => handleSortClick(field) : undefined}
    >
      <div className="flex items-center">
        {label}
        {renderSortIndicator(field)}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 w-full">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="name" label="Name" className="w-[20%]" />
            <SortableHeader field="catalogueId" label="Catalogue ID" className="w-[10%]" />
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] hidden md:table-cell">
              CAS Number
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%] hidden lg:table-cell">
              Pack Size
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%] hidden lg:table-cell">
              HSN Code
            </th>
            <SortableHeader field="brand" label="Brand/Make" className="w-[12%] hidden md:table-cell" />
            <SortableHeader field="price" label="Price" className="w-[8%]" />
            <SortableHeader field="quantity" label="Quantity" className="w-[10%]" />
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-3 py-4 whitespace-nowrap truncate">
                <div className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 truncate" title={item.catalogueId || '-'}>{item.catalogueId || '-'}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900 truncate" title={item.casNumber || '-'}>{item.casNumber || '-'}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900 truncate" title={item.packSize || '-'}>{item.packSize || '-'}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900 truncate" title={item.hsnCode || '-'}>{item.hsnCode || '-'}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900 truncate" title={item.brand || '-'}>{item.brand || '-'}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 mr-2">{item.quantity || 0}</span>
                  {item.quantity === 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Out
                    </span>
                  ) : item.quantity <= 5 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(item.id!)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
