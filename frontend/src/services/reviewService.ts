import api from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string };
  product?: { id: string; name: string; images: string[] };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  averageRating: number;
}

const reviewService = {
  // ── Public ──
  async createReview(body: { productId: string; rating: number; comment: string }): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.post('/reviews', body);
    return data;
  },

  async getProductReviews(
    productId: string,
    params?: { page?: number; limit?: number; sort?: string },
  ): Promise<ReviewsResponse> {
    const { data } = await api.get<ReviewsResponse>(`/reviews/product/${productId}`, { params });
    return data;
  },

  async updateReview(id: string, body: { rating?: number; comment?: string }): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.put(`/reviews/${id}`, body);
    return data;
  },

  async deleteReview(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/reviews/${id}`);
    return data;
  },

  async markHelpful(id: string): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.post(`/reviews/${id}/helpful`);
    return data;
  },

  // ── Admin ──
  async getAdminReviews(params?: { page?: number; limit?: number; status?: string; sort?: string }): Promise<ReviewsResponse> {
    const { data } = await api.get<ReviewsResponse>('/reviews/admin/reviews', { params });
    return data;
  },

  async getAdminReview(id: string): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.get(`/reviews/admin/reviews/${id}`);
    return data;
  },

  async approveReview(id: string): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.put(`/reviews/admin/reviews/${id}/approve`);
    return data;
  },

  async rejectReview(id: string): Promise<{ success: boolean; data: Review }> {
    const { data } = await api.put(`/reviews/admin/reviews/${id}/reject`);
    return data;
  },

  async bulkApprove(reviewIds: string[]): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/reviews/admin/reviews/bulk-approve', { reviewIds });
    return data;
  },

  async getReviewStats(): Promise<{ success: boolean; data: ReviewStats }> {
    const { data } = await api.get('/reviews/admin/reviews/stats');
    return data;
  },
};

export default reviewService;
