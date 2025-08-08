import { supabase } from '../config/supabase';

// API endpoint
const API_URL = 'http://localhost:3001';

/**
 * Checks if data exists in Supabase tables
 * This can help verify if migration was successful
 */
export async function checkMigrationStatus() {
  console.log('Checking migration status in Supabase...');
  
  const tables = [
    'companies',
    'quotations',
    'clients',
    'employees',
    'items',
    'vendors',
    'invoices',
    'tasks',
    'counters'
  ];
  
  const results: Record<string, any> = {};
  
  for (const table of tables) {
    try {
      // Count records in the table
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
        results[table] = {
          exists: false,
          count: 0,
          error: error.message
        };
      } else {
        results[table] = {
          exists: true,
          count: count || (data?.length || 0),
          sample: data && data.length > 0 ? data[0] : null
        };
        console.log(`Table ${table}: ${count || data?.length || 0} records`);
      }
    } catch (error) {
      console.error(`Error accessing table ${table}:`, error);
      results[table] = {
        exists: false,
        count: 0,
        error: (error as Error).message
      };
    }
  }
  
  return results;
}

/**
 * Checks if Supabase tables exist
 * Returns a report on tables found vs not found
 * Uses the server API for more reliable results
 */
export async function checkTablesExist() {
  try {
    // Check if the API is accessible
    try {
      const connectionResponse = await fetch(`${API_URL}/api/test-connection`);
      const connectionData = await connectionResponse.json();
      
      if (!connectionData.success) {
        return {
          success: false,
          error: 'Database connection failed'
        };
      }
    } catch (error) {
      console.error('API connection error:', error);
      return {
        success: false,
        error: 'Could not connect to the API server. Make sure it is running.'
      };
    }
    
    // Fetch tables status from API
    const response = await fetch(`${API_URL}/api/check-tables`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
} 