# Template System Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered with the quotation template system. It includes diagnostic steps, common error patterns, and step-by-step resolution procedures.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] Is the company properly configured with templateConfig?
- [ ] Are all required fields present in the quotation data?
- [ ] Is the template selection logic working correctly?
- [ ] Are there any console errors or warnings?
- [ ] Is the document generation completing without exceptions?

## Common Issues and Solutions

### 1. Wrong Template Being Used

**Symptoms:**
- Company gets default template instead of custom template
- Template doesn't match expected company branding
- All companies use the same template

**Diagnosis Steps:**

```typescript
// Add debugging to template selection
console.log('Company name for matching:', data.company?.name?.toLowerCase());
console.log('Template config type:', data.company?.templateConfig?.templateType);
console.log('Available template functions:', Object.keys(templateFunctions));
```

**Common Causes & Solutions:**

#### Cause 1: Company Name Matching Issues
```typescript
// Problem: Case sensitivity or partial matching
if (companyName.includes('chembio lifesciences')) { // Too broad
  return await createChembioTemplate(data);
}

// Solution: More specific matching
if (companyName === 'chembio lifesciences' || 
    companyName.includes('chembio lifesciences') && 
    !companyName.includes('pvt')) {
  return await createChembioLifesciencesTemplate(data);
}
```

#### Cause 2: Missing Template Configuration
```typescript
// Check if templateConfig exists
if (!data.company?.templateConfig) {
  console.error('Missing template configuration for company:', data.company?.name);
  // Add default configuration
  data.company.templateConfig = getDefaultTemplateConfig('modern');
}
```

#### Cause 3: Template Function Not Found
```typescript
// Verify template function exists
const templateFunction = getTemplateFunction(data.company.templateConfig.templateType);
if (!templateFunction) {
  console.error('Template function not found for type:', data.company.templateConfig.templateType);
  // Fall back to default
  return await createDefaultTemplate(data);
}
```

**Resolution Steps:**
1. Verify company name in database matches template selection logic
2. Check templateConfig is properly set on company record
3. Ensure template function is exported and accessible
4. Test template selection with console logging
5. Clear any caches that might be storing old configurations

### 2. Document Generation Failures

**Symptoms:**
- Error thrown during document creation
- Incomplete documents generated
- Missing sections in final document

**Diagnosis Steps:**

```typescript
// Add comprehensive error logging
export const createTemplateWithLogging = async (data: QuotationData): Promise<Document> => {
  try {
    console.log('Starting template generation for:', data.company?.name);
    
    // Test each section individually
    console.log('Creating header...');
    const header = await createHeader(data.company);
    console.log('Header created successfully');
    
    console.log('Creating client section...');
    const clientSection = await createClientSection(data);
    console.log('Client section created successfully');
    
    console.log('Creating items table...');
    const itemsTable = await createItemsTable(data);
    console.log('Items table created successfully');
    
    // Continue for all sections...
    
  } catch (error) {
    console.error('Template generation failed at step:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};
```

**Common Causes & Solutions:**

#### Cause 1: Missing Required Data
```typescript
// Problem: Undefined or null values
const clientName = data.billTo.name; // May be undefined

// Solution: Add validation and defaults
const clientName = data.billTo?.name || 'N/A';
const sanitizedName = sanitizeTemplateInput(clientName);
```

#### Cause 2: Invalid Color Codes
```typescript
// Problem: Invalid color format
colorScheme: {
  primary: 'blue', // Invalid - should be hex
  secondary: '#GGGGGG' // Invalid hex code
}

// Solution: Validate color codes
const validateColorCode = (color: string): string => {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return hexPattern.test(color) ? color : '#000000';
};
```

#### Cause 3: Font Issues
```typescript
// Problem: Font not available
typography: {
  headerFont: { family: 'NonExistentFont', size: 24 }
}

// Solution: Use fallback fonts
const getFontWithFallback = (fontFamily: string): string => {
  const safeFonts = ['Calibri', 'Arial', 'Times New Roman'];
  return safeFonts.includes(fontFamily) ? fontFamily : 'Calibri';
};
```

**Resolution Steps:**
1. Add validation for all input data
2. Implement fallback values for missing fields
3. Validate color codes and font names
4. Test with minimal data set to isolate issues
5. Use try-catch blocks around each section creation

### 3. Styling and Layout Issues

**Symptoms:**
- Incorrect colors or fonts
- Poor spacing or alignment
- Table formatting problems
- Missing borders or backgrounds

**Diagnosis Steps:**

```typescript
// Log applied styles
console.log('Applied template config:', JSON.stringify(config, null, 2));
console.log('Color scheme:', config.colorScheme);
console.log('Typography:', config.typography);
console.log('Table borders:', createTableBorders(config.tableStyle));
```

**Common Causes & Solutions:**

#### Cause 1: Configuration Not Applied
```typescript
// Problem: Using hardcoded values instead of configuration
new TextRun({
  text: 'Company Name',
  color: '#0066CC', // Hardcoded
  size: 24 // Hardcoded
});

// Solution: Use configuration values
new TextRun({
  text: 'Company Name',
  color: config.colorScheme.primary,
  size: config.typography.headerFont.size
});
```

#### Cause 2: Border Style Issues
```typescript
// Problem: Inconsistent border application
const borders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '#000000' },
  // Missing other borders
};

// Solution: Use utility function
const borders = createTableBorders(config.tableStyle, config.colorScheme.border);
```

#### Cause 3: Spacing Problems
```typescript
// Problem: Inconsistent spacing
new Paragraph({
  spacing: { before: 100, after: 200 } // Arbitrary values
});

// Solution: Use configuration-based spacing
new Paragraph({
  spacing: { 
    before: config.spacing.sectionMargin, 
    after: config.spacing.sectionMargin 
  }
});
```

**Resolution Steps:**
1. Verify template configuration is being applied
2. Check color codes are valid hex values
3. Ensure consistent spacing throughout document
4. Test border styles and table formatting
5. Compare output with expected design

### 4. Performance Issues

**Symptoms:**
- Slow document generation
- Memory usage spikes
- Browser freezing during generation
- Timeout errors

**Diagnosis Steps:**

```typescript
// Add performance monitoring
const performanceMonitor = {
  start: (label: string) => {
    console.time(label);
    console.log(`Starting: ${label}`);
  },
  end: (label: string) => {
    console.timeEnd(label);
    console.log(`Completed: ${label}`);
  }
};

// Use in template generation
performanceMonitor.start('Template Generation');
const document = await createTemplate(data);
performanceMonitor.end('Template Generation');
```

**Common Causes & Solutions:**

#### Cause 1: Large Item Lists
```typescript
// Problem: Creating all table rows at once
const rows = data.items.map(item => createItemRow(item)); // Memory intensive

// Solution: Process in batches
const createItemsInBatches = (items: any[], batchSize: number = 50) => {
  const rows = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    rows.push(...batch.map(item => createItemRow(item)));
  }
  return rows;
};
```

#### Cause 2: Repeated Style Creation
```typescript
// Problem: Creating new style objects for each element
data.items.map(item => new TextRun({
  text: item.name,
  font: 'Calibri', // Created repeatedly
  size: 18
}));

// Solution: Reuse style objects
const itemTextStyle = {
  font: config.typography.tableFont.family,
  size: config.typography.tableFont.size
};

data.items.map(item => new TextRun({
  text: item.name,
  ...itemTextStyle
}));
```

#### Cause 3: Memory Leaks
```typescript
// Problem: Not clearing references
let tempData = processLargeDataSet(data);
// tempData never cleared

// Solution: Explicit cleanup
let tempData = processLargeDataSet(data);
const result = createDocument(tempData);
tempData = null; // Clear reference
return result;
```

**Resolution Steps:**
1. Profile memory usage during generation
2. Implement batch processing for large data sets
3. Reuse style objects and configurations
4. Clear temporary variables and references
5. Consider pagination for very large documents

### 5. Data Validation Errors

**Symptoms:**
- Template injection warnings
- Sanitization errors
- Invalid data format errors
- Missing required fields

**Diagnosis Steps:**

```typescript
// Add comprehensive data validation logging
const validateAndLog = (data: QuotationData) => {
  console.log('Validating quotation data...');
  
  // Check required fields
  const requiredFields = ['company', 'billTo', 'items'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
    }
  });
  
  // Check data types
  if (data.items && !Array.isArray(data.items)) {
    console.error('Items should be an array');
  }
  
  // Check for suspicious content
  const textFields = [data.notes, data.paymentTerms];
  textFields.forEach((field, index) => {
    if (field && (field.includes('<script>') || field.includes('${}'))) {
      console.warn(`Suspicious content in text field ${index}:`, field);
    }
  });
};
```

**Common Causes & Solutions:**

#### Cause 1: Unsanitized Input
```typescript
// Problem: Direct use of user input
new TextRun({ text: data.notes }); // Potentially unsafe

// Solution: Always sanitize input
new TextRun({ text: sanitizeTemplateInput(data.notes || '') });
```

#### Cause 2: Type Mismatches
```typescript
// Problem: Expecting string but getting number
const price = data.totalAmount; // Might be number
new TextRun({ text: price }); // Error: expected string

// Solution: Type conversion with validation
const priceText = typeof price === 'number' ? 
  formatCurrency(price) : 
  sanitizeTemplateInput(String(price || 0));
```

#### Cause 3: Missing Nested Properties
```typescript
// Problem: Accessing nested properties without checking
const clientName = data.billTo.name; // Error if billTo is undefined

// Solution: Safe property access
const clientName = data.billTo?.name || 'N/A';
```

**Resolution Steps:**
1. Implement comprehensive input validation
2. Add type checking for all data fields
3. Use safe property access patterns
4. Sanitize all text inputs
5. Provide meaningful error messages

## Error Code Reference

### Template Selection Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| TS001 | Company not found | Verify company exists in database |
| TS002 | Template config missing | Add templateConfig to company record |
| TS003 | Invalid template type | Use valid template type: modern, formal, technical |
| TS004 | Template function not found | Ensure template function is exported |

### Document Generation Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| DG001 | Header creation failed | Check company data and branding configuration |
| DG002 | Items table creation failed | Validate items array and item properties |
| DG003 | Invalid color code | Use valid hex color codes (#RRGGBB) |
| DG004 | Font not available | Use supported fonts or add fallbacks |
| DG005 | Memory allocation error | Reduce data size or implement batch processing |

### Validation Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| VL001 | Required field missing | Provide all required fields |
| VL002 | Invalid data type | Ensure correct data types for all fields |
| VL003 | Suspicious content detected | Remove potentially harmful content |
| VL004 | Sanitization failed | Check input format and content |

## Debugging Tools and Techniques

### 1. Template Generation Debugger

```typescript
export const debugTemplateGeneration = async (data: QuotationData) => {
  const debug = {
    companyInfo: {
      name: data.company?.name,
      templateType: data.company?.templateConfig?.templateType,
      hasLogo: !!data.company?.branding?.logoUrl
    },
    dataValidation: {
      hasItems: Array.isArray(data.items) && data.items.length > 0,
      hasBillTo: !!data.billTo,
      hasValidAmounts: !isNaN(data.totalAmount)
    },
    templateConfig: data.company?.templateConfig ? 'Present' : 'Missing'
  };
  
  console.log('Template Debug Info:', JSON.stringify(debug, null, 2));
  return debug;
};
```

### 2. Section-by-Section Testing

```typescript
export const testTemplateSections = async (data: QuotationData) => {
  const results = {};
  
  const sections = [
    { name: 'header', fn: () => createHeader(data.company) },
    { name: 'title', fn: () => createQuotationTitle(data) },
    { name: 'client', fn: () => createClientSection(data) },
    { name: 'items', fn: () => createItemsTable(data) },
    { name: 'terms', fn: () => createTermsSection(data) },
    { name: 'signature', fn: () => createSignatureSection(data.company) },
    { name: 'bank', fn: () => createBankDetailsSection(data.company) }
  ];
  
  for (const section of sections) {
    try {
      const startTime = performance.now();
      await section.fn();
      const endTime = performance.now();
      
      results[section.name] = {
        success: true,
        time: endTime - startTime
      };
    } catch (error) {
      results[section.name] = {
        success: false,
        error: error.message
      };
    }
  }
  
  return results;
};
```

### 3. Configuration Validator

```typescript
export const validateTemplateConfiguration = (config: TemplateConfig) => {
  const issues = [];
  
  // Check color codes
  const colorFields = ['primary', 'secondary', 'accent', 'background', 'text', 'border'];
  colorFields.forEach(field => {
    const color = config.colorScheme[field];
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      issues.push(`Invalid color code for ${field}: ${color}`);
    }
  });
  
  // Check font sizes
  const fontFields = ['headerFont', 'bodyFont', 'tableFont', 'accentFont'];
  fontFields.forEach(field => {
    const font = config.typography[field];
    if (!font.size || font.size < 8 || font.size > 72) {
      issues.push(`Invalid font size for ${field}: ${font.size}`);
    }
  });
  
  // Check spacing values
  const spacingFields = ['headerPadding', 'sectionMargin', 'tableCellPadding', 'lineHeight'];
  spacingFields.forEach(field => {
    const value = config.spacing[field];
    if (!value || value < 0 || value > 1000) {
      issues.push(`Invalid spacing value for ${field}: ${value}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};
```

## Prevention Best Practices

### 1. Input Validation
- Always validate and sanitize user input
- Use TypeScript for compile-time type checking
- Implement runtime validation for critical data

### 2. Error Handling
- Use try-catch blocks around all template operations
- Implement fallback mechanisms for critical failures
- Log errors with sufficient context for debugging

### 3. Testing
- Write unit tests for each template component
- Implement integration tests for complete workflows
- Use visual regression testing for layout verification

### 4. Monitoring
- Log template generation performance metrics
- Monitor error rates and patterns
- Set up alerts for critical failures

### 5. Documentation
- Keep template documentation up to date
- Document all configuration options
- Maintain troubleshooting guides and FAQs

## Getting Additional Help

### Internal Resources
1. Check the Template System User Guide for basic usage
2. Review the Template Maintenance Guide for technical details
3. Examine unit tests for usage examples
4. Look at existing template implementations for patterns

### Debugging Steps
1. Enable debug logging in development environment
2. Use browser developer tools to inspect errors
3. Test with minimal data sets to isolate issues
4. Compare working templates with problematic ones

### Escalation Process
1. Document the issue with steps to reproduce
2. Include relevant error messages and logs
3. Provide sample data that demonstrates the problem
4. Contact the development team with detailed information

This troubleshooting guide should help resolve most common issues with the template system. For complex problems or system-wide issues, escalate to the development team with detailed diagnostic information.