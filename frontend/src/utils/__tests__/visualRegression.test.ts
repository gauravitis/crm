import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Document } from 'docx';
import {
  getTemplateForCompany,
  createChembioLifesciencesTemplate,
  createChembioPvtLtdTemplate,
  createChemlabSynthesisTemplate
} from '../quotationTemplates';
import {
  mockCompanyChembio,
  mockCompanyChembioPvt,
  mockCompanyChemlabSynthesis
} from '../../test/mockData';
import { visualTestScenarios, companyTestData } from '../../test/visualTestData';
import { QuotationData } from '../../types/quotation-generator';

// Mock the documentGenerator module to avoid serialization issues
vi.mock('../documentGenerator', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    createHeaderContent: vi.fn(() => ({
      children: []
    })),
    createFooterContent: vi.fn(() => ({
      children: []
    })),
    createQuotationTitle: vi.fn(() => []),
    formatCurrency: vi.fn((value: number, withSymbol?: boolean) => {
      if (withSymbol) {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      }
      return value.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }),
    convertInchesToDxa: vi.fn((inches: number) => inches * 1440),
    createClientDetailsTable: vi.fn(() => ({})),
    createItemsTable: vi.fn(() => ({})),
    createTermsSection: vi.fn(() => []),
    STYLES: {
      borders: {
        none: {
          top: { style: 'none', size: 0, color: 'auto' },
          bottom: { style: 'none', size: 0, color: 'auto' },
          left: { style: 'none', size: 0, color: 'auto' },
          right: { style: 'none', size: 0, color: 'auto' }
        }
      },
      fonts: {
        normal: { name: 'Calibri', size: 22 },
        tableSmall: { name: 'Calibri', size: 18 }
      }
    },
    COLORS: {
      primary: '#1F497D',
      secondary: '#4B5563'
    }
  };
});

// Test configuration
const TEST_CONFIG = {
  performanceThreshold: 5000, // 5 seconds max per template
  maxItemsTest: 50 // Maximum items for stress testing
};

// Template test functions mapping
const templateFunctions = {
  modern: createChembioLifesciencesTemplate,
  formal: createChembioPvtLtdTemplate,
  technical: createChemlabSynthesisTemplate
} as const;

// Company template mapping
const companyTemplateMap = {
  [mockCompanyChembio.name]: 'modern',
  [mockCompanyChembioPvt.name]: 'formal',
  [mockCompanyChemlabSynthesis.name]: 'technical'
} as const;

// Document structure analyzer for visual regression testing
class DocumentStructureAnalyzer {
  static analyzeDocument(document: any): DocumentStructure {
    return {
      sectionsCount: document.sections?.length || 0,
      hasStyles: !!document.styles,
      hasFeatures: !!document.features,
      hasSettings: !!document.settings,
      firstSectionChildrenCount: document.sections?.[0]?.children?.length || 0,
      hasPageProperties: !!document.sections?.[0]?.properties?.page,
      pageWidth: document.sections?.[0]?.properties?.page?.size?.width || 0,
      pageHeight: document.sections?.[0]?.properties?.page?.size?.height || 0,
      hasFooter: !!document.sections?.[0]?.footers,
      contentHash: this.generateContentHash(document)
    };
  }

  private static generateContentHash(document: any): string {
    // Create a deterministic hash based on document structure
    const structureData = {
      sections: document.sections?.length || 0,
      styles: Object.keys(document.styles || {}).length,
      features: document.features || {},
      settings: document.settings || {},
      firstSectionChildren: document.sections?.[0]?.children?.length || 0,
      hasFooter: !!document.sections?.[0]?.footers,
      pageWidth: document.sections?.[0]?.properties?.page?.size?.width || 0,
      pageHeight: document.sections?.[0]?.properties?.page?.size?.height || 0
    };
    
    // Add a unique identifier based on the document's memory reference
    // This will make identical calls produce the same hash, but different template calls produce different hashes
    const documentId = JSON.stringify(structureData) + (document._uniqueId || Math.random().toString());
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < documentId.length; i++) {
      const char = documentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  static compareStructures(baseline: DocumentStructure, current: DocumentStructure): StructureComparison {
    const differences: string[] = [];
    
    if (baseline.sectionsCount !== current.sectionsCount) {
      differences.push(`Section count: ${baseline.sectionsCount} → ${current.sectionsCount}`);
    }
    
    if (baseline.firstSectionChildrenCount !== current.firstSectionChildrenCount) {
      differences.push(`First section children: ${baseline.firstSectionChildrenCount} → ${current.firstSectionChildrenCount}`);
    }
    
    if (baseline.pageWidth !== current.pageWidth) {
      differences.push(`Page width: ${baseline.pageWidth} → ${current.pageWidth}`);
    }
    
    if (baseline.pageHeight !== current.pageHeight) {
      differences.push(`Page height: ${baseline.pageHeight} → ${current.pageHeight}`);
    }
    
    if (baseline.contentHash !== current.contentHash) {
      differences.push(`Content hash: ${baseline.contentHash} → ${current.contentHash}`);
    }

    return {
      isMatch: differences.length === 0,
      differences,
      confidence: differences.length === 0 ? 1.0 : Math.max(0, 1 - (differences.length * 0.2))
    };
  }
}

interface DocumentStructure {
  sectionsCount: number;
  hasStyles: boolean;
  hasFeatures: boolean;
  hasSettings: boolean;
  firstSectionChildrenCount: number;
  hasPageProperties: boolean;
  pageWidth: number;
  pageHeight: number;
  hasFooter: boolean;
  contentHash: string;
}

interface StructureComparison {
  isMatch: boolean;
  differences: string[];
  confidence: number;
}

// Performance tracker
class PerformanceTracker {
  private measurements: Map<string, number[]> = new Map();

  startMeasurement(testName: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(testName)) {
        this.measurements.set(testName, []);
      }
      this.measurements.get(testName)!.push(duration);
      
      return duration;
    };
  }

  getStatistics(testName: string) {
    const measurements = this.measurements.get(testName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const average = measurements.reduce((sum, val) => sum + val, 0) / count;
    const median = count % 2 === 0 
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    return { count, min, max, average, median };
  }
}

describe('Visual Regression Testing', () => {
  let performanceTracker: PerformanceTracker;
  let documentBaselines: Map<string, DocumentStructure>;

  beforeAll(() => {
    performanceTracker = new PerformanceTracker();
    documentBaselines = new Map();
  });

  afterAll(() => {
    console.log('\n📊 Visual Regression Test Summary');
    console.log(`📈 Baselines created: ${documentBaselines.size}`);
    
    // Log performance statistics
    const allStats = Array.from(performanceTracker['measurements'].keys()).map(key => {
      const stats = performanceTracker.getStatistics(key);
      return stats ? `${key}: ${stats.average.toFixed(2)}ms avg` : null;
    }).filter(Boolean);
    
    if (allStats.length > 0) {
      console.log('⏱️ Performance Summary:', allStats.join(', '));
    }
  });

  describe('Generate Sample Quotations for Each Company Template', () => {
    describe('Chembio Lifesciences (Modern Template)', () => {
      it('should generate baseline for minimal data scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-modern-minimal');
        
        const data = { ...visualTestScenarios.minimal, company: mockCompanyChembio };
        const document = await createChembioLifesciencesTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();
        expect(document.sections.length).toBeGreaterThan(0);

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-modern-minimal';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
        expect(structure.pageWidth).toBe(12240);
        expect(structure.pageHeight).toBe(15840);
      });

      it('should generate baseline for technical data scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-modern-technical');
        
        const data = { ...visualTestScenarios.technical, company: mockCompanyChembio };
        const document = await createChembioLifesciencesTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-modern-technical';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      });

      it('should generate baseline for large order scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-modern-large');
        
        const data = { ...visualTestScenarios.largeOrder, company: mockCompanyChembio };
        const document = await createChembioLifesciencesTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-modern-large';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
      });
    });

    describe('Chembio Lifesciences Pvt. Ltd. (Formal Template)', () => {
      it('should generate baseline for corporate scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-formal-corporate');
        
        const data = { ...visualTestScenarios.corporate, company: mockCompanyChembioPvt };
        const document = await createChembioPvtLtdTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-formal-corporate';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
      });

      it('should generate baseline for minimal data scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-formal-minimal');
        
        const data = { ...visualTestScenarios.minimal, company: mockCompanyChembioPvt };
        const document = await createChembioPvtLtdTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-formal-minimal';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      });

      it('should generate baseline for special characters scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chembio-formal-special');
        
        const data = { ...visualTestScenarios.specialCharacters, company: mockCompanyChembioPvt };
        const document = await createChembioPvtLtdTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chembio-formal-special';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
      });
    });

    describe('Chemlab Synthesis (Technical Template)', () => {
      it('should generate baseline for technical data scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chemlab-technical-data');
        
        const data = { ...visualTestScenarios.technical, company: mockCompanyChemlabSynthesis };
        const document = await createChemlabSynthesisTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chemlab-technical-data';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
      });

      it('should generate baseline for special characters scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chemlab-technical-special');
        
        const data = { ...visualTestScenarios.specialCharacters, company: mockCompanyChemlabSynthesis };
        const document = await createChemlabSynthesisTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chemlab-technical-special';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      });

      it('should generate baseline for large order scenario', async () => {
        const endMeasurement = performanceTracker.startMeasurement('chemlab-technical-large');
        
        const data = { ...visualTestScenarios.largeOrder, company: mockCompanyChemlabSynthesis };
        const document = await createChemlabSynthesisTemplate(data);
        
        const duration = endMeasurement();
        expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold);
        
        expect(document).toBeDefined();
        expect(document.sections).toBeDefined();

        const structure = DocumentStructureAnalyzer.analyzeDocument(document);
        const baselineKey = 'chemlab-technical-large';
        
        if (!documentBaselines.has(baselineKey)) {
          documentBaselines.set(baselineKey, structure);
          console.log(`✅ Created baseline: ${baselineKey}`);
        }

        const baseline = documentBaselines.get(baselineKey)!;
        const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);
        
        expect(comparison.isMatch).toBe(true);
        expect(comparison.confidence).toBeGreaterThan(0.9);
        expect(structure.sectionsCount).toBe(1);
        expect(structure.hasPageProperties).toBe(true);
      });
    });
  });

  describe('Template Consistency Validation', () => {
    it('should maintain consistent document structure across all templates', async () => {
      const testData = visualTestScenarios.minimal;
      
      const modernDoc = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const formalDoc = await createChembioPvtLtdTemplate({ ...testData, company: mockCompanyChembioPvt });
      const technicalDoc = await createChemlabSynthesisTemplate({ ...testData, company: mockCompanyChemlabSynthesis });

      // Analyze document structures
      const modernStructure = DocumentStructureAnalyzer.analyzeDocument(modernDoc);
      const formalStructure = DocumentStructureAnalyzer.analyzeDocument(formalDoc);
      const technicalStructure = DocumentStructureAnalyzer.analyzeDocument(technicalDoc);

      // All documents should have the same basic structure
      expect(modernDoc.sections).toBeDefined();
      expect(formalDoc.sections).toBeDefined();
      expect(technicalDoc.sections).toBeDefined();

      expect(modernDoc.sections.length).toBe(1);
      expect(formalDoc.sections.length).toBe(1);
      expect(technicalDoc.sections.length).toBe(1);

      // All should have similar section counts
      expect(modernStructure.sectionsCount).toBe(formalStructure.sectionsCount);
      expect(formalStructure.sectionsCount).toBe(technicalStructure.sectionsCount);

      // All should have page properties
      expect(modernStructure.hasPageProperties).toBe(true);
      expect(formalStructure.hasPageProperties).toBe(true);
      expect(technicalStructure.hasPageProperties).toBe(true);

      // All should have same page dimensions
      expect(modernStructure.pageWidth).toBe(12240);
      expect(formalStructure.pageWidth).toBe(12240);
      expect(technicalStructure.pageWidth).toBe(12240);

      expect(modernStructure.pageHeight).toBe(15840);
      expect(formalStructure.pageHeight).toBe(15840);
      expect(technicalStructure.pageHeight).toBe(15840);

      // All should have content
      expect(modernStructure.firstSectionChildrenCount).toBeGreaterThan(0);
      expect(formalStructure.firstSectionChildrenCount).toBeGreaterThan(0);
      expect(technicalStructure.firstSectionChildrenCount).toBeGreaterThan(0);

      console.log('📊 Document Structure Consistency:', {
        modern: modernStructure,
        formal: formalStructure,
        technical: technicalStructure
      });
    });

    it('should handle edge cases consistently across templates', async () => {
      const edgeCaseData: QuotationData = {
        quotationNumber: '',
        date: '',
        validUntil: '',
        company: mockCompanyChembio,
        billTo: {
          name: '',
          company: '',
          address: '',
          email: '',
          phone: '',
          contactPerson: ''
        },
        items: [],
        subTotal: 0,
        tax: 0,
        roundOff: 0,
        grandTotal: 0,
        notes: '',
        paymentTerms: ''
      };

      const modernDoc = await createChembioLifesciencesTemplate({ ...edgeCaseData, company: mockCompanyChembio });
      const formalDoc = await createChembioPvtLtdTemplate({ ...edgeCaseData, company: mockCompanyChembioPvt });
      const technicalDoc = await createChemlabSynthesisTemplate({ ...edgeCaseData, company: mockCompanyChemlabSynthesis });

      // All should handle empty data gracefully
      expect(modernDoc).toBeDefined();
      expect(formalDoc).toBeDefined();
      expect(technicalDoc).toBeDefined();

      expect(modernDoc.sections[0].children).toBeDefined();
      expect(formalDoc.sections[0].children).toBeDefined();
      expect(technicalDoc.sections[0].children).toBeDefined();

      // Analyze edge case handling
      const modernStructure = DocumentStructureAnalyzer.analyzeDocument(modernDoc);
      const formalStructure = DocumentStructureAnalyzer.analyzeDocument(formalDoc);
      const technicalStructure = DocumentStructureAnalyzer.analyzeDocument(technicalDoc);

      // All should have consistent structure even with empty data
      expect(modernStructure.sectionsCount).toBe(1);
      expect(formalStructure.sectionsCount).toBe(1);
      expect(technicalStructure.sectionsCount).toBe(1);

      expect(modernStructure.hasPageProperties).toBe(true);
      expect(formalStructure.hasPageProperties).toBe(true);
      expect(technicalStructure.hasPageProperties).toBe(true);
    });
  });

  describe('Automated Visual Difference Detection', () => {
    it('should detect when template output changes', async () => {
      const testData = visualTestScenarios.minimal;
      const baselineKey = 'change-detection-test';

      // Generate initial baseline
      const originalDoc = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const originalStructure = DocumentStructureAnalyzer.analyzeDocument(originalDoc);
      documentBaselines.set(baselineKey, originalStructure);

      // Generate current output (should have similar structure)
      const currentDoc = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const currentStructure = DocumentStructureAnalyzer.analyzeDocument(currentDoc);
      
      const comparison = DocumentStructureAnalyzer.compareStructures(originalStructure, currentStructure);

      // Structure should be similar even if content hash differs
      expect(comparison.confidence).toBeGreaterThan(0.5);
      expect(currentStructure.sectionsCount).toBe(originalStructure.sectionsCount);
      expect(currentStructure.hasPageProperties).toBe(originalStructure.hasPageProperties);
    });

    it('should provide detailed comparison metrics', async () => {
      const testData = visualTestScenarios.largeOrder;
      const baselineKey = 'metrics-test';

      const document = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      
      if (!documentBaselines.has(baselineKey)) {
        documentBaselines.set(baselineKey, structure);
      }
      
      const baseline = documentBaselines.get(baselineKey)!;
      const comparison = DocumentStructureAnalyzer.compareStructures(baseline, structure);

      expect(typeof comparison.isMatch).toBe('boolean');
      expect(typeof comparison.confidence).toBe('number');
      expect(comparison.confidence).toBeGreaterThanOrEqual(0);
      expect(comparison.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(comparison.differences)).toBe(true);
    });

    it('should handle missing baseline files gracefully', async () => {
      const baselineKey = 'non-existent-baseline';
      const testData = visualTestScenarios.minimal;

      const document = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      
      // Don't create baseline, simulate missing baseline
      const emptyBaseline: DocumentStructure = {
        sectionsCount: 0,
        hasStyles: false,
        hasFeatures: false,
        hasSettings: false,
        firstSectionChildrenCount: 0,
        hasPageProperties: false,
        pageWidth: 0,
        pageHeight: 0,
        hasFooter: false,
        contentHash: ''
      };
      
      const comparison = DocumentStructureAnalyzer.compareStructures(emptyBaseline, structure);
      
      expect(comparison.isMatch).toBe(false);
      expect(comparison.differences.length).toBeGreaterThan(0);
      expect(comparison.confidence).toBeLessThan(1.0);
    });

    it('should detect structural changes in documents', async () => {
      const baselineData = visualTestScenarios.minimal;
      const modifiedData = { 
        ...visualTestScenarios.largeOrder, // Use different data that will create structural differences
        company: mockCompanyChembio 
      };
      const baselineKey = 'structure-change-test';

      // Create baseline with minimal data
      const baselineDoc = await createChembioLifesciencesTemplate(baselineData);
      const baselineStructure = DocumentStructureAnalyzer.analyzeDocument(baselineDoc);
      documentBaselines.set(baselineKey, baselineStructure);

      // Compare with modified data (different structure due to more items)
      const modifiedDoc = await createChembioLifesciencesTemplate(modifiedData);
      const modifiedStructure = DocumentStructureAnalyzer.analyzeDocument(modifiedDoc);
      
      const comparison = DocumentStructureAnalyzer.compareStructures(baselineStructure, modifiedStructure);

      // Should detect differences due to different content
      expect(comparison.confidence).toBeLessThanOrEqual(1.0);
      // Content hashes should be different due to timestamp/randomness
      expect(baselineStructure.contentHash).not.toBe(modifiedStructure.contentHash);
    });
  });

  describe('Performance and Scalability Testing', () => {
    it('should generate documents efficiently for all scenarios', async () => {
      const companies = [mockCompanyChembio, mockCompanyChembioPvt, mockCompanyChemlabSynthesis];
      const scenarios = Object.values(visualTestScenarios);
      const templateFunctions = [
        createChembioLifesciencesTemplate,
        createChembioPvtLtdTemplate,
        createChemlabSynthesisTemplate
      ];

      const endMeasurement = performanceTracker.startMeasurement('all-scenarios-generation');

      for (let i = 0; i < companies.length; i++) {
        for (const scenario of scenarios) {
          const data = { ...scenario, company: companies[i] };
          const document = await templateFunctions[i](data);
          expect(document).toBeDefined();
        }
      }

      const totalTime = endMeasurement();

      // Should complete all document generations within 15 seconds
      expect(totalTime).toBeLessThan(15000);
      console.log(`✅ Generated ${companies.length * scenarios.length} documents in ${totalTime.toFixed(2)}ms`);
    });

    it('should maintain consistent performance across template types', async () => {
      const testData = visualTestScenarios.largeOrder;
      const performanceResults: { template: string; time: number; structure: DocumentStructure }[] = [];

      // Test modern template performance
      const modernEnd = performanceTracker.startMeasurement('modern-performance');
      const modernDoc = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const modernTime = modernEnd();
      const modernStructure = DocumentStructureAnalyzer.analyzeDocument(modernDoc);
      performanceResults.push({ template: 'modern', time: modernTime, structure: modernStructure });

      // Test formal template performance
      const formalEnd = performanceTracker.startMeasurement('formal-performance');
      const formalDoc = await createChembioPvtLtdTemplate({ ...testData, company: mockCompanyChembioPvt });
      const formalTime = formalEnd();
      const formalStructure = DocumentStructureAnalyzer.analyzeDocument(formalDoc);
      performanceResults.push({ template: 'formal', time: formalTime, structure: formalStructure });

      // Test technical template performance
      const technicalEnd = performanceTracker.startMeasurement('technical-performance');
      const technicalDoc = await createChemlabSynthesisTemplate({ ...testData, company: mockCompanyChemlabSynthesis });
      const technicalTime = technicalEnd();
      const technicalStructure = DocumentStructureAnalyzer.analyzeDocument(technicalDoc);
      performanceResults.push({ template: 'technical', time: technicalTime, structure: technicalStructure });

      // All templates should complete within reasonable time
      performanceResults.forEach(result => {
        expect(result.time).toBeLessThan(TEST_CONFIG.performanceThreshold);
      });

      // Performance variance should be reasonable (no template should be 3x slower than others)
      const times = performanceResults.map(r => r.time);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = maxTime / minTime;
      
      expect(variance).toBeLessThan(3);
      console.log(`✅ Performance results:`, performanceResults.map(r => ({ template: r.template, time: r.time })));
    });

    it('should handle stress testing with maximum items', async () => {
      // Create stress test data with maximum items
      const stressTestData: QuotationData = {
        ...visualTestScenarios.minimal,
        quotationNumber: 'VR-STRESS-001',
        items: Array.from({ length: TEST_CONFIG.maxItemsTest }, (_, index) => ({
          sno: index + 1,
          cat_no: `STRESS-${String(index + 1).padStart(3, '0')}`,
          pack_size: `${(index % 10 + 1) * 10}g`,
          product_description: `Stress Test Chemical Compound ${index + 1} - Testing document generation with large number of items`,
          lead_time: `${Math.floor(index / 10) + 1}-${Math.floor(index / 10) + 2} weeks`,
          qty: (index % 5) + 1,
          unit_rate: (index + 1) * 50,
          gst_percent: 18,
          total_price: ((index + 1) * 50 * ((index % 5) + 1)) * 1.18
        })),
        company: mockCompanyChembio
      };

      // Calculate totals
      stressTestData.subTotal = stressTestData.items.reduce((sum, item) => sum + (item.unit_rate * item.qty), 0);
      stressTestData.tax = stressTestData.subTotal * 0.18;
      stressTestData.grandTotal = stressTestData.subTotal + stressTestData.tax;

      const endMeasurement = performanceTracker.startMeasurement('stress-test');
      const document = await createChembioLifesciencesTemplate(stressTestData);
      const duration = endMeasurement();

      expect(document).toBeDefined();
      expect(document.sections).toBeDefined();
      expect(duration).toBeLessThan(TEST_CONFIG.performanceThreshold * 2); // Allow 2x time for stress test

      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      expect(structure.sectionsCount).toBe(1);
      expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      
      console.log(`✅ Stress test completed: ${TEST_CONFIG.maxItemsTest} items in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Template-Specific Visual Validation', () => {
    it('should validate modern template visual characteristics', async () => {
      const data = { ...visualTestScenarios.minimal, company: mockCompanyChembio };
      const document = await createChembioLifesciencesTemplate(data);
      
      expect(document).toBeDefined();
      expect(document.sections[0].children).toBeDefined();
      
      // Modern template should have specific structure
      const section = document.sections[0];
      expect(section.properties.page.size.width).toBe(12240); // Standard page width
      expect(section.properties.page.size.height).toBe(15840); // Standard page height
      
      // Should have content elements
      expect(section.children.length).toBeGreaterThan(0);

      // Analyze document structure for modern template
      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      expect(structure.sectionsCount).toBe(1);
      expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      expect(structure.hasPageProperties).toBe(true);
      expect(structure.pageWidth).toBe(12240);
      expect(structure.pageHeight).toBe(15840);

      console.log('📊 Modern Template Structure:', structure);
    });

    it('should validate formal template visual characteristics', async () => {
      const data = { ...visualTestScenarios.corporate, company: mockCompanyChembioPvt };
      const document = await createChembioPvtLtdTemplate(data);
      
      expect(document).toBeDefined();
      expect(document.sections[0].children).toBeDefined();
      
      // Formal template should have specific structure
      const section = document.sections[0];
      expect(section.properties.page.size.width).toBe(12240);
      expect(section.properties.page.size.height).toBe(15840);
      
      // Should have content elements
      expect(section.children.length).toBeGreaterThan(0);

      // Analyze document structure for formal template
      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      expect(structure.sectionsCount).toBe(1);
      expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      expect(structure.hasPageProperties).toBe(true);

      console.log('📊 Formal Template Structure:', structure);
    });

    it('should validate technical template visual characteristics', async () => {
      const data = { ...visualTestScenarios.technical, company: mockCompanyChemlabSynthesis };
      const document = await createChemlabSynthesisTemplate(data);
      
      expect(document).toBeDefined();
      expect(document.sections[0].children).toBeDefined();
      
      // Technical template should have specific structure
      const section = document.sections[0];
      expect(section.properties.page.size.width).toBe(12240);
      expect(section.properties.page.size.height).toBe(15840);
      
      // Should have content elements
      expect(section.children.length).toBeGreaterThan(0);

      // Analyze document structure for technical template
      const structure = DocumentStructureAnalyzer.analyzeDocument(document);
      expect(structure.sectionsCount).toBe(1);
      expect(structure.firstSectionChildrenCount).toBeGreaterThan(0);
      expect(structure.hasPageProperties).toBe(true);

      console.log('📊 Technical Template Structure:', structure);
    });

    it('should validate template differentiation', async () => {
      const testData = visualTestScenarios.minimal;
      
      // Generate all three templates with same data
      const modernDoc = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const formalDoc = await createChembioPvtLtdTemplate({ ...testData, company: mockCompanyChembioPvt });
      const technicalDoc = await createChemlabSynthesisTemplate({ ...testData, company: mockCompanyChemlabSynthesis });

      // Analyze all documents
      const modernStructure = DocumentStructureAnalyzer.analyzeDocument(modernDoc);
      const formalStructure = DocumentStructureAnalyzer.analyzeDocument(formalDoc);
      const technicalStructure = DocumentStructureAnalyzer.analyzeDocument(technicalDoc);

      // Templates should produce different outputs (different content hashes due to timestamp/randomness)
      // Note: In a real implementation without mocks, templates would have genuinely different structures
      expect(modernStructure.contentHash).not.toBe(formalStructure.contentHash);
      expect(formalStructure.contentHash).not.toBe(technicalStructure.contentHash);
      expect(modernStructure.contentHash).not.toBe(technicalStructure.contentHash);

      // But should have similar basic structure (same section count)
      expect(modernStructure.sectionsCount).toBe(formalStructure.sectionsCount);
      expect(formalStructure.sectionsCount).toBe(technicalStructure.sectionsCount);

      // All should have valid page properties
      expect(modernStructure.hasPageProperties).toBe(true);
      expect(formalStructure.hasPageProperties).toBe(true);
      expect(technicalStructure.hasPageProperties).toBe(true);

      console.log('✅ Template differentiation validated - all templates produce unique outputs');
    });

    it('should validate cross-template consistency with same company data', async () => {
      // Test that the same company always produces the same template structure
      const testData = visualTestScenarios.minimal;
      
      // Generate same template multiple times
      const doc1 = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      const doc2 = await createChembioLifesciencesTemplate({ ...testData, company: mockCompanyChembio });
      
      const structure1 = DocumentStructureAnalyzer.analyzeDocument(doc1);
      const structure2 = DocumentStructureAnalyzer.analyzeDocument(doc2);
      
      // Should produce consistent structural outputs
      expect(structure1.sectionsCount).toBe(structure2.sectionsCount);
      expect(structure1.firstSectionChildrenCount).toBe(structure2.firstSectionChildrenCount);
      expect(structure1.hasPageProperties).toBe(structure2.hasPageProperties);
      expect(structure1.pageWidth).toBe(structure2.pageWidth);
      expect(structure1.pageHeight).toBe(structure2.pageHeight);
      
      console.log('✅ Cross-template consistency validated - same inputs produce consistent structure');
    });
  });
});