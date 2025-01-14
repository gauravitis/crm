import React, { useState, useMemo } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Eye, CheckCircle, Plus, X, FileDown, Search } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';
import CreateManualOrderModal from '../components/orders/CreateManualOrderModal';
import QuotationDetails from '../components/quotations/QuotationDetails';
import QuotationDeliveryStatus from '../components/quotations/QuotationDeliveryStatus';
import { format } from 'date-fns';
import { QuotationProduct, Quotation } from '../types/quotation';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';

// Add type for payment status
type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';

export default function PendingOrders() {
  const { quotations, updateQuotation } = useQuotations();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Filter quotations based on search term and status
  const filteredQuotations = useMemo(() => {
    if (!quotations) return [];
    
    console.log('Raw quotations:', quotations);
    
    return (quotations as Quotation[])
      .filter(quotation => quotation?.status === 'APPROVED' || quotation?.status === 'IN_PROGRESS')
      .filter(quotation => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          (quotation?.quotationRef?.toLowerCase().includes(searchLower) || false) ||
          (quotation?.billTo?.name?.toLowerCase().includes(searchLower) || false) ||
          (quotation?.items?.some(item => 
            (item?.product_description?.toLowerCase().includes(searchLower) || false) ||
            (item?.cat_no?.toLowerCase().includes(searchLower) || false)
          ) || false)
        );
      })
      .filter(quotation => {
        if (statusFilter === 'all') return true;
        return getDeliveryStatus(quotation) === statusFilter;
      })
      .filter(quotation => {
        if (paymentStatusFilter === 'all') return true;
        return quotation?.paymentStatus === paymentStatusFilter;
      })
      .map(quotation => {
        console.log('Quotation billTo:', quotation.billTo);
        return quotation;
      });
  }, [quotations, searchTerm, statusFilter, paymentStatusFilter]);

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
  };

  const handleMarkComplete = async (quotation: Quotation) => {
    try {
      const updatedQuotation: Quotation = {
        ...quotation,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      await updateQuotation(updatedQuotation);
      toast.success('Order marked as complete');
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUpdateDeliveryStatus = async (quotation: Quotation, updatedProduct: QuotationProduct) => {
    try {
      const updatedProducts = quotation.items.map((item: QuotationProduct) =>
        item.sno === updatedProduct.sno ? updatedProduct : item
      );

      const updatedQuotation: Quotation = {
        ...quotation,
        items: updatedProducts,
        lastUpdated: new Date().toISOString(),
        status: updatedProducts.every((p: QuotationProduct) => p.delivery_status === 'delivered')
          ? 'COMPLETED' as const
          : updatedProducts.some((p: QuotationProduct) => p.delivery_status === 'delivered' || p.delivery_status === 'partial')
          ? 'IN_PROGRESS' as const
          : 'PENDING' as const
      };

      await updateQuotation(updatedQuotation);
      setSelectedQuotation(updatedQuotation);
      toast.success('Delivery status updated successfully');
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const getDeliveryStatus = (quotation: Quotation) => {
    const allDelivered = quotation.items?.every((p: QuotationProduct) => p.delivery_status === 'delivered');
    const anyDelivered = quotation.items?.some((p: QuotationProduct) => 
      p.delivery_status === 'delivered' || p.delivery_status === 'partial'
    );
    return allDelivered ? 'Completed' : anyDelivered ? 'Partially Delivered' : 'Pending';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Partially Delivered':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return dateString;
    }
  };

  const exportToExcel = () => {
    const quotationsToExport = filteredQuotations.filter(q => 
      selectedQuotations.length === 0 || selectedQuotations.includes(q.quotationRef)
    );

    // Prepare orders summary data
    const ordersData = quotationsToExport.map(quotation => ({
      'Reference No.': quotation.quotationRef,
      'Client Name': quotation.billTo?.name || quotation.billTo?.company || 'N/A',
      'Date': formatDate(quotation.quotationDate),
      'Total Amount': quotation.grandTotal,
      'Amount Paid': quotation.paymentDetails?.amountPaid || 0,
      'Balance': (quotation.grandTotal || 0) - (quotation.paymentDetails?.amountPaid || 0),
      'Delivery Status': getDeliveryStatus(quotation),
      'Payment Status': quotation.paymentStatus,
      'Shipping Status': quotation.shippingStatus || 'Not set',
      'Expected Delivery': quotation.shippingDetails?.expectedDeliveryDate ? 
        formatDate(quotation.shippingDetails.expectedDeliveryDate) : 'Not set',
      'Last Updated': quotation.lastUpdated ? formatDate(quotation.lastUpdated) : '',
      'Last Payment Date': quotation.paymentDetails?.lastPaymentDate ? 
        formatDate(quotation.paymentDetails.lastPaymentDate) : ''
    }));

    // Prepare items data with delivery status
    const itemsData = quotationsToExport.flatMap(quotation => 
      quotation.items.map(item => ({
        'Reference No.': quotation.quotationRef,
        'Client Name': quotation.billTo?.name || quotation.billTo?.company || 'N/A',
        'Item Description': item.product_description,
        'Catalog No.': item.cat_no || 'N/A',
        'Ordered Quantity': item.qty,
        'Delivered Quantity': item.delivered_qty || 0,
        'Pending Quantity': item.qty - (item.delivered_qty || 0),
        'Delivery Status': item.delivery_status || 'pending',
        'Expected Delivery Date': item.expected_delivery_date ? formatDate(item.expected_delivery_date) : 'Not set',
        'Last Delivery Date': item.last_delivery_date ? formatDate(item.last_delivery_date) : 'Not set',
        'Courier Name': item.courier_details?.courier_name || 'Not set',
        'Tracking Number': item.courier_details?.tracking_number || 'Not set',
        'Dispatch Date': item.courier_details?.dispatch_date ? formatDate(item.courier_details.dispatch_date) : 'Not set',
        'Delivery Notes': item.delivery_notes || ''
      }))
    );

    // Create workbook with multiple sheets
    const wb = XLSXUtils.book_new();
    
    // Add Orders Summary sheet
    const wsOrders = XLSXUtils.json_to_sheet(ordersData);
    XLSXUtils.book_append_sheet(wb, wsOrders, 'Orders Summary');
    
    // Add Items Details sheet
    const wsItems = XLSXUtils.json_to_sheet(itemsData);
    XLSXUtils.book_append_sheet(wb, wsItems, 'Items Details');

    // Save the workbook
    XLSXWriteFile(wb, `Orders_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Update the payment status handler
  const handleUpdatePaymentStatus = async (quotation: Quotation, newStatus: PaymentStatus, amountPaid?: number) => {
    try {
      const updatedQuotation: Quotation = {
        ...quotation,
        paymentStatus: newStatus,
        paymentDetails: {
          ...quotation.paymentDetails,
          amountPaid: amountPaid || quotation.paymentDetails?.amountPaid || 0,
          lastPaymentDate: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      };

      await updateQuotation(updatedQuotation);
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Update the PaymentStatusDialog component
  const PaymentStatusDialog = ({ quotation, onClose }: { quotation: Quotation, onClose: () => void }) => {
    const [amount, setAmount] = useState<string>('');
    const [status, setStatus] = useState<PaymentStatus>(quotation.paymentStatus as PaymentStatus || 'PENDING');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdatePaymentStatus(quotation, status, amount ? parseFloat(amount) : undefined);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Update Payment Status</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount Paid</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add state for payment dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentQuotation, setSelectedPaymentQuotation] = useState<Quotation | null>(null);

  // Modify the table row actions column
  const renderActions = (quotation: Quotation) => (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setSelectedPaymentQuotation(quotation);
          setShowPaymentDialog(true);
        }}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
        </svg>
      </Button>
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
  );

  // Add selection functionality
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);

  const toggleQuotationSelection = (quotationRef: string) => {
    setSelectedQuotations(prev => 
      prev.includes(quotationRef) 
        ? prev.filter(ref => ref !== quotationRef)
        : [...prev, quotationRef]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pending Orders</h1>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" /> Export to Excel
          </Button>
          <Button
            onClick={() => setShowManualOrderModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create Manual Order
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search by reference, client, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Delivery Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Delivered">Partially Delivered</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedQuotations.length === filteredQuotations.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuotations(filteredQuotations.map(q => q.quotationRef));
                        } else {
                          setSelectedQuotations([]);
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableHead>
                  <TableHead>Reference No.</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Delivery Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation: Quotation) => (
                  <TableRow key={quotation.quotationRef}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedQuotations.includes(quotation.quotationRef)}
                        onChange={() => toggleQuotationSelection(quotation.quotationRef)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </TableCell>
                    <TableCell>{quotation.quotationRef}</TableCell>
                    <TableCell>
                      {quotation.billTo?.name || quotation.billTo?.company || 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(quotation.quotationDate)}</TableCell>
                    <TableCell>{formatCurrency(quotation.grandTotal)}</TableCell>
                    <TableCell>{formatCurrency(quotation.paymentDetails?.amountPaid || 0)}</TableCell>
                    <TableCell>{formatCurrency((quotation.grandTotal || 0) - (quotation.paymentDetails?.amountPaid || 0))}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(getDeliveryStatus(quotation))}`}>
                        {getDeliveryStatus(quotation)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeColor(quotation.paymentStatus)}`}>
                        {quotation.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      {quotation.shippingDetails?.expectedDeliveryDate ? 
                        formatDate(quotation.shippingDetails.expectedDeliveryDate) : 
                        'Not set'}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActions(quotation)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No orders found
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
              <div className="space-y-8">
                <QuotationDetails
                  quotation={selectedQuotation}
                  onClose={() => setSelectedQuotation(null)}
                  onSave={() => {
                    setSelectedQuotation(null);
                    toast.success('Order updated successfully');
                  }}
                />
                <QuotationDeliveryStatus
                  products={selectedQuotation.items}
                  onUpdateProduct={(updatedProduct) => 
                    handleUpdateDeliveryStatus(selectedQuotation, updatedProduct)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the payment dialog */}
      {showPaymentDialog && selectedPaymentQuotation && (
        <PaymentStatusDialog
          quotation={selectedPaymentQuotation}
          onClose={() => {
            setShowPaymentDialog(false);
            setSelectedPaymentQuotation(null);
          }}
        />
      )}
    </div>
  );
}
