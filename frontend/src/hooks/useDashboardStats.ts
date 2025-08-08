import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { startOfMonth, endOfMonth, subMonths, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

// Add proper typings for the data from Firestore
interface FirestoreClient {
  id: string;
  name: string;
  email: string;
  createdAt: any;
  [key: string]: any;
}

// Helper function to parse Firebase date
function parseFirebaseDate(date: any): Date {
  if (!date) return new Date();
  
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  
  if (typeof date === 'string') {
    return parseISO(date);
  }
  
  if (date.seconds) {
    return new Date(date.seconds * 1000);
  }
  
  return new Date(date);
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
  id?: string;
  quotationRef: string;
  billTo: { name: string; [key: string]: any };
  companyId: string;
  company: { name: string; [key: string]: any };
  createdAt: any;
  grandTotal: number;
  status: string;
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
  recentQuotations: Array<{ 
    id: string; 
    ref: string; 
    client: string; 
    amount: number; 
    status: string; 
    date: Date;
    companyId: string;
  }>;
  totalInventoryValue: number;
  revenueData: Array<{ date: string; amount: number; comparisonAmount?: number }>;
  quotationData: Array<{ date: string; count: number; comparisonCount?: number }>;
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
  comparisonData: {
    totalRevenue: number;
    totalQuotations: number;
    growth: number;
  };
}

export function useDashboardStats(dateRange: string = '30', comparisonPeriod: string = 'previous') {
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
    comparisonData: {
      totalRevenue: 0,
      totalQuotations: 0,
      growth: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Define date ranges based on selected period
        const now = new Date();
        const daysToSubtract = parseInt(dateRange, 10);
        
        // Current period
        const currentPeriodStart = startOfDay(subDays(now, daysToSubtract));
        const currentPeriodEnd = endOfDay(now);
        
        // Comparison period
        let comparisonPeriodStart, comparisonPeriodEnd;
        
        if (comparisonPeriod === 'previous') {
          // Previous equal period
          comparisonPeriodStart = startOfDay(subDays(currentPeriodStart, daysToSubtract));
          comparisonPeriodEnd = endOfDay(subDays(currentPeriodStart, 1));
        } else {
          // Same period last year
          comparisonPeriodStart = startOfDay(subDays(subDays(now, 365), daysToSubtract));
          comparisonPeriodEnd = endOfDay(subDays(now, 365));
        }
        
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
        
        // Filter quotations for current period
        const currentPeriodQuotations = allQuotations.filter(
          q => q.createdAt >= currentPeriodStart && q.createdAt <= currentPeriodEnd
        );
        
        // Filter quotations for comparison period
        const comparisonPeriodQuotations = allQuotations.filter(
          q => q.createdAt >= comparisonPeriodStart && q.createdAt <= comparisonPeriodEnd
        );

        // Calculate quotation statistics for current period
        const totalQuotations = currentPeriodQuotations.length;
        const pendingQuotations = currentPeriodQuotations.filter(q => q.status === 'PENDING').length;
        const completedQuotations = currentPeriodQuotations.filter(q => q.status === 'COMPLETED').length;
        const rejectedQuotations = currentPeriodQuotations.filter(q => q.status === 'REJECTED').length;
        
        // Calculate pending quotation value
        const pendingValue = currentPeriodQuotations
          .filter(q => q.status === 'PENDING')
          .reduce((sum, q) => sum + q.grandTotal, 0);

        // Get recent quotations
        const recentQuotations = currentPeriodQuotations.slice(0, 5).map(q => ({
          id: q.id,
          ref: q.quotationRef,
          client: q.billTo?.name || 'Unknown Client',
          amount: q.grandTotal,
          status: q.status,
          date: q.createdAt,
          companyId: q.companyId || ''
        }));

        // Calculate growth (current vs comparison)
        const comparisonTotalQuotations = comparisonPeriodQuotations.length;
        const quotationGrowth = comparisonTotalQuotations === 0 ? 0 : 
          ((totalQuotations - comparisonTotalQuotations) / comparisonTotalQuotations) * 100;

        // Calculate total revenue for current period
        const totalRevenue = currentPeriodQuotations.reduce((sum, q) => sum + q.grandTotal, 0);
        
        // Calculate total revenue for comparison period
        const comparisonTotalRevenue = comparisonPeriodQuotations.reduce((sum, q) => sum + q.grandTotal, 0);
        
        // Calculate growth rate (current vs comparison)
        const growthRate = comparisonTotalRevenue === 0 ? 0 : 
          ((totalRevenue - comparisonTotalRevenue) / comparisonTotalRevenue) * 100;

        // Determine the time unit for charts based on date range
        let timeUnit = 'day';
        let dataPoints = parseInt(dateRange, 10);
        
        if (dataPoints > 90) {
          timeUnit = 'month';
          dataPoints = Math.ceil(dataPoints / 30);
        } else if (dataPoints > 14) {
          timeUnit = 'week';
          dataPoints = Math.ceil(dataPoints / 7);
        }

        // Generate time-based data for charts
        const revenueData = [];
        const quotationData = [];
        
        if (timeUnit === 'day') {
          // Daily data points
          for (let i = dataPoints - 1; i >= 0; i--) {
            const date = subDays(now, i);
            const dateStart = startOfDay(date);
            const dateEnd = endOfDay(date);
            
            // Current period data
            const dayRevenue = currentPeriodQuotations
              .filter(q => q.createdAt >= dateStart && q.createdAt <= dateEnd)
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const dayQuotationCount = currentPeriodQuotations
              .filter(q => q.createdAt >= dateStart && q.createdAt <= dateEnd)
              .length;
              
            // Comparison period data
            const comparisonDate = comparisonPeriod === 'previous' 
              ? subDays(date, dataPoints)
              : subDays(date, 365);
              
            const comparisonDateStart = startOfDay(comparisonDate);
            const comparisonDateEnd = endOfDay(comparisonDate);
            
            const comparisonDayRevenue = comparisonPeriodQuotations
              .filter(q => q.createdAt >= comparisonDateStart && q.createdAt <= comparisonDateEnd)
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const comparisonDayQuotationCount = comparisonPeriodQuotations
              .filter(q => q.createdAt >= comparisonDateStart && q.createdAt <= comparisonDateEnd)
              .length;
            
            // Format the date
            const formattedDate = date.toLocaleDateString('en-GB', { 
              day: '2-digit',
              month: 'short'
            });
            
            revenueData.push({
              date: formattedDate,
              amount: dayRevenue,
              comparisonAmount: comparisonDayRevenue
            });
            
            quotationData.push({
              date: formattedDate,
              count: dayQuotationCount,
              comparisonCount: comparisonDayQuotationCount
            });
          }
        } else if (timeUnit === 'week') {
          // Weekly data points
          for (let i = 0; i < dataPoints; i++) {
            const weekEnd = subDays(now, i * 7);
            const weekStart = subDays(weekEnd, 6);
            
            // Current period data
            const weekRevenue = currentPeriodQuotations
              .filter(q => q.createdAt >= startOfDay(weekStart) && q.createdAt <= endOfDay(weekEnd))
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const weekQuotationCount = currentPeriodQuotations
              .filter(q => q.createdAt >= startOfDay(weekStart) && q.createdAt <= endOfDay(weekEnd))
              .length;
              
            // Comparison period data
            const comparisonWeekEnd = comparisonPeriod === 'previous'
              ? subDays(weekEnd, dataPoints * 7)
              : subDays(weekEnd, 365);
            const comparisonWeekStart = subDays(comparisonWeekEnd, 6);
            
            const comparisonWeekRevenue = comparisonPeriodQuotations
              .filter(q => q.createdAt >= startOfDay(comparisonWeekStart) && q.createdAt <= endOfDay(comparisonWeekEnd))
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const comparisonWeekQuotationCount = comparisonPeriodQuotations
              .filter(q => q.createdAt >= startOfDay(comparisonWeekStart) && q.createdAt <= endOfDay(comparisonWeekEnd))
              .length;
            
            // Format the date range
            const formattedDate = `${weekStart.toLocaleDateString('en-GB', { 
              day: '2-digit',
              month: 'short'
            })} - ${weekEnd.toLocaleDateString('en-GB', { 
              day: '2-digit',
              month: 'short'
            })}`;
            
            revenueData.push({
              date: formattedDate,
              amount: weekRevenue,
              comparisonAmount: comparisonWeekRevenue
            });
            
            quotationData.push({
              date: formattedDate,
              count: weekQuotationCount,
              comparisonCount: comparisonWeekQuotationCount
            });
          }
        } else { // month
          // Monthly data points
          for (let i = dataPoints - 1; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            
            // Current period data
            const monthRevenue = currentPeriodQuotations
              .filter(q => q.createdAt >= monthStart && q.createdAt <= monthEnd)
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const monthQuotationCount = currentPeriodQuotations
              .filter(q => q.createdAt >= monthStart && q.createdAt <= monthEnd)
              .length;
            
            // Comparison period data
            const comparisonMonthDate = comparisonPeriod === 'previous'
              ? subMonths(monthDate, dataPoints)
              : subMonths(monthDate, 12);
            const comparisonMonthStart = startOfMonth(comparisonMonthDate);
            const comparisonMonthEnd = endOfMonth(comparisonMonthDate);
            
            const comparisonMonthRevenue = comparisonPeriodQuotations
              .filter(q => q.createdAt >= comparisonMonthStart && q.createdAt <= comparisonMonthEnd)
              .reduce((sum, q) => sum + q.grandTotal, 0);
              
            const comparisonMonthQuotationCount = comparisonPeriodQuotations
              .filter(q => q.createdAt >= comparisonMonthStart && q.createdAt <= comparisonMonthEnd)
              .length;
            
            revenueData.push({
              date: monthDate.toLocaleString('default', { month: 'short' }),
              amount: monthRevenue,
              comparisonAmount: comparisonMonthRevenue
            });
            
            quotationData.push({
              date: monthDate.toLocaleString('default', { month: 'short' }),
              count: monthQuotationCount,
              comparisonCount: comparisonMonthQuotationCount
            });
          }
        }

        // Calculate average order value
        const averageOrderValue = totalQuotations === 0 ? 0 :
          totalRevenue / totalQuotations;

        // Calculate conversion metrics (quotations to sales)
        const completedQuotationCount = currentPeriodQuotations.filter(q => q.status === 'COMPLETED').length;
        const quotationToSalesRate = totalQuotations === 0 ? 0 : 
          (completedQuotationCount / totalQuotations) * 100;
        
        // Calculate average response time (from quotation to client decision)
        // This is a placeholder - in a real system we would calculate from actual data
        const avgResponseTime = 2; // days
        
        // Calculate average quote value by company
        const companiesMap = new Map();
        
        currentPeriodQuotations.forEach(quotation => {
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
            value: currentPeriodQuotations
              .filter(q => q.status === 'COMPLETED')
              .reduce((sum, q) => sum + q.grandTotal, 0)
          },
          {
            status: 'REJECTED',
            name: 'REJECTED',
            count: rejectedQuotations,
            value: currentPeriodQuotations
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
          recentTransactions: currentPeriodQuotations
            .map(q => ({
              id: q.id || '',
              clientName: q.billTo?.name || 'Unknown Client',
              amount: q.grandTotal,
              date: q.createdAt,
              status: 'completed' // This is a simplification
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5),
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
          comparisonData: {
            totalRevenue: comparisonTotalRevenue,
            totalQuotations: comparisonTotalQuotations,
            growth: growthRate
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, comparisonPeriod]);

  return { stats, loading, error };
}
