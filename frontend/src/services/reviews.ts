import { apiClient } from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export const reviewApi = {
  // 创建评论
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<any>('/reviews', data);
    return response.data || response;
  },

  // 获取商品评论
  getProductReviews: async (
    productId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number,
    sortBy?: string
  ): Promise<ReviewListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (rating) params.append('rating', rating.toString());
    if (sortBy) params.append('sortBy', sortBy);

    const response = await apiClient.get<any>(`/reviews/product/${productId}?${params}`);
    return response.data || response;
  },

  // 更新评论
  updateReview: async (id: string, data: Partial<CreateReviewRequest>): Promise<Review> => {
    const response = await apiClient.put<any>(`/reviews/${id}`, data);
    return response.data || response;
  },

  // 删除评论
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  // 标记评论为有用
  markHelpful: async (id: string): Promise<Review> => {
    const response = await apiClient.post<any>(`/reviews/${id}/helpful`);
    return response.data || response;
  },
};

