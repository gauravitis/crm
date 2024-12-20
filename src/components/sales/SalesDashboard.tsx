import React from 'react';
import { useCombinedSalesStats } from '../../hooks/useCombinedSalesStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';

export default function SalesDashboard() {
  const { stats, loading, error } = useCombinedSalesStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading sales data: {error}
      </div>
    );
  }

  const monthOverMonthGrowth = ((stats.thisMonth.total - stats.lastMonth.total) / stats.lastMonth.total) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Combined */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Today's Total</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.today.total.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Includes ₹{stats.today.approvedQuotations.toLocaleString('en-IN')} from approved quotations
          </div>
        </div>

        {/* This Month's Combined */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.thisMonth.total.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center">
            <span className={`text-sm ${monthOverMonthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthOverMonthGrowth >= 0 ? (
                <ArrowUpRight className="inline h-4 w-4" />
              ) : (
                <ArrowDownRight className="inline h-4 w-4" />
              )}
              {Math.abs(monthOverMonthGrowth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs last month</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Includes ₹{stats.thisMonth.approvedQuotations.toLocaleString('en-IN')} from approved quotations
          </div>
        </div>

        {/* Last Month's Combined */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Last Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.lastMonth.total.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Includes ₹{stats.lastMonth.approvedQuotations.toLocaleString('en-IN')} from approved quotations
          </div>
        </div>

        {/* This Year's Combined */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">This Year</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.thisYear.total.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Includes ₹{stats.thisYear.approvedQuotations.toLocaleString('en-IN')} from approved quotations
          </div>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
              />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill="#3B82F6" />
              <Bar dataKey="approvedQuotations" name="Approved Quotations" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
