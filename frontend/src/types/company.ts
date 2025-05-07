export interface CompanyBankDetails {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchCode: string;
  microCode: string;
  accountType: string;
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
    sealImageUrl?: string;    // Company seal/stamp image
  };
  defaultTerms?: string;      // Company-specific default terms & conditions
  createdAt: string;
  active: boolean;
} 