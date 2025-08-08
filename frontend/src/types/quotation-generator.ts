export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  format: 'pdf' | 'docx';
  previewUrl?: string;
}

export interface QuotationFormData {
  clientDetails: {
    name: string;
    company: string;
    address: string;
    phone?: string;
    email?: string;
  };
  items: QuotationItemData[];
  terms?: string[];
  bankDetails?: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
    branchCode: string;
  };
}

export interface QuotationItemData {
  id: string;
  catalogNo: string;
  packSize: string;
  description: string;
  quantity: number;
  unitRate: number;
  gst: number;
  make?: string;
  leadTime?: string;
  hsnCode?: string;
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
}

export interface BillTo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Quotation {
  id: string;
  clientId: string;
  employeeId?: string;
  items: QuotationProduct[];
  status: string;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
}

import { Employee } from './employee';
import { Company } from './company';

export interface QuotationData {
  billTo: {
    name: string;
    company?: string;
    contactPerson?: string;
    address: string;
    phone: string;
    email: string;
  };
  billFrom: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gst: string;
    pan: string;
  };
  companyId: string;
  company?: Company;
  quotationRef: string;
  quotationDate: string;
  validTill: string;
  items: QuotationProduct[];
  subTotal: number;
  tax: number;
  roundOff: number;
  grandTotal: number;
  notes: string;
  paymentTerms: string;
  deliveryTerms?: string;
  validityPeriod?: string;
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
  employee?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  createdAt?: string;
}

export const QUOTATION_TEMPLATES: QuotationTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    previewUrl: 'https://via.placeholder.com/200x300/0066cc/ffffff?text=Modern+Blue',
    description: 'A clean, modern template with blue accents'
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    previewUrl: 'https://via.placeholder.com/200x300/333333/ffffff?text=Classic+Black',
    description: 'Traditional black and white design'
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    previewUrl: 'https://via.placeholder.com/200x300/666666/ffffff?text=Minimal+Gray',
    description: 'Minimalist design with subtle gray tones'
  },
  {
    id: 'professional-green',
    name: 'Professional Green',
    previewUrl: 'https://via.placeholder.com/200x300/006633/ffffff?text=Professional+Green',
    description: 'Professional template with green highlights'
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    previewUrl: 'https://via.placeholder.com/200x300/663399/ffffff?text=Elegant+Purple',
    description: 'Elegant design with purple accents'
  },
  {
    id: 'corporate-red',
    name: 'Corporate Red',
    previewUrl: 'https://via.placeholder.com/200x300/cc0000/ffffff?text=Corporate+Red',
    description: 'Corporate style with red elements'
  }
];
