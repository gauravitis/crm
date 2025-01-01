export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: Address;
  createdAt?: string;
  updatedAt?: string;
}
