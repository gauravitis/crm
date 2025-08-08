import { QuotationData } from '../types/quotation-generator';
import { mockCompanyChembio, mockCompanyChembioPvt, mockCompanyChemlabSynthesis } from './mockData';

/**
 * Visual regression test data scenarios
 * These scenarios test different document layouts and content variations
 */

// Scenario 1: Minimal data (edge case)
export const minimalQuotationData: QuotationData = {
  quotationNumber: 'VR-MIN-001',
  date: '2024-01-15',
  validUntil: '2024-02-15',
  company: mockCompanyChembio,
  billTo: {
    name: 'Test Client',
    company: 'Test Company',
    address: 'Test Address',
    email: 'test@example.com',
    phone: '+1-555-0123',
    contactPerson: 'Test Person'
  },
  items: [
    {
      sno: 1,
      cat_no: 'MIN-001',
      pack_size: '1g',
      product_description: 'Basic Chemical',
      lead_time: '1 week',
      qty: 1,
      unit_rate: 100.00,
      gst_percent: 18,
      total_price: 118.00
    }
  ],
  subTotal: 100.00,
  tax: 18.00,
  roundOff: 0.00,
  grandTotal: 118.00,
  notes: 'Minimal test case',
  paymentTerms: '30 days'
};

// Scenario 2: Complex items with technical specifications
export const technicalQuotationData: QuotationData = {
  quotationNumber: 'VR-TECH-001',
  date: '2024-01-15',
  validUntil: '2024-02-15',
  company: mockCompanyChemlabSynthesis,
  billTo: {
    name: 'Dr. Sarah Johnson',
    company: 'Advanced Research Institute',
    address: '456 Research Blvd, Science Park, SP 67890',
    email: 'sarah.johnson@research.edu',
    phone: '+1-555-RESEARCH',
    contactPerson: 'Dr. Sarah Johnson'
  },
  items: [
    {
      sno: 1,
      cat_no: 'CAS-64-17-5',
      pack_size: '500ml',
      product_description: 'Ethanol, Absolute (CAS: 64-17-5) - 99.9% purity, molecular biology grade, DNase/RNase free, suitable for PCR applications',
      lead_time: '2-3 weeks',
      qty: 2,
      unit_rate: 850.00,
      gst_percent: 18,
      total_price: 2006.00,
      hsn_code: '22071000'
    },
    {
      sno: 2,
      cat_no: 'CAS-67-56-1',
      pack_size: '1L',
      product_description: 'Methanol, HPLC Grade (CAS: 67-56-1) - 99.9% purity, low water content (<0.02%), UV cutoff 205nm, suitable for chromatography',
      lead_time: '1-2 weeks',
      qty: 3,
      unit_rate: 1200.00,
      gst_percent: 18,
      total_price: 4248.00,
      hsn_code: '29051100'
    },
    {
      sno: 3,
      cat_no: 'CAS-7647-01-0',
      pack_size: '250ml',
      product_description: 'Hydrochloric Acid, 37% (CAS: 7647-01-0) - ACS reagent grade, assay 36.5-38.0%, suitable for analytical applications',
      lead_time: '3-4 weeks',
      qty: 1,
      unit_rate: 450.00,
      gst_percent: 18,
      total_price: 531.00,
      hsn_code: '28061000'
    }
  ],
  subTotal: 6150.00,
  tax: 1107.00,
  roundOff: 0.00,
  grandTotal: 7257.00,
  notes: 'All chemicals are research grade and come with CoA. Special handling and storage requirements apply.',
  paymentTerms: '45 days from invoice date'
};

// Scenario 3: Large order with many items
export const largeOrderQuotationData: QuotationData = {
  quotationNumber: 'VR-LARGE-001',
  date: '2024-01-15',
  validUntil: '2024-03-15',
  company: mockCompanyChembio,
  billTo: {
    name: 'Prof. Michael Chen',
    company: 'University Research Department',
    address: '789 University Ave, Academic City, AC 13579',
    email: 'michael.chen@university.edu',
    phone: '+1-555-UNI-DEPT',
    contactPerson: 'Prof. Michael Chen'
  },
  items: Array.from({ length: 25 }, (_, index) => ({
    sno: index + 1,
    cat_no: `UNI-${String(index + 1).padStart(3, '0')}`,
    pack_size: ['25g', '50g', '100g', '250g', '500g'][index % 5],
    product_description: [
      'Analytical Grade Chemical Reagent',
      'High Purity Organic Compound',
      'Research Grade Buffer Solution',
      'Laboratory Standard Reference',
      'Biochemical Research Material'
    ][index % 5] + ` - Item ${index + 1}`,
    lead_time: ['1-2 weeks', '2-3 weeks', '3-4 weeks', '4-5 weeks'][index % 4],
    qty: (index % 5) + 1,
    unit_rate: (index + 1) * 150 + (index % 3) * 50,
    gst_percent: 18,
    total_price: ((index + 1) * 150 + (index % 3) * 50) * ((index % 5) + 1) * 1.18
  })),
  subTotal: 0, // Will be calculated
  tax: 0, // Will be calculated
  roundOff: 0.00,
  grandTotal: 0, // Will be calculated
  notes: 'Bulk order for university research project. Volume discount applied. All items require proper storage conditions.',
  paymentTerms: '60 days from invoice date'
};

// Calculate totals for large order
largeOrderQuotationData.subTotal = largeOrderQuotationData.items.reduce(
  (sum, item) => sum + (item.unit_rate * item.qty), 0
);
largeOrderQuotationData.tax = largeOrderQuotationData.subTotal * 0.18;
largeOrderQuotationData.grandTotal = largeOrderQuotationData.subTotal + largeOrderQuotationData.tax;

// Scenario 4: Corporate formal quotation
export const corporateQuotationData: QuotationData = {
  quotationNumber: 'VR-CORP-001',
  date: '2024-01-15',
  validUntil: '2024-02-28',
  company: mockCompanyChembioPvt,
  billTo: {
    name: 'Ms. Jennifer Williams',
    company: 'Global Pharmaceuticals Ltd.',
    address: '100 Corporate Plaza, Business District, BD 24680',
    email: 'jennifer.williams@globalpharma.com',
    phone: '+1-555-CORP-BUY',
    contactPerson: 'Ms. Jennifer Williams, Procurement Manager'
  },
  items: [
    {
      sno: 1,
      cat_no: 'CORP-API-001',
      pack_size: '1kg',
      product_description: 'Active Pharmaceutical Ingredient - High purity compound for drug manufacturing, GMP certified, batch tested',
      lead_time: '6-8 weeks',
      qty: 5,
      unit_rate: 15000.00,
      gst_percent: 18,
      total_price: 88500.00,
      hsn_code: '29349900'
    },
    {
      sno: 2,
      cat_no: 'CORP-EXC-002',
      pack_size: '5kg',
      product_description: 'Pharmaceutical Excipient - USP/EP grade, suitable for tablet formulation, regulatory compliant',
      lead_time: '4-6 weeks',
      qty: 10,
      unit_rate: 2500.00,
      gst_percent: 18,
      total_price: 29500.00,
      hsn_code: '39069090'
    },
    {
      sno: 3,
      cat_no: 'CORP-STD-003',
      pack_size: '100mg',
      product_description: 'Reference Standard - Certified reference material for analytical testing, traceable to international standards',
      lead_time: '3-4 weeks',
      qty: 3,
      unit_rate: 8500.00,
      gst_percent: 18,
      total_price: 30090.00,
      hsn_code: '38220090'
    }
  ],
  subTotal: 125000.00,
  tax: 22500.00,
  roundOff: 0.00,
  grandTotal: 147500.00,
  notes: 'Corporate supply agreement terms apply. All materials come with comprehensive documentation including CoA, safety data sheets, and regulatory compliance certificates.',
  paymentTerms: '90 days from invoice date'
};

// Scenario 5: Special characters and formatting test
export const specialCharactersQuotationData: QuotationData = {
  quotationNumber: 'VR-SPEC-001',
  date: '2024-01-15',
  validUntil: '2024-02-15',
  company: mockCompanyChemlabSynthesis,
  billTo: {
    name: 'Dr. François Müller',
    company: 'Société de Recherche Européenne',
    address: '123 Rue de la Science, 75001 Paris, France',
    email: 'francois.muller@recherche.fr',
    phone: '+33-1-23-45-67-89',
    contactPerson: 'Dr. François Müller'
  },
  items: [
    {
      sno: 1,
      cat_no: 'SPEC-α-001',
      pack_size: '100μL',
      product_description: 'α-Naphthol (≥99% purity) - Special grade for β-testing applications, contains <0.1% impurities',
      lead_time: '2-3 weeks',
      qty: 1,
      unit_rate: 2500.00,
      gst_percent: 18,
      total_price: 2950.00
    },
    {
      sno: 2,
      cat_no: 'SPEC-β-002',
      pack_size: '50°C',
      product_description: 'Temperature-sensitive compound (store at -20°C to +4°C) - Contains 10% w/w active ingredient',
      lead_time: '1-2 weeks',
      qty: 2,
      unit_rate: 1800.00,
      gst_percent: 18,
      total_price: 4248.00
    }
  ],
  subTotal: 6100.00,
  tax: 1098.00,
  roundOff: 0.00,
  grandTotal: 7198.00,
  notes: 'Special handling required for international shipping. Temperature-controlled transport necessary.',
  paymentTerms: '30 days from invoice date'
};

// Export all test scenarios
export const visualTestScenarios = {
  minimal: minimalQuotationData,
  technical: technicalQuotationData,
  largeOrder: largeOrderQuotationData,
  corporate: corporateQuotationData,
  specialCharacters: specialCharactersQuotationData
};

// Company-specific test data
export const companyTestData = {
  chembio: {
    modern: {
      ...minimalQuotationData,
      company: mockCompanyChembio
    },
    technical: {
      ...technicalQuotationData,
      company: mockCompanyChembio
    },
    large: {
      ...largeOrderQuotationData,
      company: mockCompanyChembio
    }
  },
  chembioPvt: {
    formal: {
      ...corporateQuotationData,
      company: mockCompanyChembioPvt
    },
    minimal: {
      ...minimalQuotationData,
      company: mockCompanyChembioPvt
    },
    special: {
      ...specialCharactersQuotationData,
      company: mockCompanyChembioPvt
    }
  },
  chemlabSynthesis: {
    technical: {
      ...technicalQuotationData,
      company: mockCompanyChemlabSynthesis
    },
    special: {
      ...specialCharactersQuotationData,
      company: mockCompanyChemlabSynthesis
    },
    large: {
      ...largeOrderQuotationData,
      company: mockCompanyChemlabSynthesis
    }
  }
};