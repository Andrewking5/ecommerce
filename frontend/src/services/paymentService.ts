import api from './api';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentStatus {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

const paymentService = {
  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'twd'
  ): Promise<{ success: boolean; data: PaymentIntent }> {
    const { data } = await api.post('/payments/create-intent', {
      orderId,
      amount,
      currency,
    });
    return data;
  },

  async getPaymentStatus(
    orderId: string
  ): Promise<{ success: boolean; data: PaymentStatus }> {
    const { data } = await api.get(`/payments/${orderId}`);
    return data;
  },
};

export default paymentService;
