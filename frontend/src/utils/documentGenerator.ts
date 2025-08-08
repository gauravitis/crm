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
  VerticalAlign,
  ImageRun
} from 'docx';
import { saveAs } from "file-saver";
import { QuotationData } from '../types/quotation-generator';
import { format, parse } from "date-fns";
import { Packer } from "docx";
import companyLogo from '../assets/company-seal.jpg';

// Export common styles and colors for reuse in other files
export const COLORS = {
  secondary: "#4B5563",
  border: "#E5E7EB",
  header: "#1F497D",  // Dark blue header color
  light: "#F2F2F2"
};

// Export common styles for reuse in other files
export const STYLES = {
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
    none: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    light: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    },
    thin: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    },
  }
};

// Export helper functions for reuse in other files
export const convertInchesToDxa = (inches: number) => {
  return Math.round(inches * 1440);
};

// Export formatting helpers
export const formatCurrency = (value: number, noSymbol = false) => {
  if (isNaN(value)) value = 0;
  const formatter = new Intl.NumberFormat('en-IN', {
    style: noSymbol ? 'decimal' : 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value).replace('₹', '').trim();
};

// Export createHeaderContent
export const createHeaderContent = (company: any, customHeaderColor?: string) => {
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
  const headerColor = customHeaderColor || company?.branding?.primaryColor || COLORS.header;

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

// Export createFooterContent
export const createFooterContent = () => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "This is a computer-generated document. No signature is required.",
        color: COLORS.secondary,
        size: 16, // 8pt
      }),
    ],
  });
};

// Export createQuotationTitle
export const createQuotationTitle = (ref: string, date: string, customStyles?: { alignment?: keyof typeof AlignmentType, color?: string, fontSize?: number }) => {
  // Format the date for display
  let formattedDate = date;
  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = format(dateObj, 'dd-MMM-yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  const titleStyle = {
    ...STYLES.fonts.header,
    size: customStyles?.fontSize || 28,
    color: customStyles?.color || COLORS.header,
    bold: true,
  };

  const alignment = customStyles?.alignment ? AlignmentType[customStyles.alignment] : AlignmentType.CENTER;

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "QUOTATION",
          ...titleStyle,
        }),
      ],
      alignment: alignment,
      spacing: { before: 400, after: 100 },
      keepNext: true,
    }),
    
    new Paragraph({
      children: [
        new TextRun({
          text: `Ref: ${ref || 'No Reference'} | Date: ${formattedDate}`,
          ...STYLES.fonts.small,
        }),
      ],
      alignment: alignment,
      spacing: { before: 0, after: 400 },
      keepNext: true,
    }),
  ];
};

// Import template functions
import { getTemplateForCompany } from './quotationTemplates';

export async function generateWord(data: QuotationData): Promise<{ blob: Blob, filename: string }> {
  try {
    console.log('Generating document with data:', {
      ref: data.quotationRef,
      items: data.items.length,
      billTo: data.billTo.name
    });

    // Get the appropriate template based on the company
    const docTemplate = await getTemplateForCompany(data);
    
    // Create the document using the template
    const doc = new Document(docTemplate);

    // Create a blob instead of buffer for browser environments
    const blob = await Packer.toBlob(doc);

    // Generate a filename (you may want to refine this)
    const sanitizedRef = data.quotationRef?.replace(/[\/\\:*?"<>|]/g, '_') || 'quotation';
    const filename = `${sanitizedRef}_${new Date().toISOString().split('T')[0]}.docx`;

    return { blob, filename };
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw error;
  }
}

// Create client details section
export const createClientDetailsTable = (data: QuotationData, customColor?: string) => {
  const sectionColor = customColor || COLORS.header;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.light,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: sectionColor,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: {
              ...STYLES.borders.light,
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Bill To:",
                    bold: true,
                    color: "FFFFFF",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            columnSpan: 2,
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Company Name:",
                    bold: true,
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.company || "-",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact Person:",
                    bold: true,
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.contactPerson || data.billTo.name || "-",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Address:",
                    bold: true,
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.address || "-",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Phone:",
                    bold: true,
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.phone || "-",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Email:",
                    bold: true,
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 80 },
              }),
            ],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.email || "-",
                    ...STYLES.fonts.tableSmall,
                  }),
                ],
                spacing: { before: 40, after: 80 },
              }),
            ],
          }),
        ],
      }),
    ],
  });
};

// Create items table
export const createItemsTable = (data: QuotationData, customColor?: string) => {
  const sectionColor = customColor || COLORS.header;
  
  // Generate the rows for items
  const itemRows: TableRow[] = [
    // Header row
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "S.No.", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Cat. No.", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Pack Size", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 25, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Unit Rate", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "GST", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          shading: { fill: sectionColor, type: ShadingType.CLEAR, color: "auto" },
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Amount", bold: true, color: "FFFFFF", ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.CENTER,
          })],
          width: { size: 12, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
  ];

  // Add item rows
  data.items.forEach((item) => {
    itemRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.sno), ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.CENTER,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: item.cat_no || "-", ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.LEFT,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: item.pack_size || "-", ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.LEFT,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: item.product_description || "-", ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.LEFT,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.qty), ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.CENTER,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.unit_rate, true), ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: `${item.gst_percent}%`, ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.CENTER,
            })],
          }),
          new TableCell({
            borders: STYLES.borders.light,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.total_price, true), ...STYLES.fonts.tableSmall })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        ],
      })
    );
  });

  // Add summary rows
  itemRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...STYLES.borders.light,
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: "Sub Total", bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
          columnSpan: 7,
        }),
        new TableCell({
          borders: {
            ...STYLES.borders.light,
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.subTotal, true), bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Tax", bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
          columnSpan: 7,
        }),
        new TableCell({
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.tax, true), bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: "Round Off", bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
          columnSpan: 7,
        }),
        new TableCell({
          borders: STYLES.borders.light,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.roundOff, true), bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...STYLES.borders.light,
            bottom: { style: BorderStyle.DOUBLE, size: 1, color: "000000" },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: "Grand Total", bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
          columnSpan: 7,
        }),
        new TableCell({
          borders: {
            ...STYLES.borders.light,
            bottom: { style: BorderStyle.DOUBLE, size: 1, color: "000000" },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.grandTotal, true), bold: true, ...STYLES.fonts.tableSmall })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.light,
    rows: itemRows,
  });
};

// Create terms and payment section
export const createTermsSection = (data: QuotationData, customColor?: string) => {
  const sectionColor = customColor || COLORS.header;
  
  // Split notes by newlines to create paragraphs
  const noteLines = (data.notes || '').split('\n').filter(line => line.trim());
  
  const termsParagraphs = [
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
        fill: sectionColor
      },
      spacing: { before: 200, after: 100 }
    }),
  ];
  
  // Add payment terms if available
  if (data.paymentTerms) {
    termsParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Payment Terms: ",
            bold: true,
            ...STYLES.fonts.tableSmall
          }),
          new TextRun({
            text: data.paymentTerms,
            ...STYLES.fonts.tableSmall
          })
        ],
        spacing: { before: 100, after: 100 }
      })
    );
  }
  
  // Add each note line as a paragraph
  noteLines.forEach(line => {
    termsParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            ...STYLES.fonts.tableSmall
          })
        ],
        spacing: { before: 40, after: 40 }
      })
    );
  });
  
  return termsParagraphs;
};
