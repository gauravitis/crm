import React from 'react';
import { testDocumentGeneration } from '../utils/documentGenerator';

const TestQuotation: React.FC = () => {
  const handleGenerateDocuments = async () => {
    try {
      await testDocumentGeneration();
      console.log('Documents generated successfully!');
    } catch (error) {
      console.error('Error generating documents:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Quotation Generation</h2>
      <button
        onClick={handleGenerateDocuments}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Generate Sample Quotations
      </button>
    </div>
  );
};

export default TestQuotation;
