import { generateQuotationRef } from '../utils/generateId';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Quotation, QuotationProduct } from '../types/quotation';
import { format, parse } from 'date-fns';
import { generateWord } from '../utils/documentGenerator';
import { useQuotations } from '../hooks/useQuotations';
import { useClients } from '../hooks/useClients';
import { useItems } from '../hooks/useItems';
import { useEmployees } from '../hooks/useEmployees';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, FileType, Plus, Trash2, Save } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useNavigate, useParams } from 'react-router-dom';
import { quotationService } from '../services/quotationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Item } from '../types/item';

const STORAGE_KEY = 'quotation_draft';

// Default quotation data structure
const defaultQuotationData: Quotation = {
  quotationRef: '',
  createdAt: new Date().toISOString(),
  quotationDate: new Date().toISOString().split('T')[0],
  validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  billTo: {
    name: '',
    company: '',
    contactPerson: '',
    address: '',
    phone: '',
    email: '',
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
  items: [],
  subTotal: 0,
  tax: 0,
  grandTotal: 0,
  paymentTerms: '',
  notes: `Terms & Conditions:
1. Validity: 30 Days
2. Lead Time: Please check individual items for their lead time
3. Please check the item status before placing order
4. Order once placed will not be cancelled`,
  bankDetails: {
    bankName: '',
    accountNo: '',
    ifscCode: '',
    branchCode: '',
    microCode: '',
    accountType: '',
  },
  status: 'PENDING' as const,
  paymentStatus: 'PENDING' as const,
  shippingStatus: 'NOT_STARTED' as const,
  lastUpdated: new Date().toISOString()
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
      return `CBL-2024-25-ERR`;
    }
    return ref;
  } catch (error) {
    console.error('Error generating reference number:', error);
    return `CBL-2024-25-ERR`;
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

// Add new interfaces
interface ItemSuggestion {
  id: string;
  name: string;
  isNew?: boolean;
  catalogueId?: string;
  packSize?: string;
  price?: number;
  hsnCode?: string;
  brand?: string;
}

interface NewItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  initialData: Partial<Item>;
}

// New Item Dialog Component
function NewItemDialog({ isOpen, onClose, onSave, initialData }: NewItemDialogProps) {
  const [itemData, setItemData] = useState<Partial<Item>>({
    name: '',
    catalogueId: '',
    packSize: '',
    price: 0,
    quantity: 0,
    hsnCode: '',
    casNumber: '',
    brand: '',
    ...initialData
  });

  const handleChange = (field: keyof Item, value: string | number) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!itemData.name) {
      toast.error('Item name is required');
      return;
    }
    onSave(itemData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name*</Label>
            <Input
              id="name"
              value={itemData.name || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
              className="col-span-3"
              placeholder="Enter item name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="catalogueId" className="text-right">Catalogue ID</Label>
            <Input
              id="catalogueId"
              value={itemData.catalogueId || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('catalogueId', e.target.value)}
              className="col-span-3"
              placeholder="Enter catalogue ID"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="casNumber" className="text-right">CAS Number</Label>
            <Input
              id="casNumber"
              value={itemData.casNumber || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('casNumber', e.target.value)}
              className="col-span-3"
              placeholder="Enter CAS number (optional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">Make</Label>
            <Input
              id="brand"
              value={itemData.brand || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('brand', e.target.value)}
              className="col-span-3"
              placeholder="Enter manufacturer/brand name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="packSize" className="text-right">Pack Size</Label>
            <Input
              id="packSize"
              value={itemData.packSize || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('packSize', e.target.value)}
              className="col-span-3"
              placeholder="Enter pack size"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Price</Label>
            <Input
              id="price"
              type="number"
              value={itemData.price || 0}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="col-span-3"
              placeholder="Enter price"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hsnCode" className="text-right">HSN Code</Label>
            <Input
              id="hsnCode"
              value={itemData.hsnCode || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('hsnCode', e.target.value)}
              className="col-span-3"
              placeholder="Enter HSN code (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full items-center">
            <span className="text-sm text-gray-500">* Required field</span>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Item</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function QuotationGenerator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode] = useState(!!id);
  const { addQuotation } = useQuotations();
  const { clients } = useClients();
  const { items, addItem } = useItems();
  const { employees } = useEmployees();
  
  const [isSaving, setIsSaving] = useState(false);
  const [quotationData, setQuotationData] = useState<Quotation>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        ...defaultQuotationData,
        ...parsed,
        quotationDate: parsed.quotationDate || new Date().toISOString().split('T')[0],
        validTill: parsed.validTill || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }
    return defaultQuotationData;
  });

  useEffect(() => {
    const loadQuotation = async () => {
      if (id) {
        try {
          const quotations = await quotationService.getQuotations();
          const existingQuotation = quotations.find(q => q.id === id);
          if (existingQuotation) {
            setQuotationData(existingQuotation);
            if (existingQuotation.employee?.id) {
              const matchingEmployee = employees.find(e => e.id === existingQuotation.employee?.id);
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
  }, [id, employees, navigate]);

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
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [newItemInitialData, setNewItemInitialData] = useState<Partial<Item>>({});

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
<<<<<<< HEAD
    const subTotal = items.reduce((sum, item) => {
      const baseAmount = item.qty * item.unit_rate;
      const discountAmount = baseAmount * (item.discount_percent / 100);
      const amountAfterDiscount = baseAmount - discountAmount;
      return sum + amountAfterDiscount;
    }, 0);
=======
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unit_rate), 0);
>>>>>>> c7759322d01449463c85de6a8136862d8970dceb
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

  const addQuotationItem = () => {
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
      console.log('Starting to save quotation...');

      // Update quotation data with selected employee details
      const documentData: Quotation = {
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
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingStatus: 'NOT_STARTED',
        lastUpdated: new Date().toISOString()
      };

      console.log('Document data prepared:', documentData);

      const { buffer, filename } = await generateWord(documentData);
      console.log('Word document generated:', { filename });
      
      // Convert buffer to base64 for storage
      const base64Data = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const quotationToSave: Quotation = {
        ...documentData,
        document: {
          data: base64Data,
          filename
        }
      };

      console.log('Attempting to save quotation...');
      if (isEditMode) {
        console.log('Updating existing quotation:', id);
        await quotationService.updateQuotation(id!, quotationToSave);
        toast.success('Quotation updated successfully');
      } else {
        console.log('Adding new quotation');
        await quotationService.addQuotation(quotationToSave);
        toast.success('Quotation saved successfully');
      }

      console.log('Quotation saved successfully, navigating to /quotations');
      navigate('/quotations');
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Failed to save quotation');
    } finally {
      setIsSaving(false);
    }
  };

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
        ...prev.billTo,
        name: client.name || '',
        company: client.company || '',
        contactPerson: client.name || '',
        address: formattedAddress,
        phone: client.phone || '',
        email: client.email || '',
        gst: client.gst || ''
      }
    }));
    setShowClientSuggestions(false);
  };

  const handleItemSearch = (index: number, field: keyof QuotationProduct, value: string) => {
    const searchValue = value.toLowerCase();
    let suggestions: ItemSuggestion[] = [];

    // Add "Create New Item" suggestion if there's input
    if (value.trim()) {
      suggestions.push({
        id: 'new',
        name: `Create new item: "${value}"`,
        isNew: true,
        catalogueId: value,
        price: 0
      });
    }

    // Add matching existing items
    if (items) {
      const matches = items
        .filter(item => 
          item.name.toLowerCase().includes(searchValue) ||
          item.catalogueId?.toLowerCase().includes(searchValue)
        )
        .map(item => ({
          id: item.id || '',
          name: item.name,
          catalogueId: item.catalogueId,
          packSize: item.packSize,
          price: item.price || 0,
          hsnCode: item.hsnCode,
          brand: item.brand,
        }));
      
      suggestions = [...suggestions, ...matches];
    }

    setItemSuggestions(suggestions);
    setShowItemSuggestions(true);
    setFocusedItemIndex(index);
  };

  const handleSuggestionSelect = async (suggestion: ItemSuggestion, index: number) => {
    if (suggestion.isNew) {
      // Open new item dialog with pre-filled data
      setNewItemInitialData({
        name: '',
        catalogueId: suggestion.catalogueId,
        price: 0
      });
      setIsNewItemDialogOpen(true);
    } else {
      // Handle existing item selection
      const newItems = [...quotationData.items];
      const unitRate = typeof suggestion.price === 'number' ? suggestion.price : 0;
      newItems[index] = {
        ...newItems[index],
        cat_no: suggestion.catalogueId || '',
        pack_size: suggestion.packSize || '',
        product_description: suggestion.name,
        hsn_code: suggestion.hsnCode || '',
        unit_rate: unitRate,
        make: suggestion.brand || '',
      };
      newItems[index].total_price = calculateItemTotal(newItems[index]);
      
      setQuotationData(prev => ({
        ...prev,
        items: newItems,
      }));
      updateTotals(newItems);
    }
    setShowItemSuggestions(false);
  };

  const handleNewItemSave = async (itemData: Partial<Item>) => {
    try {
      if (!itemData.name) {
        toast.error('Item name is required');
        return;
      }

      const newItem: Omit<Item, 'id' | 'createdAt'> = {
        name: itemData.name,
        catalogueId: itemData.catalogueId || '',
        packSize: itemData.packSize || '',
        price: itemData.price || 0,
        quantity: 0,
        hsnCode: itemData.hsnCode || '',
        casNumber: itemData.casNumber || '',
        brand: itemData.brand || '',
        sku: '',
        batchNo: '',
        mfgDate: null,
        expDate: null
      };

      const savedItem = await addItem(newItem);

      if (savedItem) {
        toast.success('Item added to inventory successfully');
        // Update the quotation item with the new item's data
        const index = focusedItemIndex!;
        const newItems = [...quotationData.items];
        newItems[index] = {
          ...newItems[index],
          cat_no: savedItem.catalogueId || '',
          pack_size: savedItem.packSize || '',
          product_description: savedItem.name,
          hsn_code: savedItem.hsnCode || '',
          unit_rate: savedItem.price,
          make: savedItem.brand || '',
        };
        newItems[index].total_price = calculateItemTotal(newItems[index]);
        
        setQuotationData(prev => ({
          ...prev,
          items: newItems,
        }));
        updateTotals(newItems);
      }
    } catch (error) {
      toast.error('Failed to add item to inventory');
      console.error('Error adding item:', error);
    }
    setIsNewItemDialogOpen(false);
  };

  // Update event handler types
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuotationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillToChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuotationData(prev => ({
      ...prev,
      billTo: {
        ...prev.billTo,
        [name]: value
      }
    }));
  };

  const handleBillFromChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuotationData(prev => ({
      ...prev,
      billFrom: {
        ...prev.billFrom,
        [name]: value
      }
    }));
  };

  const handleBankDetailsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuotationData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  return (
    <div className="p-6 max-w-[98vw] mx-auto">
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

        {/* Quotation Details Section */}
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

        {/* Client Details Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
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

        {/* Items Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80 flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Items</CardTitle>
            <Button
              onClick={addQuotationItem}
              variant="outline"
              className="h-9 px-4 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">S.No</TableHead>
                      <TableHead className="w-32">Cat No.</TableHead>
                      <TableHead className="w-32">Pack Size</TableHead>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="w-32">HSN Code</TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-32">Unit Rate</TableHead>
                      <TableHead className="w-28">Discount %</TableHead>
                      <TableHead className="w-32">Discount Value</TableHead>
                      <TableHead className="w-24">GST %</TableHead>
                      <TableHead className="w-32">GST Value</TableHead>
                      <TableHead className="w-32">Total</TableHead>
                      <TableHead className="w-32">Lead Time</TableHead>
                      <TableHead className="w-32">Make</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center font-medium">{item.sno}</TableCell>
                        <TableCell className="relative">
                          <Input
                            type="text"
                            value={item.cat_no}
                            onChange={(e) => {
                              handleItemSearch(index, 'cat_no', e.target.value);
                              handleItemChange(index, 'cat_no', e.target.value);
                            }}
                            placeholder="Enter catalog number"
                            className="text-base min-w-[120px]"
                          />
                          {showItemSuggestions && itemSuggestions.length > 0 && index === focusedItemIndex && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {itemSuggestions.map((suggestion, idx) => {
                                const isNewItem = !suggestion.id || suggestion.id === 'new';
                                return (
                                  <div
                                    key={idx}
                                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                      isNewItem ? 'border-l-4 border-blue-500' : ''
                                    }`}
                                    onClick={() => handleSuggestionSelect(suggestion, index)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="font-medium">
                                          {suggestion.catalogueId || 'New Item'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {suggestion.name}
                                        </div>
                                      </div>
                                      {isNewItem && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                          New Item
                                        </span>
                                      )}
                                    </div>
                                    {!isNewItem && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {suggestion.packSize && `Pack Size: ${suggestion.packSize}`}
                                        {suggestion.hsnCode && ` • HSN: ${suggestion.hsnCode}`}
                                        {(suggestion.price ?? 0) > 0 && ` • Price: ₹${suggestion.price}`}
                                      </div>
                                    )}
                                    {isNewItem && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        Click to add as a new item to your inventory
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                      <TableCell colSpan={11} className="text-right font-medium text-gray-600">Sub Total:</TableCell>
                      <TableCell colSpan={4} className="text-right font-medium text-gray-600">₹{quotationData.subTotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={11} className="text-right font-medium text-gray-600 border-t border-gray-200">Total GST:</TableCell>
                      <TableCell colSpan={4} className="text-right font-medium text-gray-600 border-t border-gray-200">₹{quotationData.tax.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={11} className="text-right font-semibold text-gray-900 border-t border-gray-200">Grand Total:</TableCell>
                      <TableCell colSpan={4} className="text-right font-semibold text-gray-900 border-t border-gray-200">₹{quotationData.grandTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>

            {/* Updated Totals Section with light background */}
            <div className="flex justify-end mt-6">
              <div className="w-72 space-y-2">
                <div className="flex justify-between items-center py-2 text-gray-600">
                  <span className="font-medium">Sub Total:</span>
                  <span>₹{quotationData.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-gray-600 border-t border-gray-200">
                  <span className="font-medium">Total GST:</span>
                  <span>₹{quotationData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-gray-900 border-t border-gray-200">
                  <span className="font-semibold">Grand Total:</span>
                  <span className="font-semibold">₹{quotationData.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50/80">
            <CardTitle className="text-lg font-semibold">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Terms</Label>
                <Select
                  value={quotationData.paymentTerms}
                  onValueChange={(value) => setQuotationData(prev => ({
                    ...prev,
                    paymentTerms: value
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50% Advance payment and 50% at the time of delivery of item">
                      50% Advance payment and 50% at the time of delivery of item
                    </SelectItem>
                    <SelectItem value="100% payment within 15 days of delivery of items">
                      100% payment within 15 days of delivery of items
                    </SelectItem>
                    <SelectItem value="100% payment within 30 days of delivery of items">
                      100% payment within 30 days of delivery of items
                    </SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Add the NewItemDialog */}
      <NewItemDialog
        isOpen={isNewItemDialogOpen}
        onClose={() => setIsNewItemDialogOpen(false)}
        onSave={handleNewItemSave}
        initialData={newItemInitialData}
      />
    </div>
  );
}
