import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTemplateForCompany,
  createChembioLifesciencesTemplate,
  createChembioPvtLtdTemplate,
  createChemlabSynthesisTemplate,
  createDefaultTemplate
} from '../quotationTemplates';
import {
  mockCompanyChembio,
  mockCompanyChembioPvt,
  mockCompanyChemlabSynthesis,
  mockQuotationData
} from '../../test/mockData';
import { QuotationData } from '../../types/quotation-generator';
import { Company } from '../../types/company';

// Mock the documentGenerator module with all required functions
vi.mock('../documentGenerator', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    createHeaderContent: vi.fn(() => ({
      children: []
    })),
    createFooterContent: vi.fn(() => ({
      children: []
    })),
    createQuotationTitle: vi.fn(() => []),
    formatCurrency: vi.fn((value: number, withSymbol?: boolean) => {
      if (withSymbol) {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      }
      return value.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }),
    convertInchesToDxa: vi.fn((inches: number) => inches * 1440),
    createClientDetailsTable: vi.fn(() => ({})),
    createItemsTable: vi.fn(() => ({})),
    createTermsSection: vi.fn(() => []),
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
    },
    COLORS: {
      primary: '#1F497D',
      secondary: '#4B5563'
    }
  };
});

describe('Quotation Templates Integration Tests', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Spy on console methods to verify logging behavior
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Complete Document Generation Workflow', () => {
    it('should generate complete document for Chembio Lifesciences with modern template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChembio
      };

      const document = await createChembioLifesciencesTemplate(data);

      // Verify document structure
      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.styles).toBeDefined();
      expect(document.sections).toBeDefined();
      expect(Array.isArray(document.sections)).toBe(true);
      expect(document.sections.length).toBeGreaterThan(0);

      // Verify the document has the expected structure
      const section = document.sections[0];
      expect(section.properties).toBeDefined();
      expect(section.children).toBeDefined();

      // Verify console logging for template creation
      expect(consoleLogSpy).toHaveBeenCalledWith('Creating Chembio Lifesciences modern template');
    });

    it('should generate complete document for Chembio Pvt Ltd with formal template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChembioPvt
      };

      const document = await createChembioPvtLtdTemplate(data);

      // Verify document structure
      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.styles).toBeDefined();
      expect(document.sections).toBeDefined();
      expect(Array.isArray(document.sections)).toBe(true);
      expect(document.sections.length).toBeGreaterThan(0);

      // Verify console logging for template creation
      expect(consoleLogSpy).toHaveBeenCalledWith('Creating Chembio Lifesciences Pvt. Ltd. template');
    });

    it('should generate complete document for Chemlab Synthesis with technical template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChemlabSynthesis
      };

      const document = await createChemlabSynthesisTemplate(data);

      // Verify document structure
      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.styles).toBeDefined();
      expect(document.sections).toBeDefined();
      expect(Array.isArray(document.sections)).toBe(true);
      expect(document.sections.length).toBeGreaterThan(0);

      // Verify console logging for template creation
      expect(consoleLogSpy).toHaveBeenCalledWith('Creating Chemlab Synthesis technical template');
    });

    it('should generate default template when company is unknown', async () => {
      const unknownCompany: Company = {
        ...mockCompanyChembio,
        id: 'unknown',
        name: 'Unknown Company',
        templateConfig: {
          ...mockCompanyChembio.templateConfig,
          templateType: 'modern'
        }
      };

      const data: QuotationData = {
        ...mockQuotationData,
        company: unknownCompany
      };

      const document = await createDefaultTemplate(data);

      // Verify document structure
      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.styles).toBeDefined();
      expect(document.sections).toBeDefined();
      expect(Array.isArray(document.sections)).toBe(true);
      expect(document.sections.length).toBeGreaterThan(0);

      // Verify console logging for default template
      expect(consoleLogSpy).toHaveBeenCalledWith('Creating default template');
    });
  });

  describe('Template Selection Logic', () => {
    it('should select modern template based on templateConfig.templateType', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembio,
          templateConfig: {
            ...mockCompanyChembio.templateConfig,
            templateType: 'modern'
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('🎯 Primary Selection: Using templateConfig.templateType:', 'modern');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating modern template (Chembio Lifesciences style)');
    });

    it('should select formal template based on templateConfig.templateType', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembioPvt,
          templateConfig: {
            ...mockCompanyChembioPvt.templateConfig,
            templateType: 'formal'
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('🎯 Primary Selection: Using templateConfig.templateType:', 'formal');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating formal template (Chembio Pvt Ltd style)');
    });

    it('should select technical template based on templateConfig.templateType', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChemlabSynthesis,
          templateConfig: {
            ...mockCompanyChemlabSynthesis.templateConfig,
            templateType: 'technical'
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('🎯 Primary Selection: Using templateConfig.templateType:', 'technical');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating technical template (Chemlab Synthesis style)');
    });

    it('should fallback to default template for unknown templateType', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembio,
          templateConfig: {
            ...mockCompanyChembio.templateConfig,
            templateType: 'unknown' as any
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ Unknown template type:', 'unknown');
    });

    it('should apply default template config when missing', async () => {
      const companyWithoutConfig: Company = {
        ...mockCompanyChembio,
        templateConfig: undefined as any
      };

      const data: QuotationData = {
        ...mockQuotationData,
        company: companyWithoutConfig
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ Company missing templateConfig, applying default configuration');
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ Applied default template config:', 'modern');
    });

    it('should handle null company data gracefully', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: null as any
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ No company data provided, using default template');
    });

    it('should handle null quotation data gracefully', async () => {
      // The function expects to check data.company, so we need to provide a minimal structure
      const minimalData = { company: null };
      const document = await getTemplateForCompany(minimalData as any);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ No company data provided, using default template');
    });
  });

  describe('Document Structure and Content Validation', () => {
    it('should include all required sections in modern template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChembio
      };

      const document = await createChembioLifesciencesTemplate(data);
      const section = document.sections[0];

      // Verify document has children (content)
      expect(section.children).toBeDefined();

      // Verify page settings
      expect(section.properties.page).toBeDefined();
      expect(section.properties.page.size.width).toBe(12240); // 8.5 inches
      expect(section.properties.page.size.height).toBe(15840); // 11 inches

      // Verify margins
      expect(section.properties.page.margin).toBeDefined();
    });

    it('should include all required sections in formal template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChembioPvt
      };

      const document = await createChembioPvtLtdTemplate(data);
      const section = document.sections[0];

      // Verify document has children (content)
      expect(section.children).toBeDefined();

      // Verify page settings
      expect(section.properties.page).toBeDefined();
      expect(section.properties.page.size.width).toBe(12240);
      expect(section.properties.page.size.height).toBe(15840);
    });

    it('should include all required sections in technical template', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChemlabSynthesis
      };

      const document = await createChemlabSynthesisTemplate(data);
      const section = document.sections[0];

      // Verify document has children (content)
      expect(section.children).toBeDefined();

      // Verify page settings
      expect(section.properties.page).toBeDefined();
      expect(section.properties.page.size.width).toBe(12240);
      expect(section.properties.page.size.height).toBe(15840);
    });

    it('should handle quotation data with all required fields', async () => {
      const completeData: QuotationData = {
        quotationNumber: 'Q-2024-TEST-001',
        date: '2024-01-15',
        validUntil: '2024-02-15',
        company: mockCompanyChembio,
        billTo: {
          name: 'Test Client',
          company: 'Test Company Ltd.',
          address: '123 Test Street, Test City, TC 12345',
          email: 'test@testcompany.com',
          phone: '+1-555-TEST',
          contactPerson: 'Test Person'
        },
        items: [
          {
            sno: 1,
            cat_no: 'TEST-001',
            pack_size: '100g',
            product_description: 'Test Chemical Compound',
            lead_time: '2-3 weeks',
            qty: 1,
            unit_rate: 1000.00,
            gst_percent: 18,
            total_price: 1180.00,
            hsn_code: '12345678',
            discount_percent: 0,
            discounted_value: 0,
            gst_value: 180.00
          }
        ],
        subTotal: 1000.00,
        tax: 180.00,
        roundOff: 0.00,
        grandTotal: 1180.00,
        notes: 'Test quotation for integration testing',
        paymentTerms: '30 days from invoice date'
      };

      const document = await getTemplateForCompany(completeData);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.sections[0].children).toBeDefined();
    });
  });

  describe('Performance Testing with Large Data Sets', () => {
    it('should handle quotation with many items efficiently', async () => {
      // Create a large dataset with 50 items
      const largeItemList = Array.from({ length: 50 }, (_, index) => ({
        sno: index + 1,
        cat_no: `TEST-${String(index + 1).padStart(3, '0')}`,
        pack_size: `${(index % 5 + 1) * 25}g`,
        product_description: `Test Chemical Compound ${index + 1} - Long description with detailed specifications and technical information`,
        lead_time: `${Math.floor(index / 10) + 1}-${Math.floor(index / 10) + 2} weeks`,
        qty: (index % 3) + 1,
        unit_rate: (index + 1) * 100,
        gst_percent: 18,
        total_price: ((index + 1) * 100) * 1.18,
        hsn_code: '12345678',
        discount_percent: 0,
        discounted_value: 0,
        gst_value: ((index + 1) * 100) * 0.18
      }));

      const largeData: QuotationData = {
        ...mockQuotationData,
        items: largeItemList,
        subTotal: largeItemList.reduce((sum, item) => sum + (item.unit_rate * item.qty), 0),
        tax: largeItemList.reduce((sum, item) => sum + item.gst_value, 0),
        grandTotal: largeItemList.reduce((sum, item) => sum + item.total_price, 0)
      };

      const startTime = Date.now();
      const document = await getTemplateForCompany(largeData);
      const endTime = Date.now();

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.sections[0].children).toBeDefined();

      // Performance assertion - should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Verify template selection logging includes timing
      expect(consoleLogSpy).toHaveBeenCalledWith('⏱️ Selection time:', expect.any(Number), 'ms');
    });

    it('should handle quotation with complex item descriptions', async () => {
      const complexData: QuotationData = {
        ...mockQuotationData,
        items: [
          {
            sno: 1,
            cat_no: 'COMPLEX-001',
            pack_size: '100g',
            product_description: 'Very long and complex chemical compound description with multiple lines of technical specifications, safety information, storage requirements, and detailed usage instructions that might span several lines in the document',
            lead_time: '4-6 weeks',
            qty: 1,
            unit_rate: 5000.00,
            gst_percent: 18,
            total_price: 5900.00,
            hsn_code: '12345678',
            discount_percent: 0,
            discounted_value: 0,
            gst_value: 900.00
          }
        ]
      };

      const document = await getTemplateForCompany(complexData);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.sections[0].children).toBeDefined();
    });
  });

  describe('Error Handling and Fallback Mechanisms', () => {
    it('should handle template creation errors gracefully', async () => {
      // Test with invalid data that might cause template creation to fail
      const invalidData: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembio,
          templateConfig: {
            ...mockCompanyChembio.templateConfig,
            templateType: 'invalid' as any
          }
        }
      };

      const document = await getTemplateForCompany(invalidData);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleWarnSpy).toHaveBeenCalledWith('⚠️ Unknown template type:', 'invalid');
    });

    it('should log template selection process', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: mockCompanyChembio
      };

      await getTemplateForCompany(data);

      expect(consoleLogSpy).toHaveBeenCalledWith('=== Template Selection Started ===');
      expect(consoleLogSpy).toHaveBeenCalledWith('Company Name:', mockCompanyChembio.name);
      expect(consoleLogSpy).toHaveBeenCalledWith('Company ID:', mockCompanyChembio.id);
      expect(consoleLogSpy).toHaveBeenCalledWith('Template Config Available:', true);
    });

    it('should handle missing billTo information gracefully', async () => {
      const dataWithoutBillTo: QuotationData = {
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

      const document = await getTemplateForCompany(dataWithoutBillTo);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.sections[0].children).toBeDefined();
    });

    it('should handle empty items array', async () => {
      const dataWithoutItems: QuotationData = {
        ...mockQuotationData,
        items: [],
        subTotal: 0,
        tax: 0,
        grandTotal: 0
      };

      const document = await getTemplateForCompany(dataWithoutItems);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(document.sections[0].children).toBeDefined();
    });
  });

  describe('Template Configuration Validation', () => {
    it('should validate modern template configuration', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembio,
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
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating modern template (Chembio Lifesciences style)');
    });

    it('should validate formal template configuration', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChembioPvt,
          templateConfig: {
            ...mockCompanyChembioPvt.templateConfig,
            templateType: 'formal'
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating formal template (Chembio Pvt Ltd style)');
    });

    it('should validate technical template configuration', async () => {
      const data: QuotationData = {
        ...mockQuotationData,
        company: {
          ...mockCompanyChemlabSynthesis,
          templateConfig: {
            ...mockCompanyChemlabSynthesis.templateConfig,
            templateType: 'technical'
          }
        }
      };

      const document = await getTemplateForCompany(data);

      expect(document).toBeDefined();
      expect(typeof document).toBe('object');
      expect(consoleLogSpy).toHaveBeenCalledWith('📋 Creating technical template (Chemlab Synthesis style)');
    });
  });
});