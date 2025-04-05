import { Quotation, Client, QuotationItem } from '../types';
import { format } from 'date-fns';
import { Employee } from '../types/employee';

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const calculateItemTotal = (item: QuotationItem) => {
  const subtotal = item.quantity * item.price;
  const discountAmount = (subtotal * item.discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const gstAmount = (afterDiscount * item.gst) / 100;
  return afterDiscount + gstAmount;
};

const calculateTotals = (items: QuotationItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalGST = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.price;
    const afterDiscount = itemSubtotal * (1 - item.discount / 100);
    return sum + (afterDiscount * item.gst / 100);
  }, 0);
  const grandTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  return { subtotal, totalGST, grandTotal };
};

export const generateQuotationHTML = (quotation: Quotation, client: Client, employee?: Employee) => {
  const { subtotal, totalGST, grandTotal } = calculateTotals(quotation.items);
  const quoteNo = quotation.quotationRef || `CBL-2025-26-ERR`;
  const quoteDate = format(new Date(quotation.createdAt), 'dd/MM/yyyy');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: right;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-details {
          font-size: 14px;
          line-height: 1.4;
        }
        .quotation-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin: 30px 0;
        }
        .client-details {
          float: left;
          width: 50%;
        }
        .quotation-details {
          float: right;
          width: 50%;
          text-align: right;
        }
        .clear {
          clear: both;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f8f8;
        }
        .amount-column {
          text-align: right;
        }
        .terms {
          margin: 30px 0;
        }
        .terms h3 {
          margin-bottom: 10px;
        }
        .terms ul {
          list-style-type: none;
          padding-left: 0;
        }
        .terms li {
          margin-bottom: 5px;
        }
        .bank-details {
          margin: 30px 0;
        }
        .signature {
          margin-top: 50px;
          text-align: right;
        }
        .total-section {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          margin: 5px 0;
        }
        .contact-person {
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Chembio Lifesciences</div>
        <div class="company-details">
          L-10, Himalaya Legend, Nyay Khand-1<br>
          Indirapuram, Ghaziabad-201014<br>
          Ph: 9911998473, 0120-4909400<br>
          info@chembiolifesciences.com<br>
          GST: 09AAJFC1075D1ZN
        </div>
      </div>

      <div class="quotation-title">QUOTATION</div>

      <div class="client-details">
        <strong>To:</strong><br>
        ${client.name || ''}<br>
        ${client.company || ''}<br>
        ${client.address || ''}<br>
        ${client.gst ? `GST: ${client.gst}` : ''}
      </div>

      <div class="quotation-details">
        <div>Quotation No: ${quoteNo}</div>
        <div>Date: ${quoteDate}</div>
      </div>

      <div class="clear"></div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%">Sr. No.</th>
            <th style="width: 45%">Description of Goods</th>
            <th style="width: 10%">HSN/SAC</th>
            <th style="width: 10%">Qty</th>
            <th style="width: 15%">Rate</th>
            <th style="width: 15%">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items.map((item, index) => `
            <tr>
              <td style="text-align: center">${index + 1}</td>
              <td>${item.description}</td>
              <td style="text-align: center">${item.hsnCode || ''}</td>
              <td style="text-align: center">${item.quantity}</td>
              <td class="amount-column">${formatCurrency(item.price)}</td>
              <td class="amount-column">${formatCurrency(item.quantity * item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">Subtotal: ₹${formatCurrency(subtotal)}</div>
        <div class="total-row">GST: ₹${formatCurrency(totalGST)}</div>
        <div class="total-row"><strong>Grand Total: ₹${formatCurrency(grandTotal)}</strong></div>
      </div>

      <div class="terms">
        <h3>Terms & Conditions:</h3>
        <ul>
          <li>1. Payment Terms: 100% advance with PO</li>
          <li>2. Delivery: Ex-Stock / 4-5 weeks from the date of PO</li>
          <li>3. Freight: Extra as applicable</li>
          <li>4. Validity: 30 days from the date of quotation</li>
          <li>5. GST: Extra as applicable</li>
        </ul>
      </div>

      ${employee ? `
      <div class="contact-person">
        <h3>Contact Person:</h3>
        <div>Name: ${employee.name}</div>
        <div>Mobile: ${employee.mobile}</div>
        <div>Email: ${employee.email}</div>
      </div>
      ` : ''}

      <div class="bank-details">
        <h3>Bank Details:</h3>
        <div>Bank Name: HDFC BANK</div>
        <div>Account No: 50200074357647</div>
        <div>IFSC Code: HDFC0004745</div>
      </div>

      <div class="signature">
        <p>For Chembio Lifesciences</p>
        <br><br>
        <p>Authorized Signatory</p>
      </div>
    </body>
    </html>
  `;
};
