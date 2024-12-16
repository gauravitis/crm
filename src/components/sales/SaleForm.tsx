import React, { useState } from 'react';
import { Sale, Quotation } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SaleFormProps {
  onSubmit: (data: Omit<Sale, 'id' | 'createdAt'>) => void;
  quotation?: Quotation;
  initialData?: Partial<Sale>;
}

export default function SaleForm({ onSubmit, quotation, initialData }: SaleFormProps) {
  const [formData, setFormData] = useState({
    quotationId: quotation?.id || initialData?.quotationId || '',
    clientId: quotation?.clientId || initialData?.clientId || '',
    amount: quotation?.total || initialData?.amount || 0,
    status: initialData?.status || 'pending',
    paymentDate: initialData?.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      paymentDate: new Date(formData.paymentDate),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
            className="mt-1 block w-full pl-7 pr-12 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment Date
        </label>
        <input
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Sale['status'] }))}
          className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Sale
        </button>
      </div>
    </form>
  );
}