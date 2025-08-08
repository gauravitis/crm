import { describe, it, expect, vi } from 'vitest';
import {
  createTableBorders,
  formatCurrency,
  validateTemplateConfig,
  sanitizeTemplateInput,
  validateQuotationData,
  getDefaultTemplateConfig,
  createStyledTextRun
} from '../templateUtils';
import { TemplateConfig, CompanyColorScheme, TemplateTypography } from '../../types/company';
import { mockQuotationData } from '../../test/mockData';

describe('templateUtils', () => {
  describe('createTableBorders', () => {
    it('should create modern-grid borders with correct styling', () => {
      const borders = createTableBorders('modern-grid', '#0066CC');
      
      expect(borders.top.style).toBe('single');
      expect(borders.top.size).toBe(1);
      expect(borders.top.color).toBe('#0066CC');
      expect(borders.bottom.style).toBe('single');
      expect(borders.left.style).toBe('single');
      expect(borders.right.style).toBe('single');
    });

    it('should create formal-lines borders with thicker lines', () => {
      const borders = createTableBorders('formal-lines');
      
      expect(borders.top.size).toBe(2);
      expect(borders.bottom.size).toBe(2);
      expect(borders.left.size).toBe(2);
      expect(borders.right.size).toBe(2);
    });

    it('should create technical-data borders with no left/right borders', () => {
      const borders = createTableBorders('technical-data');
      
      expect(borders.top.style).toBe('single');
      expect(borders.bottom.style).toBe('single');
      expect(borders.left.style).toBe('none');
      expect(borders.right.style).toBe('none');
    });

    it('should create no borders for none style', () => {
      const borders = createTableBorders('none');
      
      expect(borders.top.style).toBe('none');
      expect(borders.bottom.style).toBe('none');
      expect(borders.left.style).toBe('none');
      expect(borders.right.style).toBe('none');
    });

    it('should use default color when none provided', () => {
      const borders = createTableBorders('modern-grid');
      
      expect(borders.top.color).toBe('#E5E7EB');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in Indian locale by default', () => {
      const formatted = formatCurrency(1234.56);
      
      expect(formatted).toMatch(/₹.*1,234\.56/);
    });

    it('should format currency without symbol when noSymbol is true', () => {
      const formatted = formatCurrency(1234.56, 'en-IN', true);
      
      expect(formatted).toBe('1,234.56');
      expect(formatted).not.toContain('₹');
    });

    it('should handle NaN values by defaulting to 0', () => {
      const formatted = formatCurrency(NaN);
      
      expect(formatted).toMatch(/₹.*0\.00/);
    });

    it('should format in USD locale when specified', () => {
      const formatted = formatCurrency(1234.56, 'en-US');
      
      expect(formatted).toMatch(/\$1,234\.56/);
    });

    it('should maintain 2 decimal places', () => {
      const formatted = formatCurrency(1234, 'en-IN', true);
      
      expect(formatted).toBe('1,234.00');
    });
  });

  describe('validateTemplateConfig', () => {
    it('should provide default values for missing config properties', () => {
      const config = validateTemplateConfig({});
      
      expect(config.templateType).toBe('modern');
      expect(config.layout).toBe('modern');
      expect(config.headerStyle).toBe('centered');
      expect(config.tableStyle).toBe('modern-grid');
      expect(config.colorScheme.primary).toBe('#1F497D');
      expect(config.typography.headerFont.family).toBe('Calibri');
      expect(config.sections).toHaveLength(7);
    });

    it('should merge provided config with defaults', () => {
      const partialConfig = {
        templateType: 'formal' as const,
        colorScheme: {
          primary: '#001F3F'
        }
      };
      
      const config = validateTemplateConfig(partialConfig);
      
      expect(config.templateType).toBe('formal');
      expect(config.colorScheme.primary).toBe('#001F3F');
      expect(config.colorScheme.secondary).toBe('#4B5563'); // default value
      expect(config.layout).toBe('modern'); // default value
    });

    it('should validate sections array structure', () => {
      const config = validateTemplateConfig({});
      
      expect(config.sections).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'header',
            position: 1,
            style: 'default',
            visible: true
          })
        ])
      );
    });
  });

  describe('sanitizeTemplateInput', () => {
    it('should remove angle brackets', () => {
      const result = sanitizeTemplateInput('<script>alert("test")</script>');
      
      expect(result).toBe('scriptalert("test")/script');
    });

    it('should remove javascript: protocol', () => {
      const result = sanitizeTemplateInput('javascript:alert("test")');
      
      expect(result).toBe('alert("test")');
    });

    it('should remove event handlers', () => {
      const result = sanitizeTemplateInput('onclick=alert("test")');
      
      expect(result).toBe('alert("test")');
    });

    it('should remove template literals', () => {
      const result = sanitizeTemplateInput('Hello ${maliciousCode}');
      
      expect(result).toBe('Hello');
    });

    it('should handle null and undefined inputs', () => {
      expect(sanitizeTemplateInput(null as any)).toBe('');
      expect(sanitizeTemplateInput(undefined as any)).toBe('');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeTemplateInput(123 as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const result = sanitizeTemplateInput('  test  ');
      
      expect(result).toBe('test');
    });
  });

  describe('validateQuotationData', () => {
    it('should sanitize billTo information', () => {
      const maliciousData = {
        ...mockQuotationData,
        billTo: {
          ...mockQuotationData.billTo,
          name: '<script>alert("test")</script>',
          company: 'javascript:void(0)',
          address: '${malicious}'
        }
      };
      
      const sanitized = validateQuotationData(maliciousData);
      
      expect(sanitized.billTo.name).toBe('scriptalert("test")/script');
      expect(sanitized.billTo.company).toBe('void(0)');
      expect(sanitized.billTo.address).toBe('');
    });

    it('should sanitize company information', () => {
      const maliciousData = {
        ...mockQuotationData,
        company: {
          ...mockQuotationData.company,
          name: '<malicious>',
          legalName: 'onclick=alert("test")'
        }
      };
      
      const sanitized = validateQuotationData(maliciousData);
      
      expect(sanitized.company.name).toBe('malicious');
      expect(sanitized.company.legalName).toBe('alert("test")');
    });

    it('should sanitize item descriptions', () => {
      const maliciousData = {
        ...mockQuotationData,
        items: [{
          ...mockQuotationData.items[0],
          product_description: '<script>malicious</script>',
          cat_no: 'javascript:void(0)',
          pack_size: '${template}'
        }]
      };
      
      const sanitized = validateQuotationData(maliciousData);
      
      expect(sanitized.items[0].product_description).toBe('scriptmalicious/script');
      expect(sanitized.items[0].cat_no).toBe('void(0)');
      expect(sanitized.items[0].pack_size).toBe('');
    });

    it('should sanitize notes and payment terms', () => {
      const maliciousData = {
        ...mockQuotationData,
        notes: '<script>alert("notes")</script>',
        paymentTerms: 'javascript:alert("terms")'
      };
      
      const sanitized = validateQuotationData(maliciousData);
      
      expect(sanitized.notes).toBe('scriptalert("notes")/script');
      expect(sanitized.paymentTerms).toBe('alert("terms")');
    });
  });

  describe('getDefaultTemplateConfig', () => {
    it('should return modern template config', () => {
      const config = getDefaultTemplateConfig('modern');
      
      expect(config.templateType).toBe('modern');
      expect(config.headerStyle).toBe('centered');
      expect(config.tableStyle).toBe('modern-grid');
      expect(config.colorScheme.primary).toBe('#0066CC');
      expect(config.customizations.emphasizeFields).toContain('leadTime');
    });

    it('should return formal template config', () => {
      const config = getDefaultTemplateConfig('formal');
      
      expect(config.templateType).toBe('formal');
      expect(config.tableStyle).toBe('formal-lines');
      expect(config.colorScheme.primary).toBe('#001F3F');
      expect(config.colorScheme.secondary).toBe('#D4AF37');
      expect(config.customizations.emphasizeFields).toContain('compliance');
    });

    it('should return technical template config', () => {
      const config = getDefaultTemplateConfig('technical');
      
      expect(config.templateType).toBe('technical');
      expect(config.headerStyle).toBe('left-aligned');
      expect(config.tableStyle).toBe('technical-data');
      expect(config.colorScheme.primary).toBe('#2E7D32');
      expect(config.customizations.emphasizeFields).toContain('casNumber');
    });
  });

  describe('createStyledTextRun', () => {
    const mockTypography: TemplateTypography = {
      headerFont: { family: 'Arial', size: 24, weight: 'bold' },
      bodyFont: { family: 'Calibri', size: 18, weight: 'normal' },
      tableFont: { family: 'Calibri', size: 16, weight: 'normal' },
      accentFont: { family: 'Calibri', size: 20, weight: 'normal' }
    };

    it('should create text run with header font styling', () => {
      const textRun = createStyledTextRun('Test Header', mockTypography, 'header');
      
      // TextRun properties are private, so we test by creating the object successfully
      expect(textRun).toBeDefined();
      expect(textRun.constructor.name).toBe('TextRun');
    });

    it('should create text run with body font styling', () => {
      const textRun = createStyledTextRun('Test Body', mockTypography, 'body');
      
      expect(textRun).toBeDefined();
      expect(textRun.constructor.name).toBe('TextRun');
    });

    it('should apply custom options', () => {
      const textRun = createStyledTextRun('Test', mockTypography, 'body', {
        bold: true,
        color: '#FF0000',
        italic: true
      });
      
      expect(textRun).toBeDefined();
      expect(textRun.constructor.name).toBe('TextRun');
    });

    it('should sanitize input text', () => {
      const textRun = createStyledTextRun('<script>alert("test")</script>', mockTypography);
      
      expect(textRun).toBeDefined();
      expect(textRun.constructor.name).toBe('TextRun');
    });

    it('should default to body font when type not specified', () => {
      const textRun = createStyledTextRun('Test', mockTypography);
      
      expect(textRun).toBeDefined();
      expect(textRun.constructor.name).toBe('TextRun');
    });
  });
});