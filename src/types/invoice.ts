export type InvoiceType = 'SALES' | 'PURCHASE';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface InvoiceItem {
  id?: string;
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  hsnCode: string;
  taxRate: number;
  taxAmount: number;
  amount: number;
  deliveryCharges: number;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  status: InvoiceStatus;
  
  // Party details
  partyId: string;  // Client ID for sales, Vendor ID for purchase
  partyName: string;
  partyAddress: string;
  partyGST?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  totalAmount: number;
  
  // Payment details
  paymentTerms?: string;
  paymentStatus: PaymentStatus;
  paymentDue: number;
  paymentReceived: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}
