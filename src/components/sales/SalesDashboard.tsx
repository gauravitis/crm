import React from 'react';
import { useSalesStats } from '../../hooks/useSalesStats';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';

export default function SalesDashboard() {
  const { stats, loading, error } = useSalesStats();

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

  const monthOverMonthGrowth = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.today.toLocaleString('en-IN')}
          </p>
        </div>

        {/* This Month's Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.thisMonth.toLocaleString('en-IN')}
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
        </div>

        {/* Last Month's Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Last Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.lastMonth.toLocaleString('en-IN')}
          </p>
        </div>

        {/* This Year's Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">This Year</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ₹{stats.thisYear.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Sales Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
              />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
