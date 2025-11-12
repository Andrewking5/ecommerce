import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '@/services/products';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import { Filter, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { ProductQueryParams } from '@/types/product';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // 从URL参数获取筛选条件
  const category = searchParams.get('category') || undefined;
  const sortBy = (searchParams.get('sortBy') as ProductQueryParams['sortBy']) || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

  // 获取分类列表
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  // 获取商品列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, category, sortBy, sortOrder, minPrice, maxPrice],
    queryFn: () => productApi.getProducts({ 
      page, 
      limit: 12,
      category,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
    }),
  });

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setPage(1);
  }, [category, sortBy, sortOrder, minPrice, maxPrice]);

  if (isLoading) {
    return (
      <div className="container-apple py-12">
        <div className="flex justify-center items-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">Error Loading Products</h2>
          <p className="text-text-secondary">Please try again later.</p>
        </div>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || minPrice || maxPrice || sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <div className="container-apple py-12">
      <div className="text-center mb-12">
        <h1 className="heading-1 mb-4">Our Products</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Discover our curated collection of premium products designed for the modern lifestyle.
        </p>
      </div>

      {/* 筛选和排序栏 */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filters</span>
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <X size={16} />
              <span>Clear Filters</span>
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', newSortBy);
              handleFilterChange('sortOrder', newSortOrder);
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 分类筛选 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
              <select
                value={category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 价格范围 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Min Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Max Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="No limit"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </Card>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="heading-2 mb-4">No Products Found</h2>
          <p className="text-text-secondary">Check back later for new arrivals.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 text-text-secondary">
                Page {page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;


