import { QuotationData } from '../types/quotation-generator';
import { Company, TemplateConfig } from '../types/company';
import { TemplateRegistry, createCustomizedTemplateConfig } from './templateCustomization';
import { createChembioLifesciencesTemplate, createChembioPvtLtdTemplate, createChemlabSynthesisTemplate } from './quotationTemplates';

/**
 * Template extension utilities for easy addition of new companies and templates
 */

// Initialize the template registry with existing templates
export const initializeTemplateRegistry = () => {
  console.log('🔧 Initializing template registry...');

  // Register existing templates
  TemplateRegistry.registerTemplate(
    'chembio-lifesciences',
    createChembioLifesciencesTemplate,
    'Chembio Lifesciences - Modern Scientific Template',
    'modern'
  );

  TemplateRegistry.registerTemplate(
    'chembio-pvt-ltd',
    createChembioPvtLtdTemplate,
    'Chembio Lifesciences Pvt. Ltd. - Formal Corporate Template',
    'formal'
  );

  TemplateRegistry.registerTemplate(
    'chemlab-synthesis',
    createChemlabSynthesisTemplate,
    'Chemlab Synthesis - Technical Research Template',
    'technical'
  );

  console.log('✅ Template registry initialized with', TemplateRegistry.getAllTemplates().length, 'templates');
};

/**
 * Helper function to create a new company template based on existing templates
 */
export const createCompanyTemplate = (
  companyId: string,
  company: Company,
  baseTemplateType: 'modern' | 'formal' | 'technical',
  customizations?: {
    colorOverrides?: any;
    typographyOverrides?: any;
    sectionOrder?: string[];
    visibilityOverrides?: Record<string, boolean>;
    customSettings?: Record<string, any>;
  }
) => {
  // Create customized template configuration
  const templateConfig = createCustomizedTemplateConfig(
    baseTemplateType,
    company,
    customizations
  );

  // Create template function that uses the customized configuration
  const templateFunction = async (data: QuotationData) => {
    console.log(`🎨 Creating customized ${baseTemplateType} template for ${company.name}`);
    
    // Apply the customized configuration to the company data
    const customizedData = {
      ...data,
      company: {
        ...data.company,
        templateConfig
      }
    };

    // Use the appropriate base template with customized configuration
    switch (baseTemplateType) {
      case 'modern':
        return await createChembioLifesciencesTemplate(customizedData);
      case 'formal':
        return await createChembioPvtLtdTemplate(customizedData);
      case 'technical':
        return await createChemlabSynthesisTemplate(customizedData);
      default:
        throw new Error(`Unknown base template type: ${baseTemplateType}`);
    }
  };

  // Register the new template
  TemplateRegistry.registerTemplate(
    companyId,
    templateFunction,
    `${company.name} - Customized ${baseTemplateType.charAt(0).toUpperCase() + baseTemplateType.slice(1)} Template`,
    baseTemplateType
  );

  console.log(`✅ Created and registered custom template for ${company.name}`);
  return templateFunction;
};

/**
 * Predefined template creation helpers for common scenarios
 */
export const TemplateCreators = {
  /**
   * Create a modern scientific template for a new company
   */
  createModernScientificTemplate: (companyId: string, company: Company, customizations?: any) => {
    return createCompanyTemplate(companyId, company, 'modern', {
      ...customizations,
      customSettings: {
        emphasizeFields: ['leadTime', 'specifications', 'availability'],
        itemTableStyle: 'grid',
        headerLayout: 'centered',
        ...customizations?.customSettings
      }
    });
  },

  /**
   * Create a formal corporate template for a new company
   */
  createFormalCorporateTemplate: (companyId: string, company: Company, customizations?: any) => {
    return createCompanyTemplate(companyId, company, 'formal', {
      ...customizations,
      customSettings: {
        emphasizeFields: ['compliance', 'terms', 'corporate'],
        itemTableStyle: 'lines',
        headerLayout: 'split',
        ...customizations?.customSettings
      }
    });
  },

  /**
   * Create a technical research template for a new company
   */
  createTechnicalResearchTemplate: (companyId: string, company: Company, customizations?: any) => {
    return createCompanyTemplate(companyId, company, 'technical', {
      ...customizations,
      customSettings: {
        emphasizeFields: ['casNumber', 'specifications', 'research', 'technical'],
        itemTableStyle: 'minimal',
        headerLayout: 'left',
        ...customizations?.customSettings
      }
    });
  }
};

/**
 * Template management utilities
 */
export const TemplateManager = {
  /**
   * Add a new company with automatic template selection
   */
  addCompany: (
    companyId: string,
    company: Company,
    preferredTemplateType?: 'modern' | 'formal' | 'technical'
  ) => {
    console.log(`🏢 Adding new company: ${company.name}`);

    // Determine template type based on company name if not specified
    let templateType = preferredTemplateType;
    if (!templateType) {
      const name = company.name.toLowerCase();
      if (name.includes('lifesciences') && !name.includes('pvt')) {
        templateType = 'modern';
      } else if (name.includes('lifesciences') && name.includes('pvt')) {
        templateType = 'formal';
      } else if (name.includes('lab') || name.includes('research') || name.includes('synthesis')) {
        templateType = 'technical';
      } else {
        templateType = 'modern'; // Default fallback
      }
    }

    console.log(`📋 Selected template type: ${templateType}`);

    // Create and register the template
    return createCompanyTemplate(companyId, company, templateType);
  },

  /**
   * Update an existing company's template
   */
  updateCompanyTemplate: (
    companyId: string,
    company: Company,
    newTemplateType: 'modern' | 'formal' | 'technical',
    customizations?: any
  ) => {
    console.log(`🔄 Updating template for company: ${company.name}`);
    
    // Remove existing template if it exists
    if (TemplateRegistry.hasTemplate(companyId)) {
      TemplateRegistry.unregisterTemplate(companyId);
    }

    // Create new template
    return createCompanyTemplate(companyId, company, newTemplateType, customizations);
  },

  /**
   * Remove a company's template
   */
  removeCompany: (companyId: string) => {
    console.log(`🗑️ Removing company template: ${companyId}`);
    return TemplateRegistry.unregisterTemplate(companyId);
  },

  /**
   * List all registered companies and their templates
   */
  listCompanies: () => {
    const templates = TemplateRegistry.getAllTemplates();
    console.log('📋 Registered company templates:');
    templates.forEach(template => {
      console.log(`  - ${template.companyId}: ${template.description}`);
    });
    return templates;
  },

  /**
   * Get template for company with fallback logic
   */
  getTemplateForCompany: async (companyId: string, data: QuotationData) => {
    const template = TemplateRegistry.getTemplate(companyId);
    
    if (template) {
      console.log(`✅ Using registered template for ${companyId}: ${template.description}`);
      return await template.templateFunction(data);
    }

    console.warn(`⚠️ No registered template found for company: ${companyId}`);
    return null;
  }
};

/**
 * Configuration presets for common business types
 */
export const TemplatePresets = {
  pharmaceutical: {
    templateType: 'formal' as const,
    emphasizeFields: ['compliance', 'regulations', 'quality'],
    colorScheme: {
      primary: '#1565C0',
      secondary: '#E3F2FD',
      accent: '#42A5F5'
    }
  },

  laboratory: {
    templateType: 'technical' as const,
    emphasizeFields: ['casNumber', 'purity', 'specifications'],
    colorScheme: {
      primary: '#2E7D32',
      secondary: '#E8F5E8',
      accent: '#66BB6A'
    }
  },

  biotechnology: {
    templateType: 'modern' as const,
    emphasizeFields: ['leadTime', 'storage', 'handling'],
    colorScheme: {
      primary: '#7B1FA2',
      secondary: '#F3E5F5',
      accent: '#BA68C8'
    }
  },

  chemical: {
    templateType: 'technical' as const,
    emphasizeFields: ['casNumber', 'hazards', 'msds'],
    colorScheme: {
      primary: '#F57C00',
      secondary: '#FFF3E0',
      accent: '#FFB74D'
    }
  }
};

/**
 * Initialize the template system
 */
export const initializeTemplateSystem = () => {
  console.log('🚀 Initializing template system...');
  initializeTemplateRegistry();
  console.log('✅ Template system initialized successfully');
};

// Auto-initialize when module is imported
initializeTemplateSystem();