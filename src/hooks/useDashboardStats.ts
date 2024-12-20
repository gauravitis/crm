import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

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
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Fetch items
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const totalItems = itemsSnapshot.size;
        let totalInventoryValue = 0;

        // Calculate total inventory value and get recent items
        const allItems = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        allItems.forEach(item => {
          totalInventoryValue += item.price || 0;
        });

        // Sort items by createdAt and get the 5 most recent
        const recentItems = allItems
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        // Fetch invoices for revenue calculations
        const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
        let totalRevenue = 0;
        const recentTransactions: DashboardStats['recentTransactions'] = [];
        const productSales: Record<string, { count: number; revenue: number; name: string }> = {};

        invoicesSnapshot.docs.forEach(doc => {
          const invoice = doc.data();
          totalRevenue += invoice.totalAmount || 0;

          // Process recent transactions
          if (invoice.createdAt) {
            recentTransactions.push({
              id: doc.id,
              clientName: invoice.clientName,
              amount: invoice.totalAmount,
              date: invoice.createdAt.toDate(),
              status: invoice.status || 'completed',
            });
          }

          // Process product sales
          invoice.items?.forEach((item: any) => {
            if (!productSales[item.id]) {
              productSales[item.id] = {
                count: 0,
                revenue: 0,
                name: item.name,
              };
            }
            productSales[item.id].count += item.quantity || 0;
            productSales[item.id].revenue += (item.price * item.quantity) || 0;
          });
        });

        // Calculate top products
        const topProducts = Object.entries(productSales)
          .map(([id, data]) => ({
            id,
            name: data.name,
            soldCount: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Generate revenue data for the chart (last 30 days)
        const revenueData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: date.toLocaleDateString(),
            amount: Math.random() * 10000, // Replace with actual daily revenue calculation
          };
        }).reverse();

        // Calculate sales metrics
        const salesMetrics = {
          growthRate: 12, // Calculate actual growth rate
          averageOrderValue: totalRevenue / invoicesSnapshot.size || 0,
          outstandingPayments: recentTransactions
            .filter(t => t.status === 'pending')
            .reduce((sum, t) => sum + t.amount, 0),
        };

        setStats({
          totalClients,
          totalItems,
          totalRevenue,
          recentClients,
          recentItems,
          totalInventoryValue,
          revenueData,
          recentTransactions: recentTransactions
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5),
          topProducts,
          salesMetrics,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
