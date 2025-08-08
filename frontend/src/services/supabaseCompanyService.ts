import { supabase } from '../config/supabase';
import { Company } from '../types/company';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'companies';

interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export const supabaseCompanyService = {
  async getCompanies(): Promise<ServiceResponse<Company[]>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    return { data: data as Company[] || [], error };
  },

  async getActiveCompanies(): Promise<ServiceResponse<Company[]>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    return { data: data as Company[] || [], error };
  },

  async getCompany(id: string): Promise<ServiceResponse<Company>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Company || null, error };
  },

  async addCompany(company: Omit<Company, 'id'>): Promise<ServiceResponse<Company>> {
    // Make sure the object doesn't have an id property
    const { id, ...companyWithoutId } = company as any;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(companyWithoutId)
      .select()
      .single();

    return { 
      data: data as Company || null, 
      error 
    };
  },

  async updateCompany(id: string, company: Partial<Company>): Promise<ServiceResponse<null>> {
    // Remove the id from the update object if it exists
    const { id: _, ...updateData } = company as any;
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id);

    return { data: null, error };
  },

  async deleteCompany(id: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }
}; 