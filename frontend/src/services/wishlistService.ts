import api from './api';

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    isActive: boolean;
    category?: {
      name: string;
      slug: string;
    };
  };
}

const wishlistService = {
  async getWishlist(): Promise<{ success: boolean; data: WishlistItem[] }> {
    const { data } = await api.get('/wishlist');
    return data;
  },

  async toggle(productId: string): Promise<{ success: boolean; action: 'added' | 'removed' }> {
    const { data } = await api.post('/wishlist/toggle', { productId });
    return data;
  },

  async remove(productId: string): Promise<{ success: boolean }> {
    const { data } = await api.delete(`/wishlist/${productId}`);
    return data;
  },

  async check(productId: string): Promise<{ success: boolean; inWishlist: boolean }> {
    const { data } = await api.get(`/wishlist/check/${productId}`);
    return data;
  },
};

export default wishlistService;
