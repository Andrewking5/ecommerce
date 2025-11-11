import { apiClient } from './api';
import { Order, OrderListResponse, CreateOrderRequest, OrderStatus } from '@/types/order';

export const orderApi = {
  // 獲取用戶訂單
  getUserOrders: async (page: number = 1, limit: number = 10): Promise<OrderListResponse> => {
    const response = await apiClient.get<any>(`/orders?page=${page}&limit=${limit}`);
    // 后端返回格式: { success: true, data: { orders, pagination } }
    return response.data || response;
  },

  // 獲取單一訂單
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<any>(`/orders/${id}`);
    // 后端返回格式: { success: true, data: order }
    return response.data || response;
  },

  // 創建訂單
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<any>('/orders', data);
    // 后端返回格式: { success: true, data: order }
    return response.data || response;
  },

  // 獲取所有訂單（管理員）
  getAllOrders: async (page: number = 1, limit: number = 20, status?: OrderStatus): Promise<OrderListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<any>(`/orders/admin/all?${params}`);
    // 后端返回格式: { success: true, data: { orders, pagination } }
    return response.data || response;
  },

  // 更新訂單狀態（管理員）
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.put<any>(`/orders/${id}/status`, { status });
    // 后端返回格式: { success: true, data: order }
    return response.data || response;
  },
};


