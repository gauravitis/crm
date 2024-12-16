import { useState, useCallback } from 'react';
import { Quotation, QuotationItem } from '../types';
import { generateId } from '../utils/helpers';

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  const calculateTotal = (items: QuotationItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const addQuotation = useCallback((data: Omit<Quotation, 'id' | 'createdAt' | 'total'>) => {
    const newQuotation: Quotation = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      validUntil: new Date(data.validUntil),
      total: calculateTotal(data.items),
    };
    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  }, []);

  const updateQuotation = useCallback((id: string, data: Partial<Quotation>) => {
    setQuotations(prev => prev.map(quotation => {
      if (quotation.id === id) {
        const updatedQuotation = { 
          ...quotation,
          ...data,
          validUntil: data.validUntil ? new Date(data.validUntil) : quotation.validUntil
        };
        if (data.items) {
          updatedQuotation.total = calculateTotal(data.items);
        }
        return updatedQuotation;
      }
      return quotation;
    }));
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(quotation => quotation.id !== id));
  }, []);

  return { quotations, addQuotation, updateQuotation, deleteQuotation };
}