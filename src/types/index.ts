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
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  validUntil: Date;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
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