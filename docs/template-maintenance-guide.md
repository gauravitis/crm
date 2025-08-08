# Template System Maintenance Guide

## Overview

This guide provides technical documentation for maintaining and extending the quotation template system. It covers procedures for adding new companies, creating custom templates, troubleshooting issues, and optimizing performance.

## Architecture Overview

### Core Components

```
Template System Architecture:
├── Template Selection Logic (getTemplateForCompany)
├── Base Template Utilities (templateUtils.ts)
├── Company-Specific Templates
│   ├── Modern Template (Chembio Lifesciences)
│   ├── Formal Template (Chembio Pvt. Ltd.)
│   └── Technical Template (Chemlab Synthesis)
├── Template Configuration System
└── Document Generation Pipeline
```

### Key Files
- `frontend/src/utils/quotationTemplates.ts` - Main template implementations
- `frontend/src/utils/templateUtils.ts` - Shared utilities and base functions
- `frontend/src/types/company.ts` - Type definitions and interfaces
- `frontend/src/utils/templateCustomization.ts` - Customization utilities
- `frontend/src/utils/companyDefaults.ts` - Default configurations

## Adding New Companies

### Step 1: Define Company Data Structure

Create a new company record with complete template configuration:

```typescript
const newCompany: Company = {
  id: 'unique-company-id',
  name: 'Company Display Name',
  legalName: 'Full Legal Company Name',
  shortCode: 'CCN', // For reference numbers
  address: {
    street: 'Company Address',
    city: 'City',
    state: 'State',
    postalCode: '123456',
    country: 'Country'
  },
  contactInfo: {
    phone: '+1-234-567-8900',
    email: 'contact@company.com'
  },
  taxInfo: {
    gst: 'GST123456789',
    pan: 'ABCDE1234F'
  },
  bankDetails: {
    bankName: 'Bank Name',
    accountNo: '1234567890',
    ifscCode: 'BANK0001234',
    branchCode: 'BRANCH001',
    microCode: 'MICRO001',
    accountType: 'Current'
  },
  branding: {
    logoUrl: '/path/to/logo.png',
    primaryColor: '#1F497D',
    secondaryColor: '#4B5563',
    accentColor: '#0066CC',
    sealImageUrl: '/path/to/seal.png',
    fontFamily: 'Calibri'
  },
  templateConfig: {
    // See template configuration section below
  },
  defaultTerms: 'Company-specific terms and conditions',
  createdAt: new Date().toISOString(),
  active: true
};
```

### Step 2: Configure Template Settings

Choose an appropriate template type and customize it:

```typescript
// Option 1: Use existing template type
templateConfig: {
  templateType: 'modern', // or 'formal' or 'technical'
  // ... other configuration will use defaults
}

// Option 2: Full customization
templateConfig: {
  templateType: 'modern',
  layout: 'modern',
  headerStyle: 'centered',
  tableStyle: 'modern-grid',
  colorScheme: {
    primary: '#1F497D',
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
    emphasizeFields: ['leadTime', 'availability'],
    sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
  }
}
```

### Step 3: Update Template Selection Logic

Add the new company to the template selection logic in `quotationTemplates.ts`:

```typescript
export const getTemplateForCompany = async (data: QuotationData): Promise<Document> => {
  const companyName = data.company?.name?.toLowerCase() || '';
  
  try {
    // Add new company matching logic
    if (companyName.includes('new company name')) {
      return await createNewCompanyTemplate(data);
    }
    
    // Existing logic...
    if (companyName.includes('chembio lifesciences pvt')) {
      return await createChembioPvtLtdTemplate(data);
    }
    // ... rest of existing logic
    
  } catch (error) {
    console.error('Template generation failed:', error);
    return await createDefaultTemplate(data);
  }
};
```

### Step 4: Test the New Company Template

Create comprehensive tests for the new company:

```typescript
// Add to quotationTemplates.test.ts
describe('New Company Template', () => {
  it('should generate template with correct branding', async () => {
    const testData = createMockQuotationData({
      company: { name: 'New Company Name', /* ... */ }
    });
    
    const document = await getTemplateForCompany(testData);
    expect(document).toBeDefined();
    // Add specific assertions for template elements
  });
});
```

## Creating Custom Templates

### Step 1: Define Template Components

Create template-specific component functions:

```typescript
// In quotationTemplates.ts

/**
 * Creates custom header for new template
 */
export const createCustomHeader = async (company: Company): Promise<Table> => {
  const config = validateTemplateConfig(company.templateConfig);
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: createTableBorders(config.tableStyle, config.colorScheme.border),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  createStyledTextRun(
                    company.legalName || company.name,
                    config.typography,
                    'header',
                    { color: config.colorScheme.primary }
                  )
                ],
                alignment: AlignmentType.CENTER
              })
            ],
            shading: {
              type: ShadingType.SOLID,
              color: config.colorScheme.background
            }
          })
        ]
      })
    ]
  });
};

/**
 * Creates custom client section
 */
export const createCustomClientSection = async (data: QuotationData): Promise<Table> => {
  const config = validateTemplateConfig(data.company.templateConfig);
  // Implementation details...
};

/**
 * Creates custom items table
 */
export const createCustomItemsTable = async (data: QuotationData): Promise<Table> => {
  const config = validateTemplateConfig(data.company.templateConfig);
  // Implementation details...
};
```

### Step 2: Implement Main Template Function

Create the main template function that combines all components:

```typescript
/**
 * Creates custom template document
 */
export const createCustomTemplate = async (data: QuotationData): Promise<Document> => {
  console.log('Generating custom template for:', data.company?.name);
  
  try {
    const config = validateTemplateConfig(data.company.templateConfig);
    const baseDoc = createBaseDocument(config);
    
    // Validate and sanitize data
    const sanitizedData = validateQuotationData(data);
    
    // Create document sections
    const sections = [
      await createCustomHeader(sanitizedData.company),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createQuotationTitle(sanitizedData),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createCustomClientSection(sanitizedData),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createCustomItemsTable(sanitizedData),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createTermsSection(sanitizedData),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createSignatureSection(sanitizedData.company),
      createSpacingParagraph(config.spacing.sectionMargin),
      await createBankDetailsSection(sanitizedData.company)
    ];
    
    // Combine base document with sections
    return new Document({
      ...baseDoc,
      sections: [{
        ...baseDoc.sections[0],
        children: sections
      }]
    });
    
  } catch (error) {
    console.error('Custom template generation failed:', error);
    throw new Error(`Failed to generate custom template: ${error.message}`);
  }
};
```

### Step 3: Add Template Type Support

If creating a completely new template type, update the type definitions:

```typescript
// In types/company.ts
export interface TemplateConfig {
  templateType: 'modern' | 'formal' | 'technical' | 'custom'; // Add new type
  // ... rest of interface
}
```

Update the default configuration function:

```typescript
// In templateUtils.ts
export const getDefaultTemplateConfig = (
  templateType: 'modern' | 'formal' | 'technical' | 'custom'
): TemplateConfig => {
  // Add case for new template type
  switch (templateType) {
    case 'custom':
      return validateTemplateConfig({
        templateType: 'custom',
        headerStyle: 'centered',
        tableStyle: 'modern-grid',
        colorScheme: {
          primary: '#1F497D',
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
          emphasizeFields: ['custom', 'fields'],
          sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
        }
      });
    // ... existing cases
  }
};
```

## Troubleshooting Common Issues

### Issue 1: Template Not Loading

**Symptoms**: Default template is used instead of company-specific template

**Diagnosis**:
```typescript
// Add debugging to getTemplateForCompany
console.log('Company name for matching:', data.company?.name?.toLowerCase());
console.log('Template config:', data.company?.templateConfig);
```

**Solutions**:
1. Check company name matching logic
2. Verify templateConfig is properly set
3. Ensure template function exists and is exported
4. Check for typos in company name matching

### Issue 2: Document Generation Fails

**Symptoms**: Error thrown during document creation

**Diagnosis**:
```typescript
// Add try-catch blocks around each section
try {
  const header = await createCustomHeader(company);
} catch (error) {
  console.error('Header creation failed:', error);
  // Use fallback header
}
```

**Solutions**:
1. Validate all input data before processing
2. Check for missing required fields
3. Ensure all template utilities are properly imported
4. Verify color codes and font names are valid

### Issue 3: Styling Issues

**Symptoms**: Incorrect colors, fonts, or layout

**Diagnosis**:
```typescript
// Log template configuration
console.log('Applied config:', validateTemplateConfig(company.templateConfig));
```

**Solutions**:
1. Verify color codes are in correct format (#RRGGBB)
2. Check font names are available in the system
3. Ensure spacing values are reasonable
4. Validate border styles and table configurations

### Issue 4: Performance Problems

**Symptoms**: Slow document generation, memory issues

**Diagnosis**:
```typescript
// Add performance monitoring
const startTime = performance.now();
const document = await createTemplate(data);
const endTime = performance.now();
console.log(`Template generation took ${endTime - startTime} milliseconds`);
```

**Solutions**:
1. Optimize table creation for large item lists
2. Cache template configurations
3. Reuse common styling objects
4. Minimize memory allocations in loops

## Performance Optimization

### 1. Template Configuration Caching

Cache validated template configurations to avoid repeated validation:

```typescript
const templateConfigCache = new Map<string, TemplateConfig>();

export const getCachedTemplateConfig = (company: Company): TemplateConfig => {
  const cacheKey = `${company.id}-${company.templateConfig.templateType}`;
  
  if (!templateConfigCache.has(cacheKey)) {
    const validatedConfig = validateTemplateConfig(company.templateConfig);
    templateConfigCache.set(cacheKey, validatedConfig);
  }
  
  return templateConfigCache.get(cacheKey)!;
};
```

### 2. Optimize Large Item Lists

For quotations with many items, optimize table creation:

```typescript
export const createOptimizedItemsTable = async (data: QuotationData): Promise<Table> => {
  const config = getCachedTemplateConfig(data.company);
  const borders = createTableBorders(config.tableStyle, config.colorScheme.border);
  
  // Pre-create reusable styling objects
  const headerCellStyle = {
    shading: { type: ShadingType.SOLID, color: config.colorScheme.secondary }
  };
  
  const dataCellStyle = {
    shading: { type: ShadingType.SOLID, color: config.colorScheme.background }
  };
  
  // Create rows in batches to manage memory
  const rows = [];
  const batchSize = 50;
  
  for (let i = 0; i < data.items.length; i += batchSize) {
    const batch = data.items.slice(i, i + batchSize);
    const batchRows = batch.map(item => createItemRow(item, dataCellStyle, config));
    rows.push(...batchRows);
  }
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [createHeaderRow(headerCellStyle, config), ...rows]
  });
};
```

### 3. Memory Management

Implement proper memory management for large documents:

```typescript
export const createLargeDocument = async (data: QuotationData): Promise<Document> => {
  // Process sections sequentially to manage memory
  const sections = [];
  
  // Create header and immediately add to sections
  sections.push(await createHeader(data.company));
  
  // Clear any temporary variables
  let tempSection = null;
  
  // Process items in chunks
  if (data.items.length > 100) {
    tempSection = await createOptimizedItemsTable(data);
  } else {
    tempSection = await createStandardItemsTable(data);
  }
  
  sections.push(tempSection);
  tempSection = null; // Clear reference
  
  // Continue with other sections...
  
  return new Document({
    sections: [{
      children: sections
    }]
  });
};
```

### 4. Font and Style Optimization

Reuse font and style objects to reduce memory usage:

```typescript
// Create shared style objects
const createSharedStyles = (config: TemplateConfig) => {
  return {
    headerTextRun: {
      font: config.typography.headerFont.family,
      size: config.typography.headerFont.size,
      bold: true,
      color: config.colorScheme.primary
    },
    bodyTextRun: {
      font: config.typography.bodyFont.family,
      size: config.typography.bodyFont.size,
      color: config.colorScheme.text
    },
    tableTextRun: {
      font: config.typography.tableFont.family,
      size: config.typography.tableFont.size,
      color: config.colorScheme.text
    }
  };
};

// Use shared styles throughout template
export const createOptimizedTextRun = (
  text: string,
  styleType: 'header' | 'body' | 'table',
  sharedStyles: ReturnType<typeof createSharedStyles>
): TextRun => {
  return new TextRun({
    text: sanitizeTemplateInput(text),
    ...sharedStyles[`${styleType}TextRun`]
  });
};
```

## Testing and Validation

### Unit Testing Template Components

Create comprehensive tests for each template component:

```typescript
// templateComponents.test.ts
describe('Template Components', () => {
  describe('createCustomHeader', () => {
    it('should create header with correct styling', async () => {
      const mockCompany = createMockCompany();
      const header = await createCustomHeader(mockCompany);
      
      expect(header).toBeInstanceOf(Table);
      // Add specific assertions for header content and styling
    });
    
    it('should handle missing company data gracefully', async () => {
      const incompleteCompany = { name: 'Test' } as Company;
      const header = await createCustomHeader(incompleteCompany);
      
      expect(header).toBeDefined();
      // Verify fallback behavior
    });
  });
});
```

### Integration Testing

Test complete document generation:

```typescript
// templateIntegration.test.ts
describe('Template Integration', () => {
  it('should generate complete document for each template type', async () => {
    const templateTypes = ['modern', 'formal', 'technical'];
    
    for (const templateType of templateTypes) {
      const testData = createMockQuotationData({ templateType });
      const document = await getTemplateForCompany(testData);
      
      expect(document).toBeInstanceOf(Document);
      expect(document.sections).toHaveLength(1);
      expect(document.sections[0].children.length).toBeGreaterThan(0);
    }
  });
});
```

### Performance Testing

Monitor template generation performance:

```typescript
// performance.test.ts
describe('Template Performance', () => {
  it('should generate templates within acceptable time limits', async () => {
    const largeDataSet = createMockQuotationData({
      itemCount: 100
    });
    
    const startTime = performance.now();
    const document = await getTemplateForCompany(largeDataSet);
    const endTime = performance.now();
    
    const generationTime = endTime - startTime;
    expect(generationTime).toBeLessThan(5000); // 5 seconds max
    expect(document).toBeDefined();
  });
});
```

## Deployment Considerations

### Environment Configuration

Ensure proper configuration for different environments:

```typescript
// config/templateConfig.ts
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    development: {
      enableDebugLogging: true,
      cacheTemplateConfigs: false,
      validateAllInputs: true
    },
    production: {
      enableDebugLogging: false,
      cacheTemplateConfigs: true,
      validateAllInputs: true
    },
    test: {
      enableDebugLogging: false,
      cacheTemplateConfigs: false,
      validateAllInputs: true
    }
  }[env];
};
```

### Monitoring and Logging

Implement proper monitoring for production:

```typescript
// utils/templateMonitoring.ts
export const logTemplateGeneration = (
  companyName: string,
  templateType: string,
  generationTime: number,
  success: boolean,
  error?: Error
) => {
  const logData = {
    timestamp: new Date().toISOString(),
    companyName,
    templateType,
    generationTime,
    success,
    error: error?.message
  };
  
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    console.log('Template Generation:', JSON.stringify(logData));
  } else {
    console.log('Template Generation:', logData);
  }
};
```

### Error Handling and Recovery

Implement robust error handling:

```typescript
export const createTemplateWithFallback = async (data: QuotationData): Promise<Document> => {
  const fallbackChain = [
    () => getTemplateForCompany(data),
    () => createDefaultTemplate(data),
    () => createMinimalTemplate(data)
  ];
  
  for (const templateFunction of fallbackChain) {
    try {
      return await templateFunction();
    } catch (error) {
      console.warn('Template generation failed, trying fallback:', error.message);
    }
  }
  
  throw new Error('All template generation methods failed');
};
```

This maintenance guide provides comprehensive coverage of template system maintenance, from adding new companies to performance optimization and deployment considerations.