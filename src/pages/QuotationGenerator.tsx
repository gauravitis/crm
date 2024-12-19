import React, { useEffect, useState } from 'react';
import { QuotationData, QuotationProduct } from '../types/quotation-generator';
import { format } from 'date-fns';
import { generateWord } from '../utils/documentGenerator';
import { FileText, FileType, Plus, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const STORAGE_KEY = 'quotationData';

// Function to generate random 3 letters
const generateRandomLetters = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
};

// Function to generate reference number
const generateReferenceNumber = () => {
  const date = new Date();
  const dateStr = format(date, 'ddMMyy');
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
  quotationDate: format(new Date(), 'yyyy-MM-dd'),
  validTill: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
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

export default function QuotationGenerator() {
  const [quotationData, setQuotationData] = useState<QuotationData>({
    ...defaultQuotationData,
    quotationRef: generateReferenceNumber(),
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      setQuotationData(JSON.parse(savedData));
    } else {
      // Only generate new reference number if there's no saved data
      setQuotationData(prev => ({
        ...defaultQuotationData,
        quotationRef: generateReferenceNumber(),
      }));
    }
  }, []);

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
      await generateWord(quotationData);
      toast.success('Word document generated successfully!');
    } catch (error) {
      console.error('Error generating docx document:', error);
      toast.error('Failed to generate document');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quotation Generator</h1>
          <div className="space-x-2">
            <button
              onClick={handleGenerateQuotation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
            >
              Generate Word
            </button>
            <button
              onClick={clearData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* Client Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={quotationData.billTo.name}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  billTo: { ...prev.billTo, name: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={quotationData.billTo.address}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  billTo: { ...prev.billTo, address: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={quotationData.billTo.phone}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  billTo: { ...prev.billTo, phone: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={quotationData.billTo.email}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  billTo: { ...prev.billTo, email: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Quotation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference No.</label>
              <input
                type="text"
                value={quotationData.quotationRef}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  quotationRef: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={quotationData.quotationDate}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  quotationDate: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valid Till</label>
              <input
                type="date"
                value={quotationData.validTill}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  validTill: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button
              onClick={addItem}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Cat No.</th>
                  <th className="px-4 py-2">Pack Size</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Unit Rate</th>
                  <th className="px-4 py-2">Discount %</th>
                  <th className="px-4 py-2">Discount Value</th>
                  <th className="px-4 py-2">GST %</th>
                  <th className="px-4 py-2">GST Value</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Lead Time</th>
                  <th className="px-4 py-2">Make</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotationData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{item.sno}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.cat_no}
                        onChange={(e) => handleItemChange(index, 'cat_no', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.pack_size}
                        onChange={(e) => handleItemChange(index, 'pack_size', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.product_description}
                        onChange={(e) => handleItemChange(index, 'product_description', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.unit_rate}
                        onChange={(e) => handleItemChange(index, 'unit_rate', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.discount_percent}
                        onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)}
                        min="0"
                        max="100"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">₹{item.discounted_value.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={item.gst_percent}
                        onChange={(e) => handleItemChange(index, 'gst_percent', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">₹{item.gst_value.toFixed(2)}</td>
                    <td className="px-4 py-2">₹{item.total_price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.lead_time}
                        onChange={(e) => handleItemChange(index, 'lead_time', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.make}
                        onChange={(e) => handleItemChange(index, 'make', e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-right font-medium">Sub Total:</td>
                  <td colSpan={4} className="px-4 py-2">₹{quotationData.subTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-right font-medium">Total GST:</td>
                  <td colSpan={4} className="px-4 py-2">₹{quotationData.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-right font-medium">Grand Total:</td>
                  <td colSpan={4} className="px-4 py-2 font-bold">₹{quotationData.grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
              <input
                type="text"
                value={quotationData.paymentTerms}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  paymentTerms: e.target.value
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={quotationData.notes}
                onChange={(e) => setQuotationData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
