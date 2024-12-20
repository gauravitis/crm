import React, { useState } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Plus, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';
import CreateManualOrderModal from '../components/orders/CreateManualOrderModal';
import QuotationDetails from '../components/quotations/QuotationDetails';
import { format } from 'date-fns';

export default function PendingOrders() {
  const { quotations, updateQuotation } = useQuotations();
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const approvedQuotations = quotations.filter(quotation => quotation.status === 'APPROVED');

  const handleViewQuotation = (quotation: any) => {
    setSelectedQuotation(quotation);
  };

  const handleMarkComplete = async (quotation: any) => {
    try {
      const updatedQuotation = {
        ...quotation,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      };
      await updateQuotation(updatedQuotation);
      toast.success('Order marked as complete');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pending Orders</h1>
        <Button
          onClick={() => setShowManualOrderModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Manual Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference No.</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedQuotations.map((quotation) => (
                  <TableRow key={quotation.quotationRef}>
                    <TableCell>{quotation.quotationRef}</TableCell>
                    <TableCell>{quotation.billTo.name}</TableCell>
                    <TableCell>{formatDate(quotation.quotationDate)}</TableCell>
                    <TableCell>{formatCurrency(quotation.grandTotal)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Order
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewQuotation(quotation)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkComplete(quotation)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {approvedQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No pending orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Manual Order Modal */}
      {showManualOrderModal && (
        <CreateManualOrderModal
          onClose={() => setShowManualOrderModal(false)}
          onSuccess={() => {
            setShowManualOrderModal(false);
            toast.success('Order created successfully');
          }}
        />
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <QuotationDetails
                quotation={selectedQuotation}
                onClose={() => setSelectedQuotation(null)}
                onSave={() => {
                  setSelectedQuotation(null);
                  toast.success('Order updated successfully');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
