import api from './api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock: number;
  categoryId?: string;
  category?: { id: string; name: string; slug: string; image?: string };
  isActive: boolean;
  createdAt: string;
  variants?: ProductVariant[];
  specifications?: Record<string, string | number>;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price?: number;
  stock: number;
  attributes: Array<{ name: string; value: string }>;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProductParams {
  page?: number;
  limit?: number;
  category?: string;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productCount?: number;
}

const productService = {
  // ── Public ──
  async getProducts(params?: ProductParams): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>('/products', { params });
    return data;
  },

  async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async searchProducts(query: string, page = 1, limit = 20): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>('/products/search', {
      params: { q: query, page, limit },
    });
    return data;
  },

  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    const { data } = await api.get('/products/categories');
    return data;
  },

  // ── Admin: Products ──
  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    const { data } = await api.post('/products', product);
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    const { data } = await api.put(`/products/${id}`, updates);
    return data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  async createProductsBulk(products: Record<string, unknown>[]): Promise<{
    success: boolean;
    data: {
      success: Product[];
      failed: Array<{ index: number; data: any; error: string }>;
      summary: { total: number; success: number; failed: number };
    };
  }> {
    const { data } = await api.post('/products/bulk', { products });
    return data;
  },

  async getTrash(params?: { page?: number; limit?: number; search?: string }): Promise<ProductsResponse> {
    const { data } = await api.get('/products/admin/trash', { params });
    return data;
  },

  async restoreProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const { data } = await api.post(`/products/${id}/restore`);
    return data;
  },

  async permanentDelete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/products/${id}/permanent`);
    return data;
  },

  // ── Admin: Categories ──
  async createCategory(cat: Partial<Category>): Promise<{ success: boolean; data: Category }> {
    const { data } = await api.post('/categories', cat);
    return data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<{ success: boolean; data: Category }> {
    const { data } = await api.put(`/categories/${id}`, updates);
    return data;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  // ── Admin: Inventory ──
  async getLowStock(threshold = 10, page = 1, limit = 20) {
    const { data } = await api.get('/admin/inventory/low-stock', { params: { threshold, page, limit } });
    return data;
  },

  async getInventoryStats() {
    const { data } = await api.get('/admin/inventory/stats');
    return data;
  },

  async adjustStock(id: string, adjustment: number) {
    const { data } = await api.put(`/admin/inventory/${id}/adjust`, { adjustment });
    return data;
  },

  async bulkUpdateStock(updates: Array<{ productId: string; stock: number }>) {
    const { data } = await api.post('/admin/inventory/bulk-update', { updates });
    return data;
  },

  async getRecommendations(productId: string, limit = 6): Promise<{ success: boolean; data: Product[] }> {
    const { data } = await api.get(`/products/${productId}/recommendations`, { params: { limit } });
    return data;
  },
};

export default productService;
