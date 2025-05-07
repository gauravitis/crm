import { useState, useEffect } from 'react';
import { Company } from '../types/company';
import { companyService } from '../services/companyService';
import { toast } from 'react-toastify';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanies();
      setCompanies(data);
      
      // Filter active companies
      const active = data.filter(company => company.active);
      setActiveCompanies(active);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies');
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (company: Omit<Company, 'id'>) => {
    try {
      const newCompany = await companyService.addCompany(company);
      setCompanies(prev => [...prev, newCompany]);
      
      if (newCompany.active) {
        setActiveCompanies(prev => [...prev, newCompany]);
      }
      
      toast.success('Company added successfully');
      return newCompany;
    } catch (err) {
      console.error('Error adding company:', err);
      toast.error('Failed to add company');
      throw err;
    }
  };

  const updateCompany = async (company: Company) => {
    try {
      const { id, ...updateData } = company;
      await companyService.updateCompany(id, updateData);
      
      setCompanies(prev =>
        prev.map(c => (c.id === id ? company : c))
      );
      
      // Update active companies list
      setActiveCompanies(prev => {
        if (company.active) {
          // Add or update in active list
          return prev.some(c => c.id === id)
            ? prev.map(c => (c.id === id ? company : c))
            : [...prev, company];
        } else {
          // Remove from active list
          return prev.filter(c => c.id !== id);
        }
      });
      
      toast.success('Company updated successfully');
      return company;
    } catch (err) {
      console.error('Error updating company:', err);
      toast.error('Failed to update company');
      throw err;
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await companyService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      setActiveCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Company deleted successfully');
    } catch (err) {
      console.error('Error deleting company:', err);
      toast.error('Failed to delete company');
      throw err;
    }
  };

  const getCompanyById = (id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  };

  return {
    companies,
    activeCompanies,
    loading,
    error,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
    refreshCompanies: fetchCompanies,
  };
} 