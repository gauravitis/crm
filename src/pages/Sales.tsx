import React, { useState } from 'react';
import { Sale } from '../types';
import { useSales } from '../hooks/useSales';
import { useClients } from '../hooks/useClients';
import SaleList from '../components/sales/SaleList';

export default function Sales() {
  const { sales, updateSale, deleteSale } = useSales();
  const { clients } = useClients();
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    // TODO: Implement edit form
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      deleteSale(id);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
        </div>

        <div className="mt-8">
          <SaleList
            sales={sales}
            clients={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}