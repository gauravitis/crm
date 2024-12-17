import { useState, useCallback, useEffect } from 'react';
import { Quotation, QuotationItem } from '../types';
import { generateId } from '../utils/helpers';
import { useClients } from './useClients';

const QUOTATIONS_STORAGE_KEY = 'crm_quotations';

export function useQuotations() {
  const { clients } = useClients();
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const savedQuotations = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (savedQuotations) {
      try {
        const parsed = JSON.parse(savedQuotations);
        // Convert date strings back to Date objects and add client names
        return parsed.map((q: Quotation) => {
          const client = clients.find(c => c.id === q.clientId);
          return {
            ...q,
            clientName: client?.name || 'Unknown Client',
            createdAt: new Date(q.createdAt),
            validUntil: new Date(q.validUntil)
          };
        });
      } catch (error) {
        console.error('Error parsing saved quotations:', error);
        return [];
      }
    }
    return [];
  });

  // Update client names whenever clients or quotations change
  useEffect(() => {
    setQuotations(prevQuotations => 
      prevQuotations.map(quotation => {
        const client = clients.find(c => c.id === quotation.clientId);
        return {
          ...quotation,
          clientName: client?.name || 'Unknown Client'
        };
      })
    );
  }, [clients]);

  // Save quotations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
  }, [quotations]);

  const calculateTotal = (items: QuotationItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const addQuotation = useCallback((data: Omit<Quotation, 'id' | 'createdAt' | 'total' | 'clientName'>) => {
    const client = clients.find(c => c.id === data.clientId);
    const newQuotation: Quotation = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      validUntil: new Date(data.validUntil),
      total: calculateTotal(data.items),
      clientName: client?.name || 'Unknown Client'
    };
    setQuotations(prev => [...prev, newQuotation]);
    return newQuotation;
  }, [clients]);

  const updateQuotation = useCallback((id: string, data: Partial<Quotation>) => {
    setQuotations(prev => prev.map(quotation => {
      if (quotation.id === id) {
        const client = clients.find(c => c.id === (data.clientId || quotation.clientId));
        const updatedQuotation = {
          ...quotation,
          ...data,
          clientName: client?.name || 'Unknown Client',
          validUntil: new Date(data.validUntil || quotation.validUntil),
          total: calculateTotal(data.items || quotation.items)
        };
        return updatedQuotation;
      }
      return quotation;
    }));
  }, [clients]);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(quotation => quotation.id !== id));
  }, []);

  return {
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation
  };
}