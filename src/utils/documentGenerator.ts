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

// Common colors
const COLORS = {
  secondary: "#4B5563",
  border: "#E5E7EB",
  header: "#1B4C7C",  // Changed to a darker, more professional blue
  light: "#F3F4F6"
};

// Common styles
const STYLES = {
  fonts: {
    header: { name: 'Calibri', size: 28, bold: true },
    subHeader: { name: 'Calibri', size: 24 },
    normal: { name: 'Calibri', size: 22 },
    small: { name: 'Calibri', size: 20 },
    table: { name: 'Calibri', size: 18 },  // 9pt font size
    tableSmall: { name: 'Calibri', size: 16 }  // 8pt font size for all tables
  },
  spacing: {
    tiny: 60,    // 3pt
    small: 100,  // 5pt
    normal: 200, // 10pt
    large: 300   // 15pt
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
    },
    thin: {
      top: { style: BorderStyle.SINGLE, size: 0.5, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 0.5, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 0.5, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 0.5, color: COLORS.border }
    }
  },
  cellMargin: {
    top: convertInchesToTwip(0.05),
    bottom: convertInchesToTwip(0.05),
    left: convertInchesToTwip(0.1),
    right: convertInchesToTwip(0.1)
  } as ITableCellMarginOptions,
  cellMarginSmall: {
    top: convertInchesToTwip(0.02),
    bottom: convertInchesToTwip(0.02),
    left: convertInchesToTwip(0.05),
    right: convertInchesToTwip(0.05)
  } as ITableCellMarginOptions
};

// Format currency with optional rupee symbol
const formatCurrency = (amount: number | string, showSymbol: boolean = false): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formattedNumber = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return showSymbol ? `₹${formattedNumber}` : formattedNumber;
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

// Create footer with page numbers
const createFooterContent = () => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
        ...STYLES.fonts.small,
        color: COLORS.secondary
      })
    ],
    spacing: { before: 200 }
  });
};

// Create header content with company details and logo
const createHeaderContent = () => {
  const headerTextStyle = {
    ...STYLES.fonts.normal,
    color: "FFFFFF",  // White text for better contrast
    size: 24,
  };

  const headerTitleStyle = {
    ...headerTextStyle,
    size: 32,
    bold: true,
  };

  // Create the table with cells
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: COLORS.header,  // Use consistent header color
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              // Company name
              new Paragraph({
                children: [
                  new TextRun({
                    text: "CHEMBIO LIFESCIENCES",
                    ...headerTitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 240 },
              }),
              // Address
              new Paragraph({
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
                spacing: { before: 0, after: 0, line: 240 },
              }),
              // Contact
              new Paragraph({
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
                spacing: { before: 0, after: 0, line: 240 },
              }),
              // GST and PAN
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PAN NO.: AALFC0922C | GST NO.: 09AALFC0922C1ZU",
                    ...headerTextStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 240 },
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
        ],
      }),
    ],
  });

  return table;
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
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          // For Chembio Lifesciences
          new TableCell({
            borders: STYLES.borders.none,
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "For CHEMBIO LIFESCIENCES",
                    ...STYLES.fonts.normal,
                    bold: true
                  })
                ],
                spacing: { before: 800, after: 800 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    ...STYLES.fonts.normal,
                    italics: true
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
};

// Create contact person table
const createContactPersonTable = (data: any) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.thin,
    cellMargin: STYLES.cellMarginSmall,
    rows: [
      // Header Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact Person",
                    color: "FFFFFF",
                    bold: true,
                    ...STYLES.fonts.tableSmall
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
              })
            ],
            shading: {
              fill: COLORS.header,  // Use consistent header color
              type: ShadingType.CLEAR,
              color: "auto"
            }
          })
        ]
      }),
      // Name Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.employee.name || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
              })
            ]
          })
        ]
      }),
      // Mobile Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Mobile: ",
                    ...STYLES.fonts.tableSmall,
                    bold: true
                  }),
                  new TextRun({
                    text: data.employee.mobile || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
              })
            ]
          })
        ]
      }),
      // Email Row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Email: ",
                    ...STYLES.fonts.tableSmall,
                    bold: true
                  }),
                  new TextRun({
                    text: data.employee.email || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
              })
            ]
          })
        ]
      })
    ]
  });
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
      features: {
        updateFields: true
      },
      settings: {
        updateFields: true,
        defaultTabStop: 720,
        displayBackgroundShape: true,
        evenAndOddHeaders: false,
        trackRevisions: false,
        defaultView: "web"
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.2),
              right: convertInchesToTwip(0.2),
              bottom: convertInchesToTwip(0.2),
              left: convertInchesToTwip(0.2),
            },
            size: {
              width: 12240, // 8.5 inches
              height: 15840, // 11 inches
            },
            pageLayout: {
              view: "web"
            }
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

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // To Table (Client Details)
          new Table({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.thin,
            cellMargin: STYLES.cellMarginSmall,
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "To",
                            color: "FFFFFF",
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ],
                    shading: {
                      fill: COLORS.header,  // Use consistent header color
                      type: ShadingType.CLEAR,
                      color: "auto"
                    }
                  })
                ]
              }),
              // Company Name Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.billTo.company || '',
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Address Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.billTo.address || '',
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Contact Details Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Kind Attn: ",
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: data.billTo.contactPerson || '',
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: " | Tel: ",
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: data.billTo.phone || '',
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: " | Email: ",
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: data.billTo.email || '',
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Greetings text
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear Sir/Madam,",
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { after: STYLES.spacing.normal }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Thank you for your enquiry. We are pleased to quote our best prices as under:",
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { after: STYLES.spacing.normal }
          }),

          // Items table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
            },
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
                      fill: COLORS.header,  // Use consistent header color
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
                            ...STYLES.fonts.table
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
                              text: text,
                              ...STYLES.fonts.tableSmall
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

          // Totals table
          new Table({
            width: { size: 40, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.RIGHT,
            borders: STYLES.borders.thin,
            cellMargin: STYLES.cellMarginSmall,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'Sub Total:', 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ 
                        text: formatCurrency(data.subTotal, true), 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'GST Total:', 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ 
                        text: formatCurrency(data.tax, true), 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'Grand Total:', 
                        bold: true,
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ 
                        text: formatCurrency(data.grandTotal, true), 
                        bold: true,
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Bank Details
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.thin,
            cellMargin: STYLES.cellMarginSmall,
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Bank Details",
                            color: "FFFFFF",
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ],
                    shading: {
                      fill: COLORS.header,  // Use consistent header color
                      type: ShadingType.CLEAR,
                      color: "auto"
                    }
                  })
                ]
              }),
              // Bank Name Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Bank Name: HDFC BANK",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Account Details Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Account No.: 50200069668619",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // IFSC Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "IFSC Code: HDFC0001372",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Branch Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Branch: Indirapuram, Ghaziabad",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Terms & Conditions Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.thin,
            cellMargin: STYLES.cellMarginSmall,
            rows: [
              // Header Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Terms & Conditions",
                            color: "FFFFFF",
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ],
                    shading: {
                      fill: COLORS.header,  // Use consistent header color
                      type: ShadingType.CLEAR,
                      color: "auto"
                    }
                  })
                ]
              }),
              // Payment Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "1. Payment: 100% Advance",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Validity Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "2. Validity: 30 Days",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // Delivery Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "3. Delivery: Ex-Stock / As Specified",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              }),
              // GST Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "4. GST: Extra as applicable",
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny }
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          createContactPersonTable(data),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Add signature section
          createSignatureSection(),

          // Add empty paragraph for spacing
          new Paragraph({ text: '', spacing: { after: 400 } }),
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
