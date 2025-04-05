import React, { useState, useMemo } from 'react';
import { useItems } from '../hooks/useItems';
import ItemList from '../components/items/ItemList';
import ItemForm from '../components/items/ItemForm';
import { Item } from '../types/item';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  FileDown, 
  Grid, 
  List, 
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/toast';

export default function Items() {
  const { items, addItem, updateItem, deleteItem, loading, error } = useItems();
  const { toast, toasts, removeToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<keyof Item>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!items.length) return { total: 0, totalValue: 0, lowStock: 0, outOfStock: 0 };
    
    return items.reduce((acc, item) => {
      // Calculate total items
      acc.total += 1;
      
      // Calculate total inventory value
      const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
      const quantity = item.quantity || 0;
      acc.totalValue += price * quantity;
      
      // Calculate low stock items (5 or fewer)
      if (quantity > 0 && quantity <= 5) {
        acc.lowStock += 1;
      }
      
      // Calculate out of stock items
      if (quantity === 0) {
        acc.outOfStock += 1;
      }
      
      return acc;
    }, { total: 0, totalValue: 0, lowStock: 0, outOfStock: 0 });
  }, [items]);

  // Handle search and filtering
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Apply search filter
      const matchesSearch = searchQuery === '' || 
        (item.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.catalogueId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.brand?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Apply stock filter
      const matchesStockFilter = 
        stockFilter === 'all' || 
        (stockFilter === 'low' && item.quantity !== undefined && item.quantity > 0 && item.quantity <= 5) ||
        (stockFilter === 'out' && (item.quantity === 0 || item.quantity === undefined));
      
      // Apply brand filter
      const matchesBrandFilter = brandFilter === '' || item.brand === brandFilter;
      
      return matchesSearch && matchesStockFilter && matchesBrandFilter;
    });
  }, [items, searchQuery, stockFilter, brandFilter]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      // Compare values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Default (number) comparison
      const numA = typeof aValue === 'string' ? parseFloat(aValue) : (aValue as number);
      const numB = typeof bValue === 'string' ? parseFloat(bValue) : (bValue as number);
      
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Get all unique brands for filtering
  const uniqueBrands = useMemo(() => {
    const brands = items
      .map(item => item.brand)
      .filter((brand): brand is string => brand !== undefined && brand !== '');
    
    return Array.from(new Set(brands)).sort();
  }, [items]);

  const handleSort = (field: keyof Item) => {
    if (field === sortField) {
      // Toggle sort direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async (item: Item) => {
    try {
      if (editingItem) {
        await updateItem(item.id!, item);
        setEditingItem(null);
        setIsFormOpen(false);
        toast({
          title: 'Item Updated',
          description: `${item.name} has been updated successfully.`,
          variant: 'success',
        });
      } else {
        await addItem(item);
        setIsFormOpen(false);
        toast({
          title: 'Item Added',
          description: `${item.name} has been added to inventory.`,
          variant: 'success',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error',
      });
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
        toast({
          title: 'Item Deleted',
          description: 'The item has been removed from inventory.',
          variant: 'warning',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'error',
        });
      }
    }
  };

  const handleExportCsv = () => {
    // Create CSV content
    const headers = ['Name', 'Catalogue ID', 'CAS Number', 'Pack Size', 'HSN Code', 'Brand', 'Price', 'Quantity'];
    const rows = items.map(item => [
      item.name || '',
      item.catalogueId || '',
      item.casNumber || '',
      item.packSize || '',
      item.hsnCode || '',
      item.brand || '',
      item.price?.toString() || '0',
      item.quantity?.toString() || '0'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading inventory items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              {typeof error === 'string' ? error : 'Failed to load inventory items'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <div className="flex space-x-2">
              <Button onClick={() => setIsFormOpen(true)} className="inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
              <Button onClick={handleExportCsv} variant="outline" className="inline-flex items-center">
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-gray-500">
                  Items in inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalValue.toFixed(2)}</div>
                <p className="text-xs text-gray-500">
                  Total value of inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
                <p className="text-xs text-gray-500">
                  Items with 5 or fewer units
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
                <p className="text-xs text-gray-500">
                  Items with zero quantity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              
              <div className="border border-gray-300 rounded-md flex overflow-hidden">
                <button
                  className={`p-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setViewMode('table')}
                  title="Table view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items Display */}
          {viewMode === 'table' ? (
            <ItemList 
              items={sortedItems} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedItems.map(item => (
                <Card key={item.id} className="p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <span className="sr-only">Edit</span>
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <span className="sr-only">Delete</span>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">ID: {item.catalogueId || '-'}</div>
                  {item.brand && <div className="text-sm text-gray-500">Brand: {item.brand}</div>}
                  
                  <div className="mt-2 flex justify-between">
                    <div className="font-medium">₹{typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : (item.price?.toFixed(2) || '0.00')}</div>
                    <div className="flex items-center">
                      <span className="text-sm mr-1">{item.quantity || 0}</span>
                      {item.quantity === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      ) : item.quantity !== undefined && item.quantity <= 5 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Low
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Items count */}
          <div className="text-sm text-gray-500">
            Showing {sortedItems.length} of {items.length} items
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <ItemForm 
                initialData={editingItem || undefined} 
                onSubmit={handleSubmit} 
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingItem(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
