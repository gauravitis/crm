# Template Performance Optimization Guide

## Overview

This guide provides comprehensive strategies for optimizing the performance of the quotation template system. It covers memory management, processing optimization, caching strategies, and monitoring techniques to ensure efficient document generation.

## Performance Metrics and Benchmarks

### Target Performance Goals

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Small Document (1-10 items) | < 500ms | < 1s | > 2s |
| Medium Document (11-50 items) | < 1s | < 2s | > 5s |
| Large Document (51-100 items) | < 2s | < 5s | > 10s |
| Very Large Document (100+ items) | < 5s | < 10s | > 20s |
| Memory Usage | < 50MB | < 100MB | > 200MB |
| Memory Cleanup | < 1s | < 2s | > 5s |

### Performance Monitoring Setup

```typescript
// utils/performanceMonitor.ts
export class TemplatePerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private memoryBaseline: number = 0;

  startOperation(operationName: string): string {
    const operationId = `${operationName}-${Date.now()}`;
    this.memoryBaseline = this.getMemoryUsage();
    
    console.time(operationId);
    return operationId;
  }

  endOperation(operationId: string, itemCount?: number): PerformanceMetric {
    console.timeEnd(operationId);
    
    const endTime = performance.now();
    const memoryUsed = this.getMemoryUsage() - this.memoryBaseline;
    
    const metric: PerformanceMetric = {
      operationId,
      duration: endTime,
      memoryUsed,
      itemCount: itemCount || 0,
      timestamp: new Date().toISOString()
    };

    this.recordMetric(operationId.split('-')[0], metric);
    return metric;
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private recordMetric(operation: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(metric.duration);
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      operations: {},
      totalOperations: 0,
      averageMemoryUsage: 0
    };

    this.metrics.forEach((times, operation) => {
      report.operations[operation] = {
        count: times.length,
        averageTime: this.getAverageTime(operation),
        minTime: Math.min(...times),
        maxTime: Math.max(...times)
      };
      report.totalOperations += times.length;
    });

    return report;
  }
}

interface PerformanceMetric {
  operationId: string;
  duration: number;
  memoryUsed: number;
  itemCount: number;
  timestamp: string;
}

interface PerformanceReport {
  operations: Record<string, {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
  }>;
  totalOperations: number;
  averageMemoryUsage: number;
}

// Global performance monitor instance
export const performanceMonitor = new TemplatePerformanceMonitor();
```

## Memory Optimization Strategies

### 1. Object Pooling for Reusable Components

```typescript
// utils/objectPool.ts
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// Create pools for common objects
const textRunPool = new ObjectPool(
  () => ({ text: '', font: '', size: 0, bold: false, color: '' }),
  (obj) => {
    obj.text = '';
    obj.font = '';
    obj.size = 0;
    obj.bold = false;
    obj.color = '';
  }
);

const tableCellPool = new ObjectPool(
  () => ({ children: [], shading: null, borders: null }),
  (obj) => {
    obj.children.length = 0;
    obj.shading = null;
    obj.borders = null;
  }
);

// Usage in template generation
export const createOptimizedTextRun = (text: string, style: any): TextRun => {
  const pooledObj = textRunPool.acquire();
  
  // Configure the pooled object
  pooledObj.text = text;
  pooledObj.font = style.font;
  pooledObj.size = style.size;
  pooledObj.bold = style.bold;
  pooledObj.color = style.color;
  
  const textRun = new TextRun(pooledObj);
  
  // Return to pool after use (in cleanup phase)
  // textRunPool.release(pooledObj);
  
  return textRun;
};
```

### 2. Lazy Loading and Streaming

```typescript
// utils/lazyTemplateLoader.ts
export class LazyTemplateLoader {
  private templateCache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadTemplateComponent(componentName: string): Promise<any> {
    // Check cache first
    if (this.templateCache.has(componentName)) {
      return this.templateCache.get(componentName);
    }

    // Check if already loading
    if (this.loadingPromises.has(componentName)) {
      return this.loadingPromises.get(componentName);
    }

    // Start loading
    const loadingPromise = this.loadComponent(componentName);
    this.loadingPromises.set(componentName, loadingPromise);

    try {
      const component = await loadingPromise;
      this.templateCache.set(componentName, component);
      this.loadingPromises.delete(componentName);
      return component;
    } catch (error) {
      this.loadingPromises.delete(componentName);
      throw error;
    }
  }

  private async loadComponent(componentName: string): Promise<any> {
    switch (componentName) {
      case 'modernHeader':
        return import('./components/modernHeader').then(m => m.createModernHeader);
      case 'formalHeader':
        return import('./components/formalHeader').then(m => m.createFormalHeader);
      case 'technicalHeader':
        return import('./components/technicalHeader').then(m => m.createTechnicalHeader);
      default:
        throw new Error(`Unknown component: ${componentName}`);
    }
  }

  clearCache(): void {
    this.templateCache.clear();
    this.loadingPromises.clear();
  }
}

export const templateLoader = new LazyTemplateLoader();
```

### 3. Memory-Efficient Large Document Processing

```typescript
// utils/streamingDocumentGenerator.ts
export class StreamingDocumentGenerator {
  private readonly BATCH_SIZE = 25;
  private readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB

  async generateLargeDocument(data: QuotationData): Promise<Document> {
    const operationId = performanceMonitor.startOperation('large-document-generation');
    
    try {
      // Process document in sections to manage memory
      const sections = await this.processDocumentSections(data);
      
      // Create document with streaming approach
      const document = await this.createStreamingDocument(sections, data);
      
      performanceMonitor.endOperation(operationId, data.items.length);
      return document;
      
    } catch (error) {
      performanceMonitor.endOperation(operationId);
      throw error;
    }
  }

  private async processDocumentSections(data: QuotationData): Promise<any[]> {
    const sections = [];
    
    // Header section (always small)
    sections.push(await this.createHeaderSection(data));
    
    // Process items in batches if large
    if (data.items.length > this.BATCH_SIZE) {
      const itemSections = await this.createItemSectionsInBatches(data);
      sections.push(...itemSections);
    } else {
      sections.push(await this.createItemsSection(data));
    }
    
    // Footer sections
    sections.push(await this.createFooterSections(data));
    
    return sections;
  }

  private async createItemSectionsInBatches(data: QuotationData): Promise<any[]> {
    const sections = [];
    const items = data.items;
    
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      // Check memory usage before processing batch
      if (this.isMemoryThresholdExceeded()) {
        await this.performGarbageCollection();
      }
      
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const batchData = { ...data, items: batch };
      
      const batchSection = await this.createItemsSection(batchData);
      sections.push(batchSection);
      
      // Clear batch references
      batch.length = 0;
    }
    
    return sections;
  }

  private isMemoryThresholdExceeded(): boolean {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize > this.MEMORY_THRESHOLD;
    }
    return false;
  }

  private async performGarbageCollection(): Promise<void> {
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    // Give time for cleanup
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async createHeaderSection(data: QuotationData): Promise<any> {
    const templateType = data.company.templateConfig.templateType;
    const headerComponent = await templateLoader.loadTemplateComponent(`${templateType}Header`);
    return headerComponent(data.company);
  }

  private async createItemsSection(data: QuotationData): Promise<any> {
    const templateType = data.company.templateConfig.templateType;
    const itemsComponent = await templateLoader.loadTemplateComponent(`${templateType}Items`);
    return itemsComponent(data);
  }

  private async createFooterSections(data: QuotationData): Promise<any> {
    return [
      await this.createTermsSection(data),
      await this.createSignatureSection(data),
      await this.createBankDetailsSection(data)
    ];
  }

  private async createStreamingDocument(sections: any[], data: QuotationData): Promise<Document> {
    const config = validateTemplateConfig(data.company.templateConfig);
    const baseDoc = createBaseDocument(config);
    
    // Combine sections efficiently
    const documentChildren = [];
    
    for (const section of sections) {
      if (Array.isArray(section)) {
        documentChildren.push(...section);
      } else {
        documentChildren.push(section);
      }
      
      // Add spacing between sections
      documentChildren.push(createSpacingParagraph(config.spacing.sectionMargin));
    }
    
    return new Document({
      ...baseDoc,
      sections: [{
        ...baseDoc.sections[0],
        children: documentChildren
      }]
    });
  }
}

export const streamingGenerator = new StreamingDocumentGenerator();
```

## Caching Strategies

### 1. Template Configuration Caching

```typescript
// utils/templateConfigCache.ts
class TemplateConfigCache {
  private cache = new Map<string, TemplateConfig>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private timestamps = new Map<string, number>();

  get(companyId: string, templateType: string): TemplateConfig | null {
    const key = `${companyId}-${templateType}`;
    const timestamp = this.timestamps.get(key);
    
    if (timestamp && Date.now() - timestamp > this.TTL) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key) || null;
  }

  set(companyId: string, templateType: string, config: TemplateConfig): void {
    const key = `${companyId}-${templateType}`;
    this.cache.set(key, config);
    this.timestamps.set(key, Date.now());
  }

  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    // Implementation would track hits vs misses
    return 0.85; // Placeholder
  }
}

export const templateConfigCache = new TemplateConfigCache();

// Enhanced template config getter with caching
export const getCachedTemplateConfig = (company: Company): TemplateConfig => {
  const cached = templateConfigCache.get(company.id, company.templateConfig.templateType);
  
  if (cached) {
    return cached;
  }
  
  const validated = validateTemplateConfig(company.templateConfig);
  templateConfigCache.set(company.id, company.templateConfig.templateType, validated);
  
  return validated;
};
```

### 2. Style Object Caching

```typescript
// utils/styleCache.ts
class StyleCache {
  private textRunStyles = new Map<string, any>();
  private tableCellStyles = new Map<string, any>();
  private paragraphStyles = new Map<string, any>();

  getTextRunStyle(config: TemplateConfig, type: 'header' | 'body' | 'table' | 'accent'): any {
    const key = `${config.templateType}-${type}-${config.colorScheme.primary}`;
    
    if (!this.textRunStyles.has(key)) {
      const font = config.typography[`${type}Font`];
      const style = {
        font: font.family,
        size: font.size,
        bold: font.weight === 'bold',
        color: type === 'header' ? config.colorScheme.primary : config.colorScheme.text
      };
      this.textRunStyles.set(key, style);
    }
    
    return this.textRunStyles.get(key);
  }

  getTableCellStyle(config: TemplateConfig, type: 'header' | 'data' | 'total'): any {
    const key = `${config.templateType}-${type}`;
    
    if (!this.tableCellStyles.has(key)) {
      const style = {
        shading: {
          type: ShadingType.SOLID,
          color: type === 'header' ? config.colorScheme.secondary : config.colorScheme.background
        },
        margins: {
          top: config.spacing.tableCellPadding,
          bottom: config.spacing.tableCellPadding,
          left: config.spacing.tableCellPadding,
          right: config.spacing.tableCellPadding
        }
      };
      this.tableCellStyles.set(key, style);
    }
    
    return this.tableCellStyles.get(key);
  }

  clear(): void {
    this.textRunStyles.clear();
    this.tableCellStyles.clear();
    this.paragraphStyles.clear();
  }
}

export const styleCache = new StyleCache();
```

### 3. Component Result Caching

```typescript
// utils/componentCache.ts
class ComponentCache {
  private cache = new Map<string, any>();
  private readonly MAX_SIZE = 100;

  generateKey(componentName: string, data: any): string {
    // Create a hash of the relevant data for caching
    const relevantData = this.extractRelevantData(componentName, data);
    return `${componentName}-${JSON.stringify(relevantData)}`;
  }

  get(key: string): any | null {
    return this.cache.get(key) || null;
  }

  set(key: string, component: any): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, component);
  }

  private extractRelevantData(componentName: string, data: any): any {
    switch (componentName) {
      case 'header':
        return {
          companyName: data.company?.name,
          templateType: data.company?.templateConfig?.templateType,
          primaryColor: data.company?.templateConfig?.colorScheme?.primary
        };
      case 'clientSection':
        return {
          clientName: data.billTo?.name,
          clientCompany: data.billTo?.company,
          templateType: data.company?.templateConfig?.templateType
        };
      default:
        return data;
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const componentCache = new ComponentCache();

// Usage in template components
export const createCachedHeader = async (company: Company): Promise<Table> => {
  const cacheKey = componentCache.generateKey('header', { company });
  const cached = componentCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const header = await createHeader(company);
  componentCache.set(cacheKey, header);
  
  return header;
};
```

## Processing Optimization

### 1. Parallel Section Processing

```typescript
// utils/parallelProcessor.ts
export class ParallelTemplateProcessor {
  private readonly MAX_CONCURRENT = 3;

  async generateTemplateParallel(data: QuotationData): Promise<Document> {
    const operationId = performanceMonitor.startOperation('parallel-template-generation');
    
    try {
      // Create sections in parallel where possible
      const sectionPromises = this.createSectionPromises(data);
      
      // Process in batches to avoid overwhelming the system
      const sections = await this.processSectionsInBatches(sectionPromises);
      
      // Combine sections into final document
      const document = this.combineIntoDocument(sections, data);
      
      performanceMonitor.endOperation(operationId, data.items.length);
      return document;
      
    } catch (error) {
      performanceMonitor.endOperation(operationId);
      throw error;
    }
  }

  private createSectionPromises(data: QuotationData): Array<{ name: string; promise: Promise<any> }> {
    return [
      {
        name: 'header',
        promise: this.createHeaderWithTimeout(data.company)
      },
      {
        name: 'title',
        promise: this.createTitleWithTimeout(data)
      },
      {
        name: 'client',
        promise: this.createClientSectionWithTimeout(data)
      },
      {
        name: 'items',
        promise: this.createItemsTableWithTimeout(data)
      },
      {
        name: 'terms',
        promise: this.createTermsSectionWithTimeout(data)
      },
      {
        name: 'signature',
        promise: this.createSignatureSectionWithTimeout(data.company)
      },
      {
        name: 'bank',
        promise: this.createBankDetailsSectionWithTimeout(data.company)
      }
    ];
  }

  private async processSectionsInBatches(
    sectionPromises: Array<{ name: string; promise: Promise<any> }>
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (let i = 0; i < sectionPromises.length; i += this.MAX_CONCURRENT) {
      const batch = sectionPromises.slice(i, i + this.MAX_CONCURRENT);
      
      const batchResults = await Promise.allSettled(
        batch.map(async ({ name, promise }) => ({
          name,
          result: await promise
        }))
      );
      
      batchResults.forEach((result, index) => {
        const sectionName = batch[index].name;
        
        if (result.status === 'fulfilled') {
          results[sectionName] = result.value.result;
        } else {
          console.error(`Section ${sectionName} failed:`, result.reason);
          // Use fallback or skip section
          results[sectionName] = this.createFallbackSection(sectionName);
        }
      });
    }
    
    return results;
  }

  private async createHeaderWithTimeout(company: Company): Promise<any> {
    return this.withTimeout(createCachedHeader(company), 2000, 'Header creation timeout');
  }

  private async createItemsTableWithTimeout(data: QuotationData): Promise<any> {
    const timeout = data.items.length > 50 ? 10000 : 5000; // Longer timeout for large tables
    return this.withTimeout(createItemsTable(data), timeout, 'Items table creation timeout');
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), ms);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  private createFallbackSection(sectionName: string): any {
    // Create minimal fallback sections for failed components
    switch (sectionName) {
      case 'header':
        return new Paragraph({ text: 'Header unavailable' });
      case 'items':
        return new Paragraph({ text: 'Items table unavailable' });
      default:
        return new Paragraph({ text: `${sectionName} section unavailable` });
    }
  }

  private combineIntoDocument(sections: Record<string, any>, data: QuotationData): Document {
    const config = getCachedTemplateConfig(data.company);
    const baseDoc = createBaseDocument(config);
    
    // Combine sections in correct order
    const sectionOrder = ['header', 'title', 'client', 'items', 'terms', 'signature', 'bank'];
    const documentChildren = [];
    
    sectionOrder.forEach(sectionName => {
      if (sections[sectionName]) {
        documentChildren.push(sections[sectionName]);
        documentChildren.push(createSpacingParagraph(config.spacing.sectionMargin));
      }
    });
    
    return new Document({
      ...baseDoc,
      sections: [{
        ...baseDoc.sections[0],
        children: documentChildren
      }]
    });
  }
}

export const parallelProcessor = new ParallelTemplateProcessor();
```

### 2. Optimized Table Generation

```typescript
// utils/optimizedTableGenerator.ts
export class OptimizedTableGenerator {
  private readonly LARGE_TABLE_THRESHOLD = 50;

  async createOptimizedItemsTable(data: QuotationData): Promise<Table> {
    const config = getCachedTemplateConfig(data.company);
    
    if (data.items.length > this.LARGE_TABLE_THRESHOLD) {
      return this.createLargeItemsTable(data, config);
    } else {
      return this.createStandardItemsTable(data, config);
    }
  }

  private async createLargeItemsTable(data: QuotationData, config: TemplateConfig): Promise<Table> {
    const operationId = performanceMonitor.startOperation('large-table-generation');
    
    try {
      // Pre-calculate styles to reuse
      const styles = this.precalculateStyles(config);
      
      // Create header row
      const headerRow = this.createHeaderRow(styles);
      
      // Create data rows in batches
      const dataRows = await this.createDataRowsInBatches(data.items, styles);
      
      // Create total row
      const totalRow = this.createTotalRow(data, styles);
      
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createTableBorders(config.tableStyle, config.colorScheme.border),
        rows: [headerRow, ...dataRows, totalRow]
      });
      
      performanceMonitor.endOperation(operationId, data.items.length);
      return table;
      
    } catch (error) {
      performanceMonitor.endOperation(operationId);
      throw error;
    }
  }

  private precalculateStyles(config: TemplateConfig): any {
    return {
      headerCell: styleCache.getTableCellStyle(config, 'header'),
      dataCell: styleCache.getTableCellStyle(config, 'data'),
      totalCell: styleCache.getTableCellStyle(config, 'total'),
      headerText: styleCache.getTextRunStyle(config, 'table'),
      dataText: styleCache.getTextRunStyle(config, 'table'),
      borders: createTableBorders(config.tableStyle, config.colorScheme.border)
    };
  }

  private async createDataRowsInBatches(items: any[], styles: any): Promise<TableRow[]> {
    const batchSize = 25;
    const rows: TableRow[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Process batch
      const batchRows = batch.map((item, index) => 
        this.createOptimizedItemRow(item, i + index + 1, styles)
      );
      
      rows.push(...batchRows);
      
      // Yield control to prevent blocking
      if (i % (batchSize * 2) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return rows;
  }

  private createOptimizedItemRow(item: any, index: number, styles: any): TableRow {
    // Reuse pre-calculated styles
    const cells = [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: index.toString(), ...styles.dataText })]
        })],
        ...styles.dataCell
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ 
            text: sanitizeTemplateInput(item.product_description || ''), 
            ...styles.dataText 
          })]
        })],
        ...styles.dataCell
      }),
      // ... other cells with reused styles
    ];
    
    return new TableRow({ children: cells });
  }

  private createStandardItemsTable(data: QuotationData, config: TemplateConfig): Promise<Table> {
    // Use standard table creation for smaller tables
    return createItemsTable(data);
  }
}

export const optimizedTableGenerator = new OptimizedTableGenerator();
```

## Advanced Optimization Techniques

### 1. Web Workers for Heavy Processing

```typescript
// workers/templateWorker.ts
// This would be a separate Web Worker file
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'GENERATE_LARGE_TABLE':
      try {
        const result = generateLargeTableInWorker(data);
        self.postMessage({ type: 'SUCCESS', result });
      } catch (error) {
        self.postMessage({ type: 'ERROR', error: error.message });
      }
      break;
  }
};

function generateLargeTableInWorker(data: any) {
  // Heavy table processing logic here
  // This runs in a separate thread, not blocking the main UI
  return processedTableData;
}

// Main thread usage
// utils/workerManager.ts
export class TemplateWorkerManager {
  private worker: Worker | null = null;

  async generateLargeTable(data: any): Promise<any> {
    if (!this.worker) {
      this.worker = new Worker('/workers/templateWorker.js');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 30000);

      this.worker!.onmessage = (e) => {
        clearTimeout(timeout);
        const { type, result, error } = e.data;
        
        if (type === 'SUCCESS') {
          resolve(result);
        } else {
          reject(new Error(error));
        }
      };

      this.worker!.postMessage({
        type: 'GENERATE_LARGE_TABLE',
        data
      });
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const workerManager = new TemplateWorkerManager();
```

### 2. Virtual Scrolling for Large Tables

```typescript
// utils/virtualTableGenerator.ts
export class VirtualTableGenerator {
  private readonly VISIBLE_ROWS = 20;
  private readonly BUFFER_ROWS = 5;

  async createVirtualizedTable(data: QuotationData): Promise<Table> {
    // For very large tables, only render visible portion initially
    const totalRows = data.items.length;
    
    if (totalRows <= 100) {
      return this.createStandardTable(data);
    }

    // Create table with only visible rows
    const visibleItems = data.items.slice(0, this.VISIBLE_ROWS + this.BUFFER_ROWS);
    const virtualizedData = { ...data, items: visibleItems };
    
    const table = await this.createStandardTable(virtualizedData);
    
    // Add metadata for pagination/lazy loading
    (table as any).__virtualMetadata = {
      totalRows,
      visibleRows: this.VISIBLE_ROWS,
      currentOffset: 0,
      hasMore: totalRows > this.VISIBLE_ROWS
    };
    
    return table;
  }

  async loadMoreRows(table: Table, data: QuotationData, offset: number): Promise<TableRow[]> {
    const endIndex = Math.min(offset + this.VISIBLE_ROWS, data.items.length);
    const items = data.items.slice(offset, endIndex);
    
    const config = getCachedTemplateConfig(data.company);
    const styles = this.precalculateStyles(config);
    
    return items.map((item, index) => 
      this.createOptimizedItemRow(item, offset + index + 1, styles)
    );
  }

  private createStandardTable(data: QuotationData): Promise<Table> {
    return optimizedTableGenerator.createOptimizedItemsTable(data);
  }

  private precalculateStyles(config: TemplateConfig): any {
    return {
      dataCell: styleCache.getTableCellStyle(config, 'data'),
      dataText: styleCache.getTextRunStyle(config, 'table')
    };
  }

  private createOptimizedItemRow(item: any, index: number, styles: any): TableRow {
    // Same as optimized table generator
    return optimizedTableGenerator.createOptimizedItemRow(item, index, styles);
  }
}

export const virtualTableGenerator = new VirtualTableGenerator();
```

### 3. Progressive Enhancement

```typescript
// utils/progressiveTemplateGenerator.ts
export class ProgressiveTemplateGenerator {
  async generateProgressively(
    data: QuotationData, 
    onProgress?: (progress: number, section: string) => void
  ): Promise<Document> {
    const totalSteps = 7;
    let currentStep = 0;

    const updateProgress = (section: string) => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      onProgress?.(progress, section);
    };

    // Generate document progressively
    const config = getCachedTemplateConfig(data.company);
    const baseDoc = createBaseDocument(config);
    const sections = [];

    // Step 1: Header (quick)
    updateProgress('Creating header...');
    sections.push(await createCachedHeader(data.company));
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 2: Title (quick)
    updateProgress('Creating title...');
    sections.push(await createQuotationTitle(data));
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 3: Client details (quick)
    updateProgress('Creating client details...');
    sections.push(await createClientSection(data));
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 4: Items table (potentially slow)
    updateProgress('Creating items table...');
    if (data.items.length > 100) {
      sections.push(await streamingGenerator.createItemSectionsInBatches(data));
    } else {
      sections.push(await optimizedTableGenerator.createOptimizedItemsTable(data));
    }
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 5: Terms (quick)
    updateProgress('Creating terms...');
    sections.push(await createTermsSection(data));
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 6: Signature (quick)
    updateProgress('Creating signature...');
    sections.push(await createSignatureSection(data.company));
    sections.push(createSpacingParagraph(config.spacing.sectionMargin));

    // Step 7: Bank details (quick)
    updateProgress('Creating bank details...');
    sections.push(await createBankDetailsSection(data.company));

    updateProgress('Finalizing document...');

    return new Document({
      ...baseDoc,
      sections: [{
        ...baseDoc.sections[0],
        children: sections.flat()
      }]
    });
  }
}

export const progressiveGenerator = new ProgressiveTemplateGenerator();
```

## Performance Monitoring and Analytics

### 1. Real-time Performance Dashboard

```typescript
// utils/performanceDashboard.ts
export class PerformanceDashboard {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  getPerformanceStats(): PerformanceStats {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => 
      now - new Date(m.timestamp).getTime() < 3600000 // Last hour
    );

    return {
      totalOperations: recentMetrics.length,
      averageTime: this.calculateAverage(recentMetrics.map(m => m.duration)),
      medianTime: this.calculateMedian(recentMetrics.map(m => m.duration)),
      p95Time: this.calculatePercentile(recentMetrics.map(m => m.duration), 95),
      averageMemoryUsage: this.calculateAverage(recentMetrics.map(m => m.memoryUsed)),
      errorRate: this.calculateErrorRate(recentMetrics),
      throughput: this.calculateThroughput(recentMetrics)
    };
  }

  getSlowOperations(threshold: number = 5000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getMemoryIntensiveOperations(threshold: number = 50 * 1024 * 1024): PerformanceMetric[] {
    return this.metrics.filter(m => m.memoryUsed > threshold);
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      (sorted[mid - 1] + sorted[mid]) / 2 : 
      sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    const errors = metrics.filter(m => (m as any).error);
    return metrics.length > 0 ? (errors.length / metrics.length) * 100 : 0;
  }

  private calculateThroughput(metrics: PerformanceMetric[]): number {
    // Operations per minute
    return metrics.length > 0 ? (metrics.length / 60) : 0;
  }
}

interface PerformanceStats {
  totalOperations: number;
  averageTime: number;
  medianTime: number;
  p95Time: number;
  averageMemoryUsage: number;
  errorRate: number;
  throughput: number;
}

export const performanceDashboard = new PerformanceDashboard();
```

### 2. Automated Performance Alerts

```typescript
// utils/performanceAlerts.ts
export class PerformanceAlertSystem {
  private readonly THRESHOLDS = {
    SLOW_OPERATION: 10000, // 10 seconds
    HIGH_MEMORY: 100 * 1024 * 1024, // 100MB
    HIGH_ERROR_RATE: 5, // 5%
    LOW_THROUGHPUT: 0.5 // 0.5 operations per minute
  };

  checkPerformanceThresholds(): void {
    const stats = performanceDashboard.getPerformanceStats();
    
    // Check for slow operations
    if (stats.p95Time > this.THRESHOLDS.SLOW_OPERATION) {
      this.sendAlert('SLOW_OPERATION', {
        p95Time: stats.p95Time,
        threshold: this.THRESHOLDS.SLOW_OPERATION
      });
    }

    // Check for high memory usage
    if (stats.averageMemoryUsage > this.THRESHOLDS.HIGH_MEMORY) {
      this.sendAlert('HIGH_MEMORY', {
        averageMemory: stats.averageMemoryUsage,
        threshold: this.THRESHOLDS.HIGH_MEMORY
      });
    }

    // Check for high error rate
    if (stats.errorRate > this.THRESHOLDS.HIGH_ERROR_RATE) {
      this.sendAlert('HIGH_ERROR_RATE', {
        errorRate: stats.errorRate,
        threshold: this.THRESHOLDS.HIGH_ERROR_RATE
      });
    }

    // Check for low throughput
    if (stats.throughput < this.THRESHOLDS.LOW_THROUGHPUT) {
      this.sendAlert('LOW_THROUGHPUT', {
        throughput: stats.throughput,
        threshold: this.THRESHOLDS.LOW_THROUGHPUT
      });
    }
  }

  private sendAlert(type: string, data: any): void {
    console.warn(`Performance Alert [${type}]:`, data);
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service like DataDog, New Relic, etc.
      this.sendToMonitoringService(type, data);
    }
  }

  private sendToMonitoringService(type: string, data: any): void {
    // Implementation would send to actual monitoring service
    fetch('/api/performance-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data, timestamp: new Date().toISOString() })
    }).catch(error => {
      console.error('Failed to send performance alert:', error);
    });
  }
}

export const alertSystem = new PerformanceAlertSystem();

// Set up periodic performance checks
setInterval(() => {
  alertSystem.checkPerformanceThresholds();
}, 60000); // Check every minute
```

This comprehensive performance optimization guide provides strategies for memory management, caching, parallel processing, and monitoring to ensure the template system performs efficiently even with large documents and high usage volumes.