import { apiClient } from './api';

export interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentStatus {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = {
  // 创建支付意图
  createPaymentIntent: async (
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> => {
    const response = await apiClient.post<any>('/payments/create-intent', data);
    return response.data || response;
  },

  // 获取支付状态
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    const response = await apiClient.get<any>(`/payments/${orderId}`);
    return response.data || response;
  },
};

