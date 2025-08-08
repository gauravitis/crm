import { TemplateConfig, CompanyColorScheme, TemplateTypography, TemplateSpacing, SectionConfiguration, Company } from '../types/company';

// Default color schemes for each template type
export const DEFAULT_COLOR_SCHEMES: Record<string, CompanyColorScheme> = {
  modern: {
    primary: '#0066CC',
    secondary: '#F8F9FA',
    accent: '#E3F2FD',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E3F2FD'
  },
  formal: {
    primary: '#001F3F',
    secondary: '#D4AF37',
    accent: '#F5F5DC',
    background: '#FFFFFF',
    text: '#000000',
    border: '#001F3F'
  },
  technical: {
    primary: '#2E7D32',
    secondary: '#E8F5E8',
    accent: '#C8E6C9',
    background: '#FFFFFF',
    text: '#1B5E20',
    border: '#4CAF50'
  }
};

// Default typography configurations
export const DEFAULT_TYPOGRAPHY: Record<string, TemplateTypography> = {
  modern: {
    headerFont: { family: 'Calibri', size: 24, weight: 'bold' },
    bodyFont: { family: 'Calibri', size: 18 },
    tableFont: { family: 'Calibri', size: 16 },
    accentFont: { family: 'Calibri', size: 20, weight: 'bold' }
  },
  formal: {
    headerFont: { family: 'Times New Roman', size: 26, weight: 'bold' },
    bodyFont: { family: 'Times New Roman', size: 18 },
    tableFont: { family: 'Times New Roman', size: 16 },
    accentFont: { family: 'Times New Roman', size: 22, weight: 'bold' }
  },
  technical: {
    headerFont: { family: 'Arial', size: 22, weight: 'bold' },
    bodyFont: { family: 'Arial', size: 16 },
    tableFont: { family: 'Consolas', size: 14 },
    accentFont: { family: 'Arial', size: 18, weight: 'bold' }
  }
};

// Default spacing configurations
export const DEFAULT_SPACING: Record<string, TemplateSpacing> = {
  modern: {
    headerPadding: 200,
    sectionMargin: 200,
    tableCellPadding: 80,
    lineHeight: 240
  },
  formal: {
    headerPadding: 150,
    sectionMargin: 180,
    tableCellPadding: 100,
    lineHeight: 220
  },
  technical: {
    headerPadding: 120,
    sectionMargin: 160,
    tableCellPadding: 60,
    lineHeight: 200
  }
};

// Default section configurations
export const DEFAULT_SECTIONS: Record<string, SectionConfiguration[]> = {
  modern: [
    { type: 'header', position: 1, style: 'centered', visible: true },
    { type: 'title', position: 2, style: 'modern', visible: true },
    { type: 'client', position: 3, style: 'card', visible: true },
    { type: 'items', position: 4, style: 'modern-grid', visible: true },
    { type: 'terms', position: 5, style: 'modern', visible: true },
    { type: 'signature', position: 6, style: 'modern', visible: true },
    { type: 'bank', position: 7, style: 'modern', visible: true }
  ],
  formal: [
    { type: 'header', position: 1, style: 'letterhead', visible: true },
    { type: 'title', position: 2, style: 'formal', visible: true },
    { type: 'client', position: 3, style: 'table', visible: true },
    { type: 'items', position: 4, style: 'formal-lines', visible: true },
    { type: 'terms', position: 5, style: 'formal', visible: true },
    { type: 'signature', position: 6, style: 'formal', visible: true },
    { type: 'bank', position: 7, style: 'formal', visible: true }
  ],
  technical: [
    { type: 'header', position: 1, style: 'left-aligned', visible: true },
    { type: 'title', position: 2, style: 'technical', visible: true },
    { type: 'client', position: 3, style: 'compact', visible: true },
    { type: 'items', position: 4, style: 'technical-data', visible: true },
    { type: 'terms', position: 5, style: 'technical', visible: true },
    { type: 'signature', position: 6, style: 'technical', visible: true },
    { type: 'bank', position: 7, style: 'technical', visible: true }
  ]
};

// Create default template configuration for a given template type
export const createDefaultTemplateConfig = (templateType: 'modern' | 'formal' | 'technical'): TemplateConfig => {
  return {
    templateType,
    layout: templateType,
    headerStyle: templateType === 'modern' ? 'centered' : templateType === 'formal' ? 'split' : 'left-aligned',
    tableStyle: templateType === 'modern' ? 'modern-grid' : templateType === 'formal' ? 'formal-lines' : 'technical-data',
    colorScheme: DEFAULT_COLOR_SCHEMES[templateType],
    typography: DEFAULT_TYPOGRAPHY[templateType],
    spacing: DEFAULT_SPACING[templateType],
    sections: DEFAULT_SECTIONS[templateType],
    customizations: {
      headerLayout: templateType === 'modern' ? 'centered' : templateType === 'formal' ? 'split' : 'left',
      showLogo: true,
      logoPosition: templateType === 'modern' ? 'center' : templateType === 'formal' ? 'left' : 'left',
      itemTableStyle: templateType === 'modern' ? 'grid' : templateType === 'formal' ? 'lines' : 'minimal',
      emphasizeFields: templateType === 'modern' ? ['leadTime', 'specifications'] :
        templateType === 'formal' ? ['compliance', 'terms'] :
          ['casNumber', 'specifications', 'research'],
      sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
    }
  };
};

// Default company configurations for the three main companies
export const DEFAULT_COMPANY_CONFIGS = {
  chembioLifesciences: createDefaultTemplateConfig('modern'),
  chembioPvtLtd: createDefaultTemplateConfig('formal'),
  chemlabSynthesis: createDefaultTemplateConfig('technical')
};

// Utility function to get default template config based on company name
export const getDefaultTemplateConfigForCompany = (companyName: string): TemplateConfig => {
  const name = companyName.toLowerCase();

  if (name.includes('lifesciences') && !name.includes('pvt')) {
    return DEFAULT_COMPANY_CONFIGS.chembioLifesciences;
  } else if (name.includes('lifesciences') && name.includes('pvt')) {
    return DEFAULT_COMPANY_CONFIGS.chembioPvtLtd;
  } else if (name.includes('chemlab') || name.includes('synthesis')) {
    return DEFAULT_COMPANY_CONFIGS.chemlabSynthesis;
  }

  // Default fallback to modern template
  return DEFAULT_COMPANY_CONFIGS.chembioLifesciences;
};

// Utility function to ensure backward compatibility by adding template config to existing companies
export const ensureTemplateConfig = (company: Partial<Company>): Company => {
  if (!company.templateConfig && company.name) {
    return {
      ...company,
      templateConfig: getDefaultTemplateConfigForCompany(company.name)
    } as Company;
  }

  return company as Company;
};