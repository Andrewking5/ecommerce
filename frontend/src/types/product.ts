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
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
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


