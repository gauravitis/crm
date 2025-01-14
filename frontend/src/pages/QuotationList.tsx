import React, { useEffect, useState } from 'react';
import { getQuotations } from '@/lib/firebase/quotations';
import { toast } from 'react-hot-toast';
import { QuotationData } from '@/types/quotation-generator';
import { Button } from '@/components/ui/button';
import { Download, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const quotationData = await getQuotations();
      console.log('Loaded quotations:', quotationData.map(q => ({
        ref: q.quotationRef,
        employee: q.employee,
        document: q.document ? 'present' : 'missing',
        createdAt: q.createdAt
      })));
      setQuotations(quotationData);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = (document: { data: string; filename: string }) => {
    try {
      console.log('Downloading document:', document.filename);
      
      // Convert base64 to blob
      const binaryStr = atob(document.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully!');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading quotations...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotations</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ref no. or client..."
            className="px-4 py-2 border rounded-md w-64"
          />
        </div>
      </div>

      <div className="space-y-4">
        {quotations.map((quotation) => (
          <div
            key={quotation.quotationRef}
            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  Quotation {quotation.quotationRef}
                </h3>
                <p className="text-gray-600">
                  Client: {quotation.billTo.name}
                </p>
                {quotation.employee && (
                  <p className="text-gray-600">
                    Created by: {quotation.employee.name}
                  </p>
                )}
                {quotation.createdAt && (
                  <p className="text-gray-500 text-sm">
                    Created: {quotation.createdAt}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  ₹{quotation.grandTotal.toLocaleString('en-IN')}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuotation(quotation)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {quotation.document && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(quotation.document)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedQuotation} onOpenChange={() => setSelectedQuotation(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Reference Number</h3>
                  <p>{selectedQuotation.quotationRef}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <select className="mt-1 block w-full rounded-md border-gray-300">
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Client Details</h3>
                <p>{selectedQuotation.billTo.name}</p>
                <p>{selectedQuotation.billTo.address}</p>
                <p>{selectedQuotation.billTo.phone}</p>
                <p>{selectedQuotation.billTo.email}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Created By</h3>
                {selectedQuotation.employee ? (
                  <div>
                    <p>{selectedQuotation.employee.name}</p>
                    {selectedQuotation.employee.designation && (
                      <p className="text-gray-600">{selectedQuotation.employee.designation}</p>
                    )}
                    {selectedQuotation.employee.email && (
                      <p className="text-gray-600">{selectedQuotation.employee.email}</p>
                    )}
                    {selectedQuotation.employee.phone && (
                      <p className="text-gray-600">{selectedQuotation.employee.phone}</p>
                    )}
                  </div>
                ) : (
                  <p>Not specified</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Items</h3>
                <table className="w-full mt-2">
                  <thead>
                    <tr>
                      <th className="text-left">Description</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Unit Rate</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_description}</td>
                        <td className="text-right">{item.qty}</td>
                        <td className="text-right">₹{item.unit_rate.toLocaleString('en-IN')}</td>
                        <td className="text-right">₹{(item.qty * item.unit_rate).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right">
                <p><span className="font-semibold">Sub Total:</span> ₹{selectedQuotation.subTotal.toLocaleString('en-IN')}</p>
                <p><span className="font-semibold">Tax:</span> ₹{selectedQuotation.tax.toLocaleString('en-IN')}</p>
                <p className="text-lg font-semibold">Grand Total: ₹{selectedQuotation.grandTotal.toLocaleString('en-IN')}</p>
              </div>

              {selectedQuotation.document && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => handleDownloadDocument(selectedQuotation.document)}
                    className="flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Quotation
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationList;
