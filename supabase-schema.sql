-- Create tables for CRM system in Supabase

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  legal_name TEXT,
  short_code TEXT,
  address JSONB,
  contact_info JSONB,
  tax_info JSONB,
  bank_details JSONB,
  branding JSONB,
  default_terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  address JSONB,
  phone TEXT,
  email TEXT,
  gst TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  designation TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Items table (for inventory)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  catalogue_id TEXT,
  pack_size TEXT,
  price NUMERIC(10, 2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  hsn_code TEXT,
  cas_number TEXT,
  brand TEXT,
  sku TEXT,
  batch_no TEXT,
  mfg_date TIMESTAMP WITH TIME ZONE,
  exp_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_ref TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  quotation_date TEXT,
  valid_till TEXT,
  company_id UUID REFERENCES companies(id),
  bill_to JSONB,
  bill_from JSONB,
  employee JSONB,
  payment_terms TEXT,
  notes TEXT,
  sub_total NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  round_off NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) DEFAULT 0,
  bank_details JSONB,
  items JSONB,
  document JSONB,
  status TEXT,
  payment_status TEXT,
  payment_details JSONB,
  shipping_status TEXT,
  shipping_details JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invoice_date TEXT,
  due_date TEXT,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  quotation_id UUID REFERENCES quotations(id),
  bill_to JSONB,
  bill_from JSONB,
  items JSONB,
  sub_total NUMERIC(12, 2) DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  grand_total NUMERIC(12, 2) DEFAULT 0,
  payment_terms TEXT,
  notes TEXT,
  status TEXT,
  payment_status TEXT,
  payment_details JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES employees(id),
  related_to_type TEXT,
  related_to_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  address JSONB,
  phone TEXT,
  email TEXT,
  gst TEXT,
  bank_details JSONB,
  products_offered JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Counters table for ID generation
CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0
);

-- Create a stored procedure to create the counters table if it doesn't exist
CREATE OR REPLACE FUNCTION create_counters_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'counters'
  ) THEN
    CREATE TABLE counters (
      name TEXT PRIMARY KEY,
      value INTEGER DEFAULT 0
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get the next counter value (similar to Firebase functionality)
CREATE OR REPLACE FUNCTION get_next_counter_value(counter_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_value INTEGER;
BEGIN
  -- Attempt to insert a new counter if it doesn't exist
  INSERT INTO counters (name, value)
  VALUES (counter_name, 1)
  ON CONFLICT (name) DO NOTHING;
  
  -- Update and return the counter value
  UPDATE counters
  SET value = value + 1
  WHERE name = counter_name
  RETURNING value INTO current_value;
  
  RETURN current_value;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access the data
CREATE POLICY "Enable access for authenticated users" ON companies 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON clients 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON employees 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON items 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON quotations 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON invoices 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON tasks 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON vendors 
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable access for authenticated users" ON counters 
  FOR ALL USING (auth.role() = 'authenticated'); 