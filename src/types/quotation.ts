export interface QuotationProduct {
  s_no: number;
  cat_no: string;
  pack_size: string;
  product_description: string;
  qty: number;
  unit_rate: number;
  discounted_value: number;
  gst_percent: number;
  gst_value: number;
  total_price: number;
  lead_time: string;
  make: string;
}

export interface QuotationData {
  // Company Details (Pre-filled)
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_pan: string;
  company_gst: string;

  // Client Details
  client_name: string;
  client_address: string;
  client_phone: string;
  contact_person: string;
  contact_person_mobile: string;
  client_reference: string;

  // Quotation Details
  quotation_ref: string;
  date: string;
  validity: string;
  payment_terms: string;

  // Products
  products: QuotationProduct[];
  total_amount: number;

  // Bank Details (Pre-filled)
  bank_name: string;
  account_no: string;
  ifsc_code: string;
  branch_code: string;
  micro_code: string;
  account_type: string;
}
