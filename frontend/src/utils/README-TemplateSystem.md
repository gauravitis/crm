# Company-Specific Quotation Template System

## Overview

The Company-Specific Quotation Template System is a comprehensive solution for generating distinctly different quotation documents for multiple companies within the same CRM system. Each company has its own unique template that reflects its brand identity, target market, and business focus.

## Architecture

### Core Components

```
Template System Architecture
├── Template Selection Logic (quotationTemplates.ts)
├── Base Template Utilities (templateUtils.ts)
├── Template Customization System (templateCustomization.ts)
├── Template Extensions (templateExtensions.ts)
├── Company Defaults (companyDefaults.ts)
└── Type Definitions (types/company.ts)
```

### Template Types

The system supports three distinct template types:

1. **Modern Template** - Clean, contemporary design for scientific companies
2. **Formal Template** - Traditional corporate design for established businesses
3. **Technical Template** - Data-focused design for research organizations

## Company Templates

### Chembio Lifesciences (Modern Template)
- **Design**: Clean, modern grid-based layout
- **Colors**: Professional blue (#0066CC) with light accents
- **Typography**: Calibri font family with contemporary sizing
- **Emphasis**: Product specifications, lead times, availability
- **Target**: Modern scientific companies

### Chembio Lifesciences Pvt. Ltd. (Formal Template)
- **Design**: Traditional business document structure
- **Colors**: Dark navy (#001F3F) with gold accents (#D4AF37)
- **Typography**: Times New Roman for formal appearance
- **Emphasis**: Terms & conditions, compliance, corporate credibility
- **Target**: Established corporate entities

### Chemlab Synthesis (Technical Template)
- **Design**: Data-focused, technical presentation
- **Colors**: Scientific green (#2E7D32) with neutral backgrounds
- **Typography**: Arial with monospace elements for technical data
- **Emphasis**: Chemical specifications, CAS numbers, research details
- **Target**: Research and laboratory organizations

## Key Features

### Template Configuration System
Each company has a comprehensive `TemplateConfig` that defines:
- Color schemes and branding
- Typography settings
- Layout preferences
- Section ordering and visibility
- Custom field emphasis

### Security Features
- Input sanitization to prevent template injection
- Validation of all user-provided data
- Safe handling of company branding assets

### Extensibility
- Template registry for easy addition of new companies
- Customization system for brand-specific modifications
- Preset configurations for common business types

### Error Handling
- Graceful fallback to default templates
- Comprehensive error logging
- Validation with automatic correction

## Usage Examples

### Basic Template Generation
```typescript
import { getTemplateForCompany } from './quotationTemplates';

const document = await getTemplateForCompany(quotationData);
```

### Custom Template Creation
```typescript
import { TemplateCreators } from './templateExtensions';

const customTemplate = TemplateCreators.createModernScientificTemplate(
  'new-company-id',
  companyData,
  {
    colorOverrides: { primary: '#FF6B35' },
    emphasizeFields: ['leadTime', 'availability']
  }
);
```

### Template Registry Management
```typescript
import { TemplateManager } from './templateExtensions';

// Add new company
TemplateManager.addCompany('company-id', companyData, 'modern');

// Update existing template
TemplateManager.updateCompanyTemplate('company-id', companyData, 'formal');

// List all templates
const templates = TemplateManager.listCompanies();
```

## File Structure

### Core Files
- `quotationTemplates.ts` - Main template functions and company-specific implementations
- `templateUtils.ts` - Shared utilities, validation, and base functions
- `templateCustomization.ts` - Customization system and template registry
- `templateExtensions.ts` - Extension utilities and template management
- `companyDefaults.ts` - Default configurations and presets

### Type Definitions
- `types/company.ts` - TypeScript interfaces for template configuration

### Test Files
- `__tests__/quotationTemplates.test.ts` - Unit tests for template components
- `__tests__/templateUtils.test.ts` - Tests for utility functions
- `__tests__/quotationTemplates.integration.test.ts` - Integration tests

## Template Components

### Header Components
Each template type has its own header component:
- `createModernHeader()` - Centered, contemporary design
- `createFormalHeader()` - Letterhead-style corporate design
- `createTechnicalHeader()` - Left-aligned, data-focused design

### Client Section Components
- `createModernClientSection()` - Card-style layout
- `createFormalClientSection()` - Traditional table format
- `createTechnicalClientSection()` - Compact, information-dense format

### Items Table Components
- `createModernItemsTable()` - Grid-based with alternating rows
- `createFormalItemsTable()` - Formal lined table structure
- `createTechnicalItemsTable()` - Technical data table with CAS emphasis

## Configuration

### Template Configuration Interface
```typescript
interface TemplateConfig {
  templateType: 'modern' | 'formal' | 'technical';
  layout: 'modern' | 'formal' | 'technical';
  headerStyle: 'centered' | 'left-aligned' | 'split';
  tableStyle: 'modern-grid' | 'formal-lines' | 'technical-data';
  colorScheme: CompanyColorScheme;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  sections: SectionConfiguration[];
  customizations: CustomizationOptions;
}
```

### Color Scheme Configuration
```typescript
interface CompanyColorScheme {
  primary: string;      // Main brand color
  secondary: string;    // Secondary brand color
  accent: string;       // Accent color for highlights
  background: string;   // Background color
  text: string;         // Primary text color
  border: string;       // Border color
}
```

## Best Practices

### Adding New Companies
1. Determine appropriate template type based on business focus
2. Configure company-specific branding colors
3. Set field emphasis based on business requirements
4. Test with sample data before deployment

### Template Customization
1. Use the template registry for consistent management
2. Apply branding overrides through the customization system
3. Validate configurations before applying
4. Test visual output with various data scenarios

### Performance Optimization
1. Cache template configurations
2. Reuse common styling objects
3. Optimize table generation for large item lists
4. Use lazy loading for template-specific components

## Error Handling

### Template Selection Fallbacks
1. **Primary**: Company-specific template based on name matching
2. **Secondary**: Template type from company configuration
3. **Tertiary**: Default template with company branding
4. **Final**: Basic template with minimal styling

### Common Error Scenarios
- Missing template configuration → Falls back to defaults
- Invalid color values → Uses default color scheme
- Missing company data → Uses placeholder values
- Template generation failure → Falls back to basic template

## Testing

### Test Coverage
- Unit tests for all template components
- Integration tests for complete document generation
- Visual regression tests for template consistency
- User acceptance tests with real company data

### Test Data
- Mock company configurations for each template type
- Sample quotation data with various scenarios
- Edge cases (empty data, long descriptions, many items)

## Maintenance

### Adding New Template Types
1. Define new template type in type definitions
2. Create default configuration in `companyDefaults.ts`
3. Implement template components in `quotationTemplates.ts`
4. Add to template registry in `templateExtensions.ts`
5. Create comprehensive tests

### Updating Existing Templates
1. Modify component functions in `quotationTemplates.ts`
2. Update default configurations if needed
3. Run visual regression tests
4. Update documentation

### Performance Monitoring
- Monitor document generation times
- Track memory usage during template processing
- Optimize slow template components
- Cache frequently used configurations

## Troubleshooting

### Common Issues

#### Template Not Found
```
Error: No template found for company: [company-name]
Solution: Check company name matching logic or add to template registry
```

#### Invalid Configuration
```
Error: Invalid template configuration
Solution: Validate configuration using validateTemplateConfig()
```

#### Styling Issues
```
Issue: Colors not applying correctly
Solution: Check color scheme configuration and CSS color format
```

#### Performance Issues
```
Issue: Slow document generation
Solution: Check for large item lists, optimize table generation
```

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('Template debug mode enabled');
```

## Future Enhancements

### Planned Features
- Visual template editor
- Dynamic logo insertion
- Multi-language support
- PDF generation optimization
- Template versioning system

### Extension Points
- Custom field types
- Additional layout options
- Integration with external branding systems
- Automated template testing
- Template performance analytics

## Support

For issues related to the template system:
1. Check this documentation first
2. Review error logs for specific error messages
3. Test with minimal data to isolate issues
4. Check template configuration validity
5. Verify company data completeness

## Version History

- **v1.0** - Initial implementation with three company templates
- **v1.1** - Added template customization system
- **v1.2** - Implemented template registry and extensions
- **v1.3** - Enhanced error handling and fallback mechanisms
- **v1.4** - Added comprehensive testing and validation