import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, BorderStyle } from 'docx';
import { Quotation } from '../types';
import { format } from 'date-fns';
import ChembioLogo from '../assets/chembio-logo.png';

const COMPANY_NAME = 'Chembio Lifesciences';
const COMPANY_ADDRESS = 'L-10, Himalaya Legend, Nyay Khand-1';
const COMPANY_CITY = 'Indirapuram, Ghaziabad-201014';
const COMPANY_PHONE = 'Ph: 9911998473, 0120-4909400';

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })}`;
};

export const generatePDF = async (quotation: Quotation) => {
  const doc = new jsPDF();
  
  try {
    // Convert image URL to base64
    const response = await fetch(ChembioLogo);
    const blob = await response.blob();
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64data = reader.result as string;
      
      // Add logo
      const imgWidth = 60;
      const imgHeight = 30;
      doc.addImage(base64data, 'PNG', 20, 10, imgWidth, imgHeight);
      
      // Company name and details
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(COMPANY_NAME, 20, 50);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(COMPANY_ADDRESS, 20, 60);
      doc.text(COMPANY_CITY, 20, 65);
      doc.text(COMPANY_PHONE, 20, 70);

      // Quotation details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Quotation/Proforma Invoice`, 20, 85);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Quotation Date: ${format(new Date(quotation.createdAt), 'dd/MM/yyyy')}`, 20, 95);
      doc.text(`Valid Till: ${format(new Date(quotation.validUntil), 'dd/MM/yyyy')}`, 20, 100);
      
      // Client details
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Contact:', 20, 115);
      doc.setFont('helvetica', 'normal');
      doc.text(quotation.clientName || '', 20, 125);
      
      // Items table
      const tableData = quotation.items.map(item => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.price),
        `${item.discount}%`,
        `${item.gst}%`,
        formatCurrency(item.total)
      ]);

      (doc as any).autoTable({
        startY: 140,
        head: [['Description', 'QTY', 'Unit Price', 'Discount', 'GST', 'Total Price']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [63, 81, 181],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 5
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 30, halign: 'right' }
        }
      });

      // Total amount
      const totalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      const totalText = `Total Amount: ${formatCurrency(quotation.total)}`;
      doc.text(totalText, doc.internal.pageSize.width - 20, totalY, { align: 'right' });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('* Prices are Ex-works and exclusive of taxes', 20, totalY + 20);
      doc.text('* Payment terms: 100% advance', 20, totalY + 25);
      doc.text('* Delivery: 4-6 weeks from the date of receipt of order', 20, totalY + 30);

      // Save the PDF
      doc.save(`Quotation-${quotation.id}.pdf`);
    };
    
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error('Error loading logo:', error);
    // Generate PDF without logo if there's an error
    generatePDFWithoutLogo(doc, quotation);
  }
};

const generatePDFWithoutLogo = (doc: jsPDF, quotation: Quotation) => {
  // Company name and details
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 20, 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_ADDRESS, 20, 40);
  doc.text(COMPANY_CITY, 20, 45);
  doc.text(COMPANY_PHONE, 20, 50);

  // Quotation details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Quotation/Proforma Invoice`, 20, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Quotation Date: ${format(new Date(quotation.createdAt), 'dd/MM/yyyy')}`, 20, 75);
  doc.text(`Valid Till: ${format(new Date(quotation.validUntil), 'dd/MM/yyyy')}`, 20, 80);
  
  // Client details
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Contact:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.clientName || '', 20, 105);
  
  // Items table
  const tableData = quotation.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.price),
    `${item.discount}%`,
    `${item.gst}%`,
    formatCurrency(item.total)
  ]);

  (doc as any).autoTable({
    startY: 120,
    head: [['Description', 'QTY', 'Unit Price', 'Discount', 'GST', 'Total Price']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [63, 81, 181],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });

  // Total amount
  const totalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  const totalText = `Total Amount: ${formatCurrency(quotation.total)}`;
  doc.text(totalText, doc.internal.pageSize.width - 20, totalY, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('* Prices are Ex-works and exclusive of taxes', 20, totalY + 20);
  doc.text('* Payment terms: 100% advance', 20, totalY + 25);
  doc.text('* Delivery: 4-6 weeks from the date of receipt of order', 20, totalY + 30);

  // Save the PDF
  doc.save(`Quotation-${quotation.id}.pdf`);
};

export const generateDOCX = async (quotation: Quotation) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header with company details
        new Paragraph({
          children: [
            new TextRun({ text: COMPANY_NAME + '\n', size: 32, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: COMPANY_ADDRESS + '\n', size: 20 }),
            new TextRun({ text: COMPANY_CITY + '\n', size: 20 }),
            new TextRun({ text: COMPANY_PHONE + '\n\n', size: 20 }),
          ],
        }),

        // Quotation details
        new Paragraph({
          children: [
            new TextRun({ text: 'Quotation/Proforma Invoice\n\n', bold: true, size: 24 }),
            new TextRun({ text: `Quotation Date: ${format(new Date(quotation.createdAt), 'dd/MM/yyyy')}\n` }),
            new TextRun({ text: `Valid Till: ${format(new Date(quotation.validUntil), 'dd/MM/yyyy')}\n\n` }),
          ],
        }),

        // Client details
        new Paragraph({
          children: [
            new TextRun({ text: 'Customer Contact:\n', bold: true }),
            new TextRun({ text: quotation.clientName || '' }),
            new TextRun({ text: '\n\n' }),
          ],
        }),

        // Items table
        new Table({
          rows: [
            new TableRow({
              children: [
                'Description',
                'QTY',
                'Unit Price',
                'Discount',
                'GST',
                'Total Price'
              ].map(header => 
                new TableCell({
                  children: [new Paragraph({ text: header, alignment: AlignmentType.CENTER })],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                })
              ),
            }),
            ...quotation.items.map(item => 
              new TableRow({
                children: [
                  item.description,
                  item.quantity.toString(),
                  formatCurrency(item.price),
                  `${item.discount}%`,
                  `${item.gst}%`,
                  formatCurrency(item.total)
                ].map((text, index) => 
                  new TableCell({
                    children: [new Paragraph({ 
                      text, 
                      alignment: index === 0 ? AlignmentType.LEFT : 
                               (index === 2 || index === 5) ? AlignmentType.RIGHT :
                               AlignmentType.CENTER 
                    })],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  })
                ),
              })
            ),
          ],
        }),

        // Total
        new Paragraph({
          children: [
            new TextRun({ text: `\nTotal Amount: ${formatCurrency(quotation.total)}\n\n`, bold: true }),
          ],
          alignment: AlignmentType.RIGHT,
        }),

        // Footer
        new Paragraph({
          children: [
            new TextRun({ text: '* Prices are Ex-works and exclusive of taxes\n' }),
            new TextRun({ text: '* Payment terms: 100% advance\n' }),
            new TextRun({ text: '* Delivery: 4-6 weeks from the date of receipt of order\n' }),
          ],
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
