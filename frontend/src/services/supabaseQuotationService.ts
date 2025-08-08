import { supabase } from '../config/supabase';
import { Quotation } from '../types/quotation';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'quotations';

interface ServiceResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

export const supabaseQuotationService = {
  async getQuotations(): Promise<ServiceResponse<Quotation[]>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('createdAt', { ascending: false });

    return { data: data as Quotation[] || [], error };
  },

  async getQuotation(id: string): Promise<ServiceResponse<Quotation>> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Quotation || null, error };
  },

  async addQuotation(quotation: Omit<Quotation, 'id'>): Promise<ServiceResponse<Quotation>> {
    // Make sure the object doesn't have an id property
    const { id, ...quotationWithoutId } = quotation as any;
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(quotationWithoutId)
      .select()
      .single();

    return { 
      data: data as Quotation || null, 
      error 
    };
  },

  async updateQuotation(id: string, quotation: Partial<Quotation>): Promise<ServiceResponse<null>> {
    // Remove the id from the update object if it exists
    const { id: _, ...updateData } = quotation as any;
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id);

    return { data: null, error };
  },

  async deleteQuotation(id: string): Promise<ServiceResponse<null>> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    return { data: null, error };
  }
}; 