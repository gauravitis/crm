import React, { useState } from 'react';
import { Item } from '../types/item';
import { useItems } from '../hooks/useItems';
import ItemList from '../components/items/ItemList';
import ItemForm from '../components/items/ItemForm';
import { Plus, Loader, Search } from 'lucide-react';

export default function Items() {
  const { items, loading, error, addItem, updateItem, deleteItem } = useItems();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items?.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.catalogueId?.toLowerCase() || '').includes(searchLower) ||
      (item.sku?.toLowerCase() || '').includes(searchLower) ||
      (item.hsnCode?.toLowerCase() || '').includes(searchLower)
    );
  });

  const handleSubmit = async (data: Omit<Item, 'id' | 'createdAt'>) => {
    try {
      if (editingItem?.id) {
        await updateItem(editingItem.id, data);
      } else {
        await addItem(data);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error handling item:', err);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Items</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, catalogue ID, CAS, or HSN code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {filteredItems && filteredItems.length > 0 ? (
        <ItemList
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? 'No items found matching your search criteria.'
              : 'No items found. Add your first item to get started!'}
          </p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-start justify-center p-4 overflow-y-auto z-50">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full my-8">
            <h2 className="text-lg font-medium mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <ItemForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingItem(null);
              }}
              initialData={editingItem || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
