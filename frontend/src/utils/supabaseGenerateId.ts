import { supabase } from '../config/supabase';

/**
 * Gets the next quotation number from Supabase
 * Provides a fallback mechanism in case of errors
 */
export async function getNextQuotationNumber(): Promise<number> {
  try {
    // Call the Supabase RPC function to get the next counter value
    const { data, error } = await supabase.rpc('get_next_counter_value', {
      counter_name: 'quotation'
    });
    
    if (error) {
      console.error('Error getting next quotation number:', error);
      // Fallback to a backup strategy
      return generateFallbackQuotationNumber();
    }
    
    return data;
  } catch (error) {
    console.error('Exception getting next quotation number:', error);
    return generateFallbackQuotationNumber();
  }
}

/**
 * Generates a reference number for a quotation based on company, date, and counter
 */
export async function generateQuotationRef(
  companyId: string | undefined,
  companyShortCode: string | undefined
): Promise<string> {
  try {
    // Get the next quotation number
    const nextNumber = await getNextQuotationNumber();
    
    // Generate a formatted date string (YYYYMMDD)
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    
    // Use company short code if available
    const prefix = companyShortCode || 'QUO';
    
    // Format the reference number
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    // Final format: [COMPANY_CODE]-[DATE]-[SEQUENCE_NUMBER]
    // Example: CBL-20240516-0001
    return `${prefix}-${dateStr}-${paddedNumber}`;
  } catch (error) {
    console.error('Error generating quotation reference:', error);
    
    // Fallback to a simpler reference number that's still unique
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const prefix = companyShortCode || 'QUO';
    
    return `${prefix}-${timestamp}-${randomPart}`;
  }
}

/**
 * Generates a fallback quotation number when the database is unavailable
 * Based on current time to ensure it's unique
 */
function generateFallbackQuotationNumber(): number {
  // Use the current timestamp to ensure uniqueness
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // Convert to a number between 1 and 9999
  return (hours * 3600 + minutes * 60 + seconds) % 9999 + 1;
}

/**
 * Gets the next invoice number from Supabase
 */
export async function getNextInvoiceNumber(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_next_counter_value', {
      counter_name: 'invoice'
    });
    
    if (error) {
      console.error('Error getting next invoice number:', error);
      return generateFallbackInvoiceNumber();
    }
    
    return data;
  } catch (error) {
    console.error('Exception getting next invoice number:', error);
    return generateFallbackInvoiceNumber();
  }
}

/**
 * Generates a fallback invoice number when the database is unavailable
 */
function generateFallbackInvoiceNumber(): number {
  // Use current date components to ensure uniqueness
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() % 100; // Last two digits of year
  
  // Combine with milliseconds for uniqueness
  const ms = date.getMilliseconds();
  
  // Convert to a number between 1 and 9999
  return ((year * 10000 + month * 100 + day) + ms) % 9999 + 1;
} 