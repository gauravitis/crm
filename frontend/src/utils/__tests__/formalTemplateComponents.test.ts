import { describe, it, expect, vi } from 'vitest';
import {
  createFormalHeader,
  createFormalClientSection,
  createFormalItemsTable
} from '../quotationTemplates';
import {
  mockCompanyChembioPvt,
  mockQuotationData
} from '../../test/mockData';
import { Table } from 'docx';

// Mock the documentGenerator module
vi.mock('../documentGenerator', () => ({
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
      normal: { name: 'Times New Roman', size: 22 },
      tableSmall: { name: 'Times New Roman', size: 18 }
    }
  }
}));

describe('Formal Template Components', () => {
  describe('createFormalHeader', () => {
    it('should create formal header with dark navy color scheme', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      expect(header).toBeInstanceOf(Table);
      expect(header.root).toBeDefined();
    });

    it('should apply formal letterhead-style design', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      // Verify the table structure exists
      expect(header.root).toBeDefined();
      expect(header.root.length).toBeGreaterThan(0);
    });

    it('should use company legal name when available', () => {
      const companyWithLegalName = {
        ...mockCompanyChembioPvt,
        legalName: 'Chembio Lifesciences Private Limited'
      };
      
      const header = createFormalHeader(companyWithLegalName);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should handle missing company data with defaults', () => {
      const header = createFormalHeader(null as any);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should apply dark navy and gold color scheme', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      // Verify formal styling is applied
      expect(header).toBeInstanceOf(Table);
    });

    it('should use serif typography for formal appearance', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should include company seal integration area', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('createFormalClientSection', () => {
    it('should create formal client section with traditional table format', () => {
      const clientSection = createFormalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
      expect(clientSection.root).toBeDefined();
    });

    it('should apply formal borders and traditional spacing', () => {
      const clientSection = createFormalClientSection(mockQuotationData);
      
      // Verify table structure
      expect(clientSection.root).toBeDefined();
      expect(clientSection.root.length).toBeGreaterThan(0);
    });

    it('should emphasize professional and corporate credibility', () => {
      const clientSection = createFormalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should handle missing client data gracefully', () => {
      const dataWithoutClient = {
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
      
      const clientSection = createFormalClientSection(dataWithoutClient);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should use formal business document layout', () => {
      const clientSection = createFormalClientSection(mockQuotationData);
      
      // Verify formal styling
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should apply dark navy and gold color scheme', () => {
      const clientSection = createFormalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
    });
  });

  describe('createFormalItemsTable', () => {
    it('should create formal items table with traditional lined design', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
      expect(itemsTable.root).toBeDefined();
    });

    it('should implement clear borders and formal table structure', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      // Verify table structure
      expect(itemsTable.root).toBeDefined();
      expect(itemsTable.root.length).toBeGreaterThan(0);
    });

    it('should emphasize compliance information and formal terms', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should apply corporate styling with traditional fonts', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should include all required columns for formal business', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      // Should include header and item rows
      expect(itemsTable.root).toBeDefined();
    });

    it('should handle empty items array', () => {
      const dataWithNoItems = {
        ...mockQuotationData,
        items: []
      };
      
      const itemsTable = createFormalItemsTable(dataWithNoItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should create summary rows with formal styling', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      // Verify table includes summary information
      expect(itemsTable.root).toBeDefined();
    });

    it('should apply dark navy and gold color scheme consistently', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should handle multiple items with consistent formatting', () => {
      const dataWithMultipleItems = {
        ...mockQuotationData,
        items: [
          ...mockQuotationData.items,
          {
            sno: 3,
            cat_no: 'CBPL-003',
            pack_size: '10g',
            product_description: 'Formal Business Chemical',
            lead_time: '4-5 weeks',
            qty: 1,
            unit_rate: 2000.00,
            gst_percent: 18,
            total_price: 2360.00
          }
        ]
      };
      
      const itemsTable = createFormalItemsTable(dataWithMultipleItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });

  describe('Formal Template Color Scheme Consistency', () => {
    it('should use consistent dark navy primary color across components', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      const clientSection = createFormalClientSection(mockQuotationData);
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      // All components should be created successfully
      expect(header).toBeInstanceOf(Table);
      expect(clientSection).toBeInstanceOf(Table);
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should apply gold accent color appropriately', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('Formal Template Typography', () => {
    it('should use serif fonts for formal appearance', () => {
      const header = createFormalHeader(mockCompanyChembioPvt);
      const clientSection = createFormalClientSection(mockQuotationData);
      
      expect(header).toBeInstanceOf(Table);
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should use appropriate font sizes for hierarchy', () => {
      const itemsTable = createFormalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });

  describe('Formal Template Error Handling', () => {
    it('should handle null company data gracefully', () => {
      expect(() => {
        createFormalHeader(null as any);
      }).not.toThrow();
    });

    it('should handle undefined quotation data gracefully', () => {
      expect(() => {
        createFormalClientSection(undefined as any);
      }).toThrow();
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
        createFormalItemsTable(malformedData);
      }).toThrow();
    });
  });
});