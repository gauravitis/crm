export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  format: 'pdf' | 'docx';
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
}

export interface QuotationProduct {
  sno: number;
  cat_no: string;
  pack_size: string;
  product_description: string;
  qty: number;
  unit_rate: number;
  discount_percent: number;
  discounted_value: number;
  gst_percent: number;
  gst_value: number;
  total_price: number;
  lead_time: string;
  make: string;
}

export interface QuotationParty {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst?: string;
}

export interface QuotationData {
  billTo: QuotationParty;
  billFrom: QuotationParty & {
    gst: string;
    pan: string;
  };
  quotationRef: string;
  quotationDate: string;
  validTill: string;
  items: QuotationProduct[];
  subTotal: number;
  tax: number;
  grandTotal: number;
  notes: string;
  paymentTerms: string;

  // Bank Details (Pre-filled)
  bankDetails: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
    branchCode: string;
    microCode: string;
    accountType: string;
  };
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
