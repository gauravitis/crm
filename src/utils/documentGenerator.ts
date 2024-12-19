import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } from 'docx';
import { Quotation, Client, QuotationItem } from '../types';
import { format } from 'date-fns';

const formatCurrency = (amount: number) => {
  return amount.toFixed(2);
};

const calculateGST = (item: QuotationItem) => {
  const baseAmount = item.quantity * item.price;
  return (baseAmount * item.gst) / 100;
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

export const generatePDF = async (quotation: Quotation, client: Client) => {
  const doc = new jsPDF();
  
  // Add company logo text
  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 87, 183); // Blue color for CHEMBIO
  doc.text('CHEMBIO', 20, 30);

  // Add company details
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CHEMBIO LIFESCIENCES', doc.internal.pageSize.getWidth() - 10, 20, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('L-10,1st Floor, Himalaya Legend, Near Indirapuram Public School', doc.internal.pageSize.getWidth() - 10, 25, { align: 'right' });
  doc.text('Nyay Khand-1, Indirapuram, Ghaziabad-201014.', doc.internal.pageSize.getWidth() - 10, 30, { align: 'right' });
  doc.text('Email: chembio.sales@gmail.com', doc.internal.pageSize.getWidth() - 10, 35, { align: 'right' });
  doc.text('Tel: 0120 4909400', doc.internal.pageSize.getWidth() - 10, 40, { align: 'right' });
  doc.text('PAN No. AALFC0922C; GST No. 09AALFC0922C1ZU', doc.internal.pageSize.getWidth() - 10, 45, { align: 'right' });

  // Add Quotation title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Quotation', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

  // Add client and quotation details in a table-like structure
  doc.setFontSize(10);
  doc.text('To,', 10, 70);
  
  // Left side (Client details)
  const clientName = client.name || '';
  const clientCompany = client.company || '';
  const clientAddress = typeof client.address === 'string' ? client.address : 
                       (client.address ? JSON.stringify(client.address) : '');
  
  let yPos = 75;
  [clientCompany, clientAddress].forEach(line => {
    if (line) {
      doc.text(line, 10, yPos);
      yPos += 5;
    }
  });

  if (client.phone) {
    doc.text(`Tel.No.: ${client.phone}`, 10, yPos);
    yPos += 5;
  }

  if (clientName) {
    doc.text(`Kind Attn: ${clientName}`, 10, yPos);
    yPos += 5;
  }

  // Right side (Quotation details)
  const quoteNo = `CBLS/${format(new Date(), 'yy')}-${format(new Date(), 'yy')+1}/${quotation.id.slice(0, 4)}`;
  const quoteDate = format(new Date(quotation.createdAt), 'dd-MMM-yyyy');
  
  doc.text('Your Ref:', doc.internal.pageSize.getWidth() - 60, 70);
  doc.text('Ref No:', doc.internal.pageSize.getWidth() - 60, 75);
  doc.text('Date:', doc.internal.pageSize.getWidth() - 60, 80);
  
  doc.text(quoteNo, doc.internal.pageSize.getWidth() - 10, 75, { align: 'right' });
  doc.text(quoteDate, doc.internal.pageSize.getWidth() - 10, 80, { align: 'right' });

  // Add introduction text
  doc.setFont('helvetica', 'normal');
  doc.text('Dear Sir/Madam,', 10, yPos + 10);
  doc.text('We wish to thank you for your interest in our Products. We hereby quote as below:', 10, yPos + 15);

  // Add items table
  const tableColumns = [
    'S. No.',
    'Cat no.',
    'Pack Size',
    'Product Description',
    'Qty.',
    'Unit rate',
    'Discounted Value',
    'Expended value',
    'Gst %',
    'GST value',
    'Total Price INR',
    'Lead time',
    'Make'
  ];

  const tableData = quotation.items.map((item, index) => {
    const baseAmount = item.quantity * item.price;
    const gstAmount = calculateGST(item);
    return [
      (index + 1).toString(),
      item.catalogNo || '',
      item.packSize || '',
      item.description,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(baseAmount),
      formatCurrency(baseAmount),
      `${item.gst}%`,
      formatCurrency(gstAmount),
      formatCurrency(baseAmount + gstAmount),
      '1-2 weeks',
      item.make || ''
    ];
  });

  (doc as any).autoTable({
    startY: yPos + 25,
    head: [tableColumns],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 10 }, // S. No.
      1: { cellWidth: 20 }, // Cat no.
      2: { cellWidth: 15 }, // Pack Size
      3: { cellWidth: 40 }, // Product Description
      4: { cellWidth: 10 }, // Qty.
      5: { cellWidth: 15 }, // Unit rate
      6: { cellWidth: 20 }, // Discounted Value
      7: { cellWidth: 20 }, // Expended value
      8: { cellWidth: 10 }, // Gst %
      9: { cellWidth: 15 }, // GST value
      10: { cellWidth: 20 }, // Total Price INR
      11: { cellWidth: 15 }, // Lead time
      12: { cellWidth: 15 }  // Make
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // Add bank details
  doc.setFont('helvetica', 'bold');
  doc.text('HDFC BANK LTD.', 10, finalY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text([
    'Account No: 50200017511430 ; NEFT/RTGS IFCS : HDFC0000590',
    'Branch code:0590 ; Micro code : 110240081 ;Account type: Current account'
  ], 10, finalY + 25);

  // Add terms and conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', 10, finalY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text([
    '1) Payment: Payment within 15 days.',
    '2) Validity: 30Days',
    '3) Please check specification before order'
  ], 10, finalY + 45);

  // Add signature
  doc.setFont('helvetica', 'bold');
  doc.text('CHEMBIO LIFESCIENCES', doc.internal.pageSize.getWidth() - 10, finalY + 60, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', doc.internal.pageSize.getWidth() - 10, finalY + 70, { align: 'right' });

  doc.save(`Quotation-${quotation.id}.pdf`);
};

export const generateWord = async (quotation: Quotation, client: Client) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Company Header
        new Paragraph({
          children: [
            new TextRun({
              text: "CHEMBIO",
              size: 72,
              bold: true,
              color: "0057B7"
            })
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: "CHEMBIO LIFESCIENCES\n",
              size: 32,
              bold: true
            }),
            new TextRun({
              text: "L-10,1st Floor, Himalaya Legend, Near Indirapuram Public School\n" +
                    "Nyay Khand-1, Indirapuram, Ghaziabad-201014.\n" +
                    "Email: chembio.sales@gmail.com\n" +
                    "Tel: 0120 4909400\n" +
                    "PAN No. AALFC0922C; GST No. 09AALFC0922C1ZU",
              size: 20,
            })
          ],
        }),

        // Quotation Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400,
            after: 400,
          },
          children: [
            new TextRun({
              text: "Quotation",
              size: 28,
              bold: true
            })
          ],
        }),

        // Client and Quotation Details Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun("To,\n"),
                        new TextRun(client.company || ""),
                        new TextRun("\n" + (client.address || "")),
                        new TextRun(client.phone ? "\nTel.No.: " + client.phone : ""),
                        new TextRun(client.name ? "\nKind Attn: " + client.name : ""),
                      ],
                    }),
                  ],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun("Your Ref: store@fraclabs.org\n"),
                        new TextRun("Ref No: " + `CBLS/${format(new Date(), 'yy')}-${format(new Date(), 'yy')+1}/${quotation.id.slice(0, 4)}\n`),
                        new TextRun("Date: " + format(new Date(quotation.createdAt), 'dd-MMM-yyyy')),
                      ],
                    }),
                  ],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                }),
              ],
            }),
          ],
        }),

        // Introduction Text
        new Paragraph({
          spacing: {
            before: 400,
            after: 200,
          },
          children: [
            new TextRun("Dear Sir/Madam,\n"),
            new TextRun("We wish to thank you for your interest in our Products. We hereby quote as below:"),
          ],
        }),

        // Items Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            // Header Row
            new TableRow({
              children: [
                "S. No.", "Cat no.", "Pack Size", "Product Description", "Qty.",
                "Unit rate", "Discounted Value", "Expended value", "Gst %",
                "GST value", "Total Price INR", "Lead time", "Make"
              ].map(text => 
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                })
              ),
            }),
            // Data Rows
            ...quotation.items.map((item, index) => {
              const baseAmount = item.quantity * item.price;
              const gstAmount = calculateGST(item);
              return new TableRow({
                children: [
                  (index + 1).toString(),
                  item.catalogNo || "",
                  item.packSize || "",
                  item.description,
                  item.quantity.toString(),
                  formatCurrency(item.price),
                  formatCurrency(baseAmount),
                  formatCurrency(baseAmount),
                  `${item.gst}%`,
                  formatCurrency(gstAmount),
                  formatCurrency(baseAmount + gstAmount),
                  "1-2 weeks",
                  item.make || ""
                ].map(text => 
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text })] })],
                  })
                ),
              });
            }),
          ],
        }),

        // Bank Details
        new Paragraph({
          spacing: {
            before: 400,
          },
          children: [
            new TextRun({
              text: "HDFC BANK LTD.\n",
              bold: true
            }),
            new TextRun(
              "Account No: 50200017511430 ; NEFT/RTGS IFCS : HDFC0000590\n" +
              "Branch code:0590 ; Micro code : 110240081 ;Account type: Current account"
            ),
          ],
        }),

        // Terms and Conditions
        new Paragraph({
          spacing: {
            before: 400,
          },
          children: [
            new TextRun({
              text: "Terms & Conditions:\n",
              bold: true
            }),
            new TextRun(
              "1) Payment: Payment within 15 days.\n" +
              "2) Validity: 30Days\n" +
              "3) Please check specification before order"
            ),
          ],
        }),

        // Signature
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: {
            before: 400,
          },
          children: [
            new TextRun({
              text: "CHEMBIO LIFESCIENCES\n",
              bold: true
            }),
            new TextRun("Authorized Signatory"),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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
  await generateWord(sampleQuotation, sampleClient);
};
