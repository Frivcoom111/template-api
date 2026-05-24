export interface CreateAddressDTO {
  street: string;
  number: number;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UpdateAddressDTO {
  street?: string;
  number?: number;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface AddressResponse {
  id: string;
  userId?: string;
  street: string;
  number: number;
  complement: string | null;
  city: string;
  state: string;
  zipCode: string;
}
