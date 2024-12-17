import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle, HeadingLevel, WidthType } from 'docx';
import { Quotation, Client, QuotationItem } from '../types';
import { format } from 'date-fns';
import ChembioLogo from '../assets/chembio-logo.png';

const COMPANY_NAME = 'Chembio Lifesciences';
const COMPANY_ADDRESS = 'L-10, Himalaya Legend, Nyay Khand-1';
const COMPANY_CITY = 'Indirapuram, Ghaziabad-201014';
const COMPANY_PHONE = 'Ph: 9911998473, 0120-4909400';
const COMPANY_EMAIL = 'info@chembiolifesciences.com';
const COMPANY_GST = 'GST: XXXXXXXXXXXXX';
const BANK_DETAILS = {
  BANK: 'HDFC BANK',
  ACCOUNT_NUMBER: 'XXXXXXXXX',
  IFSC: 'XCVX2343CC'
};

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);  // This will display numbers as "3823.00"
};

const calculateItemTotal = (item: QuotationItem) => {
  const baseAmount = item.price * item.quantity;
  const discountAmount = baseAmount * (item.discount / 100);
  const afterDiscount = baseAmount - discountAmount;
  const gstAmount = afterDiscount * (item.gst / 100);
  return afterDiscount + gstAmount;
};

const calculateTotals = (items: QuotationItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalGST = items.reduce((sum, item) => {
    const baseAmount = item.price * item.quantity;
    const discountAmount = baseAmount * (item.discount / 100);
    const afterDiscount = baseAmount - discountAmount;
    return sum + (afterDiscount * (item.gst / 100));
  }, 0);
  const grandTotal = subtotal + totalGST;
  return { subtotal, totalGST, grandTotal };
};

export const generatePDF = async (quotation: Quotation, client: Client) => {
  const doc = new jsPDF();
  
  try {
    const response = await fetch(ChembioLogo);
    const blob = await response.blob();
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64data = reader.result as string;
      
      // Logo on left
      const imgWidth = 40;
      const imgHeight = 20;
      doc.addImage(base64data, 'PNG', 20, 10, imgWidth, imgHeight);
      
      // Company details on right
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(COMPANY_NAME, doc.internal.pageSize.width - 20, 20, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_ADDRESS, doc.internal.pageSize.width - 20, 25, { align: 'right' });
      doc.text(COMPANY_CITY, doc.internal.pageSize.width - 20, 30, { align: 'right' });
      doc.text(COMPANY_PHONE, doc.internal.pageSize.width - 20, 35, { align: 'right' });
      doc.text(COMPANY_EMAIL, doc.internal.pageSize.width - 20, 40, { align: 'right' });
      doc.text(COMPANY_GST, doc.internal.pageSize.width - 20, 45, { align: 'right' });

      // Quotation details table on right
      (doc as any).autoTable({
        startY: 55,
        tableWidth: 80,
        margin: { left: doc.internal.pageSize.width - 100 },
        body: [
          ['Quote/Performa Invoice', `QT-${quotation.id.slice(0, 8).toUpperCase()}`],
          ['Quotation Date', format(new Date(quotation.createdAt), 'dd/MM/yyyy')],
          ['Valid From', format(new Date(quotation.createdAt), 'dd/MM/yyyy')],
          ['Valid To', format(new Date(quotation.validUntil), 'dd/MM/yyyy')],
        ],
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        }
      });

      // Client details on left
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('To:', 20, 60);
      doc.setFont('helvetica', 'normal');
      doc.text([
        client.name,
        client.company,
        `Email: ${client.email}`,
        `Phone: ${client.phone}`
      ], 20, 65);

      // Items table
      const tableData = quotation.items.map((item, index) => [
        (index + 1).toString(),
        item.description,
        item.quantity.toString(),
        formatCurrency(item.price),
        `${item.gst}%`,
        `${item.discount}%`,
        formatCurrency(calculateItemTotal(item))
      ]);

      (doc as any).autoTable({
        startY: 90,
        head: [['Sl.No.', 'Material No / Description / HSNCode', 'QTY/UOM', 'Unit Price', 'GST Rate', 'Discount', 'Total Price']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 30, halign: 'right', cellPadding: { right: 5 } },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 35, halign: 'right', cellPadding: { right: 5 } }
        },
        margin: { left: 10, right: 10 }
      });

      // Calculate totals
      const { subtotal, totalGST, grandTotal } = calculateTotals(quotation.items);

      // Summary table
      const summaryY = (doc as any).lastAutoTable.finalY + 10;
      (doc as any).autoTable({
        startY: summaryY,
        body: [
          ['SUBTOTAL', '', '', '', '', '', formatCurrency(subtotal)],
          ['IGST', '', '', '', '', '', formatCurrency(totalGST)],
          ['GRAND TOTAL', '', '', '', '', '', formatCurrency(grandTotal)]
        ],
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 1
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          6: { halign: 'right' }
        },
        margin: { left: doc.internal.pageSize.width - 100 }
      });

      // Notes
      doc.setFontSize(8);
      doc.text([
        'Notes:',
        '• Prices quoted are for the stated quantities and the right is reserved to increase the price for lesser requirements.',
        '• Product supply is subject to availability'
      ], 20, summaryY + 30);

      // Bank Details
      const bankY = summaryY + 50;
      doc.setFont('helvetica', 'bold');
      doc.text('Bank Details:', 20, bankY);
      doc.setFont('helvetica', 'normal');
      doc.text([
        `Bank: ${BANK_DETAILS.BANK}`,
        `Account Number: ${BANK_DETAILS.ACCOUNT_NUMBER}`,
        `IFSC Code: ${BANK_DETAILS.IFSC}`
      ], 20, bankY + 5);

      // Footer
      const footerY = doc.internal.pageSize.height - 10;
      doc.setFontSize(8);
      doc.text('This is a computer-generated document. No signature is required.', doc.internal.pageSize.width / 2, footerY, { align: 'center' });

      // Save the PDF
      doc.save(`Quotation-${quotation.id}.pdf`);
    };
    
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export const generateDOCX = async (quotation: Quotation, client: Client) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header with Logo and Company Details
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                // Logo Cell (Left)
                new TableCell({
                  children: [new Paragraph({ text: '[Logo Placeholder]' })],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                // Company Details Cell (Right)
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: COMPANY_NAME + '\n', size: 32, bold: true }),
                        new TextRun({ text: COMPANY_ADDRESS + '\n', size: 20 }),
                        new TextRun({ text: COMPANY_CITY + '\n', size: 20 }),
                        new TextRun({ text: COMPANY_PHONE + '\n', size: 20 }),
                        new TextRun({ text: COMPANY_EMAIL + '\n', size: 20 }),
                        new TextRun({ text: COMPANY_GST + '\n', size: 20 }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ],
        }),

        // Quotation Details and Client Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                // Client Details (Left)
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'To:\n', bold: true }),
                        new TextRun({ text: client.name + '\n' }),
                        new TextRun({ text: client.company + '\n' }),
                        new TextRun({ text: `Email: ${client.email}\n` }),
                        new TextRun({ text: `Phone: ${client.phone}\n` }),
                      ],
                    }),
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                // Quotation Details (Right)
                new TableCell({
                  children: [
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: 'Quote/Performa Invoice', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: `QT-${quotation.id.slice(0, 8).toUpperCase()}` })] }),
                          ],
                        }),
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: 'Quotation Date', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: format(new Date(quotation.createdAt), 'dd/MM/yyyy') })] }),
                          ],
                        }),
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: 'Valid From', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: format(new Date(quotation.createdAt), 'dd/MM/yyyy') })] }),
                          ],
                        }),
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: 'Valid To', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: format(new Date(quotation.validUntil), 'dd/MM/yyyy') })] }),
                          ],
                        }),
                      ],
                    }),
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
          ],
        }),

        // Items Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              children: [
                'Sl.No.',
                'Material No / Description / HSNCode',
                'QTY/UOM',
                'Unit Price',
                'GST Rate',
                'Discount',
                'Total Price'
              ].map((header, index) => 
                new TableCell({
                  children: [new Paragraph({ 
                    text: header, 
                    alignment: AlignmentType.CENTER, 
                    bold: true 
                  })],
                  width: {
                    size: index === 0 ? 5 :  // Sl.No.
                         index === 1 ? 30 :  // Description
                         index === 2 ? 8 :   // QTY
                         index === 3 ? 15 :  // Unit Price
                         index === 4 ? 8 :   // GST
                         index === 5 ? 8 :   // Discount
                         18,                 // Total Price
                    type: WidthType.PERCENTAGE,
                  },
                })
              ),
            }),
            // Data rows
            ...quotation.items.map((item, index) => {
              const total = calculateItemTotal(item);
              return new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: item.description })]
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: formatCurrency(item.price), alignment: AlignmentType.RIGHT })],
                    margins: { right: 240 }  // Add right margin for price alignment
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: `${item.gst}%`, alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: `${item.discount}%`, alignment: AlignmentType.CENTER })]
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: formatCurrency(total), alignment: AlignmentType.RIGHT })],
                    margins: { right: 240 }  // Add right margin for price alignment
                  }),
                ],
              });
            }),
          ],
        }),

        // Summary Section
        new Table({
          width: { size: 40, type: WidthType.PERCENTAGE },
          alignment: AlignmentType.RIGHT,
          rows: [
            ...Object.entries(calculateTotals(quotation.items)).map(([key, value]) => 
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      text: key === 'subtotal' ? 'SUBTOTAL' : 
                           key === 'totalGST' ? 'IGST' : 'GRAND TOTAL',
                      bold: true 
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      text: formatCurrency(value),
                      alignment: AlignmentType.RIGHT
                    })],
                  }),
                ],
              })
            ),
          ],
        }),

        // Notes
        new Paragraph({
          text: 'Notes:',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun('• Prices quoted are for the stated quantities and the right is reserved to increase the price for lesser requirements.\n'),
            new TextRun('• Product supply is subject to availability\n'),
          ],
        }),

        // Bank Details
        new Paragraph({
          text: 'Bank Details:',
          bold: true,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun(`Bank: ${BANK_DETAILS.BANK}\n`),
            new TextRun(`Account Number: ${BANK_DETAILS.ACCOUNT_NUMBER}\n`),
            new TextRun(`IFSC Code: ${BANK_DETAILS.IFSC}\n`),
          ],
        }),

        // Footer
        new Paragraph({
          text: 'This is a computer-generated document. No signature is required.',
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  // Generate and save document
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Quotation-${quotation.id}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Test function to generate sample documents
export const testDocumentGeneration = async () => {
  const sampleQuotation: Quotation = {
    id: '12345678',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    items: [
      {
        id: '1',
        description: 'Laboratory Microscope XYZ-1000\nHSN: 90118000',
        quantity: 1,
        price: 125000,
        gst: 18,
        discount: 10
      },
      {
        id: '2',
        description: 'Digital pH Meter ABC-200\nHSN: 90278010',
        quantity: 2,
        price: 15000,
        gst: 18,
        discount: 5
      },
      {
        id: '3',
        description: 'Analytical Balance DEF-500\nHSN: 90160000',
        quantity: 1,
        price: 85000,
        gst: 18,
        discount: 8
      }
    ]
  };

  const sampleClient: Client = {
    id: '1',
    name: 'Dr. John Smith',
    company: 'Research Labs Pvt. Ltd.',
    email: 'john.smith@researchlabs.com',
    phone: '+91 98765 43210'
  };

  // Generate both PDF and Word documents
  await generatePDF(sampleQuotation, sampleClient);
  await generateDOCX(sampleQuotation, sampleClient);
};
