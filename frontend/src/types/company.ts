export interface CompanyBankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchCode: string;
  microCode: string;
  accountType: string;
}

export interface FontConfig {
  family: string;
  size: number;
  weight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  style?: 'normal' | 'italic' | 'oblique';
}

export interface CompanyColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface TemplateTypography {
  headerFont: FontConfig;
  bodyFont: FontConfig;
  tableFont: FontConfig;
  accentFont: FontConfig;
}

export interface TemplateSpacing {
  headerPadding: number;
  sectionMargin: number;
  tableCellPadding: number;
  lineHeight: number;
}

export interface SectionConfiguration {
  type: 'header' | 'title' | 'client' | 'items' | 'terms' | 'signature' | 'bank';
  position: number;
  style: string;
  visible: boolean;
  customization?: Record<string, any>;
}

export interface TemplateConfig {
  templateType: 'modern' | 'formal' | 'technical';
  layout: 'modern' | 'formal' | 'technical';
  headerStyle: 'centered' | 'left-aligned' | 'split';
  tableStyle: 'modern-grid' | 'formal-lines' | 'technical-data';
  colorScheme: CompanyColorScheme;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  sections: SectionConfiguration[];
  customizations: {
    headerLayout: 'centered' | 'left' | 'split';
    showLogo: boolean;
    logoPosition: 'left' | 'right' | 'center';
    itemTableStyle: 'grid' | 'lines' | 'minimal';
    emphasizeFields: string[]; // ['leadTime', 'casNumber', 'compliance']
    sectionOrder: string[];
  };
}

export interface Company {
  id: string;
  name: string;               // Display name (e.g., "Chembio Lifesciences")
  legalName: string;          // Full legal name (e.g., "Chembio Lifesciences Pvt. Ltd.")
  shortCode: string;          // For reference numbers (e.g., "CBL")
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
  };
  taxInfo: {
    gst: string;
    pan: string;
  };
  bankDetails: CompanyBankDetails;
  branding: {
    logoUrl?: string;
    primaryColor?: string;    // Header color 
    secondaryColor?: string;  // Accent color
    accentColor?: string;     // Additional accent color
    sealImageUrl?: string;    // Company seal/stamp image
    fontFamily?: string;      // Primary font family
  };
  templateConfig: TemplateConfig; // Template configuration (now required)
  defaultTerms?: string;      // Company-specific default terms & conditions
  createdAt: string;
  active: boolean;
} 