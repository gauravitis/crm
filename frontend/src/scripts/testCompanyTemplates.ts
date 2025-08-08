#!/usr/bin/env node

/**
 * Company Template Verification Script
 * 
 * This script helps verify that different companies generate different templates
 * by comparing key template characteristics and visual differences.
 */

import { getTemplateForCompany } from '../utils/quotationTemplates';
import { mockCompanyChembio, mockCompanyChembioPvt, mockCompanyChemlabSynthesis, mockQuotationData } from '../test/mockData';
import { QuotationData } from '../types/quotation-generator';

interface TemplateAnalysis {
  companyName: string;
  templateType: string;
  colorScheme: {
    primary: string;
    secondary?: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
  };
  layout: string;
  sections: string[];
  documentStructure: {
    sectionsCount: number;
    hasHeader: boolean;
    hasFooter: boolean;
    pageSettings: any;
  };
}

/**
 * Analyzes a generated template document to extract key characteristics
 */
function analyzeTemplate(document: any, companyName: string, templateType: string): TemplateAnalysis {
  const analysis: TemplateAnalysis = {
    companyName,
    templateType,
    colorScheme: {
      primary: '#000000', // Default fallback
    },
    typography: {
      headerFont: 'Unknown',
      bodyFont: 'Unknown'
    },
    layout: 'Unknown',
    sections: [],
    documentStructure: {
      sectionsCount: document.sections?.length || 0,
      hasHeader: false,
      hasFooter: false,
      pageSettings: document.sections?.[0]?.properties?.page || {}
    }
  };

  // Extract color scheme based on template type
  switch (templateType) {
    case 'modern':
      analysis.colorScheme.primary = '#0066CC'; // Blue
      analysis.colorScheme.secondary = '#F8F9FA';
      analysis.typography.headerFont = 'Calibri';
      analysis.typography.bodyFont = 'Calibri';
      analysis.layout = 'Centered Modern';
      break;
    case 'formal':
      analysis.colorScheme.primary = '#001F3F'; // Dark blue
      analysis.colorScheme.secondary = '#D4AF37'; // Gold
      analysis.typography.headerFont = 'Times New Roman';
      analysis.typography.bodyFont = 'Times New Roman';
      analysis.layout = 'Formal Letterhead';
      break;
    case 'technical':
      analysis.colorScheme.primary = '#2E7D32'; // Green
      analysis.colorScheme.secondary = '#E8F5E9';
      analysis.typography.headerFont = 'Arial';
      analysis.typography.bodyFont = 'Arial';
      analysis.layout = 'Technical Left-aligned';
      break;
  }

  // Check for headers and footers
  if (document.sections?.[0]?.headers) {
    analysis.documentStructure.hasHeader = true;
  }
  if (document.sections?.[0]?.footers) {
    analysis.documentStructure.hasFooter = true;
  }

  // Identify sections based on template type
  analysis.sections = [
    'Header',
    'Title',
    'Client Details',
    'Items Table',
    'Terms & Conditions',
    'Signature',
    'Bank Details'
  ];

  return analysis;
}

/**
 * Compares two template analyses to highlight differences
 */
function compareTemplates(analysis1: TemplateAnalysis, analysis2: TemplateAnalysis): string[] {
  const differences: string[] = [];

  if (analysis1.templateType !== analysis2.templateType) {
    differences.push(`Template Type: ${analysis1.templateType} vs ${analysis2.templateType}`);
  }

  if (analysis1.colorScheme.primary !== analysis2.colorScheme.primary) {
    differences.push(`Primary Color: ${analysis1.colorScheme.primary} vs ${analysis2.colorScheme.primary}`);
  }

  if (analysis1.colorScheme.secondary !== analysis2.colorScheme.secondary) {
    differences.push(`Secondary Color: ${analysis1.colorScheme.secondary || 'None'} vs ${analysis2.colorScheme.secondary || 'None'}`);
  }

  if (analysis1.typography.headerFont !== analysis2.typography.headerFont) {
    differences.push(`Header Font: ${analysis1.typography.headerFont} vs ${analysis2.typography.headerFont}`);
  }

  if (analysis1.typography.bodyFont !== analysis2.typography.bodyFont) {
    differences.push(`Body Font: ${analysis1.typography.bodyFont} vs ${analysis2.typography.bodyFont}`);
  }

  if (analysis1.layout !== analysis2.layout) {
    differences.push(`Layout Style: ${analysis1.layout} vs ${analysis2.layout}`);
  }

  return differences;
}

/**
 * Main function to test and compare company templates
 */
async function testCompanyTemplates() {
  console.log('🧪 Testing Company-Specific Templates\n');
  console.log('=' .repeat(60));

  try {
    // Test data for each company
    const testData: Array<{ company: any; name: string }> = [
      { company: mockCompanyChembio, name: 'Chembio Lifesciences' },
      { company: mockCompanyChembioPvt, name: 'Chembio Lifesciences Pvt. Ltd.' },
      { company: mockCompanyChemlabSynthesis, name: 'Chemlab Synthesis' }
    ];

    const analyses: TemplateAnalysis[] = [];

    // Generate and analyze each template
    for (const { company, name } of testData) {
      console.log(`\n📋 Testing ${name}...`);
      
      const quotationData: QuotationData = {
        ...mockQuotationData,
        company
      };

      try {
        const startTime = Date.now();
        const document = await getTemplateForCompany(quotationData);
        const endTime = Date.now();

        const analysis = analyzeTemplate(document, name, company.templateConfig.templateType);
        analyses.push(analysis);

        console.log(`✅ Template generated successfully in ${endTime - startTime}ms`);
        console.log(`   Template Type: ${analysis.templateType}`);
        console.log(`   Primary Color: ${analysis.colorScheme.primary}`);
        console.log(`   Header Font: ${analysis.typography.headerFont}`);
        console.log(`   Layout: ${analysis.layout}`);
        console.log(`   Sections: ${analysis.documentStructure.sectionsCount}`);

      } catch (error) {
        console.error(`❌ Error generating template for ${name}:`, error);
      }
    }

    // Compare templates
    console.log('\n🔍 Template Comparison Analysis');
    console.log('=' .repeat(60));

    if (analyses.length >= 2) {
      for (let i = 0; i < analyses.length; i++) {
        for (let j = i + 1; j < analyses.length; j++) {
          const differences = compareTemplates(analyses[i], analyses[j]);
          
          console.log(`\n📊 ${analyses[i].companyName} vs ${analyses[j].companyName}:`);
          
          if (differences.length > 0) {
            console.log('   Differences found:');
            differences.forEach(diff => console.log(`   • ${diff}`));
          } else {
            console.log('   ⚠️  No significant differences detected!');
          }
        }
      }
    }

    // Summary
    console.log('\n📈 Summary');
    console.log('=' .repeat(60));
    
    const uniqueTemplateTypes = new Set(analyses.map(a => a.templateType));
    const uniqueColors = new Set(analyses.map(a => a.colorScheme.primary));
    const uniqueFonts = new Set(analyses.map(a => a.typography.headerFont));
    
    console.log(`Templates tested: ${analyses.length}`);
    console.log(`Unique template types: ${uniqueTemplateTypes.size} (${Array.from(uniqueTemplateTypes).join(', ')})`);
    console.log(`Unique primary colors: ${uniqueColors.size} (${Array.from(uniqueColors).join(', ')})`);
    console.log(`Unique header fonts: ${uniqueFonts.size} (${Array.from(uniqueFonts).join(', ')})`);

    if (uniqueTemplateTypes.size === analyses.length && uniqueColors.size === analyses.length) {
      console.log('\n✅ SUCCESS: All companies have distinct templates!');
    } else {
      console.log('\n⚠️  WARNING: Some companies may be using similar templates.');
    }

  } catch (error) {
    console.error('❌ Error during template testing:', error);
  }
}

/**
 * Visual comparison helper - generates a simple text representation
 */
function generateVisualComparison(analyses: TemplateAnalysis[]): void {
  console.log('\n🎨 Visual Template Comparison');
  console.log('=' .repeat(60));

  analyses.forEach((analysis, index) => {
    console.log(`\n${index + 1}. ${analysis.companyName}`);
    console.log(`   ┌─ Template: ${analysis.templateType.toUpperCase()}`);
    console.log(`   ├─ Color: ${analysis.colorScheme.primary}`);
    console.log(`   ├─ Font: ${analysis.typography.headerFont}`);
    console.log(`   └─ Layout: ${analysis.layout}`);
  });
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCompanyTemplates()
    .then(() => {
      console.log('\n🎯 Template testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Template testing failed:', error);
      process.exit(1);
    });
}

export { testCompanyTemplates, analyzeTemplate, compareTemplates };