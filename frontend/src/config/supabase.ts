import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usydopzztlqyfaqrrcas.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeWRvcHp6dGxxeWZhcXJyY2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTI3NDksImV4cCI6MjA2Mjk2ODc0OX0.Rk74vy_CZWy51oAD9zrv72GwTr3XLF_GkGAbnqyoyaw';

// Create a single Supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This client has full admin privileges - use carefully and only on the server
// For client-side operations, use the regular supabase client above
export const supabaseAdmin = createClient(
  supabaseUrl, 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeWRvcHp6dGxxeWZhcXJyY2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzM5Mjc0OSwiZXhwIjoyMDYyOTY4NzQ5fQ.JMBnNk8vg4sLVXfzdPRywG4fk3jf_dhGqhVXDytsIzo'
);

export default supabase; 