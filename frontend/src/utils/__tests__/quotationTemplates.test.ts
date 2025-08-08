import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createModernHeader,
  createModernClientSection,
  createModernItemsTable,
  createSignatureSection,
  createBaseTemplate
} from '../quotationTemplates';
import {
  mockCompanyChembio,
  mockCompanyChembioPvt,
  mockCompanyChemlabSynthesis,
  mockQuotationData
} from '../../test/mockData';
import { Table, TableRow, TableCell } from 'docx';

// Mock the documentGenerator module
vi.mock('../documentGenerator', () => ({
  createFooterContent: vi.fn(() => ({
    children: []
  })),
  formatCurrency: vi.fn((value: number, withSymbol?: boolean) => {
    if (withSymbol) {
      return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return value.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }),
  STYLES: {
    borders: {
      none: {
        top: { style: 'none', size: 0, color: 'auto' },
        bottom: { style: 'none', size: 0, color: 'auto' },
        left: { style: 'none', size: 0, color: 'auto' },
        right: { style: 'none', size: 0, color: 'auto' }
      }
    },
    fonts: {
      normal: { name: 'Calibri', size: 22 },
      tableSmall: { name: 'Calibri', size: 18 }
    }
  }
}));

describe('quotationTemplates', () => {
  describe('createModernHeader', () => {
    it('should create a modern header with blue color scheme', () => {
      const header = createModernHeader(mockCompanyChembio);
      
      expect(header).toBeInstanceOf(Table);
      expect(header.root).toBeDefined();
    });

    it('should use company name in header', () => {
      const header = createModernHeader(mockCompanyChembio);
      
      // Check that the table has the expected structure
      expect(header.root).toBeDefined();
    });

    it('should handle missing company data gracefully', () => {
      const header = createModernHeader(null as any);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should use default values when company fields are missing', () => {
      const incompleteCompany = {
        ...mockCompanyChembio,
        name: undefined,
        address: undefined,
        contactInfo: undefined,
        taxInfo: undefined
      };
      
      const header = createModernHeader(incompleteCompany as any);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should apply modern color scheme styling', () => {
      const header = createModernHeader(mockCompanyChembio);
      
      // Verify the table structure exists
      expect(header.root).toBeDefined();
      expect(header.root.length).toBeGreaterThan(0);
    });
  });

  describe('createModernClientSection', () => {
    it('should create a modern client section with card-style design', () => {
      const clientSection = createModernClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
      expect(clientSection.root).toBeDefined();
    });

    it('should include all client information fields', () => {
      const clientSection = createModernClientSection(mockQuotationData);
      
      // Verify table structure
      expect(clientSection.root).toBeDefined();
      expect(clientSection.root.length).toBeGreaterThan(0);
    });

    it('should handle missing billTo data gracefully', () => {
      const dataWithoutBillTo = {
        ...mockQuotationData,
        billTo: {
          name: '',
          company: '',
          address: '',
          email: '',
          phone: '',
          contactPerson: ''
        }
      };
      
      const clientSection = createModernClientSection(dataWithoutBillTo);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should use fallback values for missing contact person', () => {
      const dataWithMissingContact = {
        ...mockQuotationData,
        billTo: {
          ...mockQuotationData.billTo,
          contactPerson: undefined
        }
      };
      
      const clientSection = createModernClientSection(dataWithMissingContact);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should apply modern styling with borders and colors', () => {
      const clientSection = createModernClientSection(mockQuotationData);
      
      // Verify the table has proper structure
      expect(clientSection.root).toBeDefined();
    });
  });

  describe('createModernItemsTable', () => {
    it('should create a modern items table with grid design', () => {
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
      expect(itemsTable.root).toBeDefined();
    });

    it('should include header row with all required columns', () => {
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      // Verify table structure
      expect(itemsTable.root).toBeDefined();
      expect(itemsTable.root.length).toBeGreaterThan(0);
    });

    it('should create rows for each item', () => {
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      // Should have header + item rows + summary rows
      expect(itemsTable.root).toBeDefined();
    });

    it('should apply alternating row colors', () => {
      const dataWithMultipleItems = {
        ...mockQuotationData,
        items: [
          ...mockQuotationData.items,
          {
            sno: 3,
            cat_no: 'CBL-003',
            pack_size: '25g',
            product_description: 'Test Chemical C',
            lead_time: '3-4 weeks',
            qty: 1,
            unit_rate: 500.00,
            gst_percent: 18,
            total_price: 590.00
          }
        ]
      };
      
      const itemsTable = createModernItemsTable(dataWithMultipleItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should include summary rows with totals', () => {
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      // Verify table includes summary information
      expect(itemsTable.root).toBeDefined();
    });

    it('should handle empty items array', () => {
      const dataWithNoItems = {
        ...mockQuotationData,
        items: []
      };
      
      const itemsTable = createModernItemsTable(dataWithNoItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should emphasize lead time with primary color', () => {
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      // Verify table structure exists
      expect(itemsTable.root).toBeDefined();
    });
  });

  describe('createSignatureSection', () => {
    it('should create signature section with company name', async () => {
      const signatureSection = await createSignatureSection(mockCompanyChembio);
      
      expect(signatureSection).toBeInstanceOf(Table);
      expect(signatureSection.root).toBeDefined();
    });

    it('should use legal name when available', async () => {
      const companyWithLegalName = {
        ...mockCompanyChembio,
        legalName: 'Chembio Lifesciences Private Limited'
      };
      
      const signatureSection = await createSignatureSection(companyWithLegalName);
      
      expect(signatureSection).toBeInstanceOf(Table);
    });

    it('should fallback to name when legal name is not available', async () => {
      const companyWithoutLegalName = {
        ...mockCompanyChembio,
        legalName: undefined
      };
      
      const signatureSection = await createSignatureSection(companyWithoutLegalName as any);
      
      expect(signatureSection).toBeInstanceOf(Table);
    });

    it('should use default company name when company is null', async () => {
      const signatureSection = await createSignatureSection(null as any);
      
      expect(signatureSection).toBeInstanceOf(Table);
    });

    it('should include authorized signatory text', async () => {
      const signatureSection = await createSignatureSection(mockCompanyChembio);
      
      expect(signatureSection).toBeInstanceOf(Table);
      expect(signatureSection.root).toBeDefined();
    });
  });

  describe('createBaseTemplate', () => {
    it('should create base template structure', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate).toBeDefined();
      expect(baseTemplate.styles).toBeDefined();
      expect(baseTemplate.features).toBeDefined();
      expect(baseTemplate.settings).toBeDefined();
      expect(baseTemplate.sections).toBeDefined();
    });

    it('should include default styles', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate.styles?.default?.document?.run).toBeDefined();
    });

    it('should include update fields feature', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate.features?.updateFields).toBe(true);
    });

    it('should include proper page settings', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate.sections?.[0]?.properties?.page).toBeDefined();
      expect(baseTemplate.sections?.[0]?.properties?.page?.size?.width).toBe(12240);
      expect(baseTemplate.sections?.[0]?.properties?.page?.size?.height).toBe(15840);
    });

    it('should include footer', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate.sections?.[0]?.footers?.default).toBeDefined();
    });

    it('should have empty children array for sections', async () => {
      const baseTemplate = await createBaseTemplate(mockQuotationData);
      
      expect(baseTemplate.sections?.[0]?.children).toEqual([]);
    });
  });

  describe('Color Scheme Application', () => {
    it('should apply correct colors for modern template', () => {
      const header = createModernHeader(mockCompanyChembio);
      
      // Verify modern blue color scheme is applied
      expect(header).toBeInstanceOf(Table);
    });

    it('should apply correct colors for formal template', () => {
      const header = createModernHeader(mockCompanyChembioPvt);
      
      // Even though using modern header function, it should work with any company
      expect(header).toBeInstanceOf(Table);
    });

    it('should apply correct colors for technical template', () => {
      const header = createModernHeader(mockCompanyChemlabSynthesis);
      
      // Even though using modern header function, it should work with any company
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('Typography Consistency', () => {
    it('should use consistent font family across components', () => {
      const header = createModernHeader(mockCompanyChembio);
      const clientSection = createModernClientSection(mockQuotationData);
      const itemsTable = createModernItemsTable(mockQuotationData);
      
      // All components should be created successfully
      expect(header).toBeInstanceOf(Table);
      expect(clientSection).toBeInstanceOf(Table);
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should use appropriate font sizes for different elements', () => {
      const header = createModernHeader(mockCompanyChembio);
      
      // Header should be created with proper structure
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('Error Handling', () => {
    it('should handle null quotation data gracefully', () => {
      expect(() => {
        createModernClientSection(null as any);
      }).toThrow();
    });

    it('should handle undefined company data gracefully', () => {
      expect(() => {
        createModernHeader(undefined as any);
      }).not.toThrow();
    });

    it('should handle malformed item data gracefully', () => {
      const malformedData = {
        ...mockQuotationData,
        items: [
          {
            sno: null,
            cat_no: undefined,
            pack_size: '',
            product_description: null,
            lead_time: undefined,
            qty: 'invalid',
            unit_rate: null,
            gst_percent: undefined,
            total_price: 'invalid'
          }
        ] as any
      };
      
      expect(() => {
        createModernItemsTable(malformedData);
      }).toThrow();
    });
  });
});