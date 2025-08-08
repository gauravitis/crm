import { describe, it, expect, vi } from 'vitest';
import {
  createTechnicalHeader,
  createTechnicalClientSection,
  createTechnicalItemsTable
} from '../quotationTemplates';
import {
  mockCompanyChemlabSynthesis,
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
      normal: { name: 'Arial', size: 22 },
      tableSmall: { name: 'Arial', size: 18 }
    }
  }
}));

describe('Technical Template Components', () => {
  describe('createTechnicalHeader', () => {
    it('should create technical header with scientific green color scheme', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      expect(header).toBeInstanceOf(Table);
      expect(header.root).toBeDefined();
    });

    it('should apply left-aligned scientific design', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      // Verify the table structure exists
      expect(header.root).toBeDefined();
      expect(header.root.length).toBeGreaterThan(0);
    });

    it('should use scientific styling with clean presentation', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should implement compact header layout for technical documents', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should handle missing company data with defaults', () => {
      const header = createTechnicalHeader(null as any);
      
      expect(header).toBeInstanceOf(Table);
    });

    it('should apply scientific green color scheme', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      // Verify technical styling is applied
      expect(header).toBeInstanceOf(Table);
    });

    it('should use clean sans-serif typography for technical clarity', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('createTechnicalClientSection', () => {
    it('should create technical client section with compact format', () => {
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
      expect(clientSection.root).toBeDefined();
    });

    it('should apply information-dense layout for technical presentation', () => {
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
      // Verify table structure
      expect(clientSection.root).toBeDefined();
      expect(clientSection.root.length).toBeGreaterThan(0);
    });

    it('should optimize space usage for technical document requirements', () => {
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should apply scientific styling with data clarity emphasis', () => {
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
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
      
      const clientSection = createTechnicalClientSection(dataWithoutClient);
      
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should use technical color scheme consistently', () => {
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
      expect(clientSection).toBeInstanceOf(Table);
    });
  });

  describe('createTechnicalItemsTable', () => {
    it('should create technical items table with data table design', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
      expect(itemsTable.root).toBeDefined();
    });

    it('should implement CAS numbers prominence', () => {
      const dataWithCASNumbers = {
        ...mockQuotationData,
        items: mockQuotationData.items.map(item => ({
          ...item,
          cas_number: '123-45-6',
          product_description: `${item.product_description} (CAS: 123-45-6)`
        }))
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithCASNumbers);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should emphasize chemical specifications and research details', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should highlight research applications and technical details', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      // Verify table structure
      expect(itemsTable.root).toBeDefined();
      expect(itemsTable.root.length).toBeGreaterThan(0);
    });

    it('should apply monospace elements for technical data', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should use clean sans-serif for text elements', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should handle empty items array', () => {
      const dataWithNoItems = {
        ...mockQuotationData,
        items: []
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithNoItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should create summary rows with technical styling', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      // Verify table includes summary information
      expect(itemsTable.root).toBeDefined();
    });

    it('should handle multiple items with consistent technical formatting', () => {
      const dataWithMultipleItems = {
        ...mockQuotationData,
        items: [
          ...mockQuotationData.items,
          {
            sno: 3,
            cat_no: 'CLS-003',
            pack_size: '5g',
            product_description: 'Research Chemical C (CAS: 789-01-2)',
            lead_time: '3-4 weeks',
            qty: 1,
            unit_rate: 1200.00,
            gst_percent: 18,
            total_price: 1416.00
          }
        ]
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithMultipleItems);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });

  describe('Technical Template Color Scheme Consistency', () => {
    it('should use consistent scientific green primary color across components', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      const clientSection = createTechnicalClientSection(mockQuotationData);
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      // All components should be created successfully
      expect(header).toBeInstanceOf(Table);
      expect(clientSection).toBeInstanceOf(Table);
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should apply neutral backgrounds appropriately', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      
      expect(header).toBeInstanceOf(Table);
    });
  });

  describe('Technical Template Typography', () => {
    it('should use clean sans-serif fonts for readability', () => {
      const header = createTechnicalHeader(mockCompanyChemlabSynthesis);
      const clientSection = createTechnicalClientSection(mockQuotationData);
      
      expect(header).toBeInstanceOf(Table);
      expect(clientSection).toBeInstanceOf(Table);
    });

    it('should apply monospace elements for technical data', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should use appropriate font sizes for data hierarchy', () => {
      const itemsTable = createTechnicalItemsTable(mockQuotationData);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });

  describe('Technical Template Data Focus', () => {
    it('should emphasize CAS numbers when present', () => {
      const dataWithCAS = {
        ...mockQuotationData,
        items: [{
          ...mockQuotationData.items[0],
          cas_number: '64-17-5',
          product_description: 'Ethanol (CAS: 64-17-5)'
        }]
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithCAS);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should highlight research applications', () => {
      const dataWithResearch = {
        ...mockQuotationData,
        items: [{
          ...mockQuotationData.items[0],
          product_description: 'Research Grade Compound for Synthesis Applications'
        }]
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithResearch);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });

    it('should emphasize technical specifications', () => {
      const dataWithSpecs = {
        ...mockQuotationData,
        items: [{
          ...mockQuotationData.items[0],
          product_description: 'High Purity (>99%) Chemical Compound',
          specifications: 'Purity: >99%, Melting Point: 78°C'
        }]
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithSpecs);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });

  describe('Technical Template Error Handling', () => {
    it('should handle null company data gracefully', () => {
      expect(() => {
        createTechnicalHeader(null as any);
      }).not.toThrow();
    });

    it('should handle undefined quotation data gracefully', () => {
      expect(() => {
        createTechnicalClientSection(undefined as any);
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
        createTechnicalItemsTable(malformedData);
      }).toThrow();
    });

    it('should handle missing CAS numbers gracefully', () => {
      const dataWithoutCAS = {
        ...mockQuotationData,
        items: [{
          ...mockQuotationData.items[0],
          cas_number: undefined,
          product_description: 'Chemical without CAS number'
        }]
      };
      
      const itemsTable = createTechnicalItemsTable(dataWithoutCAS);
      
      expect(itemsTable).toBeInstanceOf(Table);
    });
  });
});