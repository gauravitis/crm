export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Quotation {
  id: string;
  clientId: string;
  items: QuotationItem[];
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: Date;
  validUntil: Date;
}

export interface QuotationItem {
  description: string;
  quantity: number;
  price: number;
  discount: number;
  gst: number;
  total: number;
}

export interface Sale {
  id: string;
  quotationId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentDate: Date;
  createdAt: Date;
}