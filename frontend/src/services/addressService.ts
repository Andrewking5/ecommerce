import api from './api';

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

const addressService = {
  async getAddresses(): Promise<{ success: boolean; data: Address[] }> {
    const { data } = await api.get('/addresses');
    return data;
  },

  async getDefaultAddress(): Promise<{ success: boolean; data: Address | null }> {
    const { data } = await api.get('/addresses/default');
    return data;
  },

  async getAddress(id: string): Promise<{ success: boolean; data: Address }> {
    const { data } = await api.get(`/addresses/${id}`);
    return data;
  },

  async createAddress(address: AddressInput): Promise<{ success: boolean; data: Address }> {
    const { data } = await api.post('/addresses', address);
    return data;
  },

  async updateAddress(id: string, updates: Partial<AddressInput>): Promise<{ success: boolean; data: Address }> {
    const { data } = await api.put(`/addresses/${id}`, updates);
    return data;
  },

  async deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/addresses/${id}`);
    return data;
  },

  async setDefaultAddress(id: string): Promise<{ success: boolean; data: Address }> {
    const { data } = await api.put(`/addresses/${id}/set-default`);
    return data;
  },
};

export default addressService;
