import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  BorderStyle,
  WidthType,
  HeightRule,
  ShadingType,
  convertInchesToTwip,
  VerticalAlign,
  Footer
} from 'docx';
import { TemplateConfig, CompanyColorScheme, TemplateTypography } from '../types/company';
import { QuotationData } from '../types/quotation-generator';
import { createFooterContent } from './documentGenerator';

// Enhanced border styles for different template types
export interface BorderStyleConfig {
  style: BorderStyle;
  size: number;
  color: string;
}

export interface TableBordersConfig {
  top: BorderStyleConfig;
  bottom: BorderStyleConfig;
  left: BorderStyleConfig;
  right: BorderStyleConfig;
}

/**
 * Creates table borders based on template style
 * 
 * This utility function generates appropriate border configurations for different
 * template types, ensuring consistent styling across all document elements.
 * 
 * Border Styles:
 * - 'modern-grid': Single borders (1px) for clean, modern appearance
 * - 'formal-lines': Double borders (2px) for traditional business documents
 * - 'technical-data': Horizontal-only borders for data-focused tables
 * - 'none': No borders for minimal styling
 * 
 * @param style - The border style type to apply
 * @param color - Optional border color (defaults to #E5E7EB)
 * @returns TableBordersConfig - Configuration object with top, bottom, left, right borders
 * 
 * @example
 * ```typescript
 * const modernBorders = createTableBorders('modern-grid', '#0066CC');
 * const formalBorders = createTableBorders('formal-lines');
 * ```
 */
export const createTableBorders = (style: 'modern-grid' | 'formal-lines' | 'technical-data' | 'none', color?: string): TableBordersConfig => {
  const borderColor = color || '#E5E7EB';
  
  switch (style) {
    case 'modern-grid':
      return {
        top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      };
    
    case 'formal-lines':
      return {
        top: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
        right: { style: BorderStyle.SINGLE, size: 2, color: borderColor },
      };
    
    case 'technical-data':
      return {
        top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      };
    
    case 'none':
    default:
      return {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      };
  }
};

/**
 * Enhanced currency formatter with locale support
 * 
 * Formats numerical values as currency with proper locale-specific formatting.
 * Supports multiple currencies and provides option to exclude currency symbols.
 * 
 * Supported Locales:
 * - 'en-IN': Indian Rupees (₹) with Indian number formatting
 * - 'en-US': US Dollars ($) with US number formatting
 * - Other locales supported by Intl.NumberFormat
 * 
 * @param value - The numerical value to format
 * @param locale - The locale string (defaults to 'en-IN')
 * @param noSymbol - Whether to exclude the currency symbol (defaults to false)
 * @returns string - Formatted currency string
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1234.56, 'en-US') // "$1,234.56"
 * formatCurrency(1234.56, 'en-IN', true) // "1,234.56"
 * ```
 */
export const formatCurrency = (value: number, locale: string = 'en-IN', noSymbol: boolean = false): string => {
  if (isNaN(value)) value = 0;
  
  const formatter = new Intl.NumberFormat(locale, {
    style: noSymbol ? 'decimal' : 'currency',
    currency: locale === 'en-IN' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  let formatted = formatter.format(value);
  
  // Remove currency symbol if requested
  if (noSymbol) {
    formatted = formatted.replace(/[₹$€£¥]/g, '').trim();
  }
  
  return formatted;
};

/**
 * Creates a base document structure with common settings
 * 
 * This function establishes the foundational document structure that all templates
 * inherit, including page layout, margins, fonts, and common settings.
 * 
 * Document Features:
 * - Standard page size (8.5" x 11")
 * - Configurable margins based on template type
 * - Default font settings from template configuration
 * - Footer with page numbering
 * - Document update settings for dynamic fields
 * 
 * @param config - TemplateConfig containing typography, spacing, and layout settings
 * @returns Partial<Document> - Base document configuration for docx
 * 
 * @example
 * ```typescript
 * const baseDoc = createBaseDocument(templateConfig);
 * // Use as foundation for specific template implementations
 * ```
 */
export const createBaseDocument = (config: TemplateConfig): Partial<Document> => {
  return {
    styles: {
      default: {
        document: {
          run: {
            font: config.typography.bodyFont.family,
            size: config.typography.bodyFont.size,
          }
        }
      }
    },
    features: {
      updateFields: true
    },
    settings: {
      updateFields: true,
      defaultTabStop: 720,
      displayBackgroundShape: true,
      evenAndOddHeaders: false,
      trackRevisions: false,
      defaultView: "web"
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(config.spacing.headerPadding / 100),
            right: convertInchesToTwip(0.2),
            bottom: convertInchesToTwip(0.2),
            left: convertInchesToTwip(0.2),
          },
          size: {
            width: 12240, // 8.5 inches
            height: 15840, // 11 inches
          },
          pageLayout: {
            view: "web"
          }
        },
      },
      footers: {
        default: new Footer({
          children: [createFooterContent()]
        })
      },
      children: []
    }]
  };
};

/**
 * Validates template configuration and provides defaults
 * 
 * This function ensures that template configurations are complete and valid,
 * filling in missing properties with sensible defaults to prevent runtime errors.
 * 
 * Validation includes:
 * - Template type validation
 * - Color scheme completeness
 * - Typography configuration
 * - Spacing and layout settings
 * - Section configuration
 * 
 * Default Values:
 * - Template type: 'modern'
 * - Color scheme: Professional blue theme
 * - Typography: Calibri font family
 * - Standard spacing values
 * - Complete section configuration
 * 
 * @param config - Partial template configuration to validate
 * @returns TemplateConfig - Complete, validated template configuration
 * 
 * @example
 * ```typescript
 * const validConfig = validateTemplateConfig({ templateType: 'modern' });
 * // Returns complete configuration with all required properties
 * ```
 */
export const validateTemplateConfig = (config: Partial<TemplateConfig>): TemplateConfig => {
  const defaultColorScheme: CompanyColorScheme = {
    primary: '#1F497D',
    secondary: '#4B5563',
    accent: '#0066CC',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E7EB'
  };

  const defaultTypography: TemplateTypography = {
    headerFont: { family: 'Calibri', size: 24, weight: 'bold' },
    bodyFont: { family: 'Calibri', size: 22, weight: 'normal' },
    tableFont: { family: 'Calibri', size: 18, weight: 'normal' },
    accentFont: { family: 'Calibri', size: 20, weight: 'normal' }
  };

  return {
    templateType: config.templateType || 'modern',
    layout: config.layout || 'modern',
    headerStyle: config.headerStyle || 'centered',
    tableStyle: config.tableStyle || 'modern-grid',
    colorScheme: { ...defaultColorScheme, ...config.colorScheme },
    typography: { ...defaultTypography, ...config.typography },
    spacing: {
      headerPadding: 15,
      sectionMargin: 200,
      tableCellPadding: 80,
      lineHeight: 200,
      ...config.spacing
    },
    sections: config.sections || [
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
      emphasizeFields: [],
      sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank'],
      ...config.customizations
    }
  };
};

/**
 * Sanitizes user input to prevent template injection and security issues
 * 
 * This security function removes potentially dangerous characters and patterns
 * from user input before it's processed by the template system.
 * 
 * Security Measures:
 * - Removes HTML angle brackets (< >)
 * - Strips javascript: protocol references
 * - Removes event handler attributes (onclick, onload, etc.)
 * - Eliminates template literal syntax (${...})
 * - Trims whitespace
 * 
 * @param input - The string input to sanitize
 * @returns string - Sanitized string safe for template processing
 * 
 * @example
 * ```typescript
 * const safe = sanitizeTemplateInput('<script>alert("xss")</script>');
 * // Returns: 'scriptalert("xss")/script'
 * ```
 */
export const sanitizeTemplateInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\${.*?}/g, '') // Remove template literals
    .trim();
};

/**
 * Validates quotation data for template processing
 */
export const validateQuotationData = (data: QuotationData): QuotationData => {
  const sanitizedData = { ...data };
  
  // Sanitize text fields
  if (sanitizedData.billTo) {
    sanitizedData.billTo = {
      ...sanitizedData.billTo,
      name: sanitizeTemplateInput(sanitizedData.billTo.name || ''),
      company: sanitizeTemplateInput(sanitizedData.billTo.company || ''),
      address: sanitizeTemplateInput(sanitizedData.billTo.address || ''),
      email: sanitizeTemplateInput(sanitizedData.billTo.email || ''),
      phone: sanitizeTemplateInput(sanitizedData.billTo.phone || ''),
      contactPerson: sanitizeTemplateInput(sanitizedData.billTo.contactPerson || '')
    };
  }
  
  // Sanitize company data
  if (sanitizedData.company) {
    sanitizedData.company = {
      ...sanitizedData.company,
      name: sanitizeTemplateInput(sanitizedData.company.name || ''),
      legalName: sanitizeTemplateInput(sanitizedData.company.legalName || '')
    };
  }
  
  // Sanitize items
  if (sanitizedData.items) {
    sanitizedData.items = sanitizedData.items.map(item => ({
      ...item,
      product_description: sanitizeTemplateInput(item.product_description || ''),
      cat_no: sanitizeTemplateInput(item.cat_no || ''),
      pack_size: sanitizeTemplateInput(item.pack_size || '')
    }));
  }
  
  // Sanitize notes and terms
  sanitizedData.notes = sanitizeTemplateInput(sanitizedData.notes || '');
  sanitizedData.paymentTerms = sanitizeTemplateInput(sanitizedData.paymentTerms || '');
  
  return sanitizedData;
};

/**
 * Creates consistent spacing paragraph
 */
export const createSpacingParagraph = (spacing: number = 200): Paragraph => {
  return new Paragraph({
    spacing: { before: spacing, after: spacing }
  });
};

/**
 * Creates a text run with template-specific styling
 */
export const createStyledTextRun = (
  text: string, 
  typography: TemplateTypography, 
  type: 'header' | 'body' | 'table' | 'accent' = 'body',
  options: { bold?: boolean, color?: string, italic?: boolean } = {}
): TextRun => {
  const fontConfig = typography[`${type}Font`];
  
  return new TextRun({
    text: sanitizeTemplateInput(text),
    font: fontConfig.family,
    size: fontConfig.size,
    bold: options.bold || fontConfig.weight === 'bold',
    italics: options.italic || fontConfig.style === 'italic',
    color: options.color || undefined
  });
};

/**
 * Gets default template configuration for a company type
 */
export const getDefaultTemplateConfig = (templateType: 'modern' | 'formal' | 'technical'): TemplateConfig => {
  const baseConfig = {
    templateType,
    layout: templateType,
    sections: [
      { type: 'header' as const, position: 1, style: 'default', visible: true },
      { type: 'title' as const, position: 2, style: 'default', visible: true },
      { type: 'client' as const, position: 3, style: 'default', visible: true },
      { type: 'items' as const, position: 4, style: 'default', visible: true },
      { type: 'terms' as const, position: 5, style: 'default', visible: true },
      { type: 'signature' as const, position: 6, style: 'default', visible: true },
      { type: 'bank' as const, position: 7, style: 'default', visible: true }
    ]
  };

  switch (templateType) {
    case 'modern':
      return validateTemplateConfig({
        ...baseConfig,
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
        customizations: {
          headerLayout: 'centered',
          showLogo: true,
          logoPosition: 'center',
          itemTableStyle: 'grid',
          emphasizeFields: ['leadTime', 'availability', 'specifications'],
          sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
        }
      });

    case 'formal':
      return validateTemplateConfig({
        ...baseConfig,
        headerStyle: 'centered',
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
          headerLayout: 'centered',
          showLogo: true,
          logoPosition: 'center',
          itemTableStyle: 'lines',
          emphasizeFields: ['compliance', 'terms', 'corporate'],
          sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
        }
      });

    case 'technical':
      return validateTemplateConfig({
        ...baseConfig,
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
          headerLayout: 'left',
          showLogo: true,
          logoPosition: 'left',
          itemTableStyle: 'minimal',
          emphasizeFields: ['casNumber', 'specifications', 'research'],
          sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
        }
      });

    default:
      return validateTemplateConfig(baseConfig);
  }
};