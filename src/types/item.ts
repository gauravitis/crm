export interface Item {
  id: string;
  name: string;
  catalogueId: string;
  casNumber: string;
  sku: string;
  packSize: string;
  price: number;
  quantity: number;
  createdAt: Date;
  hsnCode: string;
  batchNo: string;
  mfgDate: Date | null;
  expDate: Date | null;
  brand: string;
}
