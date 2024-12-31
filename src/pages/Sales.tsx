import React from 'react';
import SalesDashboard from '../components/sales/SalesDashboard';

export default function Sales() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Sales Overview</h1>
      <SalesDashboard />
    </div>
  );
}