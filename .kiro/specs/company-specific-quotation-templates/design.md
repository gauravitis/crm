# Design Document

## Overview

This design addresses the current issue where all three companies (Chembio Lifesciences, Chembio Lifesciences Pvt. Ltd., and Chemlab Synthesis) generate quotations with nearly identical Word document formats. The solution involves creating distinctly different templates that reflect each company's unique brand identity, target market, and business focus while maintaining the existing technical infrastructure.

## Architecture

### Current State Analysis

The existing system has:
- Template selection logic in `getTemplateForCompany()` function
- Three template functions that produce similar outputs with only color variations
- Shared components for header, client details, items table, and terms sections
- Company-specific data structure with branding information

### Proposed Architecture

```
QuotationData → Template Selector → Company-Specific Template → Distinct Word Document
                      ↓
            [Chembio Lifesciences] → Modern Scientific Template
            [Chembio Pvt. Ltd.]   → Corporate Formal Template  
            [Chemlab Synthesis]   → Technical Research Template
```

## Components and Interfaces

### 1. Enhanced Template System

#### Template Configuration Interface
```typescript
interface TemplateConfig {
  layout: 'modern' | 'formal' | 'technical';
  headerStyle: 'centered' | 'left-aligned' | 'split';
  tableStyle: 'modern-grid' | 'formal-lines' | 'technical-data';
  colorScheme: CompanyColorScheme;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  sections: SectionConfiguration[];
}

interface CompanyColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

interface TemplateTypography {
  headerFont: FontConfig;
  bodyFont: FontConfig;
  tableFont: FontConfig;
  accentFont: FontConfig;
}

interface SectionConfiguration {
  type: 'header' | 'title' | 'client' | 'items' | 'terms' | 'signature' | 'bank';
  position: number;
  style: string;
  visible: boolean;
  customization?: any;
}
```

### 2. Company-Specific Template Implementations

#### Chembio Lifesciences Template (Modern Scientific)
- **Layout**: Clean, modern grid-based design
- **Colors**: Professional blue (#0066CC) with light accents
- **Header**: Centered company name with modern typography
- **Client Section**: Card-style layout with rounded corners
- **Items Table**: Modern grid with alternating row colors
- **Emphasis**: Product specifications, lead times, availability
- **Typography**: Sans-serif, clean and readable

#### Chembio Lifesciences Pvt. Ltd. Template (Corporate Formal)
- **Layout**: Traditional business document structure
- **Colors**: Dark navy (#001F3F) with gold accents (#D4AF37)
- **Header**: Formal letterhead style with company seal
- **Client Section**: Traditional table format
- **Items Table**: Formal lined table with clear borders
- **Emphasis**: Terms & conditions, compliance, corporate credibility
- **Typography**: Traditional serif fonts for formal appearance

#### Chemlab Synthesis Template (Technical Research)
- **Layout**: Data-focused, technical presentation
- **Colors**: Scientific green (#2E7D32) with neutral backgrounds
- **Header**: Left-aligned with technical styling
- **Client Section**: Compact, information-dense format
- **Items Table**: Technical data table with CAS numbers prominence
- **Emphasis**: Chemical specifications, research applications, technical details
- **Typography**: Monospace elements for technical data, clean sans-serif for text

### 3. Template Component Architecture

#### Base Template Components (Shared)
```typescript
// Shared utilities and base functions
export const createBaseDocument = (config: TemplateConfig) => Document;
export const formatCurrency = (value: number, locale?: string) => string;
export const createTableBorders = (style: BorderStyle) => TableBorders;
```

#### Company-Specific Components
```typescript
// Chembio Lifesciences Components
export const createModernHeader = (company: Company) => Table;
export const createModernClientSection = (data: QuotationData) => Table;
export const createModernItemsTable = (data: QuotationData) => Table;

// Chembio Pvt. Ltd. Components  
export const createFormalHeader = (company: Company) => Table;
export const createFormalClientSection = (data: QuotationData) => Table;
export const createFormalItemsTable = (data: QuotationData) => Table;

// Chemlab Synthesis Components
export const createTechnicalHeader = (company: Company) => Table;
export const createTechnicalClientSection = (data: QuotationData) => Table;
export const createTechnicalItemsTable = (data: QuotationData) => Table;
```

## Data Models

### Enhanced Company Configuration
```typescript
interface Company {
  // ... existing fields
  templateConfig: {
    templateType: 'modern' | 'formal' | 'technical';
    customizations: {
      headerLayout: 'centered' | 'left' | 'split';
      showLogo: boolean;
      logoPosition: 'left' | 'right' | 'center';
      itemTableStyle: 'grid' | 'lines' | 'minimal';
      emphasizeFields: string[]; // ['leadTime', 'casNumber', 'compliance']
      sectionOrder: string[];
    };
    branding: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      fontFamily: string;
      logoUrl?: string;
      sealUrl?: string;
    };
  };
}
```

### Template-Specific Data Presentation
```typescript
interface TemplateDataAdapter {
  adaptQuotationData(data: QuotationData, templateType: string): AdaptedQuotationData;
  formatItemsForTemplate(items: QuotationProduct[], templateType: string): FormattedItem[];
  getRelevantFields(templateType: string): string[];
}
```

## Error Handling

### Template Selection Fallbacks
1. **Primary**: Use company-specific template based on company.name matching
2. **Secondary**: Use company.templateConfig.templateType if available
3. **Tertiary**: Fall back to default template with company branding
4. **Final**: Use basic template with minimal styling

### Template Rendering Error Handling
```typescript
try {
  const template = await getTemplateForCompany(data);
  return await generateDocument(template);
} catch (templateError) {
  console.error('Template generation failed:', templateError);
  // Fall back to basic template
  return await generateDocument(createDefaultTemplate(data));
}
```

## Testing Strategy

### Unit Tests
- Test each template component individually
- Verify color scheme application
- Test typography and spacing consistency
- Validate table structure and formatting

### Integration Tests
- Test complete document generation for each company
- Verify template selection logic
- Test fallback mechanisms
- Validate document structure and content

### Visual Regression Tests
- Generate sample quotations for each template
- Compare visual output against approved baselines
- Test with various data scenarios (few items, many items, long descriptions)

### User Acceptance Tests
- Generate quotations with real company data
- Review with stakeholders for brand alignment
- Test document readability and professional appearance
- Validate business requirement fulfillment

## Implementation Phases

### Phase 1: Template Infrastructure
- Enhance template configuration system
- Create base template utilities
- Implement template selection improvements
- Add error handling and fallbacks

### Phase 2: Chembio Lifesciences Modern Template
- Design and implement modern scientific template
- Create modern header, client section, and items table
- Apply blue color scheme and contemporary styling
- Test with sample data

### Phase 3: Chembio Pvt. Ltd. Formal Template
- Design and implement corporate formal template
- Create formal letterhead and traditional layouts
- Apply navy/gold color scheme and serif typography
- Emphasize compliance and terms sections

### Phase 4: Chemlab Synthesis Technical Template
- Design and implement technical research template
- Create data-focused layouts with technical emphasis
- Apply green color scheme and technical styling
- Highlight CAS numbers and research applications

### Phase 5: Integration and Testing
- Integrate all templates into existing system
- Comprehensive testing across all scenarios
- Performance optimization
- Documentation and deployment

## Performance Considerations

### Document Generation Optimization
- Cache template configurations
- Reuse common styling objects
- Optimize table generation for large item lists
- Minimize memory usage during document creation

### Template Loading
- Lazy load template-specific components
- Cache compiled templates
- Optimize font and styling calculations

## Security Considerations

### Template Injection Prevention
- Sanitize all user input before template rendering
- Validate company configuration data
- Prevent arbitrary code execution in template logic

### Data Privacy
- Ensure sensitive company information is properly handled
- Validate access permissions for template customizations
- Audit template changes and usage