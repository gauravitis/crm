import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  runCompleteUATSuite,
  generateUATReport,
  realCompanyTestScenarios
} from '../../test/userAcceptanceTest';

/**
 * Test to generate UAT samples and reports for stakeholder review
 * This implements task 6.4: Generate test quotations with real company data
 */

describe('UAT Sample Generation', () => {
  it('should generate comprehensive UAT report and samples for stakeholder review', async () => {
    console.log('🚀 Starting User Acceptance Testing Sample Generation...\n');

    // Create output directory
    const outputDir = join(process.cwd(), 'uat-samples');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Run complete UAT suite
    console.log('🧪 Running Complete User Acceptance Testing Suite...\n');
    const results = await runCompleteUATSuite();
    
    expect(results.length).toBeGreaterThan(0);
    console.log(`📊 UAT Suite completed with ${results.length} tests\n`);
    
    // Generate comprehensive report
    const report = generateUATReport(results);
    expect(report).toContain('User Acceptance Testing Report');
    
    // Save report to file
    writeFileSync(join(outputDir, 'uat-comprehensive-report.md'), report);
    console.log('📋 Comprehensive UAT report saved: uat-comprehensive-report.md\n');
    
    // Generate summary statistics
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const passRate = (passedTests / totalTests) * 100;
    
    const avgBrandScore = results.reduce((sum, r) => sum + r.brandAlignment.score, 0) / totalTests;
    const avgReadabilityScore = results.reduce((sum, r) => sum + r.readability.score, 0) / totalTests;
    
    console.log('📈 UAT Results Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} (${passRate.toFixed(1)}%)`);
    console.log(`   Failed: ${totalTests - passedTests} (${(100 - passRate).toFixed(1)}%)`);
    console.log(`   Average Brand Alignment Score: ${avgBrandScore.toFixed(1)}%`);
    console.log(`   Average Readability Score: ${avgReadabilityScore.toFixed(1)}%\n`);
    
    // Validate results meet acceptance criteria
    expect(passRate).toBeGreaterThanOrEqual(80); // 80% minimum pass rate
    expect(avgBrandScore).toBeGreaterThanOrEqual(75); // 75% minimum brand alignment
    expect(avgReadabilityScore).toBeGreaterThanOrEqual(80); // 80% minimum readability
    
    // Generate sample quotation summaries for stakeholder review
    console.log('📄 Generating sample quotation summaries...\n');
    
    const samples = [
      {
        filename: 'chembio-pharmaceutical-research-summary.md',
        company: 'Chembio Lifesciences',
        scenario: 'Pharmaceutical Research Lab',
        data: realCompanyTestScenarios.pharmaceuticalResearch
      },
      {
        filename: 'chembio-pvt-corporate-manufacturing-summary.md',
        company: 'Chembio Lifesciences Pvt. Ltd.',
        scenario: 'Corporate Manufacturing',
        data: realCompanyTestScenarios.corporateManufacturing
      },
      {
        filename: 'chemlab-research-synthesis-summary.md',
        company: 'Chemlab Synthesis',
        scenario: 'Research Laboratory Synthesis',
        data: realCompanyTestScenarios.researchSynthesis
      }
    ];

    for (const sample of samples) {
      const summaryContent = generateQuotationSummary(sample.data, sample.company, sample.scenario);
      writeFileSync(join(outputDir, sample.filename), summaryContent);
      console.log(`   📋 Summary saved: ${sample.filename}`);
    }
    
    // Generate stakeholder review guide
    const reviewGuide = generateStakeholderReviewGuide();
    writeFileSync(join(outputDir, 'stakeholder-review-guide.md'), reviewGuide);
    console.log('   📋 Review guide saved: stakeholder-review-guide.md');
    
    // Generate feedback form
    const feedbackForm = generateStakeholderFeedbackForm();
    writeFileSync(join(outputDir, 'stakeholder-feedback-form.md'), feedbackForm);
    console.log('   📋 Feedback form saved: stakeholder-feedback-form.md\n');
    
    // Business requirements compliance check
    const allBusinessReqs = results.flatMap(r => r.businessRequirements);
    const reqGroups = allBusinessReqs.reduce((acc, req) => {
      if (!acc[req.requirementId]) {
        acc[req.requirementId] = { total: 0, met: 0 };
      }
      acc[req.requirementId].total++;
      if (req.met) acc[req.requirementId].met++;
      return acc;
    }, {} as Record<string, { total: number; met: number }>);
    
    console.log('📋 Business Requirements Compliance:');
    for (const [reqId, reqData] of Object.entries(reqGroups)) {
      const compliance = (reqData.met / reqData.total) * 100;
      console.log(`   Requirement ${reqId}: ${compliance.toFixed(1)}% (${reqData.met}/${reqData.total})`);
      
      // Critical requirements should have 100% compliance
      if (['1.1', '1.2', '1.3'].includes(reqId)) {
        expect(compliance).toBe(100);
      }
    }
    console.log('');
    
    console.log('🎉 User Acceptance Testing completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Generated ${samples.length} sample quotation summaries`);
    console.log(`   - Executed ${results.length} comprehensive tests`);
    console.log('   - Created stakeholder review package');
    console.log('   - Validated business requirements compliance');
    console.log('');
    console.log('📁 All files saved to: ./uat-samples/');
    console.log('');
    console.log('✅ Task 6.4 "Perform user acceptance testing" completed successfully!');
  }, 30000); // 30 second timeout for comprehensive testing
});

/**
 * Generate a markdown summary for stakeholder review
 */
function generateQuotationSummary(data: any, company: string, scenario: string): string {
  return `# Quotation Summary - ${company}

## Scenario: ${scenario}

### Document Details
- **Quotation Number**: ${data.quotationNumber}
- **Date**: ${data.date}
- **Valid Until**: ${data.validUntil}
- **Template Type**: ${data.company.templateConfig?.templateType || 'Unknown'}

### Company Information
- **Name**: ${data.company.name}
- **Legal Name**: ${data.company.legalName}
- **Address**: ${data.company.address?.street}, ${data.company.address?.city}, ${data.company.address?.state} - ${data.company.address?.postalCode}
- **Contact**: ${data.company.contactInfo?.email} | ${data.company.contactInfo?.phone}
- **Tax Info**: PAN: ${data.company.taxInfo?.pan} | GST: ${data.company.taxInfo?.gst}

### Client Information
- **Contact Person**: ${data.billTo.contactPerson || data.billTo.name}
- **Company**: ${data.billTo.company}
- **Address**: ${data.billTo.address}
- **Email**: ${data.billTo.email}
- **Phone**: ${data.billTo.phone}

### Items Summary
- **Total Items**: ${data.items.length}
- **Sub Total**: ₹${data.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- **Tax**: ₹${data.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- **Grand Total**: ₹${data.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

### Items Details
${data.items.map((item: any) => `
#### Item ${item.sno}: ${item.cat_no}
- **Pack Size**: ${item.pack_size}
- **Description**: ${item.product_description}
- **Lead Time**: ${item.lead_time}
- **Quantity**: ${item.qty}
- **Unit Rate**: ₹${item.unit_rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- **GST**: ${item.gst_percent}%
- **Total**: ₹${item.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${item.hsn_code ? `- **HSN Code**: ${item.hsn_code}` : ''}
`).join('')}

### Template Configuration
- **Layout**: ${data.company.templateConfig?.layout}
- **Header Style**: ${data.company.templateConfig?.headerStyle}
- **Table Style**: ${data.company.templateConfig?.tableStyle}
- **Primary Color**: ${data.company.templateConfig?.colorScheme?.primary}
- **Secondary Color**: ${data.company.templateConfig?.colorScheme?.secondary}
- **Emphasized Fields**: ${data.company.templateConfig?.customizations?.emphasizeFields?.join(', ')}

### Business Context
- **Payment Terms**: ${data.paymentTerms}
- **Notes**: ${data.notes}

### Stakeholder Review Checklist

#### Brand Alignment ✅
- [ ] Company colors are correctly applied
- [ ] Typography matches brand guidelines
- [ ] Layout reflects company positioning
- [ ] Visual identity is distinct from other companies

#### Document Readability ✅
- [ ] Header information is clear and professional
- [ ] Client details are well-organized and readable
- [ ] Items table is properly formatted and easy to scan
- [ ] Terms and conditions are visible and clear
- [ ] Overall appearance is professional

#### Business Requirements ✅
- [ ] Template matches company's target market
- [ ] Emphasized information aligns with business focus
- [ ] Document supports sales workflow
- [ ] Information hierarchy is appropriate

#### Technical Validation ✅
- [ ] All required information is present
- [ ] Calculations are correct
- [ ] Formatting is consistent
- [ ] Document can be generated without errors

### Feedback Section
**Brand Alignment Score**: ___/10
**Readability Score**: ___/10
**Business Fit Score**: ___/10
**Overall Satisfaction**: ___/10

**Comments**:
_Please provide feedback on the template design, layout, and business alignment_

---
*Generated on ${new Date().toISOString()} for User Acceptance Testing*
`;
}

/**
 * Generate stakeholder review guide
 */
function generateStakeholderReviewGuide(): string {
  return `# Stakeholder Review Guide
## Company-Specific Quotation Templates

### Purpose
This package contains sample quotations generated for each company template to validate:
- Brand alignment and visual identity
- Document readability and professional appearance
- Business requirement compliance
- User experience and workflow support

### Review Process

#### 1. Brand Alignment Review
For each company template, please evaluate:
- **Color Scheme**: Does the template use appropriate brand colors?
- **Typography**: Is the font selection professional and readable?
- **Layout**: Does the design reflect the company's market positioning?
- **Visual Identity**: Can you immediately identify which company created the quotation?

#### 2. Document Readability Review
Please assess:
- **Header Clarity**: Is company information clear and professional?
- **Client Information**: Is the bill-to section well-organized?
- **Items Table**: Is the product information easy to scan and understand?
- **Terms & Conditions**: Are payment terms and notes clearly visible?
- **Overall Appearance**: Does the document look professional and trustworthy?

#### 3. Business Requirements Review
Validate that each template meets its intended business focus:

**Chembio Lifesciences (Modern Template)**:
- Emphasizes product specifications and lead times
- Appeals to research laboratories and academic institutions
- Modern, approachable design

**Chembio Lifesciences Pvt. Ltd. (Formal Template)**:
- Emphasizes compliance and corporate credibility
- Appeals to pharmaceutical manufacturers and large corporations
- Traditional, formal business appearance

**Chemlab Synthesis (Technical Template)**:
- Emphasizes technical specifications and research applications
- Appeals to research chemists and synthesis laboratories
- Data-focused, scientific presentation

### Files in This Package

#### Sample Quotations
- \`chembio-pharmaceutical-research-summary.md\` - Modern template sample
- \`chembio-pvt-corporate-manufacturing-summary.md\` - Formal template sample
- \`chemlab-research-synthesis-summary.md\` - Technical template sample

#### Test Reports
- \`uat-comprehensive-report.md\` - Complete testing results and analysis
- \`stakeholder-feedback-form.md\` - Feedback collection form

### Feedback Collection
Please complete the stakeholder feedback form for each template and return your comments.

### Next Steps
Based on your feedback, we will:
1. Address any identified issues
2. Make necessary template adjustments
3. Conduct final validation testing
4. Prepare for production deployment

---
*Generated on ${new Date().toISOString()}*
`;
}

/**
 * Generate stakeholder feedback form
 */
function generateStakeholderFeedbackForm(): string {
  return `# Stakeholder Feedback Form
## Company-Specific Quotation Templates

### Reviewer Information
- **Name**: ___________________
- **Role**: ___________________
- **Company**: ___________________
- **Date**: ___________________

### Template Reviews

#### Chembio Lifesciences (Modern Template)
**Brand Alignment** (1-10): ___
**Readability** (1-10): ___
**Business Fit** (1-10): ___
**Overall Satisfaction** (1-10): ___

**Comments**:
_________________________________________________
_________________________________________________
_________________________________________________

**Specific Issues or Suggestions**:
_________________________________________________
_________________________________________________

#### Chembio Lifesciences Pvt. Ltd. (Formal Template)
**Brand Alignment** (1-10): ___
**Readability** (1-10): ___
**Business Fit** (1-10): ___
**Overall Satisfaction** (1-10): ___

**Comments**:
_________________________________________________
_________________________________________________
_________________________________________________

**Specific Issues or Suggestions**:
_________________________________________________
_________________________________________________

#### Chemlab Synthesis (Technical Template)
**Brand Alignment** (1-10): ___
**Readability** (1-10): ___
**Business Fit** (1-10): ___
**Overall Satisfaction** (1-10): ___

**Comments**:
_________________________________________________
_________________________________________________
_________________________________________________

**Specific Issues or Suggestions**:
_________________________________________________
_________________________________________________

### Overall Assessment

#### Template Differentiation
Can you easily distinguish between the three company templates? **Yes / No**

If no, what improvements would help?
_________________________________________________
_________________________________________________

#### Business Impact
Do these templates better represent each company's brand and target market compared to the previous single template? **Yes / No**

Comments:
_________________________________________________
_________________________________________________

#### Implementation Readiness
Are these templates ready for production use? **Yes / No / With modifications**

If modifications needed, please specify:
_________________________________________________
_________________________________________________

### Priority Issues
List any critical issues that must be addressed before deployment:
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Additional Comments
_________________________________________________
_________________________________________________
_________________________________________________

---
**Please return completed form to the development team**
`;
}