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
  const headerTextStyle = {
    ...STYLES.fonts.normal,
    color: "FFFFFF",  // White color for text
    size: 24,
  };

  const headerTitleStyle = {
    ...headerTextStyle,
    size: 32,
    bold: true,
  };

  // Create company name paragraph
  const companyNameParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "CHEMBIO LIFESCIENCES",
        ...headerTitleStyle,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 200,
    },
  });

  // Create address paragraph
  const addressParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "L-10, Himalaya Legend, Nyay Khand-1\n",
        ...headerTextStyle,
      }),
      new TextRun({
        text: "Indirapuram, Ghaziabad - 201014",
        ...headerTextStyle,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 200,
    },
  });

  // Create contact paragraph
  const contactParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "Email:- sales.chembio@gmail.com\n",
        ...headerTextStyle,
      }),
      new TextRun({
        text: "0120-4909400",
        ...headerTextStyle,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 200,
    },
  });

  // Create GST and PAN paragraph
  const gstPanParagraph = new Paragraph({
    children: [
      new TextRun({
        text: "PAN NO.: AALFC0922C | GST NO.: 09AALFC0922C1ZU",
        ...headerTextStyle,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      after: 200,
    },
  });

  // Create the table with cells
  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              companyNameParagraph,
              addressParagraph,
              contactParagraph,
              gstPanParagraph,
            ],
            shading: {
              fill: COLORS.primary,
              type: ShadingType.CLEAR,
            },
            margins: {
              top: 200,
              bottom: 200,
              left: 200,
              right: 200,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          }),
        ],
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

// Function to convert base64 to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Create signature section
const createSignatureSection = () => {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "For CHEMBIO LIFESCIENCE",
          ...STYLES.fonts.normal,
          bold: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: {
        after: 200,
      },
    }),
    // Add empty paragraphs for signature space
    new Paragraph({
      text: "",
      spacing: {
        before: 300,
        after: 300,
      },
    }),
    new Paragraph({
      text: "",
      spacing: {
        before: 300,
        after: 300,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Authorised Signatory",
          ...STYLES.fonts.normal,
          bold: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
  ];
};

// Create contact person section
const createContactPersonSection = (employee: any) => {
  if (!employee) return [];

  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            shading: {
              fill: COLORS.light,
              type: ShadingType.CLEAR,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact Person Details",
                    ...STYLES.fonts.subHeader,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Name: ${employee.name}`,
                    ...STYLES.fonts.normal,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Mobile: ${employee.mobile}`,
                    ...STYLES.fonts.normal,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Email: ${employee.email}`,
                    ...STYLES.fonts.normal,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return [
    new Paragraph({
      spacing: {
        before: STYLES.spacing.large,
      },
    }),
    table,
  ];
};

export async function generateWord(data: QuotationData): Promise<{ buffer: ArrayBuffer, filename: string }> {
  try {
    console.log('Generating document with data:', {
      ref: data.quotationRef,
      items: data.items.length,
      billTo: data.billTo.name
    });

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: STYLES.fonts.normal.name,
              size: STYLES.fonts.normal.size,
            }
          }
        }
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
        footers: {
          default: new Footer({
            children: [createFooterContent()]
          })
        },
        children: [
          createHeaderContent(),
          new Paragraph({
            text: "QUOTATION/PERFORMA INVOICE",
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
            style: {
              ...STYLES.fonts.header,
              size: 28,
            }
          }),

          ...createQuotationTitle(data.quotationRef, data.quotationDate),
          createBorderedParagraph([
            new TextRun({ text: 'To:\n', bold: true, ...STYLES.fonts.normal }),
            new TextRun({ text: data.billTo.companyName, bold: true, ...STYLES.fonts.normal }),
            new TextRun({ text: '\n', ...STYLES.fonts.normal }),
            new TextRun({ text: data.billTo.address, ...STYLES.fonts.normal }),
            new TextRun({ text: '\n', ...STYLES.fonts.normal }),
            new TextRun({ text: 'Kind Attn: ', bold: true, ...STYLES.fonts.normal }),
            new TextRun({ text: data.billTo.name, ...STYLES.fonts.normal }),
            new TextRun({ text: ' Tel: ', ...STYLES.fonts.normal }),
            new TextRun({ text: data.billTo.phone || 'N/A', ...STYLES.fonts.normal }),
            new TextRun({ text: ' | Email: ', ...STYLES.fonts.normal }),
            new TextRun({ text: data.billTo.email || 'N/A', ...STYLES.fonts.normal })
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
                        alignment: shouldCenter
                          ? AlignmentType.CENTER
                          : [6, 8, 9, 11, 12].includes(index)  // Monetary values
                            ? AlignmentType.RIGHT
                            : AlignmentType.LEFT,
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

          // Terms and Conditions Table
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Terms & Conditions")],
                    columnSpan: 2,
                    shading: {
                      fill: "D3D3D3",
                    },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("1. Payment")],
                    width: {
                      size: 30,
                      type: WidthType.PERCENTAGE,
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph("Payment within 15 days.")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("2. Validity")],
                  }),
                  new TableCell({
                    children: [new Paragraph("30 Days")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("3. Note")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Please check specification before order")],
                  }),
                ],
              }),
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),

          // Contact person section
          ...createContactPersonSection(data.employee),

          new Paragraph({ text: '' }),  // Add some space

          // Add signature section
          ...createSignatureSection(),
        ]
      }]
    });

    // Generate blob
    const blob = await Packer.toBlob(doc);
    const buffer = await blob.arrayBuffer();
    const filename = `Quotation_${data.quotationRef.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;

    console.log('Document generated successfully:', {
      filename,
      bufferSize: buffer.byteLength
    });

    return { buffer, filename };
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}
