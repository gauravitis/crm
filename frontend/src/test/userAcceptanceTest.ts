import { QuotationData } from '../types/quotation-generator';
import { Company } from '../types/company';
import { 
  createChembioLifesciencesTemplate,
  createChembioPvtLtdTemplate,
  createChemlabSynthesisTemplate,
  getTemplateForCompany
} from '../utils/quotationTemplates';
import { 
  mockCompanyChembio,
  mockCompanyChembioPvt,
  mockCompanyChemlabSynthesis
} from './mockData';
import { 
  visualTestScenarios,
  companyTestData,
  technicalQuotationData,
  corporateQuotationData,
  largeOrderQuotationData
} from './visualTestData';

/**
 * User Acceptance Testing Suite for Company-Specific Quotation Templates
 * 
 * This module provides comprehensive testing for validating that templates meet
 * business requirements and user expectations as defined in requirements 1.1, 1.2, 1.3, 5.1, 5.2, 5.3
 */

export interface UATTestResult {
  testName: string;
  company: string;
  templateType: string;
  passed: boolean;
  issues: string[];
  brandAlignment: BrandAlignmentResult;
  readability: ReadabilityResult;
  businessRequirements: BusinessRequirementResult[];
}

export interface BrandAlignmentResult {
  colorSchemeCorrect: boolean;
  typographyAppropriate: boolean;
  layoutMatchesBrand: boolean;
  visualIdentityDistinct: boolean;
  score: number; // 0-100
}

export interface ReadabilityResult {
  headerClear: boolean;
  clientInfoReadable: boolean;
  itemsTableFormatted: boolean;
  termsVisible: boolean;
  professionalAppearance: boolean;
  score: number; // 0-100
}

export interface BusinessRequirementResult {
  requirementId: string;
  description: string;
  met: boolean;
  details: string;
}

/**
 * Real company data scenarios for comprehensive testing
 */
export const realCompanyTestScenarios = {
  // Pharmaceutical research lab scenario
  pharmaceuticalResearch: {
    quotationNumber: 'UAT-PHARMA-001',
    date: '2024-01-15',
    validUntil: '2024-03-15',
    company: mockCompanyChembio,
    billTo: {
      name: 'Dr. Rajesh Kumar',
      company: 'Indian Institute of Science Research',
      address: 'Department of Pharmaceutical Sciences, IISc Campus, Bangalore - 560012, Karnataka, India',
      email: 'rajesh.kumar@iisc.ac.in',
      phone: '+91-80-2293-2001',
      contactPerson: 'Dr. Rajesh Kumar, Principal Investigator'
    },
    items: [
      {
        sno: 1,
        cat_no: 'CBL-API-001',
        pack_size: '25g',
        product_description: 'Paracetamol API (99.5% purity) - Pharmaceutical grade, USP/BP compliant, suitable for tablet formulation research',
        lead_time: '3-4 weeks',
        qty: 2,
        unit_rate: 2500.00,
        gst_percent: 18,
        total_price: 5900.00,
        hsn_code: '29242990'
      },
      {
        sno: 2,
        cat_no: 'CBL-EXC-002',
        pack_size: '1kg',
        product_description: 'Microcrystalline Cellulose PH-102 - Pharmaceutical excipient, suitable for direct compression',
        lead_time: '2-3 weeks',
        qty: 1,
        unit_rate: 1800.00,
        gst_percent: 18,
        total_price: 2124.00
      },
      {
        sno: 3,
        cat_no: 'CBL-SOL-003',
        pack_size: '500ml',
        product_description: 'HPLC Grade Methanol - 99.9% purity, low water content, suitable for pharmaceutical analysis',
        lead_time: '1-2 weeks',
        qty: 3,
        unit_rate: 950.00,
        gst_percent: 18,
        total_price: 3363.00
      }
    ],
    subTotal: 9650.00,
    tax: 1737.00,
    roundOff: 0.00,
    grandTotal: 11387.00,
    notes: 'All materials come with Certificate of Analysis. Special storage conditions apply for API materials.',
    paymentTerms: '45 days from invoice date'
  } as QuotationData,

  // Corporate pharmaceutical manufacturing scenario
  corporateManufacturing: {
    quotationNumber: 'UAT-CORP-001',
    date: '2024-01-15',
    validUntil: '2024-02-28',
    company: mockCompanyChembioPvt,
    billTo: {
      name: 'Mr. Suresh Patel',
      company: 'Cipla Limited',
      address: 'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg, Lower Parel, Mumbai - 400013, Maharashtra, India',
      email: 'suresh.patel@cipla.com',
      phone: '+91-22-2482-1000',
      contactPerson: 'Mr. Suresh Patel, Senior Manager - Procurement'
    },
    items: [
      {
        sno: 1,
        cat_no: 'CBPL-API-001',
        pack_size: '10kg',
        product_description: 'Atorvastatin Calcium API - GMP certified, DMF filed, suitable for commercial manufacturing',
        lead_time: '8-10 weeks',
        qty: 5,
        unit_rate: 125000.00,
        gst_percent: 18,
        total_price: 737500.00,
        hsn_code: '29349900'
      },
      {
        sno: 2,
        cat_no: 'CBPL-EXC-002',
        pack_size: '25kg',
        product_description: 'Lactose Monohydrate - Pharmaceutical grade, mesh 200, suitable for tablet manufacturing',
        lead_time: '4-6 weeks',
        qty: 10,
        unit_rate: 3500.00,
        gst_percent: 18,
        total_price: 41300.00
      },
      {
        sno: 3,
        cat_no: 'CBPL-COL-003',
        pack_size: '5kg',
        product_description: 'Sunset Yellow FCF - Food grade colorant, E110 compliant, batch tested',
        lead_time: '6-8 weeks',
        qty: 2,
        unit_rate: 8500.00,
        gst_percent: 18,
        total_price: 20060.00
      }
    ],
    subTotal: 680000.00,
    tax: 122400.00,
    roundOff: 0.00,
    grandTotal: 802400.00,
    notes: 'Corporate supply agreement terms apply. All materials come with comprehensive regulatory documentation including CoA, safety data sheets, and compliance certificates.',
    paymentTerms: '90 days from invoice date'
  } as QuotationData,

  // Research laboratory chemical synthesis scenario
  researchSynthesis: {
    quotationNumber: 'UAT-RESEARCH-001',
    date: '2024-01-15',
    validUntil: '2024-02-15',
    company: mockCompanyChemlabSynthesis,
    billTo: {
      name: 'Prof. Anita Sharma',
      company: 'National Chemical Laboratory',
      address: 'Dr. Homi Bhabha Road, Pune - 411008, Maharashtra, India',
      email: 'anita.sharma@ncl.res.in',
      phone: '+91-20-2590-2001',
      contactPerson: 'Prof. Anita Sharma, Senior Scientist'
    },
    items: [
      {
        sno: 1,
        cat_no: 'CLS-ORG-001',
        pack_size: '100g',
        product_description: '4-Nitroaniline (CAS: 100-01-6) - 99% purity, suitable for organic synthesis, recrystallized',
        lead_time: '2-3 weeks',
        qty: 1,
        unit_rate: 1200.00,
        gst_percent: 18,
        total_price: 1416.00,
        hsn_code: '29214290'
      },
      {
        sno: 2,
        cat_no: 'CLS-CAT-002',
        pack_size: '5g',
        product_description: 'Palladium on Carbon (10% Pd/C) (CAS: 7440-05-3) - Catalyst grade, 50% water wet, suitable for hydrogenation',
        lead_time: '4-5 weeks',
        qty: 2,
        unit_rate: 15000.00,
        gst_percent: 18,
        total_price: 35400.00,
        hsn_code: '28439000'
      },
      {
        sno: 3,
        cat_no: 'CLS-SOL-003',
        pack_size: '1L',
        product_description: 'Dimethylformamide (DMF) (CAS: 68-12-2) - Anhydrous, 99.8% purity, molecular sieves dried',
        lead_time: '1-2 weeks',
        qty: 2,
        unit_rate: 2800.00,
        gst_percent: 18,
        total_price: 6608.00,
        hsn_code: '29241990'
      },
      {
        sno: 4,
        cat_no: 'CLS-REA-004',
        pack_size: '250g',
        product_description: 'Sodium Borohydride (CAS: 16940-66-2) - 98% purity, powder, suitable for reduction reactions',
        lead_time: '3-4 weeks',
        qty: 1,
        unit_rate: 4500.00,
        gst_percent: 18,
        total_price: 5310.00,
        hsn_code: '28500020'
      }
    ],
    subTotal: 41100.00,
    tax: 7398.00,
    roundOff: 0.00,
    grandTotal: 48498.00,
    notes: 'All chemicals are research grade with detailed analytical data. Special handling and storage requirements apply. CAS numbers verified.',
    paymentTerms: '30 days from invoice date'
  } as QuotationData
};

/**
 * Validates brand alignment for each company template
 */
export const validateBrandAlignment = (company: Company, templateType: string): BrandAlignmentResult => {
  const result: BrandAlignmentResult = {
    colorSchemeCorrect: false,
    typographyAppropriate: false,
    layoutMatchesBrand: false,
    visualIdentityDistinct: false,
    score: 0
  };

  // Check color scheme alignment based on company template type
  switch (templateType) {
    case 'modern':
      result.colorSchemeCorrect = company.templateConfig?.colorScheme?.primary === '#0066CC';
      result.typographyAppropriate = company.templateConfig?.typography?.headerFont?.family === 'Calibri';
      result.layoutMatchesBrand = company.templateConfig?.headerStyle === 'centered';
      break;
    case 'formal':
      result.colorSchemeCorrect = company.templateConfig?.colorScheme?.primary === '#001F3F';
      result.typographyAppropriate = company.templateConfig?.typography?.headerFont?.weight === 'bold';
      result.layoutMatchesBrand = company.templateConfig?.tableStyle === 'formal-lines';
      break;
    case 'technical':
      result.colorSchemeCorrect = company.templateConfig?.colorScheme?.primary === '#2E7D32';
      result.typographyAppropriate = company.templateConfig?.typography?.tableFont?.family === 'Calibri';
      result.layoutMatchesBrand = company.templateConfig?.headerStyle === 'left-aligned';
      break;
  }

  // Visual identity distinctness check
  result.visualIdentityDistinct = company.templateConfig?.templateType === templateType;

  // Calculate score
  const checks = [
    result.colorSchemeCorrect,
    result.typographyAppropriate,
    result.layoutMatchesBrand,
    result.visualIdentityDistinct
  ];
  result.score = (checks.filter(Boolean).length / checks.length) * 100;

  return result;
};

/**
 * Validates document readability and professional appearance
 */
export const validateReadability = (data: QuotationData): ReadabilityResult => {
  const result: ReadabilityResult = {
    headerClear: false,
    clientInfoReadable: false,
    itemsTableFormatted: false,
    termsVisible: false,
    professionalAppearance: false,
    score: 0
  };

  // Check header clarity
  result.headerClear = !!(data.company?.name && data.company?.contactInfo?.email);

  // Check client information readability
  result.clientInfoReadable = !!(
    data.billTo?.name && 
    data.billTo?.company && 
    data.billTo?.address && 
    data.billTo?.email
  );

  // Check items table formatting
  result.itemsTableFormatted = data.items.length > 0 && 
    data.items.every(item => 
      item.cat_no && 
      item.product_description && 
      item.unit_rate > 0
    );

  // Check terms visibility
  result.termsVisible = !!(data.paymentTerms && data.notes);

  // Check professional appearance (based on data completeness)
  result.professionalAppearance = !!(
    data.quotationNumber && 
    data.date && 
    data.validUntil && 
    data.grandTotal > 0
  );

  // Calculate score
  const checks = [
    result.headerClear,
    result.clientInfoReadable,
    result.itemsTableFormatted,
    result.termsVisible,
    result.professionalAppearance
  ];
  result.score = (checks.filter(Boolean).length / checks.length) * 100;

  return result;
};

/**
 * Validates business requirements compliance
 */
export const validateBusinessRequirements = (
  data: QuotationData, 
  templateType: string
): BusinessRequirementResult[] => {
  const results: BusinessRequirementResult[] = [];

  // Requirement 1.1: Chembio Lifesciences modern template
  if (data.company.name === 'Chembio Lifesciences') {
    results.push({
      requirementId: '1.1',
      description: 'Modern, clean template with blue branding and scientific layout',
      met: templateType === 'modern' && data.company.templateConfig?.colorScheme?.primary === '#0066CC',
      details: `Template type: ${templateType}, Primary color: ${data.company.templateConfig?.colorScheme?.primary}`
    });
  }

  // Requirement 1.2: Chembio Lifesciences Pvt. Ltd. formal template
  if (data.company.name === 'Chembio Lifesciences Pvt. Ltd.') {
    results.push({
      requirementId: '1.2',
      description: 'Formal, corporate template with dark blue/gold branding',
      met: templateType === 'formal' && data.company.templateConfig?.colorScheme?.primary === '#001F3F',
      details: `Template type: ${templateType}, Primary color: ${data.company.templateConfig?.colorScheme?.primary}`
    });
  }

  // Requirement 1.3: Chemlab Synthesis technical template
  if (data.company.name === 'Chemlab Synthesis') {
    results.push({
      requirementId: '1.3',
      description: 'Technical, research-focused template with green branding',
      met: templateType === 'technical' && data.company.templateConfig?.colorScheme?.primary === '#2E7D32',
      details: `Template type: ${templateType}, Primary color: ${data.company.templateConfig?.colorScheme?.primary}`
    });
  }

  // Requirement 5.1: Emphasis on product specifications and lead times (Chembio)
  if (data.company.name === 'Chembio Lifesciences') {
    const hasLeadTimeEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('leadTime');
    const hasSpecificationEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('specifications');
    
    results.push({
      requirementId: '5.1',
      description: 'Emphasize product availability, lead times, and modern presentation',
      met: hasLeadTimeEmphasis && hasSpecificationEmphasis,
      details: `Emphasized fields: ${data.company.templateConfig?.customizations?.emphasizeFields?.join(', ')}`
    });
  }

  // Requirement 5.2: Emphasis on compliance and terms (Chembio Pvt. Ltd.)
  if (data.company.name === 'Chembio Lifesciences Pvt. Ltd.') {
    const hasComplianceEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('compliance');
    const hasTermsEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('terms');
    
    results.push({
      requirementId: '5.2',
      description: 'Emphasize compliance information, formal terms, and corporate credibility',
      met: hasComplianceEmphasis && hasTermsEmphasis,
      details: `Emphasized fields: ${data.company.templateConfig?.customizations?.emphasizeFields?.join(', ')}`
    });
  }

  // Requirement 5.3: Emphasis on technical specifications (Chemlab Synthesis)
  if (data.company.name === 'Chemlab Synthesis') {
    const hasCasNumberEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('casNumber');
    const hasResearchEmphasis = data.company.templateConfig?.customizations?.emphasizeFields?.includes('research');
    
    results.push({
      requirementId: '5.3',
      description: 'Emphasize technical specifications, research applications, and scientific accuracy',
      met: hasCasNumberEmphasis && hasResearchEmphasis,
      details: `Emphasized fields: ${data.company.templateConfig?.customizations?.emphasizeFields?.join(', ')}`
    });
  }

  return results;
};

/**
 * Runs comprehensive user acceptance test for a specific quotation
 */
export const runUserAcceptanceTest = async (
  testName: string,
  data: QuotationData
): Promise<UATTestResult> => {
  const issues: string[] = [];
  
  try {
    // Get template type
    const templateType = data.company.templateConfig?.templateType || 'unknown';
    
    // Validate brand alignment
    const brandAlignment = validateBrandAlignment(data.company, templateType);
    if (brandAlignment.score < 75) {
      issues.push(`Brand alignment score too low: ${brandAlignment.score}%`);
    }

    // Validate readability
    const readability = validateReadability(data);
    if (readability.score < 80) {
      issues.push(`Readability score too low: ${readability.score}%`);
    }

    // Validate business requirements
    const businessRequirements = validateBusinessRequirements(data, templateType);
    const unmetRequirements = businessRequirements.filter(req => !req.met);
    if (unmetRequirements.length > 0) {
      issues.push(`Unmet business requirements: ${unmetRequirements.map(req => req.requirementId).join(', ')}`);
    }

    // Test template generation (this would normally generate the actual document)
    const template = await getTemplateForCompany(data);
    if (!template) {
      issues.push('Template generation failed');
    }

    return {
      testName,
      company: data.company.name,
      templateType,
      passed: issues.length === 0,
      issues,
      brandAlignment,
      readability,
      businessRequirements
    };

  } catch (error) {
    issues.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      testName,
      company: data.company.name,
      templateType: 'unknown',
      passed: false,
      issues,
      brandAlignment: {
        colorSchemeCorrect: false,
        typographyAppropriate: false,
        layoutMatchesBrand: false,
        visualIdentityDistinct: false,
        score: 0
      },
      readability: {
        headerClear: false,
        clientInfoReadable: false,
        itemsTableFormatted: false,
        termsVisible: false,
        professionalAppearance: false,
        score: 0
      },
      businessRequirements: []
    };
  }
};

/**
 * Runs the complete user acceptance testing suite
 */
export const runCompleteUATSuite = async (): Promise<UATTestResult[]> => {
  const results: UATTestResult[] = [];

  // Test real company scenarios
  for (const [scenarioName, data] of Object.entries(realCompanyTestScenarios)) {
    const result = await runUserAcceptanceTest(`Real Company - ${scenarioName}`, data);
    results.push(result);
  }

  // Test visual regression scenarios with different companies
  for (const [scenarioName, data] of Object.entries(visualTestScenarios)) {
    // Test with each company
    for (const company of [mockCompanyChembio, mockCompanyChembioPvt, mockCompanyChemlabSynthesis]) {
      const testData = { ...data, company };
      const result = await runUserAcceptanceTest(
        `Visual Scenario - ${scenarioName} - ${company.name}`, 
        testData
      );
      results.push(result);
    }
  }

  return results;
};

/**
 * Generates a comprehensive UAT report
 */
export const generateUATReport = (results: UATTestResult[]): string => {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  const avgBrandScore = results.reduce((sum, r) => sum + r.brandAlignment.score, 0) / totalTests;
  const avgReadabilityScore = results.reduce((sum, r) => sum + r.readability.score, 0) / totalTests;
  
  let report = `
# User Acceptance Testing Report
## Company-Specific Quotation Templates

### Executive Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)
- **Failed**: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)
- **Average Brand Alignment Score**: ${avgBrandScore.toFixed(1)}%
- **Average Readability Score**: ${avgReadabilityScore.toFixed(1)}%

### Test Results by Company

`;

  // Group results by company
  const resultsByCompany = results.reduce((acc, result) => {
    if (!acc[result.company]) {
      acc[result.company] = [];
    }
    acc[result.company].push(result);
    return acc;
  }, {} as Record<string, UATTestResult[]>);

  for (const [company, companyResults] of Object.entries(resultsByCompany)) {
    const companyPassed = companyResults.filter(r => r.passed).length;
    const companyTotal = companyResults.length;
    
    report += `#### ${company}\n`;
    report += `- **Tests**: ${companyTotal}\n`;
    report += `- **Passed**: ${companyPassed}/${companyTotal} (${((companyPassed / companyTotal) * 100).toFixed(1)}%)\n`;
    
    const failedCompanyTests = companyResults.filter(r => !r.passed);
    if (failedCompanyTests.length > 0) {
      report += `- **Failed Tests**:\n`;
      failedCompanyTests.forEach(test => {
        report += `  - ${test.testName}: ${test.issues.join(', ')}\n`;
      });
    }
    report += '\n';
  }

  report += `### Business Requirements Compliance\n\n`;
  
  // Analyze business requirements compliance
  const allBusinessReqs = results.flatMap(r => r.businessRequirements);
  const reqGroups = allBusinessReqs.reduce((acc, req) => {
    if (!acc[req.requirementId]) {
      acc[req.requirementId] = { total: 0, met: 0, description: req.description };
    }
    acc[req.requirementId].total++;
    if (req.met) acc[req.requirementId].met++;
    return acc;
  }, {} as Record<string, { total: number; met: number; description: string }>);

  for (const [reqId, reqData] of Object.entries(reqGroups)) {
    const compliance = (reqData.met / reqData.total) * 100;
    report += `- **Requirement ${reqId}**: ${compliance.toFixed(1)}% compliance (${reqData.met}/${reqData.total})\n`;
    report += `  - ${reqData.description}\n`;
  }

  report += `\n### Recommendations\n\n`;
  
  if (avgBrandScore < 80) {
    report += `- **Brand Alignment**: Average score of ${avgBrandScore.toFixed(1)}% indicates need for brand consistency improvements\n`;
  }
  
  if (avgReadabilityScore < 85) {
    report += `- **Readability**: Average score of ${avgReadabilityScore.toFixed(1)}% suggests document formatting enhancements needed\n`;
  }
  
  const criticalIssues = results.flatMap(r => r.issues).filter(issue => 
    issue.includes('Template generation failed') || 
    issue.includes('Unmet business requirements')
  );
  
  if (criticalIssues.length > 0) {
    report += `- **Critical Issues**: ${criticalIssues.length} critical issues found requiring immediate attention\n`;
  }

  return report;
};