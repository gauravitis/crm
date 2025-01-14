export const calculateStats = (sales: any[]) => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = sales.filter(sale => sale.status === 'completed');
  const conversionRate = completedSales.length / sales.length || 0;

  return {
    totalSales,
    completedSales: completedSales.length,
    conversionRate: (conversionRate * 100).toFixed(1) + '%',
  };
};