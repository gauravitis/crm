import { Document, Packer } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface DocumentMetrics {
  fileSize: number;
  contentHash: string;
  structureHash: string;
  pageCount: number;
  sectionCount: number;
  elementCount: number;
}

export interface VisualComparisonResult {
  isMatch: boolean;
  confidence: number; // 0-1 scale
  differences: string[];
  metrics: {
    baseline: DocumentMetrics;
    current: DocumentMetrics;
  };
  recommendation: string;
}

export class DocumentAnalyzer {
  /**
   * Analyzes a document and extracts metrics for comparison
   */
  static async analyzeDocument(document: Document): Promise<DocumentMetrics> {
    const buffer = await Packer.toBuffer(document);
    
    // Calculate file size
    const fileSize = buffer.length;
    
    // Calculate content hash (for exact content comparison)
    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // Calculate structure hash (for layout comparison)
    const structureData = JSON.stringify({
      sections: document.sections?.length || 0,
      styles: Object.keys(document.styles || {}).length,
      features: document.features || {}
    });
    const structureHash = crypto.createHash('md5').update(structureData).digest('hex');
    
    // Count elements
    const sectionCount = document.sections?.length || 0;
    let elementCount = 0;
    
    if (document.sections) {
      document.sections.forEach(section => {
        if (section.children) {
          elementCount += section.children.length;
        }
      });
    }
    
    return {
      fileSize,
      contentHash,
      structureHash,
      pageCount: 1, // Default for single-section documents
      sectionCount,
      elementCount
    };
  }

  /**
   * Compares two documents and provides detailed analysis
   */
  static async compareDocuments(
    baselineDoc: Document,
    currentDoc: Document,
    tolerance: number = 0.05
  ): Promise<VisualComparisonResult> {
    const baselineMetrics = await this.analyzeDocument(baselineDoc);
    const currentMetrics = await this.analyzeDocument(currentDoc);
    
    const differences: string[] = [];
    let matchScore = 1.0;
    
    // Compare content hashes (exact match)
    if (baselineMetrics.contentHash === currentMetrics.contentHash) {
      return {
        isMatch: true,
        confidence: 1.0,
        differences: [],
        metrics: { baseline: baselineMetrics, current: currentMetrics },
        recommendation: 'Documents are identical'
      };
    }
    
    // Compare structure hashes
    if (baselineMetrics.structureHash !== currentMetrics.structureHash) {
      differences.push('Document structure has changed');
      matchScore -= 0.3;
    }
    
    // Compare file sizes
    const sizeDifference = Math.abs(baselineMetrics.fileSize - currentMetrics.fileSize);
    const sizeThreshold = baselineMetrics.fileSize * tolerance;
    
    if (sizeDifference > sizeThreshold) {
      differences.push(`File size difference: ${sizeDifference} bytes (threshold: ${sizeThreshold})`);
      matchScore -= 0.2;
    }
    
    // Compare section counts
    if (baselineMetrics.sectionCount !== currentMetrics.sectionCount) {
      differences.push(`Section count changed: ${baselineMetrics.sectionCount} → ${currentMetrics.sectionCount}`);
      matchScore -= 0.2;
    }
    
    // Compare element counts
    const elementDifference = Math.abs(baselineMetrics.elementCount - currentMetrics.elementCount);
    const elementThreshold = Math.max(baselineMetrics.elementCount * tolerance, 1);
    
    if (elementDifference > elementThreshold) {
      differences.push(`Element count difference: ${elementDifference} (threshold: ${elementThreshold})`);
      matchScore -= 0.3;
    }
    
    const isMatch = matchScore >= 0.7 && differences.length === 0;
    const confidence = Math.max(0, matchScore);
    
    let recommendation: string;
    if (isMatch) {
      recommendation = 'Documents match within acceptable tolerance';
    } else if (confidence >= 0.5) {
      recommendation = 'Documents have minor differences - review recommended';
    } else {
      recommendation = 'Documents have significant differences - investigation required';
    }
    
    return {
      isMatch,
      confidence,
      differences,
      metrics: { baseline: baselineMetrics, current: currentMetrics },
      recommendation
    };
  }
}

export class VisualBaselineManager {
  private baselineDir: string;
  private outputDir: string;
  private metricsDir: string;

  constructor(testName: string = 'default') {
    const baseDir = path.join(process.cwd(), 'frontend/src/test/visual-regression');
    this.baselineDir = path.join(baseDir, 'baselines', testName);
    this.outputDir = path.join(baseDir, 'output', testName);
    this.metricsDir = path.join(baseDir, 'metrics', testName);
  }

  ensureDirectories(): void {
    [this.baselineDir, this.outputDir, this.metricsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async saveBaseline(document: Document, filename: string): Promise<void> {
    const buffer = await Packer.toBuffer(document);
    const filePath = path.join(this.baselineDir, `${filename}.docx`);
    fs.writeFileSync(filePath, buffer);
    
    // Save metrics
    const metrics = await DocumentAnalyzer.analyzeDocument(document);
    const metricsPath = path.join(this.metricsDir, `${filename}-baseline.json`);
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  }

  async saveOutput(document: Document, filename: string): Promise<void> {
    const buffer = await Packer.toBuffer(document);
    const filePath = path.join(this.outputDir, `${filename}.docx`);
    fs.writeFileSync(filePath, buffer);
    
    // Save metrics
    const metrics = await DocumentAnalyzer.analyzeDocument(document);
    const metricsPath = path.join(this.metricsDir, `${filename}-current.json`);
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  }

  baselineExists(filename: string): boolean {
    const filePath = path.join(this.baselineDir, `${filename}.docx`);
    return fs.existsSync(filePath);
  }

  async loadBaseline(filename: string): Promise<Buffer | null> {
    const filePath = path.join(this.baselineDir, `${filename}.docx`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath);
  }

  async compareWithBaseline(
    currentDoc: Document,
    filename: string,
    tolerance: number = 0.05
  ): Promise<VisualComparisonResult> {
    const baselineBuffer = await this.loadBaseline(filename);
    
    if (!baselineBuffer) {
      const currentMetrics = await DocumentAnalyzer.analyzeDocument(currentDoc);
      return {
        isMatch: false,
        confidence: 0,
        differences: ['Baseline does not exist'],
        metrics: {
          baseline: {
            fileSize: 0,
            contentHash: '',
            structureHash: '',
            pageCount: 0,
            sectionCount: 0,
            elementCount: 0
          },
          current: currentMetrics
        },
        recommendation: 'Create baseline for future comparisons'
      };
    }

    // For a complete implementation, you would need to reconstruct the Document
    // from the buffer, which is complex with docx. For now, we'll do a simpler comparison.
    const currentBuffer = await Packer.toBuffer(currentDoc);
    const currentMetrics = await DocumentAnalyzer.analyzeDocument(currentDoc);
    
    // Simple buffer comparison
    const sizeDifference = Math.abs(baselineBuffer.length - currentBuffer.length);
    const sizeThreshold = baselineBuffer.length * tolerance;
    
    const isMatch = sizeDifference <= sizeThreshold;
    const confidence = isMatch ? 1.0 : Math.max(0, 1 - (sizeDifference / baselineBuffer.length));
    
    const differences: string[] = [];
    if (!isMatch) {
      differences.push(`File size difference: ${sizeDifference} bytes (threshold: ${sizeThreshold})`);
    }
    
    return {
      isMatch,
      confidence,
      differences,
      metrics: {
        baseline: {
          fileSize: baselineBuffer.length,
          contentHash: crypto.createHash('sha256').update(baselineBuffer).digest('hex'),
          structureHash: '',
          pageCount: 1,
          sectionCount: 1,
          elementCount: 0
        },
        current: currentMetrics
      },
      recommendation: isMatch ? 
        'Documents match within tolerance' : 
        'Documents differ - review changes'
    };
  }

  generateReport(results: Map<string, VisualComparisonResult>): string {
    const timestamp = new Date().toISOString();
    let report = `# Visual Regression Test Report\n\n`;
    report += `Generated: ${timestamp}\n\n`;
    
    const passed = Array.from(results.values()).filter(r => r.isMatch).length;
    const total = results.size;
    
    report += `## Summary\n\n`;
    report += `- Total Tests: ${total}\n`;
    report += `- Passed: ${passed}\n`;
    report += `- Failed: ${total - passed}\n`;
    report += `- Success Rate: ${((passed / total) * 100).toFixed(1)}%\n\n`;
    
    report += `## Detailed Results\n\n`;
    
    for (const [testName, result] of results) {
      const status = result.isMatch ? '✅ PASS' : '❌ FAIL';
      report += `### ${testName} ${status}\n\n`;
      report += `- Confidence: ${(result.confidence * 100).toFixed(1)}%\n`;
      report += `- Recommendation: ${result.recommendation}\n`;
      
      if (result.differences.length > 0) {
        report += `- Differences:\n`;
        result.differences.forEach(diff => {
          report += `  - ${diff}\n`;
        });
      }
      
      report += `- Baseline Size: ${result.metrics.baseline.fileSize} bytes\n`;
      report += `- Current Size: ${result.metrics.current.fileSize} bytes\n\n`;
    }
    
    return report;
  }

  saveReport(results: Map<string, VisualComparisonResult>): void {
    const report = this.generateReport(results);
    const reportPath = path.join(this.metricsDir, 'visual-regression-report.md');
    fs.writeFileSync(reportPath, report);
  }

  cleanup(): void {
    // Clean up output directory
    if (fs.existsSync(this.outputDir)) {
      const files = fs.readdirSync(this.outputDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.outputDir, file));
      });
    }
  }
}

export class PerformanceTracker {
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

  getStatistics(testName: string): {
    count: number;
    min: number;
    max: number;
    average: number;
    median: number;
  } | null {
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

  getAllStatistics(): Map<string, ReturnType<PerformanceTracker['getStatistics']>> {
    const results = new Map();
    for (const testName of this.measurements.keys()) {
      results.set(testName, this.getStatistics(testName));
    }
    return results;
  }

  generatePerformanceReport(): string {
    let report = `# Performance Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    const stats = this.getAllStatistics();
    
    for (const [testName, stat] of stats) {
      if (stat) {
        report += `## ${testName}\n\n`;
        report += `- Executions: ${stat.count}\n`;
        report += `- Average: ${stat.average.toFixed(2)}ms\n`;
        report += `- Median: ${stat.median.toFixed(2)}ms\n`;
        report += `- Min: ${stat.min.toFixed(2)}ms\n`;
        report += `- Max: ${stat.max.toFixed(2)}ms\n\n`;
      }
    }
    
    return report;
  }
}