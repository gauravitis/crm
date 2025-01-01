import { useState, useCallback } from 'react';
import { Sale } from '../types';
import { generateId } from '../utils/helpers';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);

  const addSale = useCallback((data: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    setSales(prev => [...prev, newSale]);
    return newSale;
  }, []);

  const updateSale = useCallback((id: string, data: Partial<Sale>) => {
    setSales(prev => prev.map(sale => 
      sale.id === id ? { ...sale, ...data } : sale
    ));
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  }, []);

  return { sales, addSale, updateSale, deleteSale };
}