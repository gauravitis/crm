import React, { useState, useEffect } from 'react';
import { useQuotations } from '../hooks/useQuotations';
import QuotationDetails from '../components/quotations/QuotationDetails';
import { Quotation } from '../types';
import { format } from 'date-fns';
import { Search, Eye, Trash2, X, CheckCircle, XCircle, Edit, Download, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../services/emailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Quotations() {
  const navigate = useNavigate();
  const { quotations, deleteQuotation, updateQuotation } = useQuotations();
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localQuotations, setLocalQuotations] = useState<Quotation[]>(quotations);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailQuotation, setEmailQuotation] = useState<Quotation | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailCC, setEmailCC] = useState('');
  const [emailBCC, setEmailBCC] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Update local quotations when the main quotations list changes
  useEffect(() => {
    setLocalQuotations(quotations);
  }, [quotations]);

  const handleDelete = (e: React.MouseEvent, quotation: Quotation) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(quotation.id);
      if (selectedQuotation?.id === quotation.id) {
        setSelectedQuotation(null);
      }
    }
  };

  const handleQuotationUpdate = (updatedQuotation: Quotation) => {
    // Update the local state immediately
    setLocalQuotations(prev => 
      prev.map(q => q.id === updatedQuotation.id ? updatedQuotation : q)
    );
    setSelectedQuotation(updatedQuotation);
  };

  const handleApprove = async (quotation: Quotation) => {
    try {
      const updatedQuotation = {
        ...quotation,
        status: 'APPROVED'
      };
      await updateQuotation(updatedQuotation);
      setLocalQuotations(prevQuotations => 
        prevQuotations.map(q => q.id === quotation.id ? updatedQuotation : q)
      );
      toast.success('Quotation approved successfully');
    } catch (error) {
      toast.error('Failed to approve quotation');
    }
  };

  const handleReject = async (quotation: Quotation) => {
    try {
      const updatedQuotation = {
        ...quotation,
        status: 'REJECTED'
      };
      await updateQuotation(updatedQuotation);
      setLocalQuotations(prevQuotations => 
        prevQuotations.map(q => q.id === quotation.id ? updatedQuotation : q)
      );
      toast.success('Quotation rejected successfully');
    } catch (error) {
      toast.error('Failed to reject quotation');
    }
  };

  const handleDownload = (quotation: Quotation) => {
    try {
      if (!quotation.document?.data) {
        toast.error('No document available for download');
        return;
      }

      // Convert base64 to blob
      const binaryStr = atob(quotation.document.data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = quotation.document.filename || `Quotation-${quotation.quotationRef}.docx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleSendEmail = async (quotation: Quotation) => {
    setEmailQuotation(quotation);
    setEmailTo(quotation.billTo?.email || '');
    setIsEmailDialogOpen(true);
  };

  const handleEmailSubmit = async () => {
    if (!emailQuotation || !emailQuotation.document?.data) {
      toast.error('No document available to send');
      return;
    }

    if (!emailTo) {
      toast.error('Please enter at least one recipient email address');
      return;
    }

    try {
      setIsSending(true);
      await emailService.sendQuotation({
        to: emailTo,
        cc: emailCC || undefined,
        bcc: emailBCC || undefined,
        quotationRef: emailQuotation.quotationRef,
        clientName: emailQuotation.billTo?.name || 'Valued Customer',
        documentData: emailQuotation.document.data,
        filename: emailQuotation.document.filename || `Quotation-${emailQuotation.quotationRef}.docx`,
        fromName: emailQuotation.employee?.name
      });

      // Update quotation status to SENT
      const updatedQuotation = {
        ...emailQuotation,
        status: 'SENT'
      };
      await updateQuotation(updatedQuotation);
      setLocalQuotations(prev => 
        prev.map(q => q.id === emailQuotation.id ? updatedQuotation : q)
      );

      toast.success('Quotation sent successfully');
      setIsEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const filteredQuotations = localQuotations.filter(quotation => 
    (quotation?.quotationRef?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    quotation?.billTo?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())) ?? false
  );

  const statusColors = {
    PENDING: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const formatTotal = (total: number | undefined) => {
    return total !== undefined ? total.toFixed(2) : '0.00';
  };

  const getStatusBadge = (status: string) => {
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors.PENDING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Quotations</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ref no. or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredQuotations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredQuotations.map((quotation) => (
              <li
                key={quotation.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedQuotation(quotation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        Ref: {quotation.quotationRef}
                      </p>
                      {getStatusBadge(quotation.status)}
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        Client: {quotation.billTo.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {format(new Date(quotation.createdAt), 'PP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-900">
                      Total: ₹{formatTotal(quotation.grandTotal)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedQuotation(quotation)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Edit Quotation"
                      >
                        <Edit className="w-5 h-5 text-blue-600" />
                      </button>
                      {quotation.document?.data && (
                        <>
                          <button
                            onClick={() => handleDownload(quotation)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Download Document"
                          >
                            <Download className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(quotation)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Send Email"
                          >
                            <Mail className="w-5 h-5 text-purple-600" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, quotation)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                      {quotation.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(quotation)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleReject(quotation)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No quotations found</p>
        </div>
      )}

      {/* Quotation Details Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Quotation Details</h2>
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
                onSave={handleQuotationUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">To</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter recipient's email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                placeholder="Enter CC email addresses (comma-separated)"
                value={emailCC}
                onChange={(e) => setEmailCC(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                type="email"
                placeholder="Enter BCC email addresses (comma-separated)"
                value={emailBCC}
                onChange={(e) => setEmailBCC(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmailSubmit}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}