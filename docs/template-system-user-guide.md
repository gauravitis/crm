# Template System User Guide

## Overview

The CRM system features a sophisticated template system that generates company-specific quotation documents. Each company has its own unique template design that reflects its brand identity, target market, and business focus.

## Available Templates

### 1. Chembio Lifesciences (Modern Scientific Template)
- **Design**: Clean, modern grid-based layout
- **Colors**: Professional blue (#0066CC) with light accents
- **Best For**: Scientific products, modern presentation
- **Key Features**:
  - Centered header with contemporary typography
  - Card-style client information layout
  - Modern grid table with alternating row colors
  - Emphasis on product specifications and lead times

### 2. Chembio Lifesciences Pvt. Ltd. (Corporate Formal Template)
- **Design**: Traditional business document structure
- **Colors**: Dark navy (#001F3F) with gold accents (#D4AF37)
- **Best For**: Corporate clients, formal business relationships
- **Key Features**:
  - Formal letterhead style with company seal
  - Traditional table format for client details
  - Formal lined table with clear borders
  - Emphasis on terms, conditions, and compliance

### 3. Chemlab Synthesis (Technical Research Template)
- **Design**: Data-focused, technical presentation
- **Colors**: Scientific green (#2E7D32) with neutral backgrounds
- **Best For**: Research institutions, technical specifications
- **Key Features**:
  - Left-aligned header with technical styling
  - Compact, information-dense format
  - Technical data table with CAS numbers prominence
  - Emphasis on chemical specifications and research details

## Template Selection

### Automatic Selection
The system automatically selects the appropriate template based on the company associated with the quotation:

1. **Company Matching**: The system matches the company name to determine the template
2. **Fallback Logic**: If no specific match is found, it uses the company's `templateConfig.templateType`
3. **Default Template**: As a final fallback, it uses a basic template with company branding

### Manual Override
You can override template selection by modifying the company's template configuration:

```typescript
// Example: Change template type for a company
company.templateConfig.templateType = 'modern' | 'formal' | 'technical';
```

## Template Customization

### Color Scheme Customization

Each template supports color scheme customization through the company configuration:

```typescript
company.templateConfig.colorScheme = {
  primary: '#0066CC',      // Main brand color
  secondary: '#F2F2F2',    // Secondary/background color
  accent: '#0066CC',       // Accent color for highlights
  background: '#FFFFFF',   // Document background
  text: '#000000',         // Text color
  border: '#E0E0E0'        // Border color
};
```

### Typography Customization

Customize fonts and text styling:

```typescript
company.templateConfig.typography = {
  headerFont: { family: 'Calibri', size: 24, weight: 'bold' },
  bodyFont: { family: 'Calibri', size: 22, weight: 'normal' },
  tableFont: { family: 'Calibri', size: 18, weight: 'normal' },
  accentFont: { family: 'Calibri', size: 20, weight: 'normal' }
};
```

### Layout Customization

Adjust layout and spacing:

```typescript
company.templateConfig.customizations = {
  headerLayout: 'centered' | 'left' | 'split',
  showLogo: true,
  logoPosition: 'left' | 'right' | 'center',
  itemTableStyle: 'grid' | 'lines' | 'minimal',
  emphasizeFields: ['leadTime', 'availability', 'specifications'],
  sectionOrder: ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank']
};
```

### Section Configuration

Control which sections appear and their order:

```typescript
company.templateConfig.sections = [
  { type: 'header', position: 1, style: 'default', visible: true },
  { type: 'title', position: 2, style: 'default', visible: true },
  { type: 'client', position: 3, style: 'default', visible: true },
  { type: 'items', position: 4, style: 'default', visible: true },
  { type: 'terms', position: 5, style: 'default', visible: true },
  { type: 'signature', position: 6, style: 'default', visible: true },
  { type: 'bank', position: 7, style: 'default', visible: true }
];
```

## Field Emphasis Configuration

Different templates emphasize different fields based on business needs:

### Modern Template (Chembio Lifesciences)
- **Emphasized Fields**: `['leadTime', 'availability', 'specifications']`
- **Purpose**: Highlight product availability and technical details

### Formal Template (Chembio Pvt. Ltd.)
- **Emphasized Fields**: `['compliance', 'terms', 'corporate']`
- **Purpose**: Emphasize regulatory compliance and formal terms

### Technical Template (Chemlab Synthesis)
- **Emphasized Fields**: `['casNumber', 'specifications', 'research']`
- **Purpose**: Highlight technical specifications and research applications

## Best Practices

### 1. Brand Consistency
- Always use your company's official brand colors
- Maintain consistent typography across all documents
- Ensure logo placement follows brand guidelines

### 2. Content Optimization
- Use appropriate field emphasis for your business type
- Include relevant technical details for your industry
- Maintain professional language and formatting

### 3. Template Selection
- Choose templates that match your target audience
- Consider the formality level required for your clients
- Use technical templates for research-focused communications

### 4. Testing
- Always preview documents before sending
- Test with various data scenarios (few items, many items)
- Verify all company information is correct

## Common Use Cases

### Scenario 1: Scientific Product Quotation
- **Template**: Modern (Chembio Lifesciences)
- **Emphasis**: Product specifications, lead times
- **Customization**: Highlight availability and technical details

### Scenario 2: Corporate Manufacturing Quote
- **Template**: Formal (Chembio Pvt. Ltd.)
- **Emphasis**: Compliance, terms and conditions
- **Customization**: Formal presentation with corporate credibility

### Scenario 3: Research Chemical Quotation
- **Template**: Technical (Chemlab Synthesis)
- **Emphasis**: CAS numbers, chemical specifications
- **Customization**: Technical data presentation with research focus

## Integration with CRM

### Quotation Generation Workflow
1. Select company from CRM
2. System automatically determines template
3. Fill in quotation details
4. System applies company-specific formatting
5. Generate and review document
6. Send to client

### Data Validation
The system automatically validates and sanitizes all input data to ensure:
- Security against template injection
- Consistent formatting
- Professional presentation
- Error-free document generation

## Support and Updates

### Getting Help
- Check the troubleshooting guide for common issues
- Review template maintenance documentation for technical details
- Contact system administrators for template modifications

### Template Updates
- Templates are automatically updated when company configurations change
- No code modifications required for basic customizations
- Advanced customizations may require developer assistance

## Security Considerations

### Data Protection
- All user input is automatically sanitized
- Template injection attacks are prevented
- Company data is validated before processing

### Access Control
- Template configurations require appropriate permissions
- Company branding changes are logged and auditable
- Sensitive information is properly handled throughout the process