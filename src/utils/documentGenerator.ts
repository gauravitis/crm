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
    color: "FFFFFF",  // White text
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
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
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
          text: "For CHEMBIO LIFESCIENCES",
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

          // To section with table
          new Paragraph({
            children: [
              new TextRun({
                text: "To,",
                ...STYLES.fonts.normal,
                bold: true
              })
            ],
            spacing: {
              before: 200,
              after: 100
            }
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
              right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 200,
                      right: 200,
                    },
                    children: [
                      // Company Name
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.billTo.company || '',
                            ...STYLES.fonts.normal,
                            bold: true,
                            size: 24
                          })
                        ],
                        spacing: {
                          after: 200
                        }
                      }),
                      // Address
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.billTo.address || '',
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: {
                          after: 200
                        }
                      }),
                      // Contact Details Row
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Kind Attn: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: data.billTo.contactPerson || '',
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: " | Tel: ",
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: data.billTo.phone || 'N/A',
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: " | Email: ",
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: data.billTo.email || 'N/A',
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: {
                          after: 100
                        }
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ 
            text: '',
            spacing: {
              after: 200
            }
          }),

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

          // Totals table
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
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.default,
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
                            color: "FFFFFF",  // White text
                            bold: true,
                            size: 24,
                            ...STYLES.fonts.normal,
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      fill: COLORS.primary,  // Blue background
                      type: ShadingType.CLEAR,
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              }),
              // Content Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "HDFC BANK LTD.",
                            ...STYLES.fonts.normal,
                            bold: true,
                            size: 24
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Account No: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "50200017511430",
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: " ; NEFT/RTGS IFSC: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "HDFC0000590",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Branch Code: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "0590",
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: " ; Micro Code: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "110240081",
                            ...STYLES.fonts.normal
                          }),
                          new TextRun({
                            text: " ; Account Type: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "Current Account",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      })
                    ],
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Terms and Conditions Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.default,
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
                            color: "FFFFFF",  // White text
                            bold: true,
                            size: 24,
                            ...STYLES.fonts.normal,
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      fill: COLORS.primary,  // Blue background
                      type: ShadingType.CLEAR,
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              }),
              // Content Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "1. Payment Terms: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: data.paymentTerms || "100% advance payment",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "2. Validity: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: data.validTill ? `Valid till ${formatDate(data.validTill)}` : "30 days from the date of quotation",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "3. GST: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "As applicable extra",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "4. Delivery: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: "Ex-Stock / As mentioned against each item",
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      })
                    ],
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Contact Person Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: STYLES.borders.default,
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
                            color: "FFFFFF",  // White text
                            bold: true,
                            size: 24,
                            ...STYLES.fonts.normal,
                          })
                        ],
                        alignment: AlignmentType.CENTER
                      })
                    ],
                    shading: {
                      fill: COLORS.primary,  // Blue background
                      type: ShadingType.CLEAR,
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              }),
              // Content Row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: data.employee.name || '',
                            ...STYLES.fonts.normal,
                            bold: true,
                            size: 24
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Mobile: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: data.employee.mobile || '',
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Email: ",
                            ...STYLES.fonts.normal,
                            bold: true
                          }),
                          new TextRun({
                            text: data.employee.email || '',
                            ...STYLES.fonts.normal
                          })
                        ],
                        spacing: { after: 200 }
                      })
                    ],
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200
                    }
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

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
