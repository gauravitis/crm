import { 
  Document, 
  Paragraph, 
  Table, 
  TableRow, 
  TableCell, 
  TextRun, 
  AlignmentType, 
  BorderStyle, 
  WidthType,
  HeightRule,
  PageNumber,
  Header,
  Footer,
  ShadingType,
  PageOrientation,
  convertInchesToTwip,
  LevelFormat,
  NumberFormat,
  ITableCellMarginOptions,
  VerticalAlign,
  ImageRun
} from 'docx';
import { saveAs } from "file-saver";
import { QuotationData } from '../types/quotation-generator';
import { format, parse } from "date-fns";
import { Packer } from "docx";

// Enhanced color scheme
const COLORS = {
  primary: "2B579A",    // Professional blue
  secondary: "4472C4",  // Lighter blue for accents
  accent: "70AD47",     // Green for positive values
  warning: "C00000",    // Red for important notices
  light: "F2F2F2",      // Light gray for alternating rows
  border: "E0E0E0"      // Border color
};

// Common styles
const STYLES = {
  fonts: {
    header: { name: 'Calibri', size: 28, bold: true },
    subHeader: { name: 'Calibri', size: 24 },
    normal: { name: 'Calibri', size: 22 },
    small: { name: 'Calibri', size: 20 }
  },
  spacing: {
    small: 150,
    normal: 200,
    large: 300
  },
  borders: {
    default: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border }
    },
    none: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE }
    }
  },
  cellMargin: {
    top: convertInchesToTwip(0.1),
    bottom: convertInchesToTwip(0.1),
    left: convertInchesToTwip(0.1),
    right: convertInchesToTwip(0.1)
  } as ITableCellMarginOptions
};

const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(numericAmount);
};

const formatDate = (dateStr: string): string => {
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

// Helper function to create bordered paragraph
const createBorderedParagraph = (text: string | TextRun[], options: any = {}) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.default,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.default,
            children: [
              new Paragraph({
                children: typeof text === 'string' 
                  ? [new TextRun({ text, ...STYLES.fonts.normal, ...options })]
                  : text,
                alignment: options.alignment || AlignmentType.LEFT
              })
            ],
            margins: STYLES.cellMargin
          })
        ]
      })
    ]
  });
};

// Create header content with company details and logo
const createHeaderContent = () => {
  // Create company name paragraph
  const companyNameParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "BOLT INDIA PVT LTD",
        bold: true,
        size: 28,
        color: "2B579A",
      }),
    ],
  });

  // Create address paragraph
  const addressParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "123 Business Park, Sector 5\n",
        size: 20,
        color: "666666",
      }),
      new TextRun({
        text: "Mumbai, Maharashtra 400001",
        size: 20,
        color: "666666",
      }),
    ],
  });

  // Create contact paragraph
  const contactParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "Phone: +91 22 1234 5678\n",
        size: 20,
        color: "666666",
      }),
      new TextRun({
        text: "Email: info@boltindia.com\n",
        size: 20,
        color: "666666",
      }),
      new TextRun({
        text: "GST: 27AABCU9603R1ZX",
        size: 20,
        color: "666666",
      }),
    ],
  });

  // Create logo paragraph
  const logoParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "BOLT",
        bold: true,
        size: 48,
        color: "2B579A",
      }),
    ],
  });

  // Create cells with their content
  const companyCell = new TableCell({
    children: [companyNameParagraph, addressParagraph, contactParagraph],
    width: {
      size: 70,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      top: 120,
      bottom: 120,
      left: 240,
      right: 240,
    },
    shading: {
      fill: "F8F9FA",
      type: ShadingType.CLEAR,
    },
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
    },
  });

  const logoCell = new TableCell({
    children: [logoParagraph],
    width: {
      size: 30,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      top: 120,
      bottom: 120,
      left: 240,
      right: 240,
    },
    shading: {
      fill: "F8F9FA",
      type: ShadingType.CLEAR,
    },
    verticalAlign: VerticalAlign.CENTER,
  });

  // Create the table with cells
  const table = new Table({
    rows: [
      new TableRow({
        children: [companyCell, logoCell],
      }),
    ],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  return table;
};

// Create footer with page numbers
const createFooterContent = () => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Page ",
        ...STYLES.fonts.small
      }),
      new TextRun({
        children: [PageNumber.CURRENT],
        ...STYLES.fonts.small
      }),
      new TextRun({
        text: " of ",
        ...STYLES.fonts.small
      }),
      new TextRun({
        children: [PageNumber.TOTAL_PAGES],
        ...STYLES.fonts.small
      })
    ]
  });
};

// Create quotation title section
const createQuotationTitle = (reference: string, date: string) => {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: STYLES.spacing.normal, after: STYLES.spacing.normal },
      children: [
        new TextRun({ 
          text: 'QUOTATION',
          bold: true,
          ...STYLES.fonts.header
        })
      ]
    }),
    new Paragraph({
      spacing: { before: STYLES.spacing.normal, after: STYLES.spacing.normal },
      children: [
        new TextRun({ 
          text: `Ref No: ${reference}`,
          ...STYLES.fonts.normal
        }),
        new TextRun({ 
          text: `\tDate: ${formatDate(date)}`,
          ...STYLES.fonts.normal
        })
      ]
    })
  ];
};

export const generateWord = async (data: QuotationData) => {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24,
            color: "333333"
          },
          paragraph: {
            spacing: { line: 276, before: 20 * 72 * 0.05, after: 20 * 72 * 0.05 },
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [createHeaderContent()]
        })
      },
      footers: {
        default: new Footer({
          children: [createFooterContent()]
        })
      },
      children: [
        ...createQuotationTitle(data.quotationRef, data.quotationDate),
        createBorderedParagraph([
          new TextRun({ text: 'To:\n', bold: true, ...STYLES.fonts.normal }),
          new TextRun({ text: data.billTo.name + '\n', ...STYLES.fonts.normal }),
          new TextRun({ text: data.billTo.address + '\n', ...STYLES.fonts.normal }),
          new TextRun({ text: `Kind Attn: ${data.billTo.name}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `Tel: ${data.billTo.phone} | Email: ${data.billTo.email}`, ...STYLES.fonts.normal })
        ]),
        new Paragraph({ text: '' }),
        // Items Table with alternating colors
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: STYLES.borders.default,
          cellMargin: STYLES.cellMargin,
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                'S.No', 'Cat No.', 'Description', 'Pack Size', 'HSN Code', 'Qty', 'Unit Rate',
                'Discount %', 'Discounted Price', 'Expanded Price', 'GST %', 'GST Value', 'Total', 'Lead Time', 'Make'
              ].map((header, index) => {
                // Define column widths based on content type
                let columnWidth = 8; // default width
                switch(header) {
                  case 'S.No':
                    columnWidth = 3;  // Smaller width for S.No
                    break;
                  case 'Cat No.':
                    columnWidth = 5;  // Slightly wider for Cat No.
                    break;
                  case 'Description':
                    columnWidth = 25; // Much wider for Description
                    break;
                  case 'Pack Size':
                    columnWidth = 5;  // Medium width for Pack Size
                    break;
                  case 'HSN Code':
                    columnWidth = 6;  // Medium width for HSN Code
                    break;
                  case 'Qty':
                    columnWidth = 3;  // Small width for Qty
                    break;
                  case 'Unit Rate':
                    columnWidth = 8;  // Wider for monetary values
                    break;
                  case 'Discount %':
                    columnWidth = 5;  // Small width for percentage
                    break;
                  case 'Discounted Price':
                    columnWidth = 8;  // Wider for monetary values
                    break;
                  case 'Expanded Price':
                    columnWidth = 8;  // Wider for monetary values
                    break;
                  case 'GST %':
                    columnWidth = 4;  // Small width for percentage
                    break;
                  case 'GST Value':
                    columnWidth = 4;  // Reduced width for GST Value
                    break;
                  case 'Total':
                    columnWidth = 6;  // Reduced width for Total
                    break;
                  case 'Lead Time':
                    columnWidth = 8;  // Increased width for lead time
                    break;
                  case 'Make':
                    columnWidth = 7;  // Increased width for make
                    break;
                }

                // Determine text alignment based on column content
                const shouldCenter = true; // Center align all headers

                return new TableCell({
                  shading: {
                    fill: COLORS.primary,
                    type: ShadingType.CLEAR,
                    color: "auto"
                  },
                  width: {
                    size: columnWidth,
                    type: WidthType.PERCENTAGE
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,  // Center align all headers
                      children: [
                        new TextRun({ 
                          text: header,
                          bold: true,
                          color: "FFFFFF",
                          ...STYLES.fonts.normal
                        })
                      ]
                    })
                  ]
                });
              })
            }),
            // Data rows
            ...data.items.map((item, index) => {
              // Calculate discounted price (Unit Rate - Discount %)
              const discountedPrice = Number((item.unit_rate * (1 - item.discount_percent / 100)).toFixed(2));
              // Calculate expanded price (Discounted Price * Qty)
              const expandedPrice = Number((discountedPrice * item.qty).toFixed(2));
              // Calculate GST on expanded price
              const gstValue = Number((expandedPrice * (item.gst_percent / 100)).toFixed(2));
              // Calculate total price
              const totalPrice = Number((expandedPrice + gstValue).toFixed(2));
              
              return new TableRow({
                children: [
                  item.sno.toString(),
                  item.cat_no,
                  item.product_description,
                  item.pack_size,
                  item.hsn_code,
                  item.qty.toString(),
                  formatCurrency(item.unit_rate),
                  `${item.discount_percent}%`,
                  formatCurrency(discountedPrice),
                  formatCurrency(expandedPrice),
                  `${item.gst_percent}%`,
                  formatCurrency(gstValue),
                  formatCurrency(totalPrice),
                  item.lead_time || '',
                  item.make || ''
                ].map((text, colIndex) => {
                  // Determine if this column should be centered
                  const shouldCenter = [0, 1, 3, 4, 5, 7, 10].includes(colIndex);
                  
                  return new TableCell({
                    shading: {
                      fill: index % 2 === 0 ? COLORS.light : "FFFFFF",
                      type: ShadingType.CLEAR,
                      color: "auto"
                    },
                    width: {
                      size: colIndex === 2 ? 25 : // Description
                            colIndex === 0 ? 3 :  // S.No
                            colIndex === 1 ? 5 :  // Cat No.
                            colIndex === 3 ? 5 :  // Pack Size
                            colIndex === 4 ? 6 :  // HSN Code
                            colIndex === 5 ? 3 :  // Qty
                            [6, 8, 9].includes(colIndex) ? 8 :  // Unit Rate, Discounted Price, Expanded Price
                            [7, 10].includes(colIndex) ? 5 :  // Discount %, GST %
                            colIndex === 11 ? 4 :  // GST Value
                            colIndex === 12 ? 6 :  // Total
                            colIndex === 13 ? 8 :  // Lead Time
                            colIndex === 14 ? 7 : 8,  // Make
                      type: WidthType.PERCENTAGE
                    },
                    verticalAlign: "center",
                    children: [
                      new Paragraph({
                        alignment: shouldCenter
                          ? AlignmentType.CENTER
                          : [6, 8, 9, 11, 12].includes(colIndex)  // Monetary values
                            ? AlignmentType.RIGHT
                            : AlignmentType.LEFT,
                        children: [
                          new TextRun({ 
                            text,
                            ...STYLES.fonts.normal
                          })
                        ]
                      })
                    ]
                  });
                })
              });
            })
          ]
        }),
        new Paragraph({ text: '' }),

        // Totals
        new Table({
          width: { size: 40, type: WidthType.PERCENTAGE },
          alignment: AlignmentType.RIGHT,
          borders: STYLES.borders.default,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: 'Sub Total:', ...STYLES.fonts.normal })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: formatCurrency(data.subTotal), ...STYLES.fonts.normal })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: 'Total GST:', ...STYLES.fonts.normal })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: formatCurrency(data.tax), ...STYLES.fonts.normal })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: 'Grand Total:', bold: true, ...STYLES.fonts.normal })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: formatCurrency(data.grandTotal), bold: true, ...STYLES.fonts.normal })]
                  })]
                })
              ]
            })
          ]
        }),
        new Paragraph({ text: '' }),

        // Bank Details
        createBorderedParagraph([
          new TextRun({ text: 'Bank Details\n', bold: true, ...STYLES.fonts.normal }),
          new TextRun({ text: data.bankDetails.bankName + '\n', ...STYLES.fonts.normal }),
          new TextRun({ text: `Account No: ${data.bankDetails.accountNo}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `NEFT/RTGS IFSC: ${data.bankDetails.ifscCode}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `Branch code: ${data.bankDetails.branchCode}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `Micro code: ${data.bankDetails.microCode}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `Account type: ${data.bankDetails.accountType}`, ...STYLES.fonts.normal })
        ]),
        new Paragraph({ text: '' }),

        // Terms & Conditions
        createBorderedParagraph([
          new TextRun({ text: 'Terms & Conditions\n', bold: true, ...STYLES.fonts.normal }),
          new TextRun({ text: `1. Payment Terms: ${data.paymentTerms}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: `2. Validity: ${formatDate(data.validTill)}\n`, ...STYLES.fonts.normal }),
          new TextRun({ text: '3. Prices are Ex-Works unless specified otherwise\n', ...STYLES.fonts.normal }),
          new TextRun({ text: '4. Delivery: As per mentioned lead time\n', ...STYLES.fonts.normal }),
          new TextRun({ text: '5. Please check specifications before order\n', ...STYLES.fonts.normal }),
          new TextRun({ text: '6. GST will be charged extra as applicable\n', ...STYLES.fonts.normal }),
          new TextRun({ text: '7. Subject to jurisdiction\n', ...STYLES.fonts.normal })
        ]),
        new Paragraph({ text: '' }),

        // Notes if any
        ...(data.notes ? [
          createBorderedParagraph([
            new TextRun({ text: 'Notes:\n', bold: true, ...STYLES.fonts.normal }),
            new TextRun({ text: data.notes, ...STYLES.fonts.normal })
          ]),
          new Paragraph({ text: '' })
        ] : []),

        // Signature Block
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  children: [
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: '' }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: 'For ' + data.billFrom.name,
                          bold: true,
                          ...STYLES.fonts.normal
                        })
                      ]
                    }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: '' }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: 'Authorized Signatory',
                          ...STYLES.fonts.normal
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `Quotation_${data.quotationRef}.docx`);
};
