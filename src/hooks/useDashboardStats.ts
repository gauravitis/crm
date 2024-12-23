import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

interface DashboardStats {
  totalClients: number;
  totalItems: number;
  totalRevenue: number;
  recentClients: Array<{ id: string; name: string; email: string; createdAt: Date }>;
  recentItems: Array<{ id: string; name: string; price: number; createdAt: Date }>;
  totalInventoryValue: number;
  revenueData: Array<{ date: string; amount: number }>;
  recentTransactions: Array<{
    id: string;
    clientName: string;
    amount: number;
    date: Date;
    status: 'completed' | 'pending';
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    soldCount: number;
    revenue: number;
  }>;
  salesMetrics: {
    growthRate: number;
    averageOrderValue: number;
    outstandingPayments: number;
  };
}

const parseFirebaseDate = (date: any): Date => {
  if (!date) return new Date();
  if (date instanceof Timestamp) return date.toDate();
  if (typeof date === 'string') return parseISO(date);
  if (date instanceof Date) return date;
  return new Date();
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalItems: 0,
    totalRevenue: 0,
    recentClients: [],
    recentItems: [],
    totalInventoryValue: 0,
    revenueData: [],
    recentTransactions: [],
    topProducts: [],
    salesMetrics: {
      growthRate: 0,
      averageOrderValue: 0,
      outstandingPayments: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch clients
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        const totalClients = clientsSnapshot.size;

        // Fetch recent clients
        const recentClientsQuery = query(
          collection(db, 'clients'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentClientsSnapshot = await getDocs(recentClientsQuery);
        const recentClients = recentClientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: parseFirebaseDate(doc.data().createdAt),
        }));

        // Fetch items
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const totalItems = itemsSnapshot.size;
        let totalInventoryValue = 0;

        // Calculate total inventory value and get recent items
        const allItems = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: parseFirebaseDate(doc.data().createdAt),
        }));

        totalInventoryValue = allItems.reduce((total, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return total + (price * quantity);
        }, 0);

        // Sort items by createdAt and get the 5 most recent
        const recentItems = allItems
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        // Fetch completed quotations for revenue calculations
        const quotationsSnapshot = await getDocs(
          query(collection(db, 'quotations'), where('status', '==', 'COMPLETED'))
        );
        
        const quotations = quotationsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            completedAt: parseFirebaseDate(data.completedAt || data.createdAt),
            grandTotal: Number(data.grandTotal) || 0
          };
        });

        // Calculate total revenue and recent transactions
        let totalRevenue = 0;
        const recentTransactions: DashboardStats['recentTransactions'] = [];
        
        quotations.forEach(quotation => {
          totalRevenue += quotation.grandTotal;
          
          recentTransactions.push({
            id: quotation.id,
            clientName: quotation.billTo?.name || 'Unknown Client',
            amount: quotation.grandTotal,
            date: quotation.completedAt,
            status: 'completed'
          });
        });

        // Calculate growth rate (comparing this month to last month)
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const thisMonthRevenue = quotations
          .filter(q => q.completedAt >= thisMonthStart && q.completedAt <= thisMonthEnd)
          .reduce((sum, q) => sum + q.grandTotal, 0);

        const lastMonthRevenue = quotations
          .filter(q => q.completedAt >= lastMonthStart && q.completedAt <= lastMonthEnd)
          .reduce((sum, q) => sum + q.grandTotal, 0);

        const growthRate = lastMonthRevenue === 0 ? 0 : 
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // Calculate revenue data for chart (last 6 months)
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          const monthRevenue = quotations
            .filter(q => q.completedAt >= monthStart && q.completedAt <= monthEnd)
            .reduce((sum, q) => sum + q.grandTotal, 0);

          revenueData.push({
            date: monthDate.toLocaleString('default', { month: 'short' }),
            amount: monthRevenue
          });
        }

        // Calculate average order value
        const averageOrderValue = quotations.length === 0 ? 0 :
          totalRevenue / quotations.length;

        // Update stats
        setStats({
          totalClients,
          totalItems,
          totalRevenue,
          recentClients,
          recentItems,
          totalInventoryValue,
          revenueData,
          recentTransactions: recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5),
          topProducts: [], // This can be implemented later if needed
          salesMetrics: {
            growthRate,
            averageOrderValue,
            outstandingPayments: 0, // This can be calculated if needed
          },
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
