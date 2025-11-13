import { ProductVariant } from './variant';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  stock: number;
  specifications?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  // 变体相关字段
  hasVariants?: boolean;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  categoryId?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt' | 'updatedAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'low_stock';
  isActive?: boolean | string;
  minStock?: number;
  maxStock?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


