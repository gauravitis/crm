import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Invoice } from '../types/invoice';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

interface SalesStats {
  today: number;
  thisMonth: number;
  lastMonth: number;
  thisYear: number;
  monthlyData: { month: string; amount: number }[];
}

export function useSalesStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SalesStats>({
    today: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    monthlyData: [],
  });

  const fetchSalesStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const invoicesRef = collection(db, 'invoices');
      const now = new Date();

      // Query parameters for different time periods
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);

      // Fetch today's sales
      const todayQuery = query(
        invoicesRef,
        where('type', '==', 'SALES'),
        where('date', '>=', Timestamp.fromDate(todayStart)),
        where('date', '<=', Timestamp.fromDate(todayEnd))
      );
      const todaySnapshot = await getDocs(todayQuery);
      const todaySales = todaySnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

      // Fetch this month's sales
      const monthQuery = query(
        invoicesRef,
        where('type', '==', 'SALES'),
        where('date', '>=', Timestamp.fromDate(monthStart)),
        where('date', '<=', Timestamp.fromDate(monthEnd))
      );
      const monthSnapshot = await getDocs(monthQuery);
      const monthSales = monthSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

      // Fetch last month's sales
      const lastMonthQuery = query(
        invoicesRef,
        where('type', '==', 'SALES'),
        where('date', '>=', Timestamp.fromDate(lastMonthStart)),
        where('date', '<=', Timestamp.fromDate(lastMonthEnd))
      );
      const lastMonthSnapshot = await getDocs(lastMonthQuery);
      const lastMonthSales = lastMonthSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

      // Fetch this year's sales
      const yearQuery = query(
        invoicesRef,
        where('type', '==', 'SALES'),
        where('date', '>=', Timestamp.fromDate(yearStart)),
        where('date', '<=', Timestamp.fromDate(yearEnd))
      );
      const yearSnapshot = await getDocs(yearQuery);
      const yearSales = yearSnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);

      // Calculate monthly data for the chart
      const monthlyData: { month: string; amount: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStartDate = startOfMonth(monthDate);
        const monthEndDate = endOfMonth(monthDate);
        
        const monthlyQuery = query(
          invoicesRef,
          where('type', '==', 'SALES'),
          where('date', '>=', Timestamp.fromDate(monthStartDate)),
          where('date', '<=', Timestamp.fromDate(monthEndDate))
        );
        const monthlySnapshot = await getDocs(monthlyQuery);
        const monthlyTotal = monthlySnapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
        
        monthlyData.push({
          month: monthDate.toLocaleString('default', { month: 'short' }),
          amount: monthlyTotal,
        });
      }

      setStats({
        today: todaySales,
        thisMonth: monthSales,
        lastMonth: lastMonthSales,
        thisYear: yearSales,
        monthlyData,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales statistics';
      setError(errorMessage);
      console.error('Error fetching sales stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchSalesStats,
  };
}
