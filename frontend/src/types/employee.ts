export interface Employee {
  id: string;
  name: string;
  mobile: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  name: string;
  mobile: string;
  email: string;
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {
  id: string;
}
