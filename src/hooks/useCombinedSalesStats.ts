import { useState, useCallback, useEffect } from 'react';
import { useQuotations } from './useQuotations';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

interface CombinedStats {
  today: {
    sales: number;
    approvedQuotations: number;
    total: number;
  };
  thisMonth: {
    sales: number;
    approvedQuotations: number;
    total: number;
  };
  lastMonth: {
    sales: number;
    approvedQuotations: number;
    total: number;
  };
  thisYear: {
    sales: number;
    approvedQuotations: number;
    total: number;
  };
  monthlyData: {
    month: string;
    sales: number;
    approvedQuotations: number;
    total: number;
  }[];
}

export function useCombinedSalesStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { quotations } = useQuotations();
  const [stats, setStats] = useState<CombinedStats>({
    today: { sales: 0, approvedQuotations: 0, total: 0 },
    thisMonth: { sales: 0, approvedQuotations: 0, total: 0 },
    lastMonth: { sales: 0, approvedQuotations: 0, total: 0 },
    thisYear: { sales: 0, approvedQuotations: 0, total: 0 },
    monthlyData: [],
  });

  const calculateStats = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();

      // Time period boundaries
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);

      // Get completed orders (sales)
      const completedQuotations = quotations.filter(q => q.status === 'COMPLETED');

      // Filter quotations for different periods
      const todayQuotations = completedQuotations.filter(q => {
        const date = new Date(q.completedAt || q.createdAt);
        return date >= todayStart && date <= todayEnd;
      });

      const thisMonthQuotations = completedQuotations.filter(q => {
        const date = new Date(q.completedAt || q.createdAt);
        return date >= monthStart && date <= monthEnd;
      });

      const lastMonthQuotations = completedQuotations.filter(q => {
        const date = new Date(q.completedAt || q.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });

      const thisYearQuotations = completedQuotations.filter(q => {
        const date = new Date(q.completedAt || q.createdAt);
        return date >= yearStart && date <= yearEnd;
      });

      // Calculate totals
      const todayTotal = todayQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
      const thisMonthTotal = thisMonthQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
      const lastMonthTotal = lastMonthQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
      const thisYearTotal = thisYearQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

      // Calculate monthly data
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStartDate = startOfMonth(monthDate);
        const monthEndDate = endOfMonth(monthDate);
        
        const monthQuotations = completedQuotations.filter(q => {
          const date = new Date(q.completedAt || q.createdAt);
          return date >= monthStartDate && date <= monthEndDate;
        });

        const monthlyTotal = monthQuotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

        monthlyData.push({
          month: monthDate.toLocaleString('default', { month: 'short' }),
          sales: monthlyTotal,
          approvedQuotations: 0,
          total: monthlyTotal
        });
      }

      setStats({
        today: {
          sales: todayTotal,
          approvedQuotations: 0,
          total: todayTotal
        },
        thisMonth: {
          sales: thisMonthTotal,
          approvedQuotations: 0,
          total: thisMonthTotal
        },
        lastMonth: {
          sales: lastMonthTotal,
          approvedQuotations: 0,
          total: lastMonthTotal
        },
        thisYear: {
          sales: thisYearTotal,
          approvedQuotations: 0,
          total: thisYearTotal
        },
        monthlyData
      });
    } catch (error) {
      console.error('Error calculating sales stats:', error);
      setError('Failed to calculate sales statistics');
    } finally {
      setLoading(false);
    }
  }, [quotations]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return { stats, loading, error };
}
