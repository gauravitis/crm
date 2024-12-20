import { useState, useEffect, useCallback } from 'react';
import { Quotation } from '../types';
import { generateId } from '../utils/generateId';

const QUOTATIONS_STORAGE_KEY = 'quotations';

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const savedQuotations = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
    if (savedQuotations) {
      try {
        const parsed = JSON.parse(savedQuotations);
        console.log('Loaded from storage:', parsed); // Debug log
        return parsed.map((q: any) => ({
          ...q,
          createdAt: new Date(q.createdAt),
          validUntil: new Date(q.validUntil),
          total: Number(q.total) || 0, // Ensure total is a number
          items: q.items.map((item: any) => ({
            ...item,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
            gst: Number(item.gst) || 0,
            total: Number(item.total) || 0
          }))
        }));
      } catch (error) {
        console.error('Error parsing saved quotations:', error);
        return [];
      }
    }
    return [];
  });

  // Save quotations to localStorage whenever they change
  useEffect(() => {
    console.log('Saving to storage:', quotations); // Debug log
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
  }, [quotations]);

  const addQuotation = useCallback((data: Omit<Quotation, 'id'>) => {
    const newQuotation: Quotation = {
      ...data,
      id: data.id || generateId(),
      createdAt: new Date(data.createdAt),
      validUntil: new Date(data.validUntil),
      total: Number(data.total) || 0,
      items: data.items.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
        gst: Number(item.gst) || 0,
        total: Number(item.total) || 0
      }))
    };
    console.log('Adding quotation:', newQuotation); // Debug log
    setQuotations(prev => [...prev, newQuotation]);
  }, []);

  const updateQuotation = useCallback((id: string, data: Partial<Quotation>) => {
    console.log('Updating quotation:', id, data);
    setQuotations(prev => {
      const newQuotations = prev.map(quotation => 
        quotation.id === id
          ? { ...quotation, ...data }
          : quotation
      );
      console.log('Updated quotations:', newQuotations);
      return newQuotations;
    });
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