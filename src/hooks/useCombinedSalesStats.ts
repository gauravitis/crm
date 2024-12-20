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

      // Filter approved quotations for different periods
      const approvedQuotations = quotations.filter(q => q.status === 'approved');

      const todayQuotations = approvedQuotations.filter(q => {
        const date = new Date(q.createdAt);
        return date >= todayStart && date <= todayEnd;
      });

      const thisMonthQuotations = approvedQuotations.filter(q => {
        const date = new Date(q.createdAt);
        return date >= monthStart && date <= monthEnd;
      });

      const lastMonthQuotations = approvedQuotations.filter(q => {
        const date = new Date(q.createdAt);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });

      const thisYearQuotations = approvedQuotations.filter(q => {
        const date = new Date(q.createdAt);
        return date >= yearStart && date <= yearEnd;
      });

      // Calculate monthly data
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStartDate = startOfMonth(monthDate);
        const monthEndDate = endOfMonth(monthDate);
        
        const monthQuotations = approvedQuotations.filter(q => {
          const date = new Date(q.createdAt);
          return date >= monthStartDate && date <= monthEndDate;
        });

        const monthlyQuotationsTotal = monthQuotations.reduce((sum, q) => sum + q.total, 0);

        monthlyData.push({
          month: monthDate.toLocaleString('default', { month: 'short' }),
          sales: 0, // We'll add actual sales data when integrated with Firebase
          approvedQuotations: monthlyQuotationsTotal,
          total: monthlyQuotationsTotal // Will include sales when integrated
        });
      }

      setStats({
        today: {
          sales: 0, // Will be added when integrated with Firebase
          approvedQuotations: todayQuotations.reduce((sum, q) => sum + q.total, 0),
          total: todayQuotations.reduce((sum, q) => sum + q.total, 0)
        },
        thisMonth: {
          sales: 0,
          approvedQuotations: thisMonthQuotations.reduce((sum, q) => sum + q.total, 0),
          total: thisMonthQuotations.reduce((sum, q) => sum + q.total, 0)
        },
        lastMonth: {
          sales: 0,
          approvedQuotations: lastMonthQuotations.reduce((sum, q) => sum + q.total, 0),
          total: lastMonthQuotations.reduce((sum, q) => sum + q.total, 0)
        },
        thisYear: {
          sales: 0,
          approvedQuotations: thisYearQuotations.reduce((sum, q) => sum + q.total, 0),
          total: thisYearQuotations.reduce((sum, q) => sum + q.total, 0)
        },
        monthlyData,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate sales statistics';
      setError(errorMessage);
      console.error('Error calculating sales stats:', err);
    } finally {
      setLoading(false);
    }
  }, [quotations]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: calculateStats,
  };
}
