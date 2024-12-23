import { Document, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, WidthType } from 'docx';
import { saveAs } from "file-saver";
import { QuotationData } from '../types/quotation-generator';
import { format, parse } from "date-fns";
import { Packer } from "docx";

const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericAmount);
};

const formatDate = (dateStr: string): string => {
  try {
    // First try parsing as dd/MM/yyyy
    const date = parse(dateStr, 'dd/MM/yyyy', new Date());
    return format(date, 'dd/MM/yyyy');
  } catch {
    try {
      // If that fails, try parsing as ISO string
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy');
    } catch {
      // If all parsing fails, return the original string
      return dateStr;
    }
  }
};

export const generateWord = async (data: QuotationData) => {
  console.log('Quotation Date:', data.quotationDate);
  console.log('Valid Till:', data.validTill);
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Company Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: data.billFrom.name, bold: true, size: 28 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: data.billFrom.address, size: 24 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Email: ${data.billFrom.email} Tel: ${data.billFrom.phone}`, size: 24 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `PAN No. ${data.billFrom.pan}; GST No. ${data.billFrom.gst}`, size: 24 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Quotation Title
        new Paragraph({
          children: [
            new TextRun({ text: 'Quotation', bold: true, size: 28 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Client Details
        new Paragraph({
          children: [
            new TextRun({ text: 'To:', size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: data.billTo.name, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: data.billTo.address, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Tel. No.: ${data.billTo.phone}`, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Email: ${data.billTo.email}`, size: 24 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Quotation Details
        new Paragraph({
          children: [
            new TextRun({ text: `Ref No: ${data.quotationRef}`, size: 24 }),
            new TextRun({ 
              text: `\tDate: ${formatDate(data.quotationDate)}`, 
              size: 24 
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Items Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
          rows: [
            new TableRow({
              children: [
                'S.No', 'Cat No.', 'Pack Size', 'Description', 'Qty', 'Unit Rate',
                'Discount %', 'Discount Value', 'GST %', 'GST Value', 'Total', 'Lead Time', 'Make',
              ].map(header => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: header, bold: true, size: 24 })] })],
              })),
            }),
            ...data.items.map(item => new TableRow({
              children: [
                item.sno.toString(),
                item.cat_no,
                item.pack_size,
                item.product_description,
                item.qty.toString(),
                formatCurrency(item.unit_rate),
                `${item.discount_percent}%`,
                formatCurrency(item.discounted_value),
                `${item.gst_percent}%`,
                formatCurrency(item.gst_value),
                formatCurrency(item.total_price),
                item.lead_time,
                item.make,
              ].map(text => new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text, size: 24 })] })],
              })),
            })),
          ],
        }),
        new Paragraph({ text: '' }),

        // Totals
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `Sub Total: ${formatCurrency(data.subTotal)}`, size: 24 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `Total GST: ${formatCurrency(data.tax)}`, size: 24 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `Grand Total: ${formatCurrency(data.grandTotal)}`, bold: true, size: 24 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Bank Details
        new Paragraph({
          children: [
            new TextRun({ text: data.bankDetails.bankName, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Account No: ${data.bankDetails.accountNo}; NEFT/RTGS IFSC: ${data.bankDetails.ifscCode}`, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Branch code: ${data.bankDetails.branchCode}; Micro code: ${data.bankDetails.microCode}; Account type: ${data.bankDetails.accountType}`, size: 24 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Terms & Conditions
        new Paragraph({
          children: [
            new TextRun({ text: 'Terms & Conditions:', bold: true, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `• Payment: ${data.paymentTerms}`, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ 
              text: `• Validity: ${formatDate(data.validTill)}`, 
              size: 24 
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '• Please check specification before order', size: 24 }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Notes
        ...(data.notes ? [
          new Paragraph({
            children: [
              new TextRun({ text: 'Notes:', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data.notes, size: 24 }),
            ],
          }),
          new Paragraph({ text: '' }),
        ] : []),

        // Signature
        new Paragraph({
          children: [
            new TextRun({ text: data.billFrom.name, size: 24 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Authorized Signatory', size: 24 }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, 'Quotation.docx');
};
