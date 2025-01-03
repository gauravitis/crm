export interface Item {
  id?: string;
  name: string;           // Required
  catalogueId?: string;   // Optional
  casNumber?: string;     // Optional
  sku?: string;          // Optional
  packSize?: string;     // Optional
  price: number;         // Required
  quantity: number;      // Required
  createdAt?: Date;      // Optional, system-generated
  hsnCode?: string;      // Optional
  batchNo?: string;      // Optional
  mfgDate?: Date | null; // Optional
  expDate?: Date | null; // Optional
  brand?: string;        // Optional
}
