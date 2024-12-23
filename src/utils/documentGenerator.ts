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
  PageNumberFormat,
  convertInchesToTwip,
  LevelFormat,
  NumberFormat,
  ITableCellMarginOptions,
  VerticalAlign
} from 'docx';
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

// Common styles
const STYLES = {
  fonts: {
    header: { name: 'Arial', size: 28 },
    subHeader: { name: 'Arial', size: 24 },
    normal: { name: 'Arial', size: 22 },
    small: { name: 'Arial', size: 20 }
  },
  colors: {
    primary: '2E5A88',
    secondary: '4A90E2',
    accent: 'F5F5F5',
    border: '000000'
  },
  spacing: {
    normal: 300,
    large: 400
  },
  borders: {
    default: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' }
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
                spacing: { before: STYLES.spacing.normal, after: STYLES.spacing.normal }
              })
            ]
          })
        ]
      })
    ]
  });
};

export const generateWord = async (data: QuotationData) => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
          orientation: PageOrientation.PORTRAIT
        }
      },
      headers: {
        default: new Header({
          children: [
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
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [
                new TableRow({
                  children: [
                    // Center column with company details
                    new TableCell({
                      width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                      },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 200, after: 200 },
                          children: [
                            new TextRun({
                              text: "CHEMBIO LIFESCIENCES",
                              bold: true,
                              size: 28,
                              font: "Arial",
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "L-10, Himalaya Legend, Nyay Khand-1",
                              size: 24,
                              font: "Arial",
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Indirapuram, Ghaziabad - 201014",
                              size: 24,
                              font: "Arial",
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Email:- sales.chembio@gmail.com",
                              size: 24,
                              font: "Arial",
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "0120-4909400",
                              size: 24,
                              font: "Arial",
                            }),
                          ],
                        }),
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "PAN NO.: AALFC0922C | GST NO.: 09AALFC0922C1ZU",
                              size: 24,
                              font: "Arial",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
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
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${data.billFrom.name} - ${data.billFrom.address}`,
                  ...STYLES.fonts.small
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Tel: ${data.billFrom.phone} | Email: ${data.billFrom.email}`,
                  ...STYLES.fonts.small
                })
              ]
            })
          ]
        })
      },
      children: [
        // Company Header with background
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: STYLES.borders.none,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: STYLES.borders.none,
                  shading: {
                    fill: STYLES.colors.primary,
                    type: ShadingType.CLEAR,
                    color: "auto"
                  },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 100 },
                      children: [
                        new TextRun({
                          text: "CHEMBIO LIFESCIENCES",
                          bold: true,
                          size: 28,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "L-10, Himalaya Legend, Nyay Khand-1",
                          size: 24,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Indirapuram, Ghaziabad - 201014",
                          size: 24,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "Email:- sales.chembio@gmail.com",
                          size: 24,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: "0120-4909400",
                          size: 24,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 200 },
                      children: [
                        new TextRun({
                          text: "PAN NO.: AALFC0922C | GST NO.: 09AALFC0922C1ZU",
                          size: 24,
                          font: "Arial",
                          color: "FFFFFF",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Add some space after the header
        new Paragraph({
          spacing: { before: 300, after: 300 },
          children: [new TextRun({ text: "" })]
        }),

        // Quotation Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: STYLES.spacing.large, after: STYLES.spacing.large },
          children: [
            new TextRun({ 
              text: 'QUOTATION',
              bold: true,
              ...STYLES.fonts.header
            })
          ]
        }),

        // Reference and Date
        new Paragraph({
          children: [
            new TextRun({ 
              text: `Ref No: ${data.quotationRef}`,
              ...STYLES.fonts.normal
            }),
            new TextRun({ 
              text: `\tDate: ${formatDate(data.quotationDate)}`,
              ...STYLES.fonts.normal
            })
          ]
        }),
        new Paragraph({ text: '' }),

        // Client Details Box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: STYLES.borders.default,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: 'To:',
                          bold: true,
                          ...STYLES.fonts.normal
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: data.billTo.name,
                          ...STYLES.fonts.normal
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: data.billTo.address,
                          ...STYLES.fonts.normal
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: `Kind Attn: ${data.billTo.name}`,
                          ...STYLES.fonts.normal
                        })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: `Tel: ${data.billTo.phone} | Email: ${data.billTo.email}`,
                          ...STYLES.fonts.normal
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),
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
                'S.No', 'Cat No.', 'Pack Size', 'Description', 'HSN Code', 'Qty', 'Unit Rate',
                'Discount %', 'Discount Value', 'GST %', 'GST Value', 'Total', 'Lead Time', 'Make'
              ].map((header, index) => {
                // Define column widths based on content type
                let columnWidth = 8; // default width
                switch(header) {
                  case 'Description':
                    columnWidth = 18;
                    break;
                  case 'S.No':
                    columnWidth = 4;
                    break;
                  case 'HSN Code':
                    columnWidth = 8;
                    break;
                  case 'Cat No.':
                  case 'Pack Size':
                    columnWidth = 7;
                    break;
                  case 'Qty':
                    columnWidth = 5;
                    break;
                  case 'GST %':
                  case 'Discount %':
                    columnWidth = 4;
                    break;
                  case 'Unit Rate':
                  case 'Discount Value':
                  case 'GST Value':
                    columnWidth = 9;
                    break;
                  case 'Total':
                    columnWidth = 7;
                    break;
                  case 'Lead Time':
                    columnWidth = 5;
                    break;
                  case 'Make':
                    columnWidth = 9;
                    break;
                }

                // Determine text alignment based on column content
                const shouldCenter = [
                  'S.No', 'Cat No.', 'Pack Size', 'HSN Code', 'Qty', 
                  'Discount %', 'Discount Value', 'GST %', 'GST Value', 'Total'
                ].includes(header);

                return new TableCell({
                  shading: {
                    fill: STYLES.colors.primary,
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
                        : ['Unit Rate'].includes(header)
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
            ...data.items.map((item, index) => new TableRow({
              children: [
                item.sno.toString(),
                item.cat_no,
                item.pack_size,
                item.product_description,
                item.hsn_code,
                item.qty.toString(),
                formatCurrency(item.unit_rate),
                `${item.discount_percent}%`,
                formatCurrency(item.discounted_value),
                `${item.gst_percent}%`,
                formatCurrency(item.gst_value),
                formatCurrency(item.total_price),
                item.lead_time,
                item.make
              ].map((text, colIndex) => {
                // Determine if this column should be centered
                const shouldCenter = [0, 1, 2, 4, 5, 7, 8, 9, 10, 11].includes(colIndex);
                
                return new TableCell({
                  shading: {
                    fill: index % 2 === 0 ? STYLES.colors.accent : "FFFFFF",
                    type: ShadingType.CLEAR,
                    color: "auto"
                  },
                  width: {
                    size: colIndex === 3 ? 18 : 
                          colIndex === 0 ? 4 :
                          colIndex === 4 ? 8 :
                          [1, 2].includes(colIndex) ? 7 :
                          [5].includes(colIndex) ? 5 :
                          [7, 9].includes(colIndex) ? 4 :
                          [6, 8, 10].includes(colIndex) ? 9 :
                          colIndex === 12 ? 5 :
                          colIndex === 13 ? 9 : 7,
                    type: WidthType.PERCENTAGE
                  },
                  verticalAlign: "center",
                  children: [
                    new Paragraph({
                      alignment: shouldCenter
                        ? AlignmentType.CENTER
                        : [6].includes(colIndex)
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
            }))
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
