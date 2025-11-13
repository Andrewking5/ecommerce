export interface UserAddress {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  zipCode?: string;
  label?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  zipCode?: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export type AddressLabel = '家' | '公司' | '学校' | '其他';

// 转换为订单地址格式
export const toOrderAddress = (address: UserAddress) => ({
  street: `${address.province}${address.city}${address.district}${address.street}`,
  city: address.city,
  state: address.province,
  zipCode: address.zipCode || '',
  country: '中国',
});

