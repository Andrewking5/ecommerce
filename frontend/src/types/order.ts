export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string; // 变体ID（可选）
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    images: string[];
  };
  variant?: {
    id: string;
    sku: string;
    images: string[];
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface CreateOrderRequest {
  items: {
    productId: string;
    variantId?: string; // 变体ID（可选）
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  couponCode?: string;
  shippingCost?: number;
  addressId?: string; // 地址ID，如果提供则使用保存的地址
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


