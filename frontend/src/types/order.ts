export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
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
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
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
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
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


