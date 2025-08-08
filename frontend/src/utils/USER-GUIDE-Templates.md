# User Guide: Company-Specific Quotation Templates

## Overview

This guide explains how to use and customize the company-specific quotation template system. The system automatically generates different quotation formats based on the company, ensuring each business maintains its unique brand identity.

## Getting Started

### Understanding Template Types

The system provides three distinct template types:

#### 1. Modern Template (Chembio Lifesciences)
- **Best for:** Scientific companies, modern businesses
- **Design:** Clean, contemporary layout with blue branding
- **Features:** Grid-based design, emphasis on specifications and lead times
- **Colors:** Professional blue (#0066CC) with light accents

#### 2. Formal Template (Chembio Lifesciences Pvt. Ltd.)
- **Best for:** Established corporations, formal business environments
- **Design:** Traditional business document with letterhead styling
- **Features:** Formal borders, emphasis on terms and compliance
- **Colors:** Dark navy (#001F3F) with gold accents (#D4AF37)

#### 3. Technical Template (Chemlab Synthesis)
- **Best for:** Research organizations, laboratories, technical companies
- **Design:** Data-focused layout with scientific styling
- **Features:** Compact design, emphasis on technical specifications
- **Colors:** Scientific green (#2E7D32) with neutral backgrounds

## Basic Usage

### Generating a Quotation

The system automatically selects the appropriate template based on your company:

```typescript
// Basic quotation generation
import { getTemplateForCompany } from './utils/quotationTemplates';

const quotationDocument = await getTemplateForCompany(quotationData);
```

### Required Data Structure

Ensure your quotation data includes all required fields:

```typescript
const quotationData = {
  company: {
    name: "Your Company Name",
    legalName: "Your Company Legal Name",
    address: { /* address details */ },
    contactInfo: { /* contact details */ },
    taxInfo: { /* tax information */ }
  },
  billTo: {
    company: "Client Company Name",
    contactPerson: "Client Contact",
    address: "Client Address",
    phone: "Client Phone",
    email: "client@email.com"
  },
  items: [
    {
      sno: 1,
      cat_no: "PROD001",
      pack_size: "1kg",
      product_description: "Product Description",
      lead_time: "2-3 weeks",
      qty: 1,
      unit_rate: 1000,
      gst_percent: 18,
      total_price: 1180
    }
  ],
  subTotal: 1000,
  tax: 180,
  roundOff: 0,
  grandTotal: 1180
};
```

## Template Customization

### Basic Customization

#### Changing Colors
You can customize your company's brand colors:

```typescript
import { TemplateManager } from './utils/templateExtensions';

// Update company template with custom colors
TemplateManager.updateCompanyTemplate(
  'your-company-id',
  companyData,
  'modern',
  {
    colorOverrides: {
      primary: '#FF6B35',      // Your brand color
      secondary: '#F7F7F7',    // Light background
      accent: '#FF8C42'        // Accent color
    }
  }
);
```

#### Customizing Typography
Adjust fonts and text styling:

```typescript
TemplateManager.updateCompanyTemplate(
  'your-company-id',
  companyData,
  'modern',
  {
    typographyOverrides: {
      headerFont: { 
        family: 'Arial', 
        size: 26, 
        weight: 'bold' 
      },
      bodyFont: { 
        family: 'Arial', 
        size: 18 
      }
    }
  }
);
```

#### Emphasizing Specific Fields
Highlight important information for your business:

```typescript
TemplateManager.updateCompanyTemplate(
  'your-company-id',
  companyData,
  'technical',
  {
    customSettings: {
      emphasizeFields: [
        'casNumber',        // Chemical CAS numbers
        'purity',          // Product purity
        'specifications',  // Technical specifications
        'leadTime'         // Delivery time
      ]
    }
  }
);
```

### Advanced Customization

#### Section Ordering
Customize the order of sections in your quotations:

```typescript
const customSectionOrder = [
  'header',      // Company header
  'title',       // Quotation title
  'client',      // Client details
  'items',       // Items table
  'terms',       // Terms and conditions
  'bank',        // Bank details
  'signature'    // Signature section
];

TemplateManager.updateCompanyTemplate(
  'your-company-id',
  companyData,
  'modern',
  {
    sectionOrder: customSectionOrder
  }
);
```

#### Section Visibility
Show or hide specific sections:

```typescript
TemplateManager.updateCompanyTemplate(
  'your-company-id',
  companyData,
  'formal',
  {
    visibilityOverrides: {
      'bank': false,        // Hide bank details
      'signature': true,    // Show signature section
      'terms': true         // Show terms and conditions
    }
  }
);
```

## Adding New Companies

### Automatic Template Selection
The system can automatically select an appropriate template:

```typescript
import { TemplateManager } from './utils/templateExtensions';

// Add new company with automatic template selection
TemplateManager.addCompany('new-company-id', {
  name: "New Scientific Company",
  legalName: "New Scientific Company Ltd.",
  // ... other company details
});
// System will automatically select 'modern' template for scientific companies
```

### Manual Template Selection
Specify the template type explicitly:

```typescript
// Add company with specific template type
TemplateManager.addCompany(
  'new-company-id',
  companyData,
  'formal'  // Use formal template
);
```

### Using Template Presets
Use predefined configurations for common business types:

```typescript
import { TemplateCreators } from './utils/templateExtensions';

// Create template for pharmaceutical company
TemplateCreators.createFormalCorporateTemplate(
  'pharma-company-id',
  companyData,
  {
    colorOverrides: {
      primary: '#1565C0',    // Pharmaceutical blue
      accent: '#42A5F5'
    },
    customSettings: {
      emphasizeFields: ['compliance', 'regulations', 'quality']
    }
  }
);

// Create template for laboratory
TemplateCreators.createTechnicalResearchTemplate(
  'lab-company-id',
  companyData,
  {
    colorOverrides: {
      primary: '#2E7D32',    // Scientific green
      accent: '#66BB6A'
    },
    customSettings: {
      emphasizeFields: ['casNumber', 'purity', 'specifications']
    }
  }
);
```

## Business Type Presets

### Available Presets

#### Pharmaceutical Companies
```typescript
import { TemplatePresets } from './utils/templateExtensions';

const pharmaConfig = TemplatePresets.pharmaceutical;
// Includes: formal template, compliance emphasis, blue color scheme
```

#### Laboratory/Research Organizations
```typescript
const labConfig = TemplatePresets.laboratory;
// Includes: technical template, CAS number emphasis, green color scheme
```

#### Biotechnology Companies
```typescript
const biotechConfig = TemplatePresets.biotechnology;
// Includes: modern template, storage/handling emphasis, purple color scheme
```

#### Chemical Companies
```typescript
const chemicalConfig = TemplatePresets.chemical;
// Includes: technical template, hazard/MSDS emphasis, orange color scheme
```

## Best Practices

### Data Quality
1. **Complete Information:** Ensure all required fields are populated
2. **Consistent Formatting:** Use consistent date and number formats
3. **Accurate Details:** Verify company and client information accuracy
4. **Product Descriptions:** Provide clear, detailed product descriptions

### Template Selection
1. **Match Business Type:** Choose templates that align with your business focus
2. **Consider Audience:** Select templates appropriate for your target clients
3. **Brand Consistency:** Ensure colors and styling match your brand guidelines
4. **Professional Appearance:** Prioritize readability and professional presentation

### Customization Guidelines
1. **Subtle Changes:** Make incremental adjustments rather than dramatic changes
2. **Test Thoroughly:** Generate sample quotations to verify appearance
3. **Maintain Readability:** Ensure text remains clear and easy to read
4. **Brand Alignment:** Keep customizations consistent with your brand identity

## Common Use Cases

### Scenario 1: New Scientific Company
**Requirement:** Modern, clean quotations for a biotech startup

**Solution:**
```typescript
TemplateCreators.createModernScientificTemplate(
  'biotech-startup',
  companyData,
  {
    colorOverrides: { primary: '#7B1FA2' },  // Purple for biotech
    customSettings: {
      emphasizeFields: ['leadTime', 'storage', 'handling']
    }
  }
);
```

### Scenario 2: Established Chemical Distributor
**Requirement:** Formal, corporate quotations with compliance emphasis

**Solution:**
```typescript
TemplateCreators.createFormalCorporateTemplate(
  'chemical-distributor',
  companyData,
  {
    customSettings: {
      emphasizeFields: ['compliance', 'regulations', 'msds'],
      sectionOrder: ['header', 'title', 'client', 'terms', 'items', 'bank', 'signature']
    }
  }
);
```

### Scenario 3: Research Laboratory
**Requirement:** Technical quotations with detailed specifications

**Solution:**
```typescript
TemplateCreators.createTechnicalResearchTemplate(
  'research-lab',
  companyData,
  {
    customSettings: {
      emphasizeFields: ['casNumber', 'purity', 'specifications', 'research'],
      visibilityOverrides: { 'terms': false }  // Hide terms for internal use
    }
  }
);
```

## Troubleshooting

### Common Issues

#### Template Not Applying
**Problem:** Quotation uses default template instead of custom template
**Solution:** 
1. Verify company ID matches registered template
2. Check that template is properly registered
3. Ensure quotation data includes correct company information

#### Styling Issues
**Problem:** Colors or fonts not displaying correctly
**Solution:**
1. Verify color values are valid hex codes (e.g., #0066CC)
2. Use web-safe font families with fallbacks
3. Check template configuration validation

#### Missing Information
**Problem:** Empty fields or placeholder text in quotations
**Solution:**
1. Ensure all required data fields are populated
2. Check for null or undefined values in quotation data
3. Verify company configuration is complete

### Getting Help
1. Check the troubleshooting guide for detailed solutions
2. Review error messages in browser console
3. Test with minimal sample data to isolate issues
4. Verify template configuration using validation functions

## Performance Tips

### Large Quotations
- For quotations with >50 items, generation may be slower
- Consider breaking very large quotations into multiple documents
- Use simplified styling for better performance with large datasets

### Memory Management
- Clear browser cache if experiencing memory issues
- Avoid generating multiple large quotations simultaneously
- Monitor browser memory usage during generation

## Updates and Maintenance

### Template Updates
- Template improvements are automatically applied to new quotations
- Existing saved quotations maintain their original formatting
- Test new templates with sample data before using in production

### Configuration Backup
- Export your template configurations for backup
- Document any custom modifications for future reference
- Test configurations after system updates

## Support

For additional assistance:
1. Consult the technical documentation for detailed API information
2. Review the troubleshooting guide for common issues
3. Check the maintenance guide for system administration tasks
4. Contact your system administrator for configuration changes