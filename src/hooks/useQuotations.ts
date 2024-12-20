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

  const addQuotation = useCallback((data: Omit<Quotation, 'id'>) => {
    const newQuotation: Quotation = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      status: data.status || 'draft'
    };
    setQuotations(prev => [...prev, newQuotation]);
  }, []);

  const updateQuotation = useCallback((id: string, data: Partial<Quotation>) => {
    setQuotations(prev => 
      prev.map(quotation => 
        quotation.id === id
          ? { ...quotation, ...data }
          : quotation
      )
    );
  }, []);

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