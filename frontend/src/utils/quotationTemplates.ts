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
import { QuotationData } from '../types/quotation-generator';
import { Company } from '../types/company';
import { createHeaderContent, createFooterContent, createQuotationTitle, formatCurrency, convertInchesToDxa, STYLES, COLORS, createClientDetailsTable, createItemsTable, createTermsSection } from './documentGenerator';

/**
 * Creates a signature section for quotation documents
 * 
 * This function generates a standardized signature section that includes:
 * - Company display name (using legalName if available, falling back to name)
 * - Space for authorized signatory
 * - Right-aligned formatting for professional appearance
 * 
 * @param company - Company object containing name and legal name information
 * @returns Promise<Table> - A docx Table element containing the signature section
 * 
 * @example
 * ```typescript
 * const signatureSection = await createSignatureSection(companyData);
 * // Returns a table with "For COMPANY NAME" and "Authorized Signatory" text
 * ```
 */
export const createSignatureSection = async (company: Company) => {
  console.log('Creating signature section for company:', company?.name);

  // Get the company display name
  const companyDisplayName = company?.legalName || company?.name || "CHEMBIO LIFESCIENCES";

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.none,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "For " + companyDisplayName,
                    bold: true,
                    ...STYLES.fonts.tableSmall
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 0 }
              }),
              // If we have a company seal/signature, add it
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 500, after: 0 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    ...STYLES.fonts.tableSmall
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 0 }
              })
            ],
            verticalAlign: VerticalAlign.BOTTOM
          })
        ]
      })
    ]
  });
};

/**
 * Creates a base template structure with common document elements
 * 
 * This function provides the foundational document structure that all company-specific
 * templates can build upon. It includes:
 * - Default document styles and fonts
 * - Page layout and margins
 * - Footer configuration
 * - Common document settings
 * 
 * @param data - QuotationData containing company and quotation information
 * @returns Promise<Object> - Base document configuration object for docx
 * 
 * @example
 * ```typescript
 * const baseTemplate = await createBaseTemplate(quotationData);
 * // Use baseTemplate as foundation for company-specific templates
 * ```
 */
export const createBaseTemplate = async (data: QuotationData) => {
  // Create signature section
  const signatureSection = await createSignatureSection(data.company);

  // Common document structure and styles
  return {
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
        // These will be filled in by the specific template functions
      ]
    }]
  };
};

// Modern signature section for Chembio Lifesciences with company seal
export const createModernSignatureSection = async (company: Company) => {
  console.log('Creating modern signature section for company:', company?.name);

  // Get the company display name
  const companyDisplayName = company?.legalName || company?.name || "CHEMBIO LIFESCIENCES";

  const modernSignatureStyle = {
    name: 'Calibri',
    size: 16,
    color: '#333333',
  };

  const modernCompanyStyle = {
    name: 'Calibri',
    size: 18,
    bold: true,
    color: '#333333',
  };

  // Prepare seal content
  let sealContent = [];
  
  if (company?.branding?.sealImageUrl) {
    try {
      // If company seal image is available, try to load and display it
      console.log('Loading company seal image:', company.branding.sealImageUrl);
      
      const response = await fetch(company.branding.sealImageUrl);
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        
        sealContent = [
          new Paragraph({
            children: [
              new ImageRun({
                data: uint8Array,
                transformation: {
                  width: 100,
                  height: 100,
                },
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 150, after: 150 }
          })
        ];
        console.log('Company seal image loaded successfully');
      } else {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading company seal:', error);
      sealContent = [
        new Paragraph({
          children: [
            new TextRun({
              text: "[Company Seal - Image Load Failed]",
              ...modernSignatureStyle,
              color: '#CC0000',
              italic: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 }
        })
      ];
    }
  } else {
    sealContent = [
      new Paragraph({
        children: [
          new TextRun({
            text: "[Company Seal]",
            ...modernSignatureStyle,
            color: '#CCCCCC',
            italic: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 200 }
      })
    ];
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.none,
            children: [
              // Company name
              new Paragraph({
                children: [
                  new TextRun({
                    text: "For " + companyDisplayName,
                    ...modernCompanyStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 100 }
              }),
              // Company seal content
              ...sealContent,
              // Additional space for signature
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 300, after: 100 }
              }),
              // Authorized Signatory text
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    ...modernSignatureStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 100, after: 200 }
              })
            ],
            verticalAlign: VerticalAlign.BOTTOM,
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            }
          })
        ]
      })
    ]
  });
};

/**
 * Creates a modern header component for Chembio Lifesciences template
 * 
 * This component generates a contemporary, centered header design featuring:
 * - Blue color scheme (#0066CC) for modern, professional appearance
 * - Centered company name with large, bold typography
 * - Modern address and contact information layout
 * - Tax information display (PAN and GST)
 * - Responsive typography scaling
 * 
 * Design Features:
 * - Primary color: #0066CC (Professional Blue)
 * - Typography: Calibri font family with size scaling
 * - Layout: Centered alignment for modern aesthetic
 * - Spacing: Generous padding for clean appearance
 * 
 * @param company - Company object containing name, address, contact, and tax information
 * @returns Table - A docx Table element containing the modern header
 * 
 * @example
 * ```typescript
 * const header = createModernHeader(companyData);
 * // Returns a blue-themed, centered header table
 * ```
 */
export const createModernHeader = (company: Company) => {
  const MODERN_COLORS = {
    primary: '#0066CC', // Blue
    background: '#F8F9FA',
    text: '#FFFFFF'
  };

  const modernHeaderStyle = {
    name: 'Calibri',
    size: 24,
    color: MODERN_COLORS.text,
  };

  const modernTitleStyle = {
    ...modernHeaderStyle,
    size: 36,
    bold: true,
  };

  const modernSubtitleStyle = {
    ...modernHeaderStyle,
    size: 20,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: MODERN_COLORS.primary,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              // Modern centered company name with contemporary typography
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.name || "CHEMBIO LIFESCIENCES",
                    ...modernTitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 100, line: 240 },
              }),
              // Modern address layout
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.street || ''}, ${company.address.city || ''}` :
                      "L-10, Himalaya Legend, Nyay Khand-1, Indirapuram",
                    ...modernHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 50, line: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.state || ''} - ${company.address.postalCode || ''}` :
                      "Ghaziabad - 201014",
                    ...modernHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 100, line: 200 },
              }),
              // Modern contact information layout
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Email: ${company?.contactInfo?.email || "chembio.sales@gmail.com"} | Phone: ${company?.contactInfo?.phone || "0120-4909400"}`,
                    ...modernSubtitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 100, line: 200 },
              }),
              // Modern tax information
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PAN: ${company?.taxInfo?.pan || "AALFC0922C"} | GST: ${company?.taxInfo?.gst || "09AALFC0922C1ZU"}`,
                    ...modernSubtitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 200, line: 200 },
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 150,
              right: 150,
            },
          }),
        ],
      }),
    ],
  });
};

/**
 * Creates a modern client details section for Chembio Lifesciences template
 * 
 * This component generates a card-style client information section featuring:
 * - Modern grid-based layout with rounded appearance
 * - Blue color scheme matching the header design
 * - Clean typography with label/value pairs
 * - Professional spacing and borders
 * 
 * Information Displayed:
 * - Company Name
 * - Contact Person
 * - Address
 * - Phone
 * - Email
 * 
 * Design Features:
 * - Card-style borders with light background
 * - Blue labels (#0066CC) with dark text values
 * - Consistent spacing and margins
 * - Grid-based responsive layout
 * 
 * @param data - QuotationData containing billTo client information
 * @returns Table - A docx Table element containing the modern client section
 * 
 * @example
 * ```typescript
 * const clientSection = createModernClientSection(quotationData);
 * // Returns a modern, card-style client information table
 * ```
 */
export const createModernClientSection = (data: QuotationData) => {
  const MODERN_COLORS = {
    primary: '#0066CC',
    light: '#F8F9FA',
    border: '#E3F2FD',
    text: '#333333'
  };

  const modernCellStyle = {
    name: 'Calibri',
    size: 18,
    color: MODERN_COLORS.text,
  };

  const modernLabelStyle = {
    ...modernCellStyle,
    bold: true,
    color: MODERN_COLORS.primary,
  };

  // Create modern card-style borders with rounded appearance
  const modernBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: modernBorders,
    rows: [
      // Modern header row with card-style design
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: MODERN_COLORS.light,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Bill To",
                    bold: true,
                    color: MODERN_COLORS.primary,
                    size: 22,
                    font: 'Calibri',
                  }),
                ],
                spacing: { before: 120, after: 120 },
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: 2,
            margins: {
              top: 80,
              bottom: 80,
              left: 120,
              right: 120,
            },
          }),
        ],
      }),
      // Modern grid-based client information presentation
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Company Name",
                    ...modernLabelStyle,
                  }),
                ],
                spacing: { before: 100, after: 60 },
              }),
            ],
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: {
              top: 60,
              bottom: 60,
              left: 120,
              right: 60,
            },
          }),
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.company || "-",
                    ...modernCellStyle,
                  }),
                ],
                spacing: { before: 100, after: 60 },
              }),
            ],
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: {
              top: 60,
              bottom: 60,
              left: 60,
              right: 120,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact Person",
                    ...modernLabelStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 120,
              right: 60,
            },
          }),
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.contactPerson || data.billTo.name || "-",
                    ...modernCellStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 60,
              right: 120,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Address",
                    ...modernLabelStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 120,
              right: 60,
            },
          }),
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.address || "-",
                    ...modernCellStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 60,
              right: 120,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Phone",
                    ...modernLabelStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 120,
              right: 60,
            },
          }),
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.phone || "-",
                    ...modernCellStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 60,
              left: 60,
              right: 120,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Email",
                    ...modernLabelStyle,
                  }),
                ],
                spacing: { before: 60, after: 100 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 80,
              left: 120,
              right: 60,
            },
          }),
          new TableCell({
            borders: modernBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.email || "-",
                    ...modernCellStyle,
                  }),
                ],
                spacing: { before: 60, after: 100 },
              }),
            ],
            margins: {
              top: 60,
              bottom: 80,
              left: 60,
              right: 120,
            },
          }),
        ],
      }),
    ],
  });
};

/**
 * Creates a modern items table for Chembio Lifesciences template
 * 
 * This component generates a contemporary items table featuring:
 * - Modern grid-based design with alternating row colors
 * - Blue header with white text for contrast
 * - Emphasis on product specifications and lead times
 * - Clean borders and professional spacing
 * - Summary rows with enhanced styling
 * 
 * Table Columns:
 * - S.No. (5%)
 * - Cat. No. (10%)
 * - Specification (18%) - Product specifications
 * - Make (8%) - Emphasized in blue
 * - Pack (8%) - Pack size
 * - Qty (6%)
 * - Unit Rate (10%)
 * - Discount % (8%)
 * - GST % (7%)
 * - Lead Time (9%) - Emphasized in blue
 * - Amount (11%)
 * 
 * Design Features:
 * - Alternating row colors for readability
 * - Blue header (#0066CC) with white text
 * - Lead time highlighted in blue for emphasis
 * - Modern borders and spacing
 * - Bold summary totals
 * 
 * @param data - QuotationData containing items array and totals
 * @returns Table - A docx Table element containing the modern items table
 * 
 * @example
 * ```typescript
 * const itemsTable = createModernItemsTable(quotationData);
 * // Returns a modern, grid-style items table with blue theming
 * ```
 */
export const createModernItemsTable = (data: QuotationData) => {
  const MODERN_COLORS = {
    primary: '#0066CC',
    alternateRow: '#F8F9FA',
    border: '#E3F2FD',
    headerText: '#FFFFFF',
    text: '#333333'
  };

  const modernTableStyle = {
    name: 'Calibri',
    size: 16,
    color: MODERN_COLORS.text,
  };

  const modernHeaderStyle = {
    ...modernTableStyle,
    bold: true,
    color: MODERN_COLORS.headerText,
  };

  // Modern borders with clean appearance
  const modernBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: MODERN_COLORS.border },
  };

  // Generate the rows for items
  const itemRows: TableRow[] = [
    // Modern header row with updated column structure including Make, Discount %, and GST %
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "S.No.", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 5, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Cat. No.", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Specification", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 18, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Make", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Pack", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Qty", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 6, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Unit Rate", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Discount %", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "GST %", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 7, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Lead Time", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 9, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          shading: { fill: MODERN_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Amount", ...modernHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
          })],
          width: { size: 11, type: WidthType.PERCENTAGE },
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
      ],
    }),
  ];

  // Add item rows with updated column structure including Make, Discount %, and GST %
  data.items.forEach((item, index) => {
    const isAlternate = index % 2 === 1;
    const rowShading = isAlternate ? { fill: MODERN_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" } : undefined;

    // Calculate discount percentage (default to 0 if not provided)
    const discountPercent = item.discount_percent || 0;
    
    // Calculate GST percentage (default to 18 if not provided)
    const gstPercent = item.gst_percent || 18;

    // Get make and lead time with defaults
    const make = item.make || "Generic";
    const leadTime = item.lead_time || "2-3 weeks";

    itemRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.sno), ...modernTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.cat_no || "-", ...modernTableStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.product_description || "-", ...modernTableStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: make, ...modernTableStyle, color: MODERN_COLORS.primary, italic: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.pack_size || "-", ...modernTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.qty), ...modernTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.unit_rate, true), ...modernTableStyle })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${discountPercent}%`, ...modernTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${gstPercent}%`, ...modernTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: leadTime, ...modernTableStyle, color: MODERN_COLORS.primary, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
          new TableCell({
            borders: modernBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.total_price, true), ...modernTableStyle, bold: true })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 60, after: 60 },
            })],
            margins: { top: 50, bottom: 50, left: 40, right: 40 },
          }),
        ],
      })
    );
  });

  // Add modern summary rows with clean styling
  const summaryStyle = {
    ...modernTableStyle,
    bold: true,
    size: 18,
  };

  itemRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...modernBorders,
            top: { style: BorderStyle.SINGLE, size: 2, color: MODERN_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: "Sub Total", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          columnSpan: 10,
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
        new TableCell({
          borders: {
            ...modernBorders,
            top: { style: BorderStyle.SINGLE, size: 2, color: MODERN_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.subTotal, true), ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          margins: { top: 60, bottom: 60, left: 40, right: 40 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Tax", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          columnSpan: 10,
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
        }),
        new TableCell({
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.tax, true), ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Round Off", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          columnSpan: 10,
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
        }),
        new TableCell({
          borders: modernBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.roundOff, true), ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          margins: { top: 50, bottom: 50, left: 40, right: 40 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...modernBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 2, color: MODERN_COLORS.primary },
          },
          shading: { fill: MODERN_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: "Grand Total",
              ...summaryStyle,
              size: 20,
              color: MODERN_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
          })],
          columnSpan: 10,
          margins: { top: 80, bottom: 80, left: 40, right: 40 },
        }),
        new TableCell({
          borders: {
            ...modernBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 2, color: MODERN_COLORS.primary },
          },
          shading: { fill: MODERN_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: formatCurrency(data.grandTotal, true),
              ...summaryStyle,
              size: 20,
              color: MODERN_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
          })],
          margins: { top: 80, bottom: 80, left: 40, right: 40 },
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: modernBorders,
    rows: itemRows,
  });
};

// Modern terms section for Chembio Lifesciences
export const createModernTermsSection = (data: QuotationData, colors: any) => {
  const modernTermsStyle = {
    name: 'Calibri',
    size: 16,
    color: colors.text,
  };

  const modernTermsHeaderStyle = {
    name: 'Calibri',
    size: 20,
    bold: true,
    color: colors.headerText,
  };

  const modernBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
  };

  return [
    // Modern Terms Header
    new Paragraph({
      children: [
        new TextRun({
          text: "Terms & Conditions",
          ...modernTermsHeaderStyle,
        })
      ],
      shading: {
        type: ShadingType.CLEAR,
        color: "auto",
        fill: colors.primary
      },
      spacing: { before: 200, after: 150 },
      alignment: AlignmentType.LEFT,
    }),

    // Modern Terms Content with clean formatting
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: modernBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: modernBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Payment Terms: ",
                      ...modernTermsStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.paymentTerms || "100% advance payment required",
                      ...modernTermsStyle,
                    }),
                  ],
                  spacing: { before: 100, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Delivery: ",
                      ...modernTermsStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.deliveryTerms || "Ex-works, subject to availability",
                      ...modernTermsStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Validity: ",
                      ...modernTermsStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.validityPeriod || "30 days from quotation date",
                      ...modernTermsStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Lead Time: ",
                      ...modernTermsStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: "As mentioned against each item, subject to confirmation",
                      ...modernTermsStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Quality: ",
                      ...modernTermsStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: "All products are guaranteed for quality and specifications",
                      ...modernTermsStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 100 },
                }),
              ],
              margins: {
                top: 100,
                bottom: 100,
                left: 120,
                right: 120,
              },
            }),
          ],
        }),
      ],
    }),
  ];
};

// Modern bank details section for Chembio Lifesciences
export const createModernBankDetailsSection = (data: QuotationData, colors: any, typography: any) => {
  const modernBankStyle = {
    ...typography.bodyFont,
    color: colors.text,
  };

  const modernBankHeaderStyle = {
    ...typography.headerFont,
    bold: true,
    color: colors.headerText,
  };

  const modernBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: colors.border },
  };

  return [
    // Modern Bank Details Header
    new Paragraph({
      children: [
        new TextRun({
          text: "Bank Details",
          ...modernBankHeaderStyle,
        })
      ],
      shading: {
        type: ShadingType.CLEAR,
        color: "auto",
        fill: colors.primary
      },
      spacing: { before: 200, after: 150 },
      alignment: AlignmentType.LEFT,
    }),

    // Modern Bank Details Content with clean grid layout
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: modernBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: modernBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Bank Name: ",
                      ...modernBankStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.bankDetails?.bankName || 'HDFC BANK LTD.',
                      ...modernBankStyle,
                    }),
                  ],
                  spacing: { before: 100, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Account No: ",
                      ...modernBankStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.bankDetails?.accountNo || '50200017511430',
                      ...modernBankStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "IFSC Code: ",
                      ...modernBankStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.bankDetails?.ifscCode || 'HDFC0000590',
                      ...modernBankStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Branch Code: ",
                      ...modernBankStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.bankDetails?.branchCode || '0590',
                      ...modernBankStyle,
                    }),
                    new TextRun({
                      text: " | Account Type: ",
                      ...modernBankStyle,
                      bold: true,
                      color: colors.primary,
                    }),
                    new TextRun({
                      text: data.bankDetails?.accountType || 'Current account',
                      ...modernBankStyle,
                    }),
                  ],
                  spacing: { before: 80, after: 100 },
                }),
              ],
              margins: {
                top: 100,
                bottom: 100,
                left: 120,
                right: 120,
              },
            }),
          ],
        }),
      ],
    }),
  ];
};

// Technical header component for Chemlab Synthesis
export const createTechnicalHeader = (company: Company) => {
  const TECHNICAL_COLORS = {
    primary: '#2E7D32', // Scientific green
    background: '#F1F8E9', // Light green background
    text: '#1B5E20', // Dark green text
    neutral: '#FAFAFA' // Neutral background
  };

  const technicalHeaderStyle = {
    name: 'Arial',
    size: 20,
    color: TECHNICAL_COLORS.text,
  };

  const technicalTitleStyle = {
    ...technicalHeaderStyle,
    size: 28,
    bold: true,
    color: TECHNICAL_COLORS.primary,
  };

  const technicalSubtitleStyle = {
    ...technicalHeaderStyle,
    size: 16,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: TECHNICAL_COLORS.background,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              // Center-aligned company name with scientific styling
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.name || "CHEMLAB SYNTHESIS",
                    ...technicalTitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 150, after: 80, line: 240 },
              }),
              // Center-aligned technical address layout
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.street || ''}, ${company.address.city || ''}` :
                      "GROUND FLOOR, AQ 2-10, BTTP PARK, SECTOR-81, GR. FARIDABAD-121001, FARIDABAD",
                    ...technicalHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 40, line: 180 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.state || ''} - ${company.address.postalCode || ''}` :
                      "HARYANA - 121001",
                    ...technicalHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60, line: 180 },
              }),
              // Center-aligned contact information for technical documents
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Email: ${company?.contactInfo?.email || "chemlab.sales@gmail.com"} | Phone: ${company?.contactInfo?.phone || "+91-9911998473"}`,
                    ...technicalSubtitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 60, line: 180 },
              }),
              // Center-aligned technical tax information
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PAN: ${company?.taxInfo?.pan || "AANFC1381M"} | GST: ${company?.taxInfo?.gst || "06AANFC1381M1Z6"}`,
                    ...technicalSubtitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 150, line: 180 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 100,
              right: 100,
            },
          }),
        ],
      }),
    ],
  });
};

// Technical signature section for Chemlab Synthesis with company seal space
export const createTechnicalSignatureSection = async (company: Company) => {
  console.log('Creating technical signature section for company:', company?.name);

  // Get the company display name
  const companyDisplayName = company?.legalName || company?.name || "CHEMLAB SYNTHESIS";

  const technicalSignatureStyle = {
    name: 'Arial',
    size: 16,
    color: '#333333',
  };

  const technicalCompanyStyle = {
    name: 'Arial',
    size: 18,
    bold: true,
    color: '#333333',
  };

  // Prepare seal content
  let sealContent = [];
  
  if (company?.branding?.sealImageUrl) {
    try {
      // If company seal image is available, try to load and display it
      console.log('Loading company seal image:', company.branding.sealImageUrl);
      
      // Attempt to load the actual image
      const response = await fetch(company.branding.sealImageUrl);
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        
        sealContent = [
          new Paragraph({
            children: [
              new ImageRun({
                data: uint8Array,
                transformation: {
                  width: 100, // 100 pixels width
                  height: 100, // 100 pixels height
                },
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 150, after: 150 }
          })
        ];
        console.log('Company seal image loaded successfully');
      } else {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading company seal:', error);
      // Fallback to text indicator if image loading fails
      sealContent = [
        new Paragraph({
          children: [
            new TextRun({
              text: "[Company Seal - Image Load Failed]",
              ...technicalSignatureStyle,
              color: '#CC0000', // Red color to indicate error
              italic: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 }
        })
      ];
    }
  } else {
    // If no seal image, show placeholder with more space
    sealContent = [
      new Paragraph({
        children: [
          new TextRun({
            text: "[Company Seal]",
            ...technicalSignatureStyle,
            color: '#CCCCCC', // Light gray placeholder text
            italic: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 200 }
      })
    ];
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.none,
            children: [
              // Company name
              new Paragraph({
                children: [
                  new TextRun({
                    text: "For " + companyDisplayName,
                    ...technicalCompanyStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 100 }
              }),
              // Company seal content
              ...sealContent,
              // Additional space for signature
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 300, after: 100 }
              }),
              // Authorized Signatory text
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    ...technicalSignatureStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 100, after: 200 }
              })
            ],
            verticalAlign: VerticalAlign.BOTTOM,
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            }
          })
        ]
      })
    ]
  });
};

// Technical terms section for Chemlab Synthesis with specific terms
export const createTechnicalTermsSection = (data: QuotationData, colors: any) => {
  const technicalTermsStyle = {
    name: 'Arial',
    size: 14,
    color: colors.text || '#1B5E20',
  };

  const technicalTermsHeaderStyle = {
    name: 'Arial',
    size: 18,
    bold: true,
    color: '#FFFFFF',
  };

  const technicalBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: colors.border || '#A5D6A7' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.border || '#A5D6A7' },
    left: { style: BorderStyle.SINGLE, size: 1, color: colors.border || '#A5D6A7' },
    right: { style: BorderStyle.SINGLE, size: 1, color: colors.border || '#A5D6A7' },
  };

  return [
    // Professional Terms Header
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: technicalBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: {
                fill: colors.primary || '#2E7D32',
                type: ShadingType.CLEAR,
                color: "auto"
              },
              borders: technicalBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Terms & Conditions",
                      ...technicalTermsHeaderStyle,
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 120 },
                }),
              ],
              margins: {
                top: 80,
                bottom: 80,
                left: 120,
                right: 120,
              },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: technicalBorders,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "1. Validity: ",
                      ...technicalTermsStyle,
                      bold: true,
                      color: colors.primary || '#2E7D32',
                    }),
                    new TextRun({
                      text: "30 Days",
                      ...technicalTermsStyle,
                    }),
                  ],
                  spacing: { before: 120, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "2. Lead Time: ",
                      ...technicalTermsStyle,
                      bold: true,
                      color: colors.primary || '#2E7D32',
                    }),
                    new TextRun({
                      text: "Please check individual items for their lead time",
                      ...technicalTermsStyle,
                    }),
                  ],
                  spacing: { before: 100, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "3. Order once placed will not be cancelled",
                      ...technicalTermsStyle,
                      bold: true,
                      color: colors.primary || '#2E7D32',
                    }),
                  ],
                  spacing: { before: 100, after: 120 },
                }),
              ],
              margins: {
                top: 100,
                bottom: 100,
                left: 120,
                right: 120,
              },
            }),
          ],
        }),
      ],
    }),
  ];
};

// Technical client details section for Chemlab Synthesis
export const createTechnicalClientSection = (data: QuotationData) => {
  const TECHNICAL_COLORS = {
    primary: '#2E7D32', // Scientific green
    background: '#F1F8E9', // Light green background
    border: '#A5D6A7', // Green border
    text: '#1B5E20', // Dark green text
    neutral: '#FAFAFA' // Neutral background
  };

  const technicalCellStyle = {
    name: 'Arial',
    size: 16,
    color: TECHNICAL_COLORS.text,
  };

  const technicalLabelStyle = {
    ...technicalCellStyle,
    bold: true,
    color: TECHNICAL_COLORS.primary,
  };

  // Compact, information-dense borders for technical presentation
  const technicalBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: technicalBorders,
    rows: [
      // Compact header row optimized for technical documents
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: TECHNICAL_COLORS.background,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Client Information",
                    bold: true,
                    color: TECHNICAL_COLORS.primary,
                    size: 18,
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 80, after: 80 },
                alignment: AlignmentType.LEFT,
              }),
            ],
            columnSpan: 2,
            margins: {
              top: 60,
              bottom: 60,
              left: 80,
              right: 80,
            },
          }),
        ],
      }),
      // Compact, information-dense format optimized for space usage
      new TableRow({
        children: [
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Company",
                    ...technicalLabelStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            width: { size: 25, type: WidthType.PERCENTAGE },
            margins: {
              top: 40,
              bottom: 40,
              left: 80,
              right: 40,
            },
          }),
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.company || "-",
                    ...technicalCellStyle,
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            width: { size: 75, type: WidthType.PERCENTAGE },
            margins: {
              top: 40,
              bottom: 40,
              left: 40,
              right: 80,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact",
                    ...technicalLabelStyle,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 40,
              left: 80,
              right: 40,
            },
          }),
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.contactPerson || data.billTo.name || "-",
                    ...technicalCellStyle,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 40,
              left: 40,
              right: 80,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Address",
                    ...technicalLabelStyle,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 40,
              left: 80,
              right: 40,
            },
          }),
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.address || "-",
                    ...technicalCellStyle,
                  }),
                ],
                spacing: { before: 40, after: 40 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 40,
              left: 40,
              right: 80,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Phone | Email",
                    ...technicalLabelStyle,
                  }),
                ],
                spacing: { before: 40, after: 60 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 60,
              left: 80,
              right: 40,
            },
          }),
          new TableCell({
            borders: technicalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${data.billTo.phone || "-"} | ${data.billTo.email || "-"}`,
                    ...technicalCellStyle,
                  }),
                ],
                spacing: { before: 40, after: 60 },
              }),
            ],
            margins: {
              top: 40,
              bottom: 60,
              left: 40,
              right: 80,
            },
          }),
        ],
      }),
    ],
  });
};

// Technical items table for Chemlab Synthesis
export const createTechnicalItemsTable = (data: QuotationData) => {
  const TECHNICAL_COLORS = {
    primary: '#2E7D32', // Scientific green
    background: '#F1F8E9', // Light green background
    alternateRow: '#FAFAFA', // Neutral alternate row
    border: '#A5D6A7', // Green border
    headerText: '#FFFFFF', // White header text
    text: '#1B5E20', // Dark green text
    monospace: '#263238' // Dark color for technical data
  };

  const technicalTableStyle = {
    name: 'Arial',
    size: 14,
    color: TECHNICAL_COLORS.text,
  };

  const technicalHeaderStyle = {
    ...technicalTableStyle,
    bold: true,
    color: TECHNICAL_COLORS.headerText,
  };

  const technicalMonospaceStyle = {
    name: 'Consolas', // Monospace font for technical data
    size: 14,
    color: TECHNICAL_COLORS.monospace,
  };

  // Technical data table borders with clean appearance
  const technicalBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
  };

  // Generate the rows for items
  const itemRows: TableRow[] = [
    // Technical header row with updated column structure including Make and Lead Time
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "S.No.", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 5, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Cat. No.", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Specification", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 20, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Make", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Pack", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Qty", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 6, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Unit Rate", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Discount %", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "GST %", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 7, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Lead Time", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 9, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          shading: { fill: TECHNICAL_COLORS.primary, type: ShadingType.CLEAR, color: "auto" },
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Amount", ...technicalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          width: { size: 9, type: WidthType.PERCENTAGE },
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
      ],
    }),
  ];

  // Add item rows with updated column structure including Make and Lead Time
  data.items.forEach((item, index) => {
    const isAlternate = index % 2 === 1;
    const rowShading = isAlternate ? { fill: TECHNICAL_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" } : undefined;

    // Calculate discount percentage (default to 0 if not provided)
    const discountPercent = item.discount_percent || 0;
    
    // Calculate GST percentage (default to 18 if not provided)
    const gstPercent = item.gst_percent || 18;

    // Get make and lead time with defaults
    const make = item.make || "Generic";
    const leadTime = item.lead_time || "2-3 weeks";

    itemRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.sno), ...technicalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.cat_no || "-", ...technicalMonospaceStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.product_description || "-", ...technicalTableStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: make, ...technicalTableStyle, color: TECHNICAL_COLORS.primary, italic: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.pack_size || "-", ...technicalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.qty), ...technicalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.unit_rate, true), ...technicalMonospaceStyle })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${discountPercent}%`, ...technicalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${gstPercent}%`, ...technicalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: leadTime, ...technicalTableStyle, color: TECHNICAL_COLORS.primary, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
          new TableCell({
            borders: technicalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.total_price, true), ...technicalMonospaceStyle, bold: true })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 40, after: 40 },
            })],
            margins: { top: 40, bottom: 40, left: 30, right: 30 },
          }),
        ],
      })
    );
  });

  // Add technical summary rows with clean styling
  const summaryStyle = {
    ...technicalTableStyle,
    bold: true,
    size: 16,
  };

  itemRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...technicalBorders,
            top: { style: BorderStyle.SINGLE, size: 2, color: TECHNICAL_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: "Sub Total", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          columnSpan: 10,
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
        new TableCell({
          borders: {
            ...technicalBorders,
            top: { style: BorderStyle.SINGLE, size: 2, color: TECHNICAL_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.subTotal, true), ...summaryStyle, ...technicalMonospaceStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 60, after: 60 },
          })],
          margins: { top: 50, bottom: 50, left: 30, right: 30 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Tax", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
          })],
          columnSpan: 10,
          margins: { top: 40, bottom: 40, left: 30, right: 30 },
        }),
        new TableCell({
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.tax, true), ...summaryStyle, ...technicalMonospaceStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
          })],
          margins: { top: 40, bottom: 40, left: 30, right: 30 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Round Off", ...summaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
          })],
          columnSpan: 10,
          margins: { top: 40, bottom: 40, left: 30, right: 30 },
        }),
        new TableCell({
          borders: technicalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.roundOff, true), ...summaryStyle, ...technicalMonospaceStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
          })],
          margins: { top: 40, bottom: 40, left: 30, right: 30 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...technicalBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 2, color: TECHNICAL_COLORS.primary },
          },
          shading: { fill: TECHNICAL_COLORS.background, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: "Grand Total",
              ...summaryStyle,
              size: 18,
              color: TECHNICAL_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          columnSpan: 10,
          margins: { top: 60, bottom: 60, left: 30, right: 30 },
        }),
        new TableCell({
          borders: {
            ...technicalBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 2, color: TECHNICAL_COLORS.primary },
          },
          shading: { fill: TECHNICAL_COLORS.background, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: formatCurrency(data.grandTotal, true),
              ...summaryStyle,
              ...technicalMonospaceStyle,
              size: 18,
              color: TECHNICAL_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          margins: { top: 60, bottom: 60, left: 30, right: 30 },
        }),
      ],
    }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: technicalBorders,
    rows: itemRows,
  });
};

// Template for Chembio Lifesciences (modern, professional)
export const createChembioLifesciencesTemplate = async (data: QuotationData) => {
  console.log('Creating Chembio Lifesciences modern template');

  try {
    // Validate input data
    if (!data) {
      throw new Error('No quotation data provided');
    }

    // Define modern color scheme and typography for Chembio Lifesciences
    const MODERN_COLORS = {
      primary: '#0066CC', // Professional blue
      secondary: '#F8F9FA', // Light background
      border: '#E3F2FD', // Light blue border
      text: '#333333', // Dark text
      headerText: '#FFFFFF', // White text for headers
      alternateRow: '#F8F9FA' // Alternate row color
    };

    const MODERN_TYPOGRAPHY = {
      headerFont: { name: 'Calibri', size: 24 },
      titleFont: { name: 'Calibri', size: 36, bold: true },
      bodyFont: { name: 'Calibri', size: 18 },
      tableFont: { name: 'Calibri', size: 16 },
      smallFont: { name: 'Calibri', size: 14 }
    };

    // Create signature section with modern styling
    let signatureSection;
    try {
      signatureSection = await createModernSignatureSection(data.company);
    } catch (signatureError) {
      console.error('Error creating modern signature section:', signatureError);
      signatureSection = new Paragraph({
        children: [new TextRun({ 
          text: "Signature section unavailable", 
          color: "999999",
          ...MODERN_TYPOGRAPHY.smallFont
        })]
      });
    }

    // Create base document with modern settings and repeating header
    let baseDoc;
    try {
      baseDoc = await createBaseTemplate(data);
    } catch (baseError) {
      console.error('Error creating base template:', baseError);
      throw new Error('Failed to create base document structure');
    }

    // Modern Header - using the new component
    let modernHeader;
    try {
      modernHeader = createModernHeader(data.company);
    } catch (headerError) {
      console.error('Error creating modern header:', headerError);
      // Fallback to basic header with modern colors
      modernHeader = createHeaderContent(data.company, MODERN_COLORS.primary);
    }

    // Modern Client Details section - using the new component
    let modernClientSection;
    try {
      modernClientSection = createModernClientSection(data);
    } catch (clientError) {
      console.error('Error creating modern client section:', clientError);
      // Fallback to basic client details with modern colors
      modernClientSection = createClientDetailsTable(data, MODERN_COLORS.primary);
    }

    // Modern Items Table - using the new component
    let modernItemsTable;
    try {
      modernItemsTable = createModernItemsTable(data);
    } catch (itemsError) {
      console.error('Error creating modern items table:', itemsError);
      // Fallback to basic items table with modern colors
      modernItemsTable = createItemsTable(data, MODERN_COLORS.primary);
    }

    // Modern Terms section with enhanced styling
    let modernTermsSection;
    try {
      modernTermsSection = createModernTermsSection(data, MODERN_COLORS);
    } catch (termsError) {
      console.error('Error creating modern terms section:', termsError);
      // Fallback to basic terms section
      modernTermsSection = createTermsSection(data, MODERN_COLORS.primary);
    }

    // Modern Bank Details section
    const modernBankDetailsSection = createModernBankDetailsSection(data, MODERN_COLORS, MODERN_TYPOGRAPHY);

    // Children array for the document section with modern components and consistent spacing
    const children = [
      // Modern Header
      modernHeader,
      
      // Modern Quotation Title with enhanced styling
      ...createQuotationTitle(data.quotationRef, data.quotationDate, {
        alignment: 'CENTER',
        color: MODERN_COLORS.primary,
        fontSize: 32
      }),

      // Consistent modern spacing
      new Paragraph({ spacing: { before: 400, after: 200 } }),

      // Modern Client Details with card-style layout
      modernClientSection,

      // Consistent modern spacing
      new Paragraph({ spacing: { before: 400, after: 200 } }),

      // Modern Items Table with grid-based design
      modernItemsTable,

      // Consistent modern spacing
      new Paragraph({ spacing: { before: 400, after: 200 } }),

      // Modern Terms and Conditions
      ...modernTermsSection,

      // Consistent modern spacing
      new Paragraph({ spacing: { before: 400, after: 200 } }),

      // Modern Bank Details
      ...modernBankDetailsSection,

      // Consistent modern spacing
      new Paragraph({ spacing: { before: 400, after: 200 } }),

      // Modern Signature section
      signatureSection,
    ];

    // Set the children array for the document section
    if (baseDoc.sections && baseDoc.sections[0]) {
      baseDoc.sections[0].children = children;
    } else {
      throw new Error('Invalid base document structure');
    }

    console.log('Chembio Lifesciences modern template created successfully with consistent styling');
    return baseDoc;

  } catch (error) {
    console.error('Error in createChembioLifesciencesTemplate:', error);
    throw error; // Re-throw to be handled by getTemplateForCompany
  }
};

// Formal signature section for Chembio Pvt Ltd with company seal
export const createFormalSignatureSection = async (company: Company) => {
  console.log('Creating formal signature section for company:', company?.name);

  // Get the company display name
  const companyDisplayName = company?.legalName || company?.name || "CHEMBIO LIFESCIENCES PVT. LTD.";

  const formalSignatureStyle = {
    name: 'Times New Roman',
    size: 16,
    color: '#333333',
  };

  const formalCompanyStyle = {
    name: 'Times New Roman',
    size: 18,
    bold: true,
    color: '#333333',
  };

  // Prepare seal content
  let sealContent = [];
  
  if (company?.branding?.sealImageUrl) {
    try {
      // If company seal image is available, try to load and display it
      console.log('Loading company seal image:', company.branding.sealImageUrl);
      
      const response = await fetch(company.branding.sealImageUrl);
      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        
        sealContent = [
          new Paragraph({
            children: [
              new ImageRun({
                data: uint8Array,
                transformation: {
                  width: 100,
                  height: 100,
                },
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 150, after: 150 }
          })
        ];
        console.log('Company seal image loaded successfully');
      } else {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading company seal:', error);
      sealContent = [
        new Paragraph({
          children: [
            new TextRun({
              text: "[Company Seal - Image Load Failed]",
              ...formalSignatureStyle,
              color: '#CC0000',
              italic: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 200 }
        })
      ];
    }
  } else {
    sealContent = [
      new Paragraph({
        children: [
          new TextRun({
            text: "[Company Seal]",
            ...formalSignatureStyle,
            color: '#CCCCCC',
            italic: true
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 200 }
      })
    ];
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: STYLES.borders.none,
            children: [
              // Company name
              new Paragraph({
                children: [
                  new TextRun({
                    text: "For " + companyDisplayName,
                    ...formalCompanyStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 200, after: 100 }
              }),
              // Company seal content
              ...sealContent,
              // Additional space for signature
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 300, after: 100 }
              }),
              // Authorized Signatory text
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Authorized Signatory",
                    ...formalSignatureStyle
                  })
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { before: 100, after: 200 }
              })
            ],
            verticalAlign: VerticalAlign.BOTTOM,
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            }
          })
        ]
      })
    ]
  });
};

// Formal header component for Chembio Lifesciences Pvt. Ltd.
export const createFormalHeader = (company: Company) => {
  const FORMAL_COLORS = {
    primary: '#001F3F', // Dark navy
    secondary: '#D4AF37', // Gold
    background: '#F8F9FA',
    text: '#FFFFFF',
    darkText: '#001F3F'
  };

  const formalHeaderStyle = {
    name: 'Times New Roman',
    size: 20,
    color: FORMAL_COLORS.text,
  };

  const formalTitleStyle = {
    ...formalHeaderStyle,
    size: 32,
    bold: true,
  };

  const formalSubtitleStyle = {
    ...formalHeaderStyle,
    size: 18,
  };

  const formalContactStyle = {
    ...formalHeaderStyle,
    size: 16,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: STYLES.borders.none,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: FORMAL_COLORS.primary,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              // Formal letterhead-style header with company seal integration
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.legalName || company?.name || "CHEMBIO LIFESCIENCES PVT. LTD.",
                    ...formalTitleStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 150, line: 280 },
              }),
              // Traditional typography with formal business styling
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.street || ''}, ${company.address.city || ''}` :
                      "L-10, Himalaya Legend, Nyay Khand-1, Indirapuram",
                    ...formalHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 80, line: 240 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: company?.address ?
                      `${company.address.state || ''} - ${company.address.postalCode || ''}` :
                      "Ghaziabad - 201014",
                    ...formalHeaderStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120, line: 240 },
              }),
              // Structured contact information layout for corporate appearance
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Tel: ${company?.contactInfo?.phone || "0120-4909400"}`,
                    ...formalContactStyle,
                  }),
                  new TextRun({
                    text: " | ",
                    ...formalContactStyle,
                  }),
                  new TextRun({
                    text: `Email: ${company?.contactInfo?.email || "chembio.sales@gmail.com"}`,
                    ...formalContactStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 120, line: 220 },
              }),
              // Corporate tax information with formal presentation
              new Paragraph({
                children: [
                  new TextRun({
                    text: `PAN: ${company?.taxInfo?.pan || "AALFC0922C"}`,
                    ...formalContactStyle,
                  }),
                  new TextRun({
                    text: " | ",
                    ...formalContactStyle,
                  }),
                  new TextRun({
                    text: `GST: ${company?.taxInfo?.gst || "09AALFC0922C1ZU"}`,
                    ...formalContactStyle,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 200, line: 220 },
              }),
            ],
            margins: {
              top: 150,
              bottom: 150,
              left: 200,
              right: 200,
            },
          }),
        ],
      }),
      // Gold accent border for formal appearance
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: FORMAL_COLORS.secondary,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: STYLES.borders.none,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "", size: 4 })],
                spacing: { before: 0, after: 0 },
              }),
            ],
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          }),
        ],
      }),
    ],
  });
};

// Formal client details section for Chembio Lifesciences Pvt. Ltd.
export const createFormalClientSection = (data: QuotationData) => {
  const FORMAL_COLORS = {
    primary: '#001F3F', // Dark navy
    secondary: '#D4AF37', // Gold
    border: '#001F3F',
    headerBg: '#001F3F',
    headerText: '#FFFFFF',
    text: '#333333',
    lightBg: '#F8F9FA'
  };

  const formalCellStyle = {
    name: 'Times New Roman',
    size: 18,
    color: FORMAL_COLORS.text,
  };

  const formalLabelStyle = {
    ...formalCellStyle,
    bold: true,
    color: FORMAL_COLORS.primary,
  };

  const formalHeaderStyle = {
    ...formalCellStyle,
    bold: true,
    color: FORMAL_COLORS.headerText,
    size: 20,
  };

  // Traditional table format with formal borders
  const formalBorders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: formalBorders,
    rows: [
      // Formal header with corporate styling
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: FORMAL_COLORS.headerBg,
              type: ShadingType.CLEAR,
              color: "auto"
            },
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "BILL TO",
                    ...formalHeaderStyle,
                  }),
                ],
                spacing: { before: 150, after: 150 },
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 2,
            margins: {
              top: 100,
              bottom: 100,
              left: 150,
              right: 150,
            },
          }),
        ],
      }),
      // Structured, business-formal client information presentation
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Company Name:",
                    ...formalLabelStyle,
                  }),
                ],
                spacing: { before: 120, after: 80 },
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: {
              top: 80,
              bottom: 80,
              left: 150,
              right: 80,
            },
          }),
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.company || "-",
                    ...formalCellStyle,
                  }),
                ],
                spacing: { before: 120, after: 80 },
              }),
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: {
              top: 80,
              bottom: 80,
              left: 80,
              right: 150,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Contact Person:",
                    ...formalLabelStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 150,
              right: 80,
            },
          }),
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.contactPerson || data.billTo.name || "-",
                    ...formalCellStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 80,
              right: 150,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Address:",
                    ...formalLabelStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 150,
              right: 80,
            },
          }),
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.address || "-",
                    ...formalCellStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 80,
              right: 150,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Telephone:",
                    ...formalLabelStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 150,
              right: 80,
            },
          }),
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.phone || "-",
                    ...formalCellStyle,
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 80,
              left: 80,
              right: 150,
            },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Email:",
                    ...formalLabelStyle,
                  }),
                ],
                spacing: { before: 80, after: 120 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 100,
              left: 150,
              right: 80,
            },
          }),
          new TableCell({
            borders: formalBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.billTo.email || "-",
                    ...formalCellStyle,
                  }),
                ],
                spacing: { before: 80, after: 120 },
              }),
            ],
            margins: {
              top: 80,
              bottom: 100,
              left: 80,
              right: 150,
            },
          }),
        ],
      }),
    ],
  });
};

// Formal items table for Chembio Lifesciences Pvt. Ltd.
export const createFormalItemsTable = (data: QuotationData) => {
  const FORMAL_COLORS = {
    primary: '#001F3F', // Dark navy
    secondary: '#D4AF37', // Gold
    border: '#001F3F',
    headerBg: '#001F3F',
    headerText: '#FFFFFF',
    text: '#333333',
    alternateRow: '#F8F9FA'
  };

  const formalTableStyle = {
    name: 'Times New Roman',
    size: 16,
    color: FORMAL_COLORS.text,
  };

  const formalHeaderStyle = {
    ...formalTableStyle,
    bold: true,
    color: FORMAL_COLORS.headerText,
    size: 18,
  };

  const formalSummaryStyle = {
    ...formalTableStyle,
    bold: true,
    size: 18,
  };

  // Traditional lined table design with clear borders
  const formalBorders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 2, color: FORMAL_COLORS.border },
  };

  // Generate the rows for items
  const itemRows: TableRow[] = [
    // Formal header row with updated column structure including Make, Discount %, and GST %
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "S.No.", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 5, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Cat. No.", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Specification", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 18, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Make", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Pack", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Qty", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 6, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Unit Rate", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 10, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Discount %", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 8, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "GST %", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 7, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Lead Time", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 9, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          shading: { fill: FORMAL_COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Amount", ...formalHeaderStyle })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          })],
          width: { size: 11, type: WidthType.PERCENTAGE },
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
      ],
    }),
  ];

  // Add item rows with updated column structure including Make, Discount %, and GST %
  data.items.forEach((item, index) => {
    const isAlternate = index % 2 === 1;
    const rowShading = isAlternate ? { fill: FORMAL_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" } : undefined;

    // Calculate discount percentage (default to 0 if not provided)
    const discountPercent = item.discount_percent || 0;
    
    // Calculate GST percentage (default to 18 if not provided)
    const gstPercent = item.gst_percent || 18;

    // Get make and lead time with defaults
    const make = item.make || "Generic";
    const leadTime = item.lead_time || "2-3 weeks";

    itemRows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.sno), ...formalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.cat_no || "-", ...formalTableStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.product_description || "-", ...formalTableStyle })],
              alignment: AlignmentType.LEFT,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: make, ...formalTableStyle, color: FORMAL_COLORS.primary, italic: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: item.pack_size || "-", ...formalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: String(item.qty), ...formalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.unit_rate, true), ...formalTableStyle })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${discountPercent}%`, ...formalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: `${gstPercent}%`, ...formalTableStyle })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: leadTime, ...formalTableStyle, color: FORMAL_COLORS.primary, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
          new TableCell({
            borders: formalBorders,
            shading: rowShading,
            children: [new Paragraph({
              children: [new TextRun({ text: formatCurrency(item.total_price, true), ...formalTableStyle, bold: true })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 80, after: 80 },
            })],
            margins: { top: 70, bottom: 70, left: 60, right: 60 },
          }),
        ],
      })
    );
  });

  // Add formal summary rows with corporate styling
  itemRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...formalBorders,
            top: { style: BorderStyle.DOUBLE, size: 3, color: FORMAL_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: "Sub Total", ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
          })],
          columnSpan: 10,
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
        new TableCell({
          borders: {
            ...formalBorders,
            top: { style: BorderStyle.DOUBLE, size: 3, color: FORMAL_COLORS.primary },
          },
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.subTotal, true), ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
          })],
          margins: { top: 80, bottom: 80, left: 60, right: 60 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Tax", ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          columnSpan: 10,
          margins: { top: 70, bottom: 70, left: 60, right: 60 },
        }),
        new TableCell({
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.tax, true), ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          margins: { top: 70, bottom: 70, left: 60, right: 60 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: "Round Off", ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          columnSpan: 10,
          margins: { top: 70, bottom: 70, left: 60, right: 60 },
        }),
        new TableCell({
          borders: formalBorders,
          children: [new Paragraph({
            children: [new TextRun({ text: formatCurrency(data.roundOff, true), ...formalSummaryStyle })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 80, after: 80 },
          })],
          margins: { top: 70, bottom: 70, left: 60, right: 60 },
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: {
            ...formalBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 3, color: FORMAL_COLORS.primary },
          },
          shading: { fill: FORMAL_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: "GRAND TOTAL",
              ...formalSummaryStyle,
              size: 20,
              color: FORMAL_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 120, after: 120 },
          })],
          columnSpan: 10,
          margins: { top: 100, bottom: 100, left: 60, right: 60 },
        }),
        new TableCell({
          borders: {
            ...formalBorders,
            bottom: { style: BorderStyle.DOUBLE, size: 3, color: FORMAL_COLORS.primary },
          },
          shading: { fill: FORMAL_COLORS.alternateRow, type: ShadingType.CLEAR, color: "auto" },
          children: [new Paragraph({
            children: [new TextRun({
              text: formatCurrency(data.grandTotal, true),
              ...formalSummaryStyle,
              size: 20,
              color: FORMAL_COLORS.primary
            })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 120, after: 120 },
          })],
          margins: { top: 100, bottom: 100, left: 60, right: 60 },
        }),
      ],
    }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: formalBorders,
    rows: itemRows,
  });
};

// Template for Chembio Lifesciences Pvt. Ltd. (formal, corporate)
export const createChembioPvtLtdTemplate = async (data: QuotationData) => {
  console.log('Creating Chembio Lifesciences Pvt. Ltd. template');

  try {
    // Validate input data
    if (!data) {
      throw new Error('No quotation data provided');
    }

    // Define company-specific styles
    const COMPANY_COLORS = {
      primary: '#001F3F', // Dark blue
      secondary: '#D4AF37', // Gold
      border: '#D4AF37', // Gold borders
      header: '#001F3F',
      light: '#F8F9FA'
    };

    // Create components with error handling
    let signatureSection, baseDoc, clientDetailsTable, itemsTable, termsSection;

    try {
      signatureSection = await createFormalSignatureSection(data.company);
    } catch (error) {
      console.error('Error creating formal signature section:', error);
      signatureSection = new Paragraph({ children: [new TextRun({ text: "Signature section unavailable", color: "999999" })] });
    }

    try {
      baseDoc = await createBaseTemplate(data);
    } catch (error) {
      console.error('Error creating base template:', error);
      throw new Error('Failed to create base document structure');
    }

    try {
      clientDetailsTable = createClientDetailsTable(data, COMPANY_COLORS.header);
    } catch (error) {
      console.error('Error creating client details table:', error);
      clientDetailsTable = new Paragraph({ children: [new TextRun({ text: "Client details unavailable", color: "999999" })] });
    }

    try {
      itemsTable = createItemsTable(data, COMPANY_COLORS.header);
    } catch (error) {
      console.error('Error creating items table:', error);
      itemsTable = new Paragraph({ children: [new TextRun({ text: "Items table unavailable", color: "999999" })] });
    }

    try {
      termsSection = createTermsSection(data, COMPANY_COLORS.header);
    } catch (error) {
      console.error('Error creating terms section:', error);
      termsSection = [new Paragraph({ children: [new TextRun({ text: "Terms section unavailable", color: "999999" })] })];
    }

    // Create formal template components
    let formalHeader, formalClientSection, formalItemsTable;

    try {
      formalHeader = createFormalHeader(data.company);
    } catch (error) {
      console.error('Error creating formal header:', error);
      formalHeader = createHeaderContent(data.company, COMPANY_COLORS.header);
    }

    try {
      formalClientSection = createFormalClientSection(data);
    } catch (error) {
      console.error('Error creating formal client section:', error);
      formalClientSection = clientDetailsTable;
    }

    try {
      formalItemsTable = createFormalItemsTable(data);
    } catch (error) {
      console.error('Error creating formal items table:', error);
      formalItemsTable = itemsTable;
    }

    // Children array for the document section with formal components
    const children = [
      formalHeader,
      ...createQuotationTitle(data.quotationRef, data.quotationDate, {
        alignment: 'CENTER', // Centered title for formal appearance
        color: COMPANY_COLORS.primary, // Dark blue for formal look
        fontSize: 28 // Slightly larger for emphasis
      }),

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Formal Client Details
      formalClientSection,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Formal Items Table
      formalItemsTable,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Add the terms and conditions
      ...termsSection,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Add company-specific bank details with formal styling
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
          left: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
          right: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  fill: COMPANY_COLORS.primary,
                  type: ShadingType.CLEAR,
                  color: "auto"
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  left: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  right: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "BANK DETAILS",
                        bold: true,
                        color: "FFFFFF",
                        font: 'Times New Roman',
                        size: 20
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 }
                  }),
                ],
                margins: {
                  top: 80,
                  bottom: 80,
                  left: 120,
                  right: 120,
                },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  bottom: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  left: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                  right: { style: BorderStyle.SINGLE, size: 2, color: COMPANY_COLORS.primary },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Bank Name: ${data.bankDetails?.bankName || 'HDFC BANK LTD.'}`,
                        font: 'Times New Roman',
                        size: 16,
                        color: COMPANY_COLORS.primary,
                        bold: true
                      })
                    ],
                    spacing: { before: 80, after: 60 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Account No: ${data.bankDetails?.accountNo || '50200017511430'}`,
                        font: 'Times New Roman',
                        size: 16,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 60, after: 60 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `NEFT/RTGS IFSC: ${data.bankDetails?.ifscCode || 'HDFC0000590'}`,
                        font: 'Times New Roman',
                        size: 16,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 60, after: 60 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Branch Code: ${data.bankDetails?.branchCode || '0590'} | Micro Code: ${data.bankDetails?.microCode || '110240081'}`,
                        font: 'Times New Roman',
                        size: 16,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 60, after: 60 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Account Type: ${data.bankDetails?.accountType || 'Current Account'}`,
                        font: 'Times New Roman',
                        size: 16,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 60, after: 80 }
                  }),
                ],
                margins: {
                  top: 80,
                  bottom: 80,
                  left: 120,
                  right: 120,
                },
              }),
            ],
          }),
        ],
      }),

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Add signature section as the last section
      signatureSection,
    ];

    // Set the children array for the document section
    if (baseDoc.sections && baseDoc.sections[0]) {
      baseDoc.sections[0].children = children;
    } else {
      throw new Error('Invalid base document structure');
    }

    console.log('Chembio Pvt Ltd template created successfully');
    return baseDoc;

  } catch (error) {
    console.error('Error in createChembioPvtLtdTemplate:', error);
    throw error; // Re-throw to be handled by getTemplateForCompany
  }
};

// Template for Chemlab Synthesis (scientific, technical)
export const createChemlabSynthesisTemplate = async (data: QuotationData) => {
  console.log('Creating Chemlab Synthesis technical template');

  try {
    // Validate input data
    if (!data) {
      throw new Error('No quotation data provided');
    }

    // Define technical color scheme and typography
    const TECHNICAL_COLORS = {
      primary: '#2E7D32', // Scientific green
      secondary: '#E8F5E9',
      border: '#A5D6A7',
      header: '#2E7D32',
      light: '#F1F8E9'
    };

    // Create technical components with error handling
    let technicalHeader, technicalClientSection, technicalItemsTable, signatureSection, baseDoc, termsSection;

    try {
      technicalHeader = createTechnicalHeader(data.company);
    } catch (headerError) {
      console.error('Error creating technical header:', headerError);
      technicalHeader = new Paragraph({ children: [new TextRun({ text: "Technical header unavailable", color: "999999" })] });
    }

    try {
      technicalClientSection = createTechnicalClientSection(data);
    } catch (clientError) {
      console.error('Error creating technical client section:', clientError);
      technicalClientSection = new Paragraph({ children: [new TextRun({ text: "Client details unavailable", color: "999999" })] });
    }

    try {
      technicalItemsTable = createTechnicalItemsTable(data);
    } catch (itemsError) {
      console.error('Error creating technical items table:', itemsError);
      technicalItemsTable = new Paragraph({ children: [new TextRun({ text: "Items table unavailable", color: "999999" })] });
    }

    try {
      signatureSection = await createTechnicalSignatureSection(data.company);
    } catch (error) {
      console.error('Error creating technical signature section:', error);
      signatureSection = new Paragraph({ children: [new TextRun({ text: "Signature section unavailable", color: "999999" })] });
    }

    try {
      baseDoc = await createBaseTemplate(data);
    } catch (error) {
      console.error('Error creating base template:', error);
      throw new Error('Failed to create base document structure');
    }

    try {
      termsSection = createTechnicalTermsSection(data, TECHNICAL_COLORS);
    } catch (error) {
      console.error('Error creating technical terms section:', error);
      termsSection = [new Paragraph({ children: [new TextRun({ text: "Terms section unavailable", color: "999999" })] })];
    }

    // Children array for the technical document section
    const children = [
      // Technical header with left-aligned scientific design
      technicalHeader,
      
      // Technical quotation title with left alignment
      ...createQuotationTitle(data.quotationRef, data.quotationDate, {
        alignment: 'LEFT', // Left-aligned for technical documents
        color: TECHNICAL_COLORS.primary,
        fontSize: 22
      }),

      // Compact spacing for technical documents
      new Paragraph({ spacing: { before: 150, after: 150 } }),

      // Technical client details section
      technicalClientSection,

      // Compact spacing
      new Paragraph({ spacing: { before: 150, after: 150 } }),

      // Technical items table with CAS numbers and chemical specifications
      technicalItemsTable,

      // Compact spacing
      new Paragraph({ spacing: { before: 150, after: 150 } }),

      // Technical terms and conditions
      ...termsSection,

      // Compact spacing
      new Paragraph({ spacing: { before: 150, after: 150 } }),

      // Professional Technical Bank Details Section
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
          left: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
          right: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: {
                  fill: TECHNICAL_COLORS.primary,
                  type: ShadingType.CLEAR,
                  color: "auto"
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  left: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  right: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Bank Details",
                        bold: true,
                        color: "FFFFFF",
                        font: 'Arial',
                        size: 18
                      })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 120, after: 120 }
                  }),
                ],
                margins: {
                  top: 80,
                  bottom: 80,
                  left: 120,
                  right: 120,
                },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  left: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                  right: { style: BorderStyle.SINGLE, size: 1, color: TECHNICAL_COLORS.border },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Bank Name: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.bankName || 'HDFC BANK LTD.',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 100, after: 80 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Account No: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.accountNo || '50200017511430',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 80, after: 80 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "NEFT/RTGS IFSC: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.ifscCode || 'HDFC0000590',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 80, after: 80 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Branch Code: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.branchCode || '0590',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      }),
                      new TextRun({
                        text: " | Micro Code: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.microCode || '110240081',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 80, after: 80 }
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Account Type: ",
                        font: 'Arial',
                        size: 14,
                        bold: true,
                        color: TECHNICAL_COLORS.primary
                      }),
                      new TextRun({
                        text: data.bankDetails?.accountType || 'Current Account',
                        font: 'Arial',
                        size: 14,
                        color: '#333333'
                      })
                    ],
                    spacing: { before: 80, after: 100 }
                  }),
                ],
                margins: {
                  top: 100,
                  bottom: 100,
                  left: 120,
                  right: 120,
                },
              }),
            ],
          }),
        ],
      }),

      // Compact spacing
      new Paragraph({ spacing: { before: 150, after: 150 } }),

      // Technical signature section
      signatureSection,
    ];

    // Set the children array for the document section
    if (baseDoc.sections && baseDoc.sections[0]) {
      baseDoc.sections[0].children = children;
    } else {
      throw new Error('Invalid base document structure');
    }

    console.log('Chemlab Synthesis technical template created successfully');
    return baseDoc;

  } catch (error) {
    console.error('Error in createChemlabSynthesisTemplate:', error);
    throw error; // Re-throw to be handled by getTemplateForCompany
  }
};

// Default template (fallback)
export const createDefaultTemplate = async (data: QuotationData) => {
  console.log('Creating default template');

  try {
    // Validate input data - be more lenient for default template
    if (!data) {
      console.warn('No quotation data provided, creating minimal template');
      data = {
        quotationRef: 'N/A',
        quotationDate: new Date().toISOString(),
        billTo: { name: 'N/A', company: 'N/A', address: 'N/A', email: 'N/A', phone: 'N/A' },
        items: [],
        subTotal: 0,
        tax: 0,
        roundOff: 0,
        grandTotal: 0,
        notes: '',
        paymentTerms: '',
        company: { id: '', name: 'Default Company', legalName: 'Default Company' }
      } as QuotationData;
    }

    // Create components with error handling
    let signatureSection, baseDoc, clientDetailsTable, itemsTable, termsSection;

    try {
      signatureSection = await createSignatureSection(data.company);
    } catch (error) {
      console.error('Error creating signature section:', error);
      signatureSection = new Paragraph({ children: [new TextRun({ text: "Signature section unavailable", color: "999999" })] });
    }

    try {
      baseDoc = await createBaseTemplate(data);
    } catch (error) {
      console.error('Error creating base template:', error);
      throw new Error('Failed to create base document structure');
    }

    try {
      clientDetailsTable = createClientDetailsTable(data);
    } catch (error) {
      console.error('Error creating client details table:', error);
      clientDetailsTable = new Paragraph({ children: [new TextRun({ text: "Client details unavailable", color: "999999" })] });
    }

    try {
      itemsTable = createItemsTable(data);
    } catch (error) {
      console.error('Error creating items table:', error);
      itemsTable = new Paragraph({ children: [new TextRun({ text: "Items table unavailable", color: "999999" })] });
    }

    try {
      termsSection = createTermsSection(data);
    } catch (error) {
      console.error('Error creating terms section:', error);
      termsSection = [new Paragraph({ children: [new TextRun({ text: "Terms section unavailable", color: "999999" })] })];
    }

    // Children array for the document section
    const children = [
      createHeaderContent(data.company),
      ...createQuotationTitle(data.quotationRef, data.quotationDate),

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Client Details
      clientDetailsTable,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Items Table
      itemsTable,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Add the terms and conditions
      ...termsSection,

      // Spacing
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Add signature section
      signatureSection,

      // Add default bank details
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
    ];

    // Set the children array for the document section
    if (baseDoc.sections && baseDoc.sections[0]) {
      baseDoc.sections[0].children = children;
    } else {
      throw new Error('Invalid base document structure');
    }

    console.log('Default template created successfully');
    return baseDoc;

  } catch (error) {
    console.error('Error in createDefaultTemplate:', error);
    throw error; // Re-throw to be handled by getTemplateForCompany
  }
};

// Template selector function with enhanced error handling and fallback logic
export const getTemplateForCompany = async (data: QuotationData) => {
  const startTime = Date.now();
  console.log('=== Template Selection Started ===');
  console.log('Company Name:', data.company?.name || 'Unknown');
  console.log('Company ID:', data.company?.id || 'Unknown');
  console.log('Template Config Available:', !!data.company?.templateConfig);

  try {
    // Validate input data
    if (!data) {
      console.error('❌ No quotation data provided, using default template');
      return createDefaultTemplate(data);
    }

    if (!data.company) {
      console.error('❌ No company data provided, using default template');
      return createDefaultTemplate(data);
    }

    // Ensure company has template configuration (backward compatibility)
    if (!data.company.templateConfig) {
      console.warn('⚠️ Company missing templateConfig, applying default configuration');
      const { ensureTemplateConfig } = await import('./companyDefaults');
      data.company = ensureTemplateConfig(data.company);
      console.log('✅ Applied default template config:', data.company.templateConfig.templateType);
    }

    // Primary selection: Use templateConfig.templateType if available
    if (data.company.templateConfig?.templateType) {
      console.log('🎯 Primary Selection: Using templateConfig.templateType:', data.company.templateConfig.templateType);

      try {
        let selectedTemplate;
        const templateType = data.company.templateConfig.templateType;

        switch (templateType) {
          case 'modern':
            console.log('📋 Creating modern template (Chembio Lifesciences style)');
            selectedTemplate = await createChembioLifesciencesTemplate(data);
            break;
          case 'formal':
            console.log('📋 Creating formal template (Chembio Pvt Ltd style)');
            selectedTemplate = await createChembioPvtLtdTemplate(data);
            break;
          case 'technical':
            console.log('📋 Creating technical template (Chemlab Synthesis style)');
            selectedTemplate = await createChemlabSynthesisTemplate(data);
            break;
          default:
            console.warn('⚠️ Unknown template type:', templateType);
            throw new Error(`Unknown template type: ${templateType}`);
        }

        const endTime = Date.now();
        console.log('✅ Template created successfully via templateConfig');
        console.log('⏱️ Selection time:', endTime - startTime, 'ms');
        console.log('=== Template Selection Complete ===');
        return selectedTemplate;

      } catch (templateError) {
        console.error('❌ Error creating template from templateConfig:', templateError);
        console.log('🔄 Falling back to secondary selection method');
        // Fall through to secondary selection
      }
    }

    // Secondary selection: Enhanced company name matching
    if (data.company.name) {
      console.log('🎯 Secondary Selection: Using enhanced company name matching');
      console.log('Company Name:', data.company.name);
      console.log('Legal Name:', data.company.legalName || 'Not provided');

      try {
        const companyName = data.company.name.toLowerCase().trim();
        const legalName = (data.company.legalName || '').toLowerCase().trim();
        const combinedName = `${companyName} ${legalName}`.toLowerCase();

        console.log('🔍 Analyzing company names for pattern matching...');

        // Enhanced pattern matching with more specific rules
        let selectedTemplate;
        let templateReason = '';

        if (companyName.includes('chembio') && companyName.includes('lifesciences') && !combinedName.includes('pvt')) {
          console.log('📋 Match: Chembio Lifesciences (modern template)');
          selectedTemplate = await createChembioLifesciencesTemplate(data);
          templateReason = 'Company name contains "chembio lifesciences" without "pvt"';
        } else if (combinedName.includes('chembio') && combinedName.includes('lifesciences') && combinedName.includes('pvt')) {
          console.log('📋 Match: Chembio Lifesciences Pvt. Ltd. (formal template)');
          selectedTemplate = await createChembioPvtLtdTemplate(data);
          templateReason = 'Company name contains "chembio lifesciences" with "pvt"';
        } else if (companyName.includes('chemlab') || companyName.includes('synthesis')) {
          console.log('📋 Match: Chemlab Synthesis (technical template)');
          selectedTemplate = await createChemlabSynthesisTemplate(data);
          templateReason = 'Company name contains "chemlab" or "synthesis"';
        } else if (combinedName.includes('lifesciences') && !combinedName.includes('pvt')) {
          console.log('📋 Partial Match: Generic Lifesciences (modern template)');
          selectedTemplate = await createChembioLifesciencesTemplate(data);
          templateReason = 'Company name contains "lifesciences" without "pvt" - using modern template';
        } else if (combinedName.includes('lifesciences') && combinedName.includes('pvt')) {
          console.log('📋 Partial Match: Generic Lifesciences Pvt (formal template)');
          selectedTemplate = await createChembioPvtLtdTemplate(data);
          templateReason = 'Company name contains "lifesciences" with "pvt" - using formal template';
        }

        if (selectedTemplate) {
          const endTime = Date.now();
          console.log('✅ Template selected via name matching:', templateReason);
          console.log('⏱️ Selection time:', endTime - startTime, 'ms');
          console.log('=== Template Selection Complete ===');
          return selectedTemplate;
        } else {
          console.log('⚠️ No name pattern match found, proceeding to tertiary selection');
        }

      } catch (nameMatchError) {
        console.error('❌ Error in enhanced name-based template selection:', nameMatchError);
        console.log('🔄 Falling back to tertiary selection method');
        // Fall through to tertiary selection
      }
    }

    // Tertiary selection: Enhanced company ID mapping
    if (data.company.id) {
      console.log('🎯 Tertiary Selection: Using enhanced company ID mapping');
      console.log('Company ID:', data.company.id);

      try {
        // Enhanced company ID to template mapping with logging
        const companyTemplateMap: Record<string, { template: () => Promise<any>, description: string }> = {
          'chembio-lifesciences': {
            template: () => createChembioLifesciencesTemplate(data),
            description: 'Chembio Lifesciences - Modern Template'
          },
          'chembio-pvt-ltd': {
            template: () => createChembioPvtLtdTemplate(data),
            description: 'Chembio Lifesciences Pvt. Ltd. - Formal Template'
          },
          'chemlab-synthesis': {
            template: () => createChemlabSynthesisTemplate(data),
            description: 'Chemlab Synthesis - Technical Template'
          }
          // Additional company IDs can be added here
        };

        const templateMapping = companyTemplateMap[data.company.id];
        if (templateMapping) {
          console.log('📋 ID Match Found:', templateMapping.description);
          const selectedTemplate = await templateMapping.template();
          
          const endTime = Date.now();
          console.log('✅ Template selected via ID mapping:', templateMapping.description);
          console.log('⏱️ Selection time:', endTime - startTime, 'ms');
          console.log('=== Template Selection Complete ===');
          return selectedTemplate;
        } else {
          console.log('⚠️ No ID mapping found for company ID:', data.company.id);
        }
      } catch (idMappingError) {
        console.error('❌ Error in enhanced ID-based template selection:', idMappingError);
        console.log('🔄 Falling back to default template');
        // Fall through to default
      }
    }

    // Final fallback: Use default template with enhanced logging
    console.log('🎯 Final Fallback: Using default template with company branding');
    console.log('⚠️ No specific template match found, applying default template');
    
    const defaultTemplate = await createDefaultTemplate(data);
    const endTime = Date.now();
    console.log('✅ Default template created successfully');
    console.log('⏱️ Selection time:', endTime - startTime, 'ms');
    console.log('=== Template Selection Complete ===');
    return defaultTemplate;

  } catch (error) {
    const endTime = Date.now();
    console.error('❌ Critical error in template selection:', error);
    console.log('⏱️ Failed selection time:', endTime - startTime, 'ms');

    // Emergency fallback: Create minimal template with enhanced error handling
    try {
      console.log('🚨 Creating emergency fallback template');
      const emergencyTemplate = await createDefaultTemplate(data);
      console.log('✅ Emergency template created successfully');
      console.log('=== Template Selection Complete (Emergency) ===');
      return emergencyTemplate;
    } catch (fallbackError) {
      console.error('❌ Emergency fallback template creation failed:', fallbackError);
      console.log('🚨 Creating last resort minimal template');

      // Last resort: Return basic document structure with enhanced error information
      const errorTemplate = {
        styles: {
          default: {
            document: {
              run: {
                font: 'Calibri',
                size: 22,
              }
            }
          }
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.15),
                right: convertInchesToTwip(0.2),
                bottom: convertInchesToTwip(0.2),
                left: convertInchesToTwip(0.2),
              }
            }
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Template Generation Error",
                  bold: true,
                  color: "FF0000",
                  size: 28
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Company: ${data?.company?.name || 'Unknown'}`,
                  color: "333333",
                  size: 20
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Error: ${error?.message || 'Unknown error occurred'}`,
                  color: "666666",
                  size: 18
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Please contact technical support for assistance.",
                  color: "333333",
                  size: 18
                })
              ]
            })
          ]
        }]
      };

      console.log('🚨 Last resort template created');
      console.log('=== Template Selection Complete (Last Resort) ===');
      return errorTemplate;
    }
  }
}; 