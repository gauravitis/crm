import { useState, useEffect } from 'react';
import { QuotationData } from '../types/quotation-generator';
import { quotationService } from '../services/quotationService';
import { toast } from 'react-toastify';

export function useQuotations() {
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getQuotations();
      setQuotations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to fetch quotations');
      toast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  const addQuotation = async (quotation: Omit<QuotationData, 'id'>) => {
    try {
      const newQuotation = await quotationService.addQuotation(quotation);
      setQuotations(prev => [...prev, newQuotation]);
      toast.success('Quotation added successfully');
      return newQuotation;
    } catch (err) {
      console.error('Error adding quotation:', err);
      toast.error('Failed to add quotation');
      throw err;
    }
  };

  const updateQuotation = async (quotation: QuotationData) => {
    try {
      const { id, ...updateData } = quotation;
      await quotationService.updateQuotation(id, updateData);
      setQuotations(prev =>
        prev.map(q => (q.id === id ? quotation : q))
      );
      toast.success('Quotation updated successfully');
      return quotation;
    } catch (err) {
      console.error('Error updating quotation:', err);
      toast.error('Failed to update quotation');
      throw err;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      await quotationService.deleteQuotation(id);
      setQuotations(prev => prev.filter(q => q.id !== id));
      toast.success('Quotation deleted successfully');
    } catch (err) {
      console.error('Error deleting quotation:', err);
      toast.error('Failed to delete quotation');
      throw err;
    }
  };

  return {
    quotations,
    loading,
    error,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    refreshQuotations: fetchQuotations,
  };
}