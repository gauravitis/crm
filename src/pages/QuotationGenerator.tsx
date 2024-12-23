import React, { useEffect, useState } from 'react';
import { QuotationData, QuotationProduct } from '../types/quotation-generator';
import { format, parse } from 'date-fns';
import { generateWord } from '../utils/documentGenerator';
import { FileText, FileType, Plus, Trash2, Save } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuotations } from '../hooks/useQuotations';
import { useClients } from '../hooks/useClients';
import { useItems } from '../hooks/useItems';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

const STORAGE_KEY = 'quotationData';

// Function to generate random 3 letters
const generateRandomLetters = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
};

// Function to generate reference number
const generateReferenceNumber = () => {
  const date = new Date();
  const dateStr = format(date, 'dd/MM/yyyy');
  const randomLetters = generateRandomLetters();
  return `CBL-${dateStr}-${randomLetters}`;
};

const defaultProduct: QuotationProduct = {
  sno: 1,
  cat_no: '',
  pack_size: '',
  product_description: '',
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

const defaultQuotationData: QuotationData = {
  billTo: {
    name: '',
    address: '',
    phone: '',
    email: '',
  },
  billFrom: {
    name: 'CHEMBIO LIFESCIENCES',
    address: 'L-10, 1st Floor, Himalaya Legend, Near Indirapuram Public School\nNyay Khand-1, Indirapuram, Ghaziabad-201014.',
    phone: '0120 4909400',
    email: 'chembio.sales@gmail.com',
    gst: '09AALFC0922C1ZU',
    pan: 'AALFC0922C',
  },
  quotationRef: '',
  quotationDate: new Date().toISOString(),
  validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  items: [defaultProduct],
  subTotal: 0,
  tax: 0,
  grandTotal: 0,
  notes: '',
  paymentTerms: '100% advance payment',
  bankDetails: {
    bankName: 'HDFC BANK LTD.',
    accountNo: '50200017511430',
    ifscCode: 'HDFC0000590',
    branchCode: '0590',
    microCode: '110240081',
    accountType: 'Current account',
  },
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
  const { addQuotation } = useQuotations();
  const { clients } = useClients();
  const { items } = useItems();
  const [quotationData, setQuotationData] = useState<QuotationData>(
    () => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return {
        ...defaultQuotationData,
        quotationRef: generateReferenceNumber(),
      };
    }
  );
  const [clientSuggestions, setClientSuggestions] = useState<any[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<any[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

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
      items: newItems,
    }));
    updateTotals(newItems);
  };

  const clearData = () => {
    const newData = {
      ...defaultQuotationData,
      quotationRef: generateReferenceNumber(),
    };
    localStorage.removeItem(STORAGE_KEY);
    setQuotationData(newData);
  };

  const handleGenerateQuotation = async () => {
    try {
      // Ensure dates are in the correct format before generating Word document
      const formattedData = {
        ...quotationData,
        quotationDate: format(new Date(), 'dd/MM/yyyy'),
        validTill: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')
      };
      console.log('Generating quotation with data:', formattedData);
      await generateWord(formattedData);
      toast.success('Word document generated successfully!');
    } catch (error) {
      console.error('Error generating docx document:', error);
      toast.error('Failed to generate document');
    }
  };

  const handleSaveQuotation = async () => {
    try {
      // Ensure all numeric values are properly converted
      const processedItems = quotationData.items.map(item => ({
        ...item,
        qty: Number(item.qty || 0),
        unit_rate: Number(item.unit_rate || 0),
        discount_percent: Number(item.discount_percent || 0),
        gst_percent: Number(item.gst_percent || 0),
        total_price: Number(item.total_price || 0)
      }));

      const quotationToSave = {
        ...quotationData,
        items: processedItems,
        subTotal: Number(quotationData.subTotal || 0),
        tax: Number(quotationData.tax || 0),
        grandTotal: Number(quotationData.grandTotal || 0)
      };
      
      await addQuotation(quotationToSave);
      toast.success('Quotation saved successfully!');
      // Clear the form after successful save
      clearData();
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Failed to save quotation');
    }
  };

  const handleClientNameChange = (value: string) => {
    // Update the quotation data
    setQuotationData(prev => ({
      ...prev,
      billTo: {
        ...prev.billTo,
        name: value
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
        name: client.name || '',
        company: client.company || '',
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

  const handleItemSelect = (index: number, item: any) => {
    const updatedItems = [...quotationData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      cat_no: item.catalogueId || '',
      pack_size: item.packSize || '',
      product_description: item.name || '',
      unit_rate: Number(item.price || 0),
      make: item.brand || '',
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
                <Label className="text-sm font-medium">Name</Label>
                <Input
                  type="text"
                  value={quotationData.billTo.name}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  placeholder="Start typing client name..."
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
                  value={quotationData.quotationRef}
                  onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    quotationRef: e.target.value
                  }))}
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
