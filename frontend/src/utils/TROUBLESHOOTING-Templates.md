# Template System Troubleshooting Guide

## Common Issues and Solutions

### Template Selection Issues

#### Issue: "No template found for company"
**Symptoms:**
- Error message: "No template found for company: [company-name]"
- Document generation fails
- Falls back to default template

**Causes:**
- Company name doesn't match registered template names
- Template not registered in the template registry
- Company data missing or malformed

**Solutions:**
1. **Check Company Name Matching:**
   ```typescript
   // Verify company name in data
   console.log('Company name:', data.company.name);
   
   // Check registered templates
   import { TemplateManager } from './templateExtensions';
   TemplateManager.listCompanies();
   ```

2. **Register Missing Template:**
   ```typescript
   import { TemplateManager } from './templateExtensions';
   TemplateManager.addCompany('company-id', companyData, 'modern');
   ```

3. **Fix Company Data:**
   ```typescript
   // Ensure company object has required fields
   const company = {
     name: "Company Name",
     legalName: "Company Legal Name",
     templateConfig: { /* valid config */ }
   };
   ```

#### Issue: "Template configuration invalid"
**Symptoms:**
- Warning messages about invalid configuration
- Template falls back to defaults
- Styling not applied correctly

**Causes:**
- Missing required configuration properties
- Invalid color values
- Malformed typography settings

**Solutions:**
1. **Validate Configuration:**
   ```typescript
   import { validateTemplateConfig } from './templateCustomization';
   const validation = validateTemplateConfig(config);
   if (!validation.isValid) {
     console.error('Config errors:', validation.errors);
   }
   ```

2. **Use Default Configuration:**
   ```typescript
   import { createDefaultTemplateConfig } from './companyDefaults';
   const defaultConfig = createDefaultTemplateConfig('modern');
   ```

3. **Fix Color Values:**
   ```typescript
   // Ensure colors are valid hex values
   const colorScheme = {
     primary: '#0066CC',    // Valid hex
     secondary: '#F8F9FA',  // Valid hex
     // Not: 'blue' or 'rgb(0,102,204)'
   };
   ```

### Document Generation Issues

#### Issue: "Document generation fails"
**Symptoms:**
- Error during document creation
- Empty or corrupted output
- Memory issues with large documents

**Causes:**
- Invalid quotation data
- Memory exhaustion with large item lists
- Malformed template components

**Solutions:**
1. **Validate Input Data:**
   ```typescript
   import { validateQuotationData } from './templateUtils';
   const sanitizedData = validateQuotationData(quotationData);
   ```

2. **Handle Large Item Lists:**
   ```typescript
   // For quotations with >100 items, consider pagination
   if (data.items.length > 100) {
     console.warn('Large item list detected, consider optimization');
   }
   ```

3. **Check Memory Usage:**
   ```typescript
   // Monitor memory during generation
   const memBefore = process.memoryUsage();
   await generateDocument(data);
   const memAfter = process.memoryUsage();
   console.log('Memory used:', memAfter.heapUsed - memBefore.heapUsed);
   ```

#### Issue: "Styling not applied correctly"
**Symptoms:**
- Colors don't match expected values
- Fonts not displaying correctly
- Layout issues

**Causes:**
- Invalid CSS color formats
- Font family not available
- Conflicting style definitions

**Solutions:**
1. **Check Color Format:**
   ```typescript
   // Valid formats
   const validColors = {
     hex: '#0066CC',
     hexShort: '#06C',
     // Invalid: 'blue', 'rgb(0,102,204)', 'hsl(210,100%,40%)'
   };
   ```

2. **Verify Font Availability:**
   ```typescript
   // Use web-safe fonts or provide fallbacks
   const typography = {
     headerFont: { 
       family: 'Calibri, Arial, sans-serif',  // Fallback fonts
       size: 24 
     }
   };
   ```

3. **Debug Style Application:**
   ```typescript
   // Log applied styles
   console.log('Applied color scheme:', config.colorScheme);
   console.log('Applied typography:', config.typography);
   ```

### Performance Issues

#### Issue: "Slow document generation"
**Symptoms:**
- Long wait times for document creation
- Browser becomes unresponsive
- Memory warnings

**Causes:**
- Large number of items in quotation
- Complex table structures
- Inefficient template logic

**Solutions:**
1. **Optimize Large Tables:**
   ```typescript
   // For large item lists, use simplified styling
   const useSimplifiedStyling = data.items.length > 50;
   
   if (useSimplifiedStyling) {
     // Reduce cell padding, simpler borders
     const simplifiedBorders = createTableBorders('none');
   }
   ```

2. **Cache Template Configurations:**
   ```typescript
   // Cache configurations to avoid repeated validation
   const configCache = new Map();
   
   function getCachedConfig(companyId) {
     if (!configCache.has(companyId)) {
       configCache.set(companyId, validateTemplateConfig(config));
     }
     return configCache.get(companyId);
   }
   ```

3. **Use Lazy Loading:**
   ```typescript
   // Load template components only when needed
   const loadTemplateComponent = async (templateType) => {
     switch (templateType) {
       case 'modern':
         return await import('./modernComponents');
       case 'formal':
         return await import('./formalComponents');
       case 'technical':
         return await import('./technicalComponents');
     }
   };
   ```

### Data Validation Issues

#### Issue: "Invalid or missing data"
**Symptoms:**
- Empty fields in generated document
- Error messages about missing properties
- Placeholder text appearing in output

**Causes:**
- Incomplete quotation data
- Missing company information
- Null or undefined values

**Solutions:**
1. **Validate Required Fields:**
   ```typescript
   const requiredFields = ['company.name', 'billTo.company', 'items'];
   
   function validateRequiredData(data) {
     const missing = [];
     if (!data.company?.name) missing.push('company.name');
     if (!data.billTo?.company) missing.push('billTo.company');
     if (!data.items?.length) missing.push('items');
     
     if (missing.length > 0) {
       throw new Error(`Missing required fields: ${missing.join(', ')}`);
     }
   }
   ```

2. **Provide Default Values:**
   ```typescript
   const safeData = {
     ...data,
     company: {
       name: data.company?.name || 'Company Name',
       address: data.company?.address || 'Address Not Provided',
       ...data.company
     }
   };
   ```

3. **Handle Null Values:**
   ```typescript
   // Safe property access
   const companyName = data.company?.name || 'Unknown Company';
   const contactEmail = data.billTo?.email || 'No email provided';
   ```

## Error Codes and Messages

### Template Selection Errors
- **TS001**: Template not found for company
- **TS002**: Invalid template type specified
- **TS003**: Template registry not initialized

### Configuration Errors
- **TC001**: Invalid template configuration
- **TC002**: Missing required color scheme properties
- **TC003**: Invalid typography configuration
- **TC004**: Missing section configuration

### Generation Errors
- **TG001**: Document generation failed
- **TG002**: Memory exhaustion during generation
- **TG003**: Invalid quotation data structure

### Validation Errors
- **TV001**: Required field missing
- **TV002**: Invalid data type
- **TV003**: Data sanitization failed

## Debug Mode

Enable comprehensive debugging:

```typescript
// Enable debug logging
const DEBUG_TEMPLATES = true;

if (DEBUG_TEMPLATES) {
  console.log('🔧 Template debug mode enabled');
  
  // Log template selection
  console.log('Selected template:', templateType);
  console.log('Company data:', company);
  console.log('Configuration:', config);
  
  // Log generation steps
  console.log('Creating header...');
  console.log('Creating client section...');
  console.log('Creating items table...');
}
```

## Performance Monitoring

Monitor template performance:

```typescript
function monitorTemplatePerformance(templateFunction) {
  return async function(data) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await templateFunction(data);
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      console.log(`⏱️ Template generation took ${endTime - startTime}ms`);
      console.log(`💾 Memory used: ${endMemory.heapUsed - startMemory.heapUsed} bytes`);
      
      return result;
    } catch (error) {
      console.error('❌ Template generation failed:', error);
      throw error;
    }
  };
}
```

## Testing Issues

### Issue: "Tests failing after template changes"
**Solutions:**
1. **Update Test Data:**
   ```typescript
   // Ensure test data matches new template requirements
   const testData = {
     company: { /* complete company data */ },
     billTo: { /* complete client data */ },
     items: [/* valid items */]
   };
   ```

2. **Update Visual Baselines:**
   ```bash
   # Regenerate visual test baselines
   npm run test:visual -- --update-baselines
   ```

3. **Check Template Compatibility:**
   ```typescript
   // Verify template works with test data
   const result = await templateFunction(testData);
   expect(result).toBeDefined();
   ```

## Recovery Procedures

### Template System Recovery
If the template system becomes completely non-functional:

1. **Reset to Default Configuration:**
   ```typescript
   import { createDefaultTemplateConfig } from './companyDefaults';
   
   // Reset all companies to default modern template
   const companies = ['chembio-lifesciences', 'chembio-pvt-ltd', 'chemlab-synthesis'];
   companies.forEach(companyId => {
     const defaultConfig = createDefaultTemplateConfig('modern');
     // Apply default configuration
   });
   ```

2. **Clear Template Cache:**
   ```typescript
   // Clear any cached configurations
   if (typeof configCache !== 'undefined') {
     configCache.clear();
   }
   
   // Reinitialize template registry
   import { initializeTemplateSystem } from './templateExtensions';
   initializeTemplateSystem();
   ```

3. **Fallback to Basic Template:**
   ```typescript
   // Use minimal template for emergency situations
   const emergencyTemplate = async (data) => {
     return createBasicDocument(data); // Minimal styling
   };
   ```

## Prevention Best Practices

### Code Quality
- Always validate input data before processing
- Use TypeScript for type safety
- Implement comprehensive error handling
- Add logging for debugging

### Testing
- Write unit tests for all template components
- Include integration tests for complete workflows
- Use visual regression testing for UI consistency
- Test with various data scenarios

### Monitoring
- Monitor document generation performance
- Track error rates and types
- Log template usage statistics
- Set up alerts for critical failures

### Documentation
- Keep documentation updated with code changes
- Document all configuration options
- Provide examples for common use cases
- Maintain troubleshooting guides

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Error Logs:** Look for specific error messages and codes
2. **Review Recent Changes:** Check if recent code changes might have caused the issue
3. **Test with Minimal Data:** Isolate the problem with simplified test data
4. **Check Dependencies:** Ensure all required packages are installed and up to date
5. **Consult Documentation:** Review the main README and API documentation

## Contact Information

For additional support:
- Check the main template system documentation
- Review the test files for usage examples
- Consult the type definitions for interface details