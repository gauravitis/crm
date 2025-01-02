import { generateQuotationRef } from '../utils/generateId';
import React, { useEffect, useState } from 'react';
import { QuotationData, QuotationProduct } from '../types/quotation-generator';
import { format, parse } from 'date-fns';
import { generateWord } from '../utils/documentGenerator';
import { useQuotations } from '../hooks/useQuotations';
import { useClients } from '../hooks/useClients';
import { useItems } from '../hooks/useItems';
import { useEmployees } from '../hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, FileType, Plus, Trash2, Save } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../services/quotationService';

const STORAGE_KEY = 'quotation_draft';

// Default quotation data structure
const defaultQuotationData: QuotationData = {
  billTo: {
    name: '',
    address: '',
    phone: '',
    email: '',
    company: '',
    contactPerson: ''
  },
  billFrom: {
    name: '',
    address: '',
    phone: '',
    email: '',
    gst: '',
    pan: '',
  },
  employee: {
    id: '',
    name: '',
    email: '',
    phone: '',
    designation: ''
  },
  quotationRef: '',
  quotationDate: new Date().toISOString().split('T')[0],
  validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  items: [],
  subTotal: 0,
  tax: 0,
  grandTotal: 0,
  notes: '',
  paymentTerms: '',
  bankDetails: {
    bankName: '',
    accountNo: '',
    ifscCode: '',
    branchCode: '',
    microCode: '',
    accountType: '',
  }
};

const defaultProduct: QuotationProduct = {
  sno: 1,
  cat_no: '',
  pack_size: '',
  product_description: '',
  hsn_code: '',
  qty: 1,
  unit_rate: 0,
  discount_percent: 0,
  discounted_value: 0,
  gst_percent: 18,
  gst_value: 0,
  total_price: 0,
  lead_time: '',
  make: '',
};

// Function to generate reference number
const generateReferenceNumber = async () => {
  try {
    console.log('Generating reference number...');
    const ref = await generateQuotationRef();
    console.log('Generated reference:', ref, typeof ref);
    if (typeof ref !== 'string') {
      console.error('Reference is not a string:', ref);
      return `CBL-${format(new Date(), 'dd/MM/yyyy')}-ERR`;
    }
    return ref;
  } catch (error) {
    console.error('Error generating reference number:', error);
    return `CBL-${format(new Date(), 'dd/MM/yyyy')}-ERR`;
  }
};

const formatDateForDisplay = (dateStr: string) => {
  try {
    const date = parse(dateStr, 'dd/MM/yyyy', new Date());
    return format(date, 'dd/MM/yyyy');
  } catch {
    try {
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  }
};

const formatDateForInput = (dateStr: string) => {
  try {
    const date = parse(dateStr, 'dd/MM/yyyy', new Date());
    return format(date, 'yyyy-MM-dd');
  } catch {
    try {
      const date = new Date(dateStr);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateStr;
    }
  }
};

export default function QuotationGenerator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode] = useState(!!id);
  const { addQuotation } = useQuotations();
  const { clients } = useClients();
  const { items } = useItems();
  const { employees } = useEmployees();
  
  const [quotationData, setQuotationData] = useState<QuotationData>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return defaultQuotationData;
  });

  // Set initial reference number
  useEffect(() => {
    const initializeRef = async () => {
      try {
        console.log('Initializing reference...');
        const ref = await generateReferenceNumber();
        console.log('Setting reference in state:', ref, typeof ref);
        if (typeof ref === 'string') {
          setQuotationData(prev => {
            const updated = {
              ...prev,
              quotationRef: ref
            };
            console.log('Updated quotation data:', updated.quotationRef, typeof updated.quotationRef);
            return updated;
          });
        } else {
          console.error('Reference is not a string:', ref);
        }
      } catch (error) {
        console.error('Error initializing reference number:', error);
      }
    };

    console.log('Current quotationRef:', quotationData.quotationRef, typeof quotationData.quotationRef);
    if (!quotationData.quotationRef || 
        (typeof quotationData.quotationRef === 'string' && quotationData.quotationRef.endsWith('...'))) {
      console.log('Current quotationRef:', quotationData.quotationRef, typeof quotationData.quotationRef); // Debug log
      initializeRef();
    }
  }, []);

  // Set selected employee when loading quotation data
  useEffect(() => {
    if (quotationData.employee?.id && employees.length > 0) {
      const employee = employees.find(emp => emp.id === quotationData.employee?.id);
      if (employee) {
        setSelectedEmployee(employee);
      }
    }
  }, [quotationData.employee?.id, employees]);

  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<any[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  // Save to localStorage whenever quotationData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotationData));
  }, [quotationData]);

  const calculateItemTotal = (item: QuotationProduct): number => {
    const baseAmount = item.qty * item.unit_rate;
    const discountAmount = baseAmount * (item.discount_percent / 100);
    item.discounted_value = Number(discountAmount.toFixed(2));
    const afterDiscount = baseAmount - discountAmount;
    const gstValue = afterDiscount * (item.gst_percent / 100);
    item.gst_value = Number(gstValue.toFixed(2));
    return Number((afterDiscount + gstValue).toFixed(2));
  };

  const updateTotals = (items: QuotationProduct[]) => {
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unit_rate), 0);
    const totalTax = items.reduce((sum, item) => sum + item.gst_value, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.total_price, 0);

    setQuotationData(prev => ({
      ...prev,
      subTotal: Number(subTotal.toFixed(2)),
      tax: Number(totalTax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    }));
  };

  const handleItemChange = (index: number, field: keyof QuotationProduct, value: string | number) => {
    const newItems = [...quotationData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: typeof value === 'string' ? value : Number(value) || 0,
    };
    newItems[index].total_price = calculateItemTotal(newItems[index]);
    
    setQuotationData(prev => ({
      ...prev,
      items: newItems,
    }));
    updateTotals(newItems);
  };

  const addItem = () => {
    const newItem: QuotationProduct = {
      ...defaultProduct,
      sno: quotationData.items.length + 1,
    };
    setQuotationData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    const newItems = quotationData.items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => {
      item.sno = i + 1;
    });
    setQuotationData(prev => ({
      ...prev,
      items: newItems
    }));
    updateTotals(newItems);
  };

  const clearData = async () => {
    try {
      const ref = await generateReferenceNumber();
      const newData = {
        ...defaultQuotationData,
        quotationRef: ref
      };
      localStorage.removeItem(STORAGE_KEY);
      setQuotationData(newData);
    } catch (error) {
      console.error('Error generating reference number:', error);
      const fallbackRef = `CBL-${format(new Date(), 'dd/MM/yyyy')}-ERR`;
      const newData = {
        ...defaultQuotationData,
        quotationRef: fallbackRef
      };
      localStorage.removeItem(STORAGE_KEY);
      setQuotationData(newData);
    }
  };

  const handleGenerateQuotation = async () => {
    try {
      // Update quotation data with selected employee details
      const documentData = {
        ...quotationData,
        employee: selectedEmployee ? {
          id: selectedEmployee.id,
          name: selectedEmployee.name,
          email: selectedEmployee.email,
          phone: selectedEmployee.mobile,
          designation: selectedEmployee.designation || ''
        } : quotationData.employee,
        items: quotationData.items.map((item, index) => ({
          ...item,
          sno: index + 1,
        })),
      };

      const { buffer, filename } = await generateWord(documentData);
      
      // Convert buffer to base64 for storage
      const base64Data = btoa(
        new Uint8Array(buffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Create blob and download
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Update quotationData with the document
      setQuotationData(prev => ({
        ...prev,
        document: {
          filename,
          data: base64Data
        }
      }));

      toast.success('Quotation generated successfully!');
      return { filename, base64Data };
    } catch (error) {
      console.error('Error generating quotation:', error);
      toast.error('Error generating quotation');
      throw error;
    }
  };

  const handleSaveQuotation = async () => {
    try {
      setIsSaving(true);

      // Update quotation data with selected employee details
      const documentData = {
        ...quotationData,
        employee: selectedEmployee ? {
          id: selectedEmployee.id,
          name: selectedEmployee.name,
          email: selectedEmployee.email,
          phone: selectedEmployee.mobile,
          designation: selectedEmployee.designation || ''
        } : quotationData.employee,
        items: quotationData.items.map((item, index) => ({
          ...item,
          sno: index + 1,
        })),
      };

      const { buffer, filename } = await generateWord(documentData);
      
      // Convert buffer to base64 for storage
      const base64Data = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const quotationToSave = {
        ...documentData,
        document: {
          data: base64Data,
          filename
        }
      };

      if (isEditMode) {
        await quotationService.updateQuotation(id!, quotationToSave);
        toast.success('Quotation updated successfully');
      } else {
        await quotationService.addQuotation(quotationToSave);
        toast.success('Quotation saved successfully');
      }

      navigate('/quotations');
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Failed to save quotation');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadQuotation = async () => {
      if (id) {
        try {
          const quotations = await quotationService.getQuotations();
          const existingQuotation = quotations.find(q => q.id === id);
          if (existingQuotation) {
            setQuotationData(existingQuotation);
            // Set selected employee if exists
            if (existingQuotation.employee) {
              const matchingEmployee = employees.find(e => e.id === existingQuotation.employee.id);
              if (matchingEmployee) {
                setSelectedEmployee(matchingEmployee);
              }
            }
          } else {
            toast.error('Quotation not found');
            navigate('/quotations');
          }
        } catch (error) {
          console.error('Error loading quotation:', error);
          toast.error('Failed to load quotation');
          navigate('/quotations');
        }
      }
    };

    loadQuotation();
  }, [id, employees]);

  const handleClientNameChange = (value: string) => {
    // Update the quotation data
    setQuotationData(prev => ({
      ...prev,
      billTo: {
        ...prev.billTo,
        contactPerson: value
      }
    }));

    // Filter and show client suggestions
    if (value.trim()) {
      const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(value.toLowerCase()) ||
        client.company?.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(filteredClients);
      setShowClientSuggestions(true);
    } else {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
    }
  };

  const handleClientSelect = (client: any) => {
    // Check if address is a string or an object
    let formattedAddress = '';
    if (typeof client.address === 'string') {
      formattedAddress = client.address;
    } else if (client.address) {
      formattedAddress = [
        client.address.street,
        client.address.city,
        client.address.state,
        client.address.postalCode,
        client.address.country
      ].filter(Boolean).join(', ');
    }

    setQuotationData(prev => ({
      ...prev,
      billTo: {
        company: client.company || '',
        contactPerson: client.name || '',
        address: formattedAddress,
        phone: client.phone || '',
        email: client.email || ''
      }
    }));
    setShowClientSuggestions(false);
  };

  const handleItemSearch = (index: number, value: string) => {
    if (!value.trim()) {
      setItemSuggestions([]);
      setShowItemSuggestions(false);
      return;
    }

    const searchValue = value.toLowerCase();
    const filteredItems = items.filter(item => 
      item.catalogueId?.toLowerCase().includes(searchValue) ||
      item.name?.toLowerCase().includes(searchValue)
    );
    
    setItemSuggestions(filteredItems);
    setShowItemSuggestions(true);
    setFocusedItemIndex(index);
  };

  const handleItemSelect = (index: number, selectedItem: any) => {
    const updatedItems = [...quotationData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      cat_no: selectedItem.catalogueId || '',
      pack_size: selectedItem.packSize || '',
      product_description: selectedItem.name || '',
      hsn_code: selectedItem.hsnCode || '',
      unit_rate: selectedItem.price || 0,
      make: selectedItem.brand || '',
      lead_time: '1-2 weeks'
    };
    setQuotationData(prev => ({
      ...prev,
      items: updatedItems
    }));
    setShowItemSuggestions(false);
    calculateItemTotal(updatedItems[index]);
    updateTotals(updatedItems);
  };

  return (
    <div className="p-6 max-w-[95vw] mx-auto">
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold">Quotation Generator</h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerateQuotation}
              variant="default"
              className="flex items-center h-10 px-4 text-base"
            >
              <FileText className="h-5 w-5 mr-2" />
              Generate Word
            </Button>
            <Button
              onClick={handleSaveQuotation}
              variant="default"
              className="flex items-center h-10 px-4 text-base"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Quotation
            </Button>
            <Button
              onClick={clearData}
              variant="outline"
              className="flex items-center h-10 px-4 text-base"
            >
              Clear Data
            </Button>
          </div>
        </div>

        {/* Client Details Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <Label className="text-sm font-medium">Company Name</Label>
                <Input
                  type="text"
                  value={quotationData.billTo.company || ''}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, company: e.target.value }
                  }))}
                  placeholder="Enter company name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2 relative">
                <Label className="text-sm font-medium">Contact Person Name</Label>
                <Input
                  type="text"
                  value={quotationData.billTo.contactPerson || ''}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  placeholder="Start typing contact person name..."
                  className="w-full"
                />
                {showClientSuggestions && clientSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {clientSuggestions.map((client, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-medium">{client.name}</div>
                        {client.company && (
                          <div className="text-sm text-gray-600">{client.company}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  type="text"
                  value={quotationData.billTo.address}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, address: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  type="text"
                  value={quotationData.billTo.phone}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, phone: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={quotationData.billTo.email}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    billTo: { ...prev.billTo, email: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Details Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Employee</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const employee = employees.find(emp => emp.id === e.target.value);
                    setSelectedEmployee(employee || null);
                  }}
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Details */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reference No.</Label>
                <Input
                  type="text"
                  value={String(quotationData.quotationRef || '')}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Input
                  type="date"
                  value={formatDateForInput(quotationData.quotationDate)}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    quotationDate: formatDateForDisplay(e.target.value)
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Valid Till</Label>
                <Input
                  type="date"
                  value={formatDateForInput(quotationData.validTill)}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    validTill: formatDateForDisplay(e.target.value)
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80 flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Items</CardTitle>
            <Button
              onClick={addItem}
              variant="outline"
              className="h-9 px-4 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="w-[60px] text-center font-medium">S.No</TableHead>
                    <TableHead className="w-[120px] font-medium">Cat No.</TableHead>
                    <TableHead className="w-[100px] font-medium">Pack Size</TableHead>
                    <TableHead className="min-w-[250px] font-medium">Description</TableHead>
                    <TableHead className="w-[100px] text-center font-medium">HSN Code</TableHead>
                    <TableHead className="w-[100px] text-right font-medium">Qty</TableHead>
                    <TableHead className="w-[120px] text-right font-medium">Unit Rate</TableHead>
                    <TableHead className="w-[100px] text-right font-medium">Discount %</TableHead>
                    <TableHead className="w-[120px] text-right font-medium">Discount Value</TableHead>
                    <TableHead className="w-[100px] text-right font-medium">GST %</TableHead>
                    <TableHead className="w-[120px] text-right font-medium">GST Value</TableHead>
                    <TableHead className="w-[120px] text-right font-medium">Total</TableHead>
                    <TableHead className="w-[120px] font-medium">Lead Time</TableHead>
                    <TableHead className="w-[120px] font-medium">Make</TableHead>
                    <TableHead className="w-[60px] font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationData.items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="text-center font-medium">{item.sno}</TableCell>
                      <TableCell className="relative">
                        <Input
                          type="text"
                          value={item.cat_no}
                          onChange={(e) => {
                            handleItemSearch(index, e.target.value);
                            handleItemChange(index, 'cat_no', e.target.value);
                          }}
                          placeholder="Enter catalog number"
                          className="text-base min-w-[120px]"
                        />
                        {showItemSuggestions && itemSuggestions.length > 0 && index === focusedItemIndex && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {itemSuggestions.map((suggestion, idx) => (
                              <div
                                key={idx}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleItemSelect(index, suggestion)}
                              >
                                <div className="font-medium">{suggestion.catalogueId}</div>
                                <div className="text-sm text-gray-600">{suggestion.name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.pack_size}
                          onChange={(e) => handleItemChange(index, 'pack_size', e.target.value)}
                          className="text-base min-w-[90px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.product_description}
                          onChange={(e) => handleItemChange(index, 'product_description', e.target.value)}
                          className="text-base min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.hsn_code}
                          onChange={(e) => handleItemChange(index, 'hsn_code', e.target.value)}
                          className="text-base min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                          className="text-base text-right min-w-[80px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unit_rate}
                          onChange={(e) => handleItemChange(index, 'unit_rate', e.target.value)}
                          className="text-base text-right min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.discount_percent}
                          onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
                          min="0"
                          max="100"
                          className="text-base text-right min-w-[80px]"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{item.discounted_value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.gst_percent}
                          onChange={(e) => handleItemChange(index, 'gst_percent', e.target.value)}
                          className="text-base text-right min-w-[80px]"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{item.gst_value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">₹{item.total_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.lead_time}
                          onChange={(e) => handleItemChange(index, 'lead_time', e.target.value)}
                          className="text-base min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.make}
                          onChange={(e) => handleItemChange(index, 'make', e.target.value)}
                          className="text-base min-w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-medium">Sub Total:</TableCell>
                    <TableCell colSpan={7} className="text-right font-medium">₹{quotationData.subTotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-medium">Total GST:</TableCell>
                    <TableCell colSpan={7} className="text-right font-medium">₹{quotationData.tax.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-right font-medium">Grand Total:</TableCell>
                    <TableCell colSpan={7} className="text-right font-bold text-lg">₹{quotationData.grandTotal.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Terms</Label>
                <Input
                  type="text"
                  value={quotationData.paymentTerms}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    paymentTerms: e.target.value
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  value={quotationData.notes}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={4}
                  className="text-base font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
