import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeSentry } from './config/sentry';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Items from './pages/Items';
import Quotations from './pages/Quotations';
import Sales from './pages/Sales';
import KanbanBoard from './pages/KanbanBoard';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Initialize Sentry
initializeSentry();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
              <Header />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/quotations" element={<Quotations />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/tasks" element={<KanbanBoard />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
        <Analytics />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}