import { Company, TemplateConfig } from '../types/company';
import { QuotationData } from '../types/quotation-generator';

export const mockCompanyChembio: Company = {
  id: '1',
  name: 'Chembio Lifesciences',
  legalName: 'Chembio Lifesciences',
  shortCode: 'CBL',
  address: {
    street: 'L-10, Himalaya Legend, Nyay Khand-1, Indirapuram',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    postalCode: '201014',
    country: 'India'
  },
  contactInfo: {
    phone: '0120-4909400',
    email: 'chembio.sales@gmail.com'
  },
  taxInfo: {
    gst: '09AALFC0922C1ZU',
    pan: 'AALFC0922C'
  },
  bankDetails: {
    bankName: 'Test Bank',
    accountNo: '123456789',
    ifscCode: 'TEST0001',
    branchCode: 'TEST',
    microCode: 'TEST001',
    accountType: 'Current'
  },
  branding: {
    primaryColor: '#0066CC',
    secondaryColor: '#F2F2F2',
    accentColor: '#0066CC'
  },
  templateConfig: {
    templateType: 'modern',
    layout: 'modern',
    headerStyle: 'centered',
    tableStyle: 'modern-grid',
    colorScheme: {
      primary: '#0066CC',
      secondary: '#F2F2F2',
      accent: '#0066CC',
      background: '#FFFFFF',
      text: '#000000',
      border: '#E0E0E0'
    },
    typography: {
      headerFont: { family: 'Calibri', size: 24, weight: 'bold' },
      bodyFont: { family: 'Calibri', size: 22, weight: 'normal' },
      tableFont: { family: 'Calibri', size: 18, weight: 'normal' },
      accentFont: { family: 'Calibri', size: 20, weight: 'normal' }
    },
    spacing: {
      headerPadding: 15,
      sectionMargin: 200,
      tableCellPadding: 80,
      lineHeight: 200
    },
    sections: [
      { type: 'header', position: 1, style: 'default', visible: true },
      { type: 'title', position: 2, style: 'default', visible: true },
      { type: 'client', position: 3, style: 'default', visible: true },
      { type: 'items', position: 4, style: 'default', visible: true },
      { type: 'terms', position: 5, style: 'default', visible: true },
      { type: 'signature', position: 6, style: 'default', visible: true },
      { type: 'bank', position: 7, style: 'default', visible: true }
    ],
    customizations: {
      headerLayout: 'centered',
      showLogo: true,
      logoPosition: 'center',
      itemTableStyle: 'grid',
      emphasizeFields: ['leadTime', 'availability', 'specifications'],
      sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
    }
  },
  createdAt: '2024-01-01T00:00:00Z',
  active: true
};

export const mockCompanyChembioPvt: Company = {
  ...mockCompanyChembio,
  id: '2',
  name: 'Chembio Lifesciences Pvt. Ltd.',
  legalName: 'Chembio Lifesciences Pvt. Ltd.',
  shortCode: 'CBPL',
  templateConfig: {
    ...mockCompanyChembio.templateConfig,
    templateType: 'formal',
    layout: 'formal',
    tableStyle: 'formal-lines',
    colorScheme: {
      primary: '#001F3F',
      secondary: '#D4AF37',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#000000',
      border: '#D4AF37'
    },
    customizations: {
      ...mockCompanyChembio.templateConfig.customizations,
      emphasizeFields: ['compliance', 'terms', 'corporate']
    }
  }
};

export const mockCompanyChemlabSynthesis: Company = {
  ...mockCompanyChembio,
  id: '3',
  name: 'Chemlab Synthesis',
  legalName: 'Chemlab Synthesis',
  shortCode: 'CLS',
  templateConfig: {
    ...mockCompanyChembio.templateConfig,
    templateType: 'technical',
    layout: 'technical',
    headerStyle: 'left-aligned',
    tableStyle: 'technical-data',
    colorScheme: {
      primary: '#2E7D32',
      secondary: '#E8F5E9',
      accent: '#2E7D32',
      background: '#FFFFFF',
      text: '#000000',
      border: '#A5D6A7'
    },
    customizations: {
      ...mockCompanyChembio.templateConfig.customizations,
      headerLayout: 'left',
      logoPosition: 'left',
      emphasizeFields: ['casNumber', 'specifications', 'research']
    }
  }
};

export const mockQuotationData: QuotationData = {
  quotationNumber: 'Q-2024-001',
  date: '2024-01-15',
  validUntil: '2024-02-15',
  company: mockCompanyChembio,
  billTo: {
    name: 'John Doe',
    company: 'Test Research Lab',
    address: '123 Science Street, Research City, RC 12345',
    email: 'john.doe@testlab.com',
    phone: '+1-555-0123',
    contactPerson: 'John Doe'
  },
  items: [
    {
      sno: 1,
      cat_no: 'CBL-001',
      pack_size: '100g',
      product_description: 'High Purity Chemical Compound A',
      lead_time: '2-3 weeks',
      qty: 2,
      unit_rate: 1500.00,
      gst_percent: 18,
      total_price: 3540.00
    },
    {
      sno: 2,
      cat_no: 'CBL-002',
      pack_size: '50ml',
      product_description: 'Research Grade Solvent B',
      lead_time: '1-2 weeks',
      qty: 1,
      unit_rate: 800.00,
      gst_percent: 18,
      total_price: 944.00
    }
  ],
  subTotal: 2300.00,
  tax: 414.00,
  roundOff: 0.00,
  grandTotal: 2714.00,
  notes: 'Test quotation for unit testing',
  paymentTerms: '30 days from invoice date'
};