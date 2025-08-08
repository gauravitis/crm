import { TemplateConfig, CompanyColorScheme, TemplateTypography, SectionConfiguration, Company } from '../types/company';
import { QuotationData } from '../types/quotation-generator';
import { createDefaultTemplateConfig } from './companyDefaults';

// Template customization utilities for future extensibility

/**
 * Apply custom color scheme overrides to a template configuration
 */
export const applyColorSchemeOverrides = (
  baseConfig: TemplateConfig,
  colorOverrides: Partial<CompanyColorScheme>
): TemplateConfig => {
  return {
    ...baseConfig,
    colorScheme: {
      ...baseConfig.colorScheme,
      ...colorOverrides
    }
  };
};

/**
 * Apply custom typography overrides to a template configuration
 */
export const applyTypographyOverrides = (
  baseConfig: TemplateConfig,
  typographyOverrides: Partial<TemplateTypography>
): TemplateConfig => {
  return {
    ...baseConfig,
    typography: {
      ...baseConfig.typography,
      ...typographyOverrides
    }
  };
};

/**
 * Apply custom branding overrides from company branding settings
 */
export const applyBrandingOverrides = (
  baseConfig: TemplateConfig,
  company: Company
): TemplateConfig => {
  let customizedConfig = { ...baseConfig };

  // Apply color overrides from company branding
  if (company.branding) {
    const colorOverrides: Partial<CompanyColorScheme> = {};
    
    if (company.branding.primaryColor) {
      colorOverrides.primary = company.branding.primaryColor;
    }
    if (company.branding.secondaryColor) {
      colorOverrides.secondary = company.branding.secondaryColor;
    }
    if (company.branding.accentColor) {
      colorOverrides.accent = company.branding.accentColor;
    }

    if (Object.keys(colorOverrides).length > 0) {
      customizedConfig = applyColorSchemeOverrides(customizedConfig, colorOverrides);
    }
  }

  // Apply font family overrides
  if (company.branding?.fontFamily) {
    const typographyOverrides: Partial<TemplateTypography> = {
      headerFont: { ...customizedConfig.typography.headerFont, family: company.branding.fontFamily },
      bodyFont: { ...customizedConfig.typography.bodyFont, family: company.branding.fontFamily },
      accentFont: { ...customizedConfig.typography.accentFont, family: company.branding.fontFamily }
    };
    
    customizedConfig = applyTypographyOverrides(customizedConfig, typographyOverrides);
  }

  return customizedConfig;
};

/**
 * Configure section ordering and visibility
 */
export const configureSections = (
  baseConfig: TemplateConfig,
  sectionOrder?: string[],
  visibilityOverrides?: Record<string, boolean>
): TemplateConfig => {
  let sections = [...baseConfig.sections];

  // Apply visibility overrides
  if (visibilityOverrides) {
    sections = sections.map(section => ({
      ...section,
      visible: visibilityOverrides[section.type] !== undefined 
        ? visibilityOverrides[section.type] 
        : section.visible
    }));
  }

  // Apply custom section ordering
  if (sectionOrder) {
    const orderedSections: SectionConfiguration[] = [];
    
    sectionOrder.forEach((sectionType, index) => {
      const section = sections.find(s => s.type === sectionType);
      if (section) {
        orderedSections.push({
          ...section,
          position: index + 1
        });
      }
    });

    // Add any remaining sections that weren't in the custom order
    sections.forEach(section => {
      if (!sectionOrder.includes(section.type)) {
        orderedSections.push({
          ...section,
          position: orderedSections.length + 1
        });
      }
    });

    sections = orderedSections;
  }

  return {
    ...baseConfig,
    sections
  };
};

/**
 * Create a fully customized template configuration
 */
export const createCustomizedTemplateConfig = (
  baseTemplateType: 'modern' | 'formal' | 'technical',
  company: Company,
  customizations?: {
    colorOverrides?: Partial<CompanyColorScheme>;
    typographyOverrides?: Partial<TemplateTypography>;
    sectionOrder?: string[];
    visibilityOverrides?: Record<string, boolean>;
    customSettings?: Record<string, any>;
  }
): TemplateConfig => {
  // Start with base template configuration
  let config = createDefaultTemplateConfig(baseTemplateType);

  // Apply company branding overrides
  config = applyBrandingOverrides(config, company);

  // Apply additional customizations if provided
  if (customizations) {
    if (customizations.colorOverrides) {
      config = applyColorSchemeOverrides(config, customizations.colorOverrides);
    }

    if (customizations.typographyOverrides) {
      config = applyTypographyOverrides(config, customizations.typographyOverrides);
    }

    if (customizations.sectionOrder || customizations.visibilityOverrides) {
      config = configureSections(config, customizations.sectionOrder, customizations.visibilityOverrides);
    }

    // Apply custom settings to the customizations object
    if (customizations.customSettings) {
      config.customizations = {
        ...config.customizations,
        ...customizations.customSettings
      };
    }
  }

  return config;
};

/**
 * Validate template configuration for completeness and correctness
 */
export const validateTemplateConfig = (config: TemplateConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate template type
  if (!['modern', 'formal', 'technical'].includes(config.templateType)) {
    errors.push(`Invalid template type: ${config.templateType}`);
  }

  // Validate color scheme
  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'text', 'border'];
  requiredColors.forEach(color => {
    if (!config.colorScheme[color as keyof CompanyColorScheme]) {
      errors.push(`Missing required color: ${color}`);
    }
  });

  // Validate typography
  const requiredFonts = ['headerFont', 'bodyFont', 'tableFont', 'accentFont'];
  requiredFonts.forEach(font => {
    const fontConfig = config.typography[font as keyof TemplateTypography];
    if (!fontConfig || !fontConfig.family || !fontConfig.size) {
      errors.push(`Invalid font configuration: ${font}`);
    }
  });

  // Validate sections
  if (!config.sections || config.sections.length === 0) {
    errors.push('No sections configured');
  } else {
    const requiredSections = ['header', 'title', 'client', 'items'];
    requiredSections.forEach(sectionType => {
      if (!config.sections.find(s => s.type === sectionType)) {
        errors.push(`Missing required section: ${sectionType}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get default values for missing configuration properties
 */
export const getDefaultConfigValues = (templateType: 'modern' | 'formal' | 'technical') => {
  return createDefaultTemplateConfig(templateType);
};

/**
 * Merge template configurations with fallback to defaults
 */
export const mergeTemplateConfigs = (
  baseConfig: TemplateConfig,
  overrideConfig: Partial<TemplateConfig>
): TemplateConfig => {
  return {
    templateType: overrideConfig.templateType || baseConfig.templateType,
    layout: overrideConfig.layout || baseConfig.layout,
    headerStyle: overrideConfig.headerStyle || baseConfig.headerStyle,
    tableStyle: overrideConfig.tableStyle || baseConfig.tableStyle,
    colorScheme: {
      ...baseConfig.colorScheme,
      ...(overrideConfig.colorScheme || {})
    },
    typography: {
      ...baseConfig.typography,
      ...(overrideConfig.typography || {})
    },
    spacing: {
      ...baseConfig.spacing,
      ...(overrideConfig.spacing || {})
    },
    sections: overrideConfig.sections || baseConfig.sections,
    customizations: {
      ...baseConfig.customizations,
      ...(overrideConfig.customizations || {})
    }
  };
};

/**
 * Template registry for easy addition of new companies and templates
 */
export class TemplateRegistry {
  private static templates: Map<string, {
    templateFunction: (data: QuotationData) => Promise<any>;
    description: string;
    templateType: 'modern' | 'formal' | 'technical';
  }> = new Map();

  /**
   * Register a new template for a company
   */
  static registerTemplate(
    companyId: string,
    templateFunction: (data: QuotationData) => Promise<any>,
    description: string,
    templateType: 'modern' | 'formal' | 'technical'
  ) {
    this.templates.set(companyId, {
      templateFunction,
      description,
      templateType
    });
    console.log(`✅ Registered template for company: ${companyId} (${description})`);
  }

  /**
   * Get template for a company
   */
  static getTemplate(companyId: string) {
    return this.templates.get(companyId);
  }

  /**
   * Get all registered templates
   */
  static getAllTemplates() {
    return Array.from(this.templates.entries()).map(([companyId, template]) => ({
      companyId,
      ...template
    }));
  }

  /**
   * Check if template exists for company
   */
  static hasTemplate(companyId: string): boolean {
    return this.templates.has(companyId);
  }

  /**
   * Remove template for company
   */
  static unregisterTemplate(companyId: string): boolean {
    const result = this.templates.delete(companyId);
    if (result) {
      console.log(`🗑️ Unregistered template for company: ${companyId}`);
    }
    return result;
  }
}

/**
 * Configuration validation and default value handling
 */
export const ensureValidTemplateConfig = (
  company: Company,
  fallbackTemplateType: 'modern' | 'formal' | 'technical' = 'modern'
): TemplateConfig => {
  let config = company.templateConfig;

  // If no config exists, create default
  if (!config) {
    console.warn(`⚠️ No template config for company ${company.name}, creating default`);
    config = createDefaultTemplateConfig(fallbackTemplateType);
  }

  // Validate the configuration
  const validation = validateTemplateConfig(config);
  
  if (!validation.isValid) {
    console.warn(`⚠️ Invalid template config for company ${company.name}:`, validation.errors);
    
    // Merge with defaults to fix missing properties
    const defaultConfig = createDefaultTemplateConfig(config.templateType || fallbackTemplateType);
    config = mergeTemplateConfigs(defaultConfig, config);
    
    // Re-validate
    const revalidation = validateTemplateConfig(config);
    if (!revalidation.isValid) {
      console.error(`❌ Could not fix template config for company ${company.name}, using defaults`);
      config = createDefaultTemplateConfig(fallbackTemplateType);
    } else {
      console.log(`✅ Fixed template config for company ${company.name}`);
    }
  }

  return config;
};