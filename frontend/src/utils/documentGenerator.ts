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
import companyLogo from '../assets/company-seal.jpg';

// Common colors
const COLORS = {
  secondary: "#4B5563",
  border: "#E5E7EB",
  header: "#1F497D",  // Dark blue header color
  light: "#F2F2F2"
};

// Common styles
const STYLES = {
  fonts: {
    header: { name: 'Calibri', size: 24, bold: true },
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
const createHeaderContent = (company: any) => {
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

  // Use company-specific colors if available
  const headerColor = company?.branding?.primaryColor || COLORS.header;

  // Create the table with cells
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: headerColor,  // Use company color
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              // Company name
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.name || "CHEMBIO LIFESCIENCES", // Use company name if available
                    ...headerTitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 200 },
              }),
              // Address
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ? 
                      `${company.address.street || ''}, ${company.address.city || ''}\n` : 
                      "L-10, Himalaya Legend, Nyay Khand-1\n",
                    ...headerTextStyle,
                  }),
                  new TextRun({
                    text: company?.address ? 
                      `${company.address.state || ''} - ${company.address.postalCode || ''}` : 
                      "Indirapuram, Ghaziabad - 201014",
                    ...headerTextStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 200 },
              }),
              // Contact
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Email:- ${company?.contactInfo?.email || "chembio.sales@gmail.com"}\n`,
                    ...headerTextStyle,
                  }),
                  new TextRun({
                    text: company?.contactInfo?.phone || "0120-4909400",
                    ...headerTextStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 200 },
              }),
              // GST and PAN
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PAN NO.: ${company?.taxInfo?.pan || "AALFC0922C"} | GST NO.: ${company?.taxInfo?.gst || "09AALFC0922C1ZU"}`,
                    ...headerTextStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0, line: 200 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
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
      spacing: { before: STYLES.spacing.tiny, after: STYLES.spacing.tiny },
      children: [
        new TextRun({ 
          text: 'QUOTATION/PERFORMA INVOICE',
          bold: true,
          ...STYLES.fonts.header
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 0, after: 10 },
      children: [
        new TextRun({ 
          text: `Ref No: ${reference}`,
          ...STYLES.fonts.tableSmall
        }),
        new TextRun({ 
          text: `\tDate: ${formatDate(date)}`,
          ...STYLES.fonts.tableSmall
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

// Add this function at the top with other utility functions
const getImageData = async (imagePath: string, company?: any): Promise<Uint8Array> => {
  try {
    console.log('Loading image from:', imagePath);
    
    // If it's a base64 string (uploaded image)
    if (typeof imagePath === 'string' && (
      imagePath.startsWith('data:image/') || 
      imagePath.startsWith('blob:') ||
      imagePath.startsWith('http')
    )) {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    }
    
    // For local file paths
    let assetPath;
    
    // If we have a company with sealImageUrl, prioritize it
    if (company?.branding?.sealImageUrl) {
      if (company.branding.sealImageUrl.startsWith('data:image/') ||
          company.branding.sealImageUrl.startsWith('blob:') ||
          company.branding.sealImageUrl.startsWith('http')) {
        const response = await fetch(company.branding.sealImageUrl);
        const blob = await response.blob();
        return new Uint8Array(await blob.arrayBuffer());
      }
    }
    
    // Default fallback to company-seal.jpg
    try {
      // Use import.meta.url to get the relative path
      const defaultSeal = await import('../assets/company-seal.jpg');
      assetPath = defaultSeal.default;
      
      const response = await fetch(assetPath);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    } catch (error) {
      console.error('Error loading default seal:', error);
      // Return an empty array as a last resort
      return new Uint8Array(0);
    }
  } catch (error) {
    console.error('Error loading image:', error);
    // Return an empty array if loading fails
    return new Uint8Array(0);
  }
};

// Create signature section
const createSignatureSection = async (company: any) => {
  console.log('Creating signature section for company:', company?.name);
  
  // Get the company display name
  const companyDisplayName = company?.legalName || company?.name || "CHEMBIO LIFESCIENCES";
  
  // Get seal image directly from company if available
  let sealImageData;
  if (company?.branding?.sealImageUrl) {
    console.log('Using company uploaded seal:', company.branding.sealImageUrl.substring(0, 30) + '...');
    sealImageData = await getImageData(company.branding.sealImageUrl, company);
  } else {
    console.log('Using default company seal');
    // Default seal
    sealImageData = await getImageData('', company);
  }
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.none,
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `For ${companyDisplayName}`,
                    bold: true,
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new ImageRun({
                    data: sealImageData,
                    transformation: {
                      width: 80,
                      height: 80
                    }
                  })
                ],
                spacing: { before: 100, after: 100 }
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    bold: true,
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 100, after: 200 }
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
                spacing: { before: 10, after: 10 }
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
                    text: data.employee?.name || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 10, after: 10 }
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
                    text: data.employee?.phone || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 10, after: 10 }
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
                    text: data.employee?.email || '',
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 10, after: 10 }
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

    // Create signature section first
    const signatureSection = await createSignatureSection(data.company);

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
              top: convertInchesToTwip(0.15),
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
          createHeaderContent(data.company),
          ...createQuotationTitle(data.quotationRef, data.quotationDate),

          new Paragraph({ text: '', spacing: { before: 0, after: 20 } }),

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
                        alignment: AlignmentType.LEFT,
                        spacing: { before: 10, after: 10 }
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
                            text: data.billTo?.company || '',
                            bold: true,
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: 10, after: 10 }
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
                            text: data.billTo?.address || '',
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: 10, after: 10 }
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
                            text: data.billTo?.contactPerson || '',
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: " | Tel: ",
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: data.billTo?.phone || '',
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: " | Email: ",
                            ...STYLES.fonts.tableSmall
                          }),
                          new TextRun({
                            text: data.billTo?.email || '',
                            ...STYLES.fonts.tableSmall
                          })
                        ],
                        spacing: { before: 10, after: 10 }
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { before: 0, after: 20 } }),

          // Greetings text
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear Sir/Madam,",
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 0, after: STYLES.spacing.tiny }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Thank you for your enquiry. We are pleased to quote our best prices as under:",
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 0, after: STYLES.spacing.small }
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
                  // Define column widths based on screenshot
                  let columnWidth = 8; // default width
                  switch(header) {
                    case 'S.No':
                      columnWidth = 4;  // Smaller width for S.No
                      break;
                    case 'Cat No.':
                      columnWidth = 6;  // Slightly wider for Cat No.
                      break;
                    case 'Description':
                      columnWidth = 20; // Much wider for Description
                      break;
                    case 'Pack Size':
                      columnWidth = 6;  // Medium width for Pack Size
                      break;
                    case 'HSN Code':
                      columnWidth = 6;  // Medium width for HSN Code
                      break;
                    case 'Qty':
                      columnWidth = 4;  // Small width for Qty
                      break;
                    case 'Unit Rate':
                      columnWidth = 8;  // Wider for monetary values
                      break;
                    case 'Discount %':
                      columnWidth = 6;  // Small width for percentage
                      break;
                    case 'Discounted Price':
                      columnWidth = 8;  // Wider for monetary values
                      break;
                    case 'Expanded Price':
                      columnWidth = 8;  // Wider for monetary values
                      break;
                    case 'GST %':
                      columnWidth = 5;  // Small width for percentage
                      break;
                    case 'GST Value':
                      columnWidth = 6;  // Width for GST Value
                      break;
                    case 'Total':
                      columnWidth = 6;  // Width for Total
                      break;
                    case 'Lead Time':
                      columnWidth = 7;  // Width for lead time
                      break;
                    case 'Make':
                      columnWidth = 6;  // Width for make
                      break;
                  }

                  return new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    shading: {
                      fill: COLORS.header,
                      type: ShadingType.CLEAR,
                      color: "auto"
                    },
                    width: {
                      size: columnWidth,
                      type: WidthType.PERCENTAGE
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
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
                const discountedPrice = Number((item.unit_rate * (1 - item.discount_percent / 100)).toFixed(2));
                const expandedPrice = Number((discountedPrice * item.qty).toFixed(2));
                const gstValue = Number((expandedPrice * (item.gst_percent / 100)).toFixed(2));
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
                    return new TableCell({
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                        left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                        right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      },
                      width: {
                        size: colIndex === 0 ? 4 :  // S.No
                              colIndex === 1 ? 6 :  // Cat No.
                              colIndex === 2 ? 20 : // Description
                              colIndex === 3 ? 6 :  // Pack Size
                              colIndex === 4 ? 6 :  // HSN Code
                              colIndex === 5 ? 4 :  // Qty
                              [6, 8, 9].includes(colIndex) ? 8 :  // Unit Rate, Discounted Price, Expanded Price
                              colIndex === 7 ? 6 :  // Discount %
                              colIndex === 10 ? 5 : // GST %
                              [11, 12].includes(colIndex) ? 6 :  // GST Value, Total
                              colIndex === 13 ? 7 :  // Lead Time
                              6,  // Make
                        type: WidthType.PERCENTAGE
                      },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: [6, 8, 9, 11, 12].includes(colIndex) ? AlignmentType.RIGHT : AlignmentType.CENTER,
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

          // Add spacing between tables
          new Paragraph({
            spacing: { before: 100, after: 100 }
          }),

          // Total calculations table
          new Table({
            width: { size: 35, type: WidthType.PERCENTAGE }, // Slightly smaller width
            alignment: AlignmentType.RIGHT,
            borders: STYLES.borders.thin,
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
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'Sub Total:', 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
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
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'GST Total:', 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
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
              // Add Round Off Row
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'Round Off:', 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ 
                        text: formatCurrency(Math.round(data.subTotal + data.tax) - (data.subTotal + data.tax), true), 
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    children: [new Paragraph({ 
                      children: [new TextRun({ 
                        text: 'Grand Total:', 
                        bold: true,
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  }),
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
                    },
                    children: [new Paragraph({ 
                      alignment: AlignmentType.RIGHT,
                      children: [new TextRun({ 
                        text: formatCurrency(Math.round(data.subTotal + data.tax), true), 
                        bold: true,
                        ...STYLES.fonts.tableSmall 
                      })]
                    })]
                  })
                ]
              })
            ]
          }),

          // Bank Details section
          new Paragraph({
            children: [
              new TextRun({
                text: "Bank Details",
                bold: true,
                color: "FFFFFF",
                ...STYLES.fonts.tableSmall
              })
            ],
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: COLORS.header
            },
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.bankDetails?.bankName || 'HDFC BANK LTD.'}\n`,
                ...STYLES.fonts.tableSmall
              }),
              new TextRun({
                text: `Account No: ${data.bankDetails?.accountNo || '50200017511430'} ; NEFT/RTGS IFCS : ${data.bankDetails?.ifscCode || 'HDFC0000590'}\n`,
                ...STYLES.fonts.tableSmall
              }),
              new TextRun({
                text: `Branch code: ${data.bankDetails?.branchCode || '0590'} ; Micro code : ${data.bankDetails?.microCode || '110240081'} ; Account type: ${data.bankDetails?.accountType || 'Current account'}`,
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 100, after: 200 }
          }),

          // Terms & Conditions section
          new Paragraph({
            children: [
              new TextRun({
                text: "Terms & Conditions",
                bold: true,
                color: "FFFFFF",
                ...STYLES.fonts.tableSmall
              })
            ],
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: COLORS.header
            },
            spacing: { before: 200, after: 100 }
          }),
          // Payment Terms
          new Paragraph({
            children: [
              new TextRun({
                text: `1) Payment Terms: ${data.paymentTerms || '100% advance payment'}`,
                bold: true,
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 100, after: 50 }
          }),
          // Additional Terms from notes
          ...(data.notes ? data.notes.split('\n')
            .filter(line => line.trim() !== 'Terms & Conditions:') // Remove the redundant header
            .map((line, index) => {
              // Remove any existing numbers at the start of the line
              const cleanedLine = line.replace(/^\d+\.\s*/, '');
              // Skip the first line if it's about payment terms (we already handled it above)
              if (index === 0 && cleanedLine.toLowerCase().includes('payment terms')) {
                return null;
              }
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 2}) ${cleanedLine}`,
                    ...STYLES.fonts.tableSmall
                  })
                ],
                spacing: { before: 0, after: 50 }
              });
            }).filter(Boolean) : []),

          // Contact Person section (Quotation Created By)
          new Paragraph({
            children: [
              new TextRun({
                text: "Quotation Created By",
                bold: true,
                color: "FFFFFF",
                ...STYLES.fonts.tableSmall
              })
            ],
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: COLORS.header
            },
            spacing: { before: 200, after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.employee?.name || '',
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 100, after: 0 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Mobile: ",
                bold: true,
                ...STYLES.fonts.tableSmall
              }),
              new TextRun({
                text: data.employee?.phone || '',
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 0, after: 0 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Email: ",
                bold: true,
                ...STYLES.fonts.tableSmall
              }),
              new TextRun({
                text: data.employee?.email || '',
                ...STYLES.fonts.tableSmall
              })
            ],
            spacing: { before: 0, after: 200 }
          }),

          // Add signature section with seal
          signatureSection,

          // Add empty paragraph for spacing
          new Paragraph({ text: '', spacing: { after: 200 } }),
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
