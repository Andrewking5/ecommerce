import api from './api';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDelivery?: string;
  shippingAddress?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateOrderData {
  items: Array<{ productId: string; quantity: number; variantId?: string }>;
  shippingAddressId?: string;
  couponCode?: string;
  paymentMethod?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

const orderService = {
  async getUserOrders(params?: { page?: number; limit?: number }): Promise<OrdersResponse> {
    const { data } = await api.get<OrdersResponse>('/orders', { params });
    return data;
  },

  async getOrderById(id: string): Promise<{ success: boolean; data: Order }> {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async createOrder(orderData: CreateOrderData): Promise<{ success: boolean; data: Order; message: string }> {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<OrdersResponse> {
    const { data } = await api.get<OrdersResponse>('/orders/admin/all', { params });
    return data;
  },

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<{ success: boolean; data: Order; message: string }> {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
  },
};

export default orderService;
