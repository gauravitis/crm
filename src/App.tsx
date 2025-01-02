import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import Quotations from './pages/Quotations';
import QuotationGenerator from './pages/QuotationGenerator';
import KanbanBoard from './pages/KanbanBoard';
import { Vendors } from './pages/Vendors';
import PendingOrders from './pages/PendingOrders';
import Employees from './pages/Employees';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/tasks" element={<KanbanBoard />} />
                        <Route path="/items" element={<Items />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/vendors" element={<Vendors />} />
                        <Route path="/quotations" element={<Quotations />} />
                        <Route path="/quotations/new" element={<QuotationGenerator />} />
                        <Route path="/quotations/edit/:id" element={<QuotationGenerator />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/quotation-generator" element={<QuotationGenerator />} />
                        <Route path="/pending-orders" element={<PendingOrders />} />
                        <Route path="/sales" element={<Sales />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
        <Analytics />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;