import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';

// Add proper typings for the data from Firestore
interface FirestoreClient {
  id: string;
  name: string;
  email: string;
  createdAt: any;
  [key: string]: any;
}

interface FirestoreItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  createdAt: any;
  [key: string]: any;
}

interface FirestoreQuotation {
  id: string;
  quotationRef: string;
  billTo: {
    name: string;
    [key: string]: any;
  };
  companyId?: string;
  company?: {
    name: string;
    [key: string]: any;
  };
  grandTotal: number;
  status: string;
  createdAt: any;
  [key: string]: any;
}

interface DashboardStats {
  totalClients: number;
  totalItems: number;
  totalRevenue: number;
  totalQuotations: number;
  quotationStats: {
    pending: number;
    completed: number;
    rejected: number;
    total: number;
    pendingValue: number;
    growth: number;
  };
  recentClients: Array<{ id: string; name: string; email: string; createdAt: Date }>;
  recentItems: Array<{ id: string; name: string; price: number; createdAt: Date }>;
  recentQuotations: Array<{ id: string; ref: string; client: string; amount: number; status: string; date: Date }>;
  totalInventoryValue: number;
  revenueData: Array<{ date: string; amount: number }>;
  quotationData: Array<{ date: string; count: number }>;
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
  conversionMetrics: {
    quotationToSalesRate: number;
    avgResponseTime: number;
  };
  avgQuoteValueByCompany: Array<{
    companyId: string;
    companyName: string;
    avgValue: number;
    count: number;
  }>;
  quotationStatusDistribution: Array<{
    status: string;
    name: string;
    count: number;
    value: number;
  }>;
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
    totalQuotations: 0,
    quotationStats: {
      pending: 0,
      completed: 0,
      rejected: 0,
      total: 0,
      pendingValue: 0,
      growth: 0
    },
    recentClients: [],
    recentItems: [],
    recentQuotations: [],
    totalInventoryValue: 0,
    revenueData: [],
    quotationData: [],
    recentTransactions: [],
    topProducts: [],
    salesMetrics: {
      growthRate: 0,
      averageOrderValue: 0,
      outstandingPayments: 0,
    },
    conversionMetrics: {
      quotationToSalesRate: 0,
      avgResponseTime: 0,
    },
    avgQuoteValueByCompany: [],
    quotationStatusDistribution: [],
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
        const recentClients = recentClientsSnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreClient;
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            createdAt: parseFirebaseDate(data.createdAt),
          };
        });

        // Fetch items
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const totalItems = itemsSnapshot.size;
        let totalInventoryValue = 0;

        // Calculate total inventory value and get recent items
        const allItems = itemsSnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreItem;
          return {
            id: doc.id,
            name: data.name || '',
            price: Number(data.price) || 0,
            quantity: Number(data.quantity) || 0,
            createdAt: parseFirebaseDate(data.createdAt),
          };
        });

        totalInventoryValue = allItems.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);

        // Sort items by createdAt and get the 5 most recent
        const recentItems = [...allItems]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);

        // Fetch all quotations
        const quotationsQuery = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
        const allQuotationsSnapshot = await getDocs(quotationsQuery);
        const allQuotations = allQuotationsSnapshot.docs.map(doc => {
          const data = doc.data() as FirestoreQuotation;
          return {
            id: doc.id,
            quotationRef: data.quotationRef || '',
            billTo: data.billTo || { name: 'Unknown Client' },
            companyId: data.companyId,
            company: data.company,
            createdAt: parseFirebaseDate(data.createdAt),
            grandTotal: Number(data.grandTotal) || 0,
            status: data.status || 'PENDING'
          };
        });

        // Calculate quotation statistics
        const totalQuotations = allQuotations.length;
        const pendingQuotations = allQuotations.filter(q => q.status === 'PENDING').length;
        const completedQuotations = allQuotations.filter(q => q.status === 'COMPLETED').length;
        const rejectedQuotations = allQuotations.filter(q => q.status === 'REJECTED').length;
        
        // Calculate pending quotation value
        const pendingValue = allQuotations
          .filter(q => q.status === 'PENDING')
          .reduce((sum, q) => sum + q.grandTotal, 0);

        // Get recent quotations
        const recentQuotations = allQuotations.slice(0, 5).map(q => ({
          id: q.id,
          ref: q.quotationRef,
          client: q.billTo?.name || 'Unknown Client',
          amount: q.grandTotal,
          status: q.status,
          date: q.createdAt
        }));

        // Quotation growth calculation
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const thisMonthQuotations = allQuotations.filter(
          q => q.createdAt >= thisMonthStart && q.createdAt <= thisMonthEnd
        ).length;

        const lastMonthQuotations = allQuotations.filter(
          q => q.createdAt >= lastMonthStart && q.createdAt <= lastMonthEnd
        ).length;

        const quotationGrowth = lastMonthQuotations === 0 ? 0 : 
          ((thisMonthQuotations - lastMonthQuotations) / lastMonthQuotations) * 100;

        // Quotation data for chart (last 6 months)
        const quotationData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          const monthQuotationCount = allQuotations
            .filter(q => q.createdAt >= monthStart && q.createdAt <= monthEnd)
            .length;

          quotationData.push({
            date: monthDate.toLocaleString('default', { month: 'short' }),
            count: monthQuotationCount
          });
        }

        // Calculate total revenue and recent transactions
        let totalRevenue = 0;
        const recentTransactions: DashboardStats['recentTransactions'] = [];
        
        allQuotations.forEach(quotation => {
          totalRevenue += quotation.grandTotal;
          
          recentTransactions.push({
            id: quotation.id,
            clientName: quotation.billTo?.name || 'Unknown Client',
            amount: quotation.grandTotal,
            date: quotation.createdAt,
            status: 'completed'
          });
        });

        // Calculate growth rate (comparing this month to last month)
        const thisMonthRevenue = allQuotations
          .filter(q => q.createdAt >= thisMonthStart && q.createdAt <= thisMonthEnd)
          .reduce((sum, q) => sum + q.grandTotal, 0);

        const lastMonthRevenue = allQuotations
          .filter(q => q.createdAt >= lastMonthStart && q.createdAt <= lastMonthEnd)
          .reduce((sum, q) => sum + q.grandTotal, 0);

        const growthRate = lastMonthRevenue === 0 ? 0 : 
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

        // Calculate revenue data for chart (last 6 months)
        const revenueData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = subMonths(now, i);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          const monthRevenue = allQuotations
            .filter(q => q.createdAt >= monthStart && q.createdAt <= monthEnd)
            .reduce((sum, q) => sum + q.grandTotal, 0);

          revenueData.push({
            date: monthDate.toLocaleString('default', { month: 'short' }),
            amount: monthRevenue
          });
        }

        // Calculate average order value
        const averageOrderValue = allQuotations.length === 0 ? 0 :
          totalRevenue / allQuotations.length;

        // Calculate conversion metrics (quotations to sales)
        const completedQuotationCount = allQuotations.filter(q => q.status === 'COMPLETED').length;
        const quotationToSalesRate = totalQuotations === 0 ? 0 : 
          (completedQuotationCount / totalQuotations) * 100;
        
        // Assuming an average response time of 2 days for demonstration
        // In a real scenario, this would be calculated from actual data
        const avgResponseTime = 2; // days
        
        // Calculate average quote value by company
        const companiesMap = new Map();
        
        allQuotations.forEach(quotation => {
          if (!quotation.companyId) return;
          
          const companyData = companiesMap.get(quotation.companyId) || { 
            totalValue: 0, 
            count: 0, 
            name: quotation.company?.name || 'Unknown Company'
          };
          
          companyData.totalValue += quotation.grandTotal;
          companyData.count += 1;
          
          companiesMap.set(quotation.companyId, companyData);
        });
        
        const avgQuoteValueByCompany = Array.from(companiesMap.entries()).map(([companyId, data]) => ({
          companyId,
          companyName: data.name,
          avgValue: data.totalValue / data.count,
          count: data.count
        })).sort((a, b) => b.avgValue - a.avgValue);
        
        // Calculate quotation status distribution
        const quotationStatusDistribution = [
          {
            status: 'PENDING',
            name: 'PENDING',
            count: pendingQuotations,
            value: pendingValue
          },
          {
            status: 'COMPLETED',
            name: 'COMPLETED',
            count: completedQuotations,
            value: allQuotations
              .filter(q => q.status === 'COMPLETED')
              .reduce((sum, q) => sum + q.grandTotal, 0)
          },
          {
            status: 'REJECTED',
            name: 'REJECTED',
            count: rejectedQuotations,
            value: allQuotations
              .filter(q => q.status === 'REJECTED')
              .reduce((sum, q) => sum + q.grandTotal, 0)
          }
        ];

        // Update stats
        setStats({
          totalClients,
          totalItems,
          totalRevenue,
          totalQuotations,
          quotationStats: {
            pending: pendingQuotations,
            completed: completedQuotations,
            rejected: rejectedQuotations,
            total: totalQuotations,
            pendingValue,
            growth: quotationGrowth
          },
          recentClients,
          recentItems,
          recentQuotations,
          totalInventoryValue,
          revenueData,
          quotationData,
          recentTransactions: recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5),
          topProducts: [], // This can be implemented later if needed
          salesMetrics: {
            growthRate,
            averageOrderValue,
            outstandingPayments: 0, // This can be calculated if needed
          },
          conversionMetrics: {
            quotationToSalesRate,
            avgResponseTime,
          },
          avgQuoteValueByCompany,
          quotationStatusDistribution,
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
