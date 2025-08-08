import React, { useState, useEffect } from 'react';
import { getTemplateForCompany } from '../utils/quotationTemplates';
import { mockCompanyChembio, mockCompanyChembioPvt, mockCompanyChemlabSynthesis, mockQuotationData } from '../test/mockData';
import { QuotationData } from '../types/quotation-generator';
import { Company } from '../types/company';

interface TemplatePreview {
  companyName: string;
  templateType: string;
  colorScheme: {
    primary: string;
    secondary: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
  };
  layout: string;
  generationTime: number;
  success: boolean;
  error?: string;
}

const TemplateComparison: React.FC = () => {
  const [previews, setPreviews] = useState<TemplatePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['all']);

  const companies = [
    { id: 'chembio', name: 'Chembio Lifesciences', data: mockCompanyChembio },
    { id: 'chembio-pvt', name: 'Chembio Lifesciences Pvt. Ltd.', data: mockCompanyChembioPvt },
    { id: 'chemlab', name: 'Chemlab Synthesis', data: mockCompanyChemlabSynthesis }
  ];

  const generateTemplatePreview = async (company: Company, companyName: string): Promise<TemplatePreview> => {
    const startTime = Date.now();
    
    try {
      const quotationData: QuotationData = {
        ...mockQuotationData,
        company
      };

      await getTemplateForCompany(quotationData);
      const endTime = Date.now();

      // Extract template characteristics
      const templateConfig = company.templateConfig;
      
      return {
        companyName,
        templateType: templateConfig.templateType,
        colorScheme: {
          primary: templateConfig.colorScheme.primary,
          secondary: templateConfig.colorScheme.secondary
        },
        typography: {
          headerFont: templateConfig.typography.headerFont.family,
          bodyFont: templateConfig.typography.bodyFont.family
        },
        layout: templateConfig.headerStyle,
        generationTime: endTime - startTime,
        success: true
      };
    } catch (error) {
      return {
        companyName,
        templateType: 'unknown',
        colorScheme: { primary: '#000000', secondary: '#FFFFFF' },
        typography: { headerFont: 'Unknown', bodyFont: 'Unknown' },
        layout: 'Unknown',
        generationTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testTemplates = async () => {
    setLoading(true);
    setPreviews([]);

    try {
      const companiesToTest = selectedCompanies.includes('all') 
        ? companies 
        : companies.filter(c => selectedCompanies.includes(c.id));

      const previewPromises = companiesToTest.map(({ data, name }) => 
        generateTemplatePreview(data, name)
      );

      const results = await Promise.all(previewPromises);
      setPreviews(results);
    } catch (error) {
      console.error('Error testing templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTypeColor = (templateType: string): string => {
    switch (templateType) {
      case 'modern': return '#0066CC';
      case 'formal': return '#001F3F';
      case 'technical': return '#2E7D32';
      default: return '#666666';
    }
  };

  const getTemplateTypeIcon = (templateType: string): string => {
    switch (templateType) {
      case 'modern': return '🎨';
      case 'formal': return '📋';
      case 'technical': return '🔬';
      default: return '❓';
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testTemplates();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📊 Company Template Comparison
        </h1>
        <p className="text-gray-600 mb-6">
          Compare how different companies generate different quotation templates with unique styling, colors, and layouts.
        </p>

        {/* Company Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Companies to Test:
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCompanies.includes('all')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCompanies(['all']);
                  } else {
                    setSelectedCompanies([]);
                  }
                }}
                className="mr-2"
              />
              All Companies
            </label>
            {companies.map(company => (
              <label key={company.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id) || selectedCompanies.includes('all')}
                  onChange={(e) => {
                    if (selectedCompanies.includes('all')) {
                      setSelectedCompanies([company.id]);
                    } else if (e.target.checked) {
                      setSelectedCompanies([...selectedCompanies.filter(id => id !== 'all'), company.id]);
                    } else {
                      setSelectedCompanies(selectedCompanies.filter(id => id !== company.id));
                    }
                  }}
                  className="mr-2"
                />
                {company.name}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={testTemplates}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? '🔄 Testing Templates...' : '🧪 Test Templates'}
        </button>
      </div>

      {/* Results */}
      {previews.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            📋 Template Comparison Results
          </h2>

          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">📈 Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Templates Tested:</span> {previews.length}
              </div>
              <div>
                <span className="font-medium">Unique Types:</span> {new Set(previews.map(p => p.templateType)).size}
              </div>
              <div>
                <span className="font-medium">Unique Colors:</span> {new Set(previews.map(p => p.colorScheme.primary)).size}
              </div>
              <div>
                <span className="font-medium">Success Rate:</span> {Math.round((previews.filter(p => p.success).length / previews.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previews.map((preview, index) => (
              <div
                key={index}
                className={`border rounded-lg p-6 ${
                  preview.success ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {preview.companyName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getTemplateTypeIcon(preview.templateType)}
                    </span>
                    {preview.success ? (
                      <span className="text-green-600 text-sm">✅</span>
                    ) : (
                      <span className="text-red-600 text-sm">❌</span>
                    )}
                  </div>
                </div>

                {preview.success ? (
                  <div className="space-y-3">
                    {/* Template Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Template Type:</span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getTemplateTypeColor(preview.templateType) }}
                      >
                        {preview.templateType.toUpperCase()}
                      </span>
                    </div>

                    {/* Color Scheme */}
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Color Scheme:</span>
                      <div className="flex space-x-2">
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: preview.colorScheme.primary }}
                          ></div>
                          <span className="text-xs text-gray-500">Primary</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: preview.colorScheme.secondary }}
                          ></div>
                          <span className="text-xs text-gray-500">Secondary</span>
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div>
                      <span className="text-sm font-medium text-gray-600">Typography:</span>
                      <div className="text-sm text-gray-500 mt-1">
                        <div>Header: {preview.typography.headerFont}</div>
                        <div>Body: {preview.typography.bodyFont}</div>
                      </div>
                    </div>

                    {/* Layout */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Layout:</span>
                      <span className="text-sm text-gray-900">{preview.layout}</span>
                    </div>

                    {/* Performance */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Generation Time:</span>
                      <span className="text-sm text-gray-900">{preview.generationTime}ms</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="text-sm font-medium">❌ Template generation failed</p>
                    {preview.error && (
                      <p className="text-xs mt-1 text-red-500">{preview.error}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Differences Analysis */}
          {previews.length > 1 && previews.every(p => p.success) && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Template Differences</h3>
              <div className="space-y-2 text-sm">
                {previews.map((preview, i) => 
                  previews.slice(i + 1).map((otherPreview, j) => {
                    const differences = [];
                    if (preview.templateType !== otherPreview.templateType) {
                      differences.push(`Template Type (${preview.templateType} vs ${otherPreview.templateType})`);
                    }
                    if (preview.colorScheme.primary !== otherPreview.colorScheme.primary) {
                      differences.push(`Primary Color (${preview.colorScheme.primary} vs ${otherPreview.colorScheme.primary})`);
                    }
                    if (preview.typography.headerFont !== otherPreview.typography.headerFont) {
                      differences.push(`Header Font (${preview.typography.headerFont} vs ${otherPreview.typography.headerFont})`);
                    }
                    if (preview.layout !== otherPreview.layout) {
                      differences.push(`Layout (${preview.layout} vs ${otherPreview.layout})`);
                    }

                    return (
                      <div key={`${i}-${j}`} className="border-l-4 border-blue-400 pl-3">
                        <div className="font-medium text-gray-900">
                          {preview.companyName} vs {otherPreview.companyName}:
                        </div>
                        {differences.length > 0 ? (
                          <ul className="text-gray-600 ml-2">
                            {differences.map((diff, idx) => (
                              <li key={idx}>• {diff}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-orange-600 ml-2">⚠️ No significant differences detected</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Testing templates...</p>
        </div>
      )}
    </div>
  );
};

export default TemplateComparison;