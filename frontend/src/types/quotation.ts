import { Company } from './company';

export interface Quotation {
  id?: string;
  quotationRef: string;
  createdAt: string;
  quotationDate: string;
  validTill: string;
  companyId: string;
  company?: Company;
  items: QuotationProduct[];
  billTo: {
    name: string;
    company?: string;
    contactPerson?: string;
    address: string;
    phone: string;
    email: string;
    gst?: string;
  };
  billFrom: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
    pan: string;
  };
  employee?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  paymentTerms: string;
  notes: string;
  subTotal: number;
  tax: number;
  roundOff: number;
  grandTotal: number;
  bankDetails: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
    branchCode: string;
    microCode: string;
    accountType: string;
  };
  document?: {
    filename: string;
    data: string;
  };
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED';
  paymentDetails?: {
    amountPaid: number;
    lastPaymentDate?: string;
    paymentMethod?: string;
    transactionId?: string;
    paymentNotes?: string;
  };
  shippingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  shippingDetails?: {
    courierName?: string;
    trackingNumber?: string;
    expectedDeliveryDate?: string;
    shippingDate?: string;
    shippingAddress?: string;
    shippingNotes?: string;
  };
  lastUpdated?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface QuotationProduct {
  sno: number;
  cat_no: string;
  pack_size: string;
  product_description: string;
  hsn_code: string;
  qty: number;
  unit_rate: number;
  discount_percent: number;
  discounted_value: number;
  gst_percent: number;
  gst_value: number;
  total_price: number;
  lead_time?: string;
  make?: string;
  delivery_status?: 'pending' | 'partial' | 'delivered';
  delivered_qty?: number;
  delivery_notes?: string;
  last_delivery_date?: string;
  expected_delivery_date?: string;
  courier_details?: {
    courier_name?: string;
    tracking_number?: string;
    dispatch_date?: string;
  };
  delivery_history?: DeliveryHistoryEntry[];
}

export interface DeliveryHistoryEntry {
  date: string;
  status: 'pending' | 'partial' | 'delivered';
  quantity: number;
  notes?: string;
}

export type QuotationData = Quotation;
