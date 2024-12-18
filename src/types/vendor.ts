export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  panNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
