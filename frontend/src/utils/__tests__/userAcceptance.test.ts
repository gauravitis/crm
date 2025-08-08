import { describe, it, expect, beforeAll } from 'vitest';
import {
  runUserAcceptanceTest,
  runCompleteUATSuite,
  generateUATReport,
  validateBrandAlignment,
  validateReadability,
  validateBusinessRequirements,
  realCompanyTestScenarios,
  UATTestResult
} from '../../test/userAcceptanceTest';
import {
  mockCompanyChembio,
  mockCompanyChembioPvt,
  mockCompanyChemlabSynthesis
} from '../../test/mockData';
import { visualTestScenarios } from '../../test/visualTestData';

/**
 * User Acceptance Testing Suite
 * 
 * Tests validate that templates meet business requirements and user expectations
 * as specified in requirements 1.1, 1.2, 1.3, 5.1, 5.2, 5.3
 */

describe('User Acceptance Testing - Company-Specific Quotation Templates', () => {
  let uatResults: UATTestResult[] = [];

  beforeAll(async () => {
    // Run the complete UAT suite once for all tests
    uatResults = await runCompleteUATSuite();
  });

  describe('Brand Alignment Validation', () => {
    it('should validate Chembio Lifesciences modern brand alignment', () => {
      const brandAlignment = validateBrandAlignment(mockCompanyChembio, 'modern');
      
      expect(brandAlignment.colorSchemeCorrect).toBe(true);
      expect(brandAlignment.typographyAppropriate).toBe(true);
      expect(brandAlignment.layoutMatchesBrand).toBe(true);
      expect(brandAlignment.visualIdentityDistinct).toBe(true);
      expect(brandAlignment.score).toBeGreaterThanOrEqual(75);
    });

    it('should validate Chembio Pvt. Ltd. formal brand alignment', () => {
      const brandAlignment = validateBrandAlignment(mockCompanyChembioPvt, 'formal');
      
      expect(brandAlignment.colorSchemeCorrect).toBe(true);
      expect(brandAlignment.layoutMatchesBrand).toBe(true);
      expect(brandAlignment.visualIdentityDistinct).toBe(true);
      expect(brandAlignment.score).toBeGreaterThanOrEqual(75);
    });

    it('should validate Chemlab Synthesis technical brand alignment', () => {
      const brandAlignment = validateBrandAlignment(mockCompanyChemlabSynthesis, 'technical');
      
      expect(brandAlignment.colorSchemeCorrect).toBe(true);
      expect(brandAlignment.layoutMatchesBrand).toBe(true);
      expect(brandAlignment.visualIdentityDistinct).toBe(true);
      expect(brandAlignment.score).toBeGreaterThanOrEqual(75);
    });

    it('should distinguish between different company brands visually', () => {
      const chembioAlignment = validateBrandAlignment(mockCompanyChembio, 'modern');
      const pvtAlignment = validateBrandAlignment(mockCompanyChembioPvt, 'formal');
      const synthesisAlignment = validateBrandAlignment(mockCompanyChemlabSynthesis, 'technical');

      // Each company should have distinct visual identity
      expect(chembioAlignment.visualIdentityDistinct).toBe(true);
      expect(pvtAlignment.visualIdentityDistinct).toBe(true);
      expect(synthesisAlignment.visualIdentityDistinct).toBe(true);

      // Color schemes should be different
      expect(mockCompanyChembio.templateConfig?.colorScheme?.primary).not.toBe(
        mockCompanyChembioPvt.templateConfig?.colorScheme?.primary
      );
      expect(mockCompanyChembioPvt.templateConfig?.colorScheme?.primary).not.toBe(
        mockCompanyChemlabSynthesis.templateConfig?.colorScheme?.primary
      );
    });
  });

  describe('Document Readability Validation', () => {
    it('should validate pharmaceutical research quotation readability', () => {
      const readability = validateReadability(realCompanyTestScenarios.pharmaceuticalResearch);
      
      expect(readability.headerClear).toBe(true);
      expect(readability.clientInfoReadable).toBe(true);
      expect(readability.itemsTableFormatted).toBe(true);
      expect(readability.termsVisible).toBe(true);
      expect(readability.professionalAppearance).toBe(true);
      expect(readability.score).toBeGreaterThanOrEqual(80);
    });

    it('should validate corporate manufacturing quotation readability', () => {
      const readability = validateReadability(realCompanyTestScenarios.corporateManufacturing);
      
      expect(readability.headerClear).toBe(true);
      expect(readability.clientInfoReadable).toBe(true);
      expect(readability.itemsTableFormatted).toBe(true);
      expect(readability.termsVisible).toBe(true);
      expect(readability.professionalAppearance).toBe(true);
      expect(readability.score).toBeGreaterThanOrEqual(80);
    });

    it('should validate research synthesis quotation readability', () => {
      const readability = validateReadability(realCompanyTestScenarios.researchSynthesis);
      
      expect(readability.headerClear).toBe(true);
      expect(readability.clientInfoReadable).toBe(true);
      expect(readability.itemsTableFormatted).toBe(true);
      expect(readability.termsVisible).toBe(true);
      expect(readability.professionalAppearance).toBe(true);
      expect(readability.score).toBeGreaterThanOrEqual(80);
    });

    it('should handle edge cases with minimal data', () => {
      const readability = validateReadability(visualTestScenarios.minimal);
      
      // Even minimal data should maintain basic readability
      expect(readability.headerClear).toBe(true);
      expect(readability.clientInfoReadable).toBe(true);
      expect(readability.itemsTableFormatted).toBe(true);
      expect(readability.score).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Business Requirements Compliance', () => {
    it('should validate Requirement 1.1 - Chembio Lifesciences modern template', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.pharmaceuticalResearch,
        'modern'
      );
      
      const req11 = requirements.find(r => r.requirementId === '1.1');
      expect(req11).toBeDefined();
      expect(req11?.met).toBe(true);
      expect(req11?.description).toContain('Modern, clean template with blue branding');
    });

    it('should validate Requirement 1.2 - Chembio Pvt. Ltd. formal template', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.corporateManufacturing,
        'formal'
      );
      
      const req12 = requirements.find(r => r.requirementId === '1.2');
      expect(req12).toBeDefined();
      expect(req12?.met).toBe(true);
      expect(req12?.description).toContain('Formal, corporate template with dark blue/gold branding');
    });

    it('should validate Requirement 1.3 - Chemlab Synthesis technical template', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.researchSynthesis,
        'technical'
      );
      
      const req13 = requirements.find(r => r.requirementId === '1.3');
      expect(req13).toBeDefined();
      expect(req13?.met).toBe(true);
      expect(req13?.description).toContain('Technical, research-focused template with green branding');
    });

    it('should validate Requirement 5.1 - Chembio emphasis on specifications and lead times', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.pharmaceuticalResearch,
        'modern'
      );
      
      const req51 = requirements.find(r => r.requirementId === '5.1');
      expect(req51).toBeDefined();
      expect(req51?.met).toBe(true);
      expect(req51?.description).toContain('product availability, lead times');
    });

    it('should validate Requirement 5.2 - Chembio Pvt. Ltd. emphasis on compliance', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.corporateManufacturing,
        'formal'
      );
      
      const req52 = requirements.find(r => r.requirementId === '5.2');
      expect(req52).toBeDefined();
      expect(req52?.met).toBe(true);
      expect(req52?.description).toContain('compliance information, formal terms');
    });

    it('should validate Requirement 5.3 - Chemlab Synthesis emphasis on technical specs', () => {
      const requirements = validateBusinessRequirements(
        realCompanyTestScenarios.researchSynthesis,
        'technical'
      );
      
      const req53 = requirements.find(r => r.requirementId === '5.3');
      expect(req53).toBeDefined();
      expect(req53?.met).toBe(true);
      expect(req53?.description).toContain('technical specifications, research applications');
    });
  });

  describe('Real Company Data Testing', () => {
    it('should successfully generate pharmaceutical research quotation', async () => {
      const result = await runUserAcceptanceTest(
        'Pharmaceutical Research',
        realCompanyTestScenarios.pharmaceuticalResearch
      );
      
      expect(result.passed).toBe(true);
      expect(result.company).toBe('Chembio Lifesciences');
      expect(result.templateType).toBe('modern');
      expect(result.brandAlignment.score).toBeGreaterThanOrEqual(75);
      expect(result.readability.score).toBeGreaterThanOrEqual(80);
      expect(result.issues).toHaveLength(0);
    });

    it('should successfully generate corporate manufacturing quotation', async () => {
      const result = await runUserAcceptanceTest(
        'Corporate Manufacturing',
        realCompanyTestScenarios.corporateManufacturing
      );
      
      expect(result.passed).toBe(true);
      expect(result.company).toBe('Chembio Lifesciences Pvt. Ltd.');
      expect(result.templateType).toBe('formal');
      expect(result.brandAlignment.score).toBeGreaterThanOrEqual(75);
      expect(result.readability.score).toBeGreaterThanOrEqual(80);
      expect(result.issues).toHaveLength(0);
    });

    it('should successfully generate research synthesis quotation', async () => {
      const result = await runUserAcceptanceTest(
        'Research Synthesis',
        realCompanyTestScenarios.researchSynthesis
      );
      
      expect(result.passed).toBe(true);
      expect(result.company).toBe('Chemlab Synthesis');
      expect(result.templateType).toBe('technical');
      expect(result.brandAlignment.score).toBeGreaterThanOrEqual(75);
      expect(result.readability.score).toBeGreaterThanOrEqual(80);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle large orders with many items', async () => {
      const largeOrderData = {
        ...visualTestScenarios.largeOrder,
        company: mockCompanyChembio
      };
      
      const result = await runUserAcceptanceTest('Large Order Test', largeOrderData);
      
      expect(result.passed).toBe(true);
      expect(result.readability.itemsTableFormatted).toBe(true);
      expect(result.readability.professionalAppearance).toBe(true);
    });

    it('should handle special characters and international data', async () => {
      const specialCharData = {
        ...visualTestScenarios.specialCharacters,
        company: mockCompanyChemlabSynthesis
      };
      
      const result = await runUserAcceptanceTest('Special Characters Test', specialCharData);
      
      expect(result.passed).toBe(true);
      expect(result.readability.clientInfoReadable).toBe(true);
      expect(result.readability.itemsTableFormatted).toBe(true);
    });
  });

  describe('Template Selection and Generation', () => {
    it('should select correct template for each company', async () => {
      const chembioResult = await runUserAcceptanceTest(
        'Template Selection - Chembio',
        realCompanyTestScenarios.pharmaceuticalResearch
      );
      
      const pvtResult = await runUserAcceptanceTest(
        'Template Selection - Pvt Ltd',
        realCompanyTestScenarios.corporateManufacturing
      );
      
      const synthesisResult = await runUserAcceptanceTest(
        'Template Selection - Synthesis',
        realCompanyTestScenarios.researchSynthesis
      );
      
      expect(chembioResult.templateType).toBe('modern');
      expect(pvtResult.templateType).toBe('formal');
      expect(synthesisResult.templateType).toBe('technical');
      
      // All should pass template generation
      expect(chembioResult.passed).toBe(true);
      expect(pvtResult.passed).toBe(true);
      expect(synthesisResult.passed).toBe(true);
    });

    it('should generate templates without errors', async () => {
      const results = await Promise.all([
        runUserAcceptanceTest('Error Test - Chembio', realCompanyTestScenarios.pharmaceuticalResearch),
        runUserAcceptanceTest('Error Test - Pvt Ltd', realCompanyTestScenarios.corporateManufacturing),
        runUserAcceptanceTest('Error Test - Synthesis', realCompanyTestScenarios.researchSynthesis)
      ]);
      
      results.forEach(result => {
        expect(result.issues.filter(issue => issue.includes('Template generation failed'))).toHaveLength(0);
        expect(result.issues.filter(issue => issue.includes('execution failed'))).toHaveLength(0);
      });
    });
  });

  describe('Complete UAT Suite Results', () => {
    it('should have run all planned tests', () => {
      expect(uatResults.length).toBeGreaterThan(0);
      
      // Should have tests for all three companies
      const companies = [...new Set(uatResults.map(r => r.company))];
      expect(companies).toContain('Chembio Lifesciences');
      expect(companies).toContain('Chembio Lifesciences Pvt. Ltd.');
      expect(companies).toContain('Chemlab Synthesis');
    });

    it('should have acceptable overall pass rate', () => {
      const passedTests = uatResults.filter(r => r.passed).length;
      const totalTests = uatResults.length;
      const passRate = (passedTests / totalTests) * 100;
      
      expect(passRate).toBeGreaterThanOrEqual(80); // 80% minimum pass rate
    });

    it('should have acceptable brand alignment scores', () => {
      const avgBrandScore = uatResults.reduce((sum, r) => sum + r.brandAlignment.score, 0) / uatResults.length;
      expect(avgBrandScore).toBeGreaterThanOrEqual(75);
    });

    it('should have acceptable readability scores', () => {
      const avgReadabilityScore = uatResults.reduce((sum, r) => sum + r.readability.score, 0) / uatResults.length;
      expect(avgReadabilityScore).toBeGreaterThanOrEqual(80);
    });

    it('should meet all critical business requirements', () => {
      const allBusinessReqs = uatResults.flatMap(r => r.businessRequirements);
      const criticalReqs = allBusinessReqs.filter(req => 
        ['1.1', '1.2', '1.3'].includes(req.requirementId)
      );
      
      const metCriticalReqs = criticalReqs.filter(req => req.met);
      const criticalComplianceRate = (metCriticalReqs.length / criticalReqs.length) * 100;
      
      expect(criticalComplianceRate).toBeGreaterThanOrEqual(90); // 90% compliance for critical requirements
    });

    it('should generate comprehensive UAT report', () => {
      const report = generateUATReport(uatResults);
      
      expect(report).toContain('User Acceptance Testing Report');
      expect(report).toContain('Executive Summary');
      expect(report).toContain('Test Results by Company');
      expect(report).toContain('Business Requirements Compliance');
      expect(report).toContain('Chembio Lifesciences');
      expect(report).toContain('Chembio Lifesciences Pvt. Ltd.');
      expect(report).toContain('Chemlab Synthesis');
      
      // Report should include metrics
      expect(report).toMatch(/Total Tests.*\d+/);
      expect(report).toMatch(/Passed.*\d+/);
      expect(report).toMatch(/Average.*Score.*\d+\.\d+%/);
    });
  });

  describe('Stakeholder Review Validation', () => {
    it('should validate templates meet stakeholder expectations for brand differentiation', () => {
      // Test that each company template is visually distinct
      const chembioTests = uatResults.filter(r => r.company === 'Chembio Lifesciences');
      const pvtTests = uatResults.filter(r => r.company === 'Chembio Lifesciences Pvt. Ltd.');
      const synthesisTests = uatResults.filter(r => r.company === 'Chemlab Synthesis');
      
      // Each company should have distinct template types
      expect(chembioTests.every(t => t.templateType === 'modern')).toBe(true);
      expect(pvtTests.every(t => t.templateType === 'formal')).toBe(true);
      expect(synthesisTests.every(t => t.templateType === 'technical')).toBe(true);
      
      // Brand alignment should be strong for each company
      chembioTests.forEach(test => {
        expect(test.brandAlignment.visualIdentityDistinct).toBe(true);
      });
      pvtTests.forEach(test => {
        expect(test.brandAlignment.visualIdentityDistinct).toBe(true);
      });
      synthesisTests.forEach(test => {
        expect(test.brandAlignment.visualIdentityDistinct).toBe(true);
      });
    });

    it('should validate professional appearance meets business standards', () => {
      uatResults.forEach(result => {
        expect(result.readability.professionalAppearance).toBe(true);
        expect(result.readability.headerClear).toBe(true);
        expect(result.readability.clientInfoReadable).toBe(true);
      });
    });

    it('should validate templates support business workflows', () => {
      // Test that all required information is present and properly formatted
      uatResults.forEach(result => {
        expect(result.readability.itemsTableFormatted).toBe(true);
        expect(result.readability.termsVisible).toBe(true);
        
        // Business requirements should be met
        const unmetReqs = result.businessRequirements.filter(req => !req.met);
        expect(unmetReqs.length).toBe(0);
      });
    });
  });
});