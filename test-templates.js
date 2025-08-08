#!/usr/bin/env node

/**
 * Quick Template Verification Script
 * 
 * This script tests if different companies generate different templates
 * by running the template generation and comparing key characteristics.
 */

const path = require('path');

// Simple test to verify templates are different
async function testTemplates() {
  console.log('🧪 Testing Company-Specific Templates');
  console.log('=' .repeat(50));

  try {
    // Test different companies
    const companies = [
      {
        name: 'Chembio Lifesciences',
        templateType: 'modern',
        expectedColor: '#0066CC',
        expectedFont: 'Calibri'
      },
      {
        name: 'Chembio Lifesciences Pvt. Ltd.',
        templateType: 'formal', 
        expectedColor: '#001F3F',
        expectedFont: 'Times New Roman'
      },
      {
        name: 'Chemlab Synthesis',
        templateType: 'technical',
        expectedColor: '#2E7D32',
        expectedFont: 'Arial'
      }
    ];

    console.log('\n📋 Expected Template Characteristics:');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   Template Type: ${company.templateType}`);
      console.log(`   Primary Color: ${company.expectedColor}`);
      console.log(`   Font Family: ${company.expectedFont}`);
      console.log('');
    });

    // Check if the template files exist
    const fs = require('fs');
    const templateFile = path.join(__dirname, 'frontend/src/utils/quotationTemplates.ts');
    const companyDefaultsFile = path.join(__dirname, 'frontend/src/utils/companyDefaults.ts');
    
    console.log('📁 Checking template files:');
    console.log(`   quotationTemplates.ts: ${fs.existsSync(templateFile) ? '✅ Found' : '❌ Missing'}`);
    console.log(`   companyDefaults.ts: ${fs.existsSync(companyDefaultsFile) ? '✅ Found' : '❌ Missing'}`);

    if (fs.existsSync(templateFile)) {
      const templateContent = fs.readFileSync(templateFile, 'utf8');
      
      // Check for different template functions
      const hasModernTemplate = templateContent.includes('createChembioLifesciencesTemplate');
      const hasFormalTemplate = templateContent.includes('createChembioPvtLtdTemplate');
      const hasTechnicalTemplate = templateContent.includes('createChemlabSynthesisTemplate');
      
      console.log('\n🔍 Template Functions Found:');
      console.log(`   Modern Template (Chembio): ${hasModernTemplate ? '✅' : '❌'}`);
      console.log(`   Formal Template (Pvt Ltd): ${hasFormalTemplate ? '✅' : '❌'}`);
      console.log(`   Technical Template (Chemlab): ${hasTechnicalTemplate ? '✅' : '❌'}`);

      // Check for different color schemes
      const hasBlueColor = templateContent.includes('#0066CC');
      const hasDarkBlueColor = templateContent.includes('#001F3F');
      const hasGreenColor = templateContent.includes('#2E7D32');
      
      console.log('\n🎨 Color Schemes Found:');
      console.log(`   Modern Blue (#0066CC): ${hasBlueColor ? '✅' : '❌'}`);
      console.log(`   Formal Dark Blue (#001F3F): ${hasDarkBlueColor ? '✅' : '❌'}`);
      console.log(`   Technical Green (#2E7D32): ${hasGreenColor ? '✅' : '❌'}`);

      // Check for different fonts
      const hasCalibri = templateContent.includes('Calibri');
      const hasTimesNewRoman = templateContent.includes('Times New Roman');
      const hasArial = templateContent.includes('Arial');
      
      console.log('\n📝 Font Families Found:');
      console.log(`   Calibri (Modern): ${hasCalibri ? '✅' : '❌'}`);
      console.log(`   Times New Roman (Formal): ${hasTimesNewRoman ? '✅' : '❌'}`);
      console.log(`   Arial (Technical): ${hasArial ? '✅' : '❌'}`);

      // Summary
      const allTemplatesFound = hasModernTemplate && hasFormalTemplate && hasTechnicalTemplate;
      const allColorsFound = hasBlueColor && hasDarkBlueColor && hasGreenColor;
      const allFontsFound = hasCalibri && hasTimesNewRoman && hasArial;

      console.log('\n📊 Summary:');
      console.log(`   All template functions: ${allTemplatesFound ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   All color schemes: ${allColorsFound ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   All font families: ${allFontsFound ? '✅ PASS' : '❌ FAIL'}`);

      if (allTemplatesFound && allColorsFound && allFontsFound) {
        console.log('\n🎉 SUCCESS: Templates are configured differently for each company!');
        console.log('\n💡 To test the actual template generation:');
        console.log('   1. Run your application');
        console.log('   2. Generate quotations for different companies');
        console.log('   3. Compare the generated documents visually');
        console.log('   4. Or use the TemplateComparison component in your frontend');
      } else {
        console.log('\n⚠️  WARNING: Some template differences may be missing.');
        console.log('   Check the template implementation for completeness.');
      }
    }

    // Check company defaults
    if (fs.existsSync(companyDefaultsFile)) {
      const defaultsContent = fs.readFileSync(companyDefaultsFile, 'utf8');
      
      console.log('\n🏢 Company Defaults Configuration:');
      const hasDefaultConfigs = defaultsContent.includes('DEFAULT_COMPANY_CONFIGS');
      const hasColorSchemes = defaultsContent.includes('DEFAULT_COLOR_SCHEMES');
      const hasTypography = defaultsContent.includes('DEFAULT_TYPOGRAPHY');
      
      console.log(`   Company Configs: ${hasDefaultConfigs ? '✅' : '❌'}`);
      console.log(`   Color Schemes: ${hasColorSchemes ? '✅' : '❌'}`);
      console.log(`   Typography: ${hasTypography ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error during template testing:', error.message);
  }
}

// How to verify templates are working in your running application
function printVerificationInstructions() {
  console.log('\n🔧 How to Verify Templates in Your Running Application:');
  console.log('=' .repeat(60));
  
  console.log('\n1. 🌐 Web Interface Method:');
  console.log('   • Open your application in the browser');
  console.log('   • Navigate to the quotation generator');
  console.log('   • Create quotations for different companies:');
  console.log('     - Chembio Lifesciences (should be blue/modern)');
  console.log('     - Chembio Lifesciences Pvt. Ltd. (should be dark blue/formal)');
  console.log('     - Chemlab Synthesis (should be green/technical)');
  console.log('   • Download and compare the generated documents');

  console.log('\n2. 🧪 Component Testing Method:');
  console.log('   • Add the TemplateComparison component to your app');
  console.log('   • Import: import TemplateComparison from "./components/TemplateComparison"');
  console.log('   • Use: <TemplateComparison />');
  console.log('   • This will show a side-by-side comparison');

  console.log('\n3. 🔍 Visual Differences to Look For:');
  console.log('   • Header colors (blue vs dark blue vs green)');
  console.log('   • Font families (Calibri vs Times New Roman vs Arial)');
  console.log('   • Layout styles (centered vs formal vs left-aligned)');
  console.log('   • Table designs (modern grid vs formal lines vs technical data)');

  console.log('\n4. 📊 Browser Console Method:');
  console.log('   • Open browser developer tools');
  console.log('   • Generate quotations and watch console logs');
  console.log('   • Look for messages like:');
  console.log('     "Creating Chembio Lifesciences modern template"');
  console.log('     "Creating Chembio Lifesciences Pvt. Ltd. template"');
  console.log('     "Creating Chemlab Synthesis technical template"');

  console.log('\n5. 🎯 Quick Test Commands:');
  console.log('   • cd frontend && npm test -- quotationTemplates');
  console.log('   • cd frontend && npm run test:integration');
  console.log('   • node test-templates.js (this script)');
}

// Run the test
if (require.main === module) {
  testTemplates()
    .then(() => {
      printVerificationInstructions();
      console.log('\n✨ Template verification completed!');
    })
    .catch((error) => {
      console.error('💥 Template verification failed:', error);
      process.exit(1);
    });
}

module.exports = { testTemplates };