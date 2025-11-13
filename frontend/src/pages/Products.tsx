import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productApi } from '@/services/products';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/common/ProductCardSkeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductFilterSidebar from '@/components/product/ProductFilterSidebar';
import ProductSearchBar from '@/components/product/ProductSearchBar';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductQueryParams } from '@/types/product';

const Products: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // 桌面端默认显示筛选栏，移动端需要点击按钮
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
    queryKey: ['products', page, category, sortBy, sortOrder, minPrice, maxPrice, searchQuery],
    queryFn: () => productApi.getProducts({ 
      page, 
      limit: 12,
      category,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      search: searchQuery || undefined,
    }),
  });

  // 当筛选条件改变时重置到第一页
  useEffect(() => {
    setPage(1);
  }, [category, sortBy, sortOrder, minPrice, maxPrice, searchQuery]);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchQuery || undefined);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);


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

  const handleCategoryChange = (cat: string | undefined) => {
    handleFilterChange('category', cat);
  };

  const handlePriceChange = (min: number | undefined, max: number | undefined) => {
    handleFilterChange('minPrice', min);
    handleFilterChange('maxPrice', max);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const hasActiveFilters = category || minPrice || maxPrice || searchQuery || sortBy !== 'createdAt' || sortOrder !== 'desc';

  // 计算产品总数
  const productCount = useMemo(() => {
    return data?.pagination?.total || 0;
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-50" aria-label={t('products:title', { defaultValue: 'Products' })}>
      {/* 顶部搜索栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30" role="banner">
        <div className="container-apple py-6">
          <ProductSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('products:search.placeholder', { defaultValue: 'Search products by name, description...' })}
            onClear={clearFilters}
          />
        </div>
      </header>

      <div className="container-apple py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧筛选栏 - 桌面端始终显示，移动端通过按钮控制 */}
          <div className="lg:w-64 flex-shrink-0">
            <ProductFilterSidebar
              categories={categories}
              selectedCategory={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onClearFilters={clearFilters}
              productCount={productCount}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
            />
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 工具栏 */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* 左侧：筛选按钮和结果计数 */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2"
                >
                  <Filter size={16} />
                  <span>{t('products:filter.title', { defaultValue: 'Filters' })}</span>
                  {hasActiveFilters && (
                    <span className="ml-1 px-2 py-0.5 bg-brand-blue text-white text-xs rounded-full">
                      {[category, minPrice, maxPrice, searchQuery].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                
                <div className="text-sm text-text-secondary">
                  {productCount > 0 ? (
                    <span>
                      {t('products:filter.showing', { 
                        count: productCount, 
                        defaultValue: `Showing ${productCount} products` 
                      })}
                    </span>
                  ) : (
                    <span>{t('products:filter.noResults', { defaultValue: 'No products found' })}</span>
                  )}
                </div>
              </div>

              {/* 右侧：排序 */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary hidden sm:block">
                  {t('products:filter.sortBy', { defaultValue: 'Sort by' })}:
                </span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', newSortBy);
                    handleFilterChange('sortOrder', newSortOrder);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white text-sm font-medium text-text-primary"
                >
                  <option value="createdAt-desc">{t('products:filter.sortOptions.newest', { defaultValue: 'Newest' })}</option>
                  <option value="createdAt-asc">{t('products:filter.sortOptions.oldest', { defaultValue: 'Oldest' })}</option>
                  <option value="price-asc">{t('products:filter.sortOptions.priceLow', { defaultValue: 'Price: Low to High' })}</option>
                  <option value="price-desc">{t('products:filter.sortOptions.priceHigh', { defaultValue: 'Price: High to Low' })}</option>
                  <option value="name-asc">{t('products:filter.sortOptions.nameAZ', { defaultValue: 'Name: A-Z' })}</option>
                  <option value="name-desc">{t('products:filter.sortOptions.nameZA', { defaultValue: 'Name: Z-A' })}</option>
                </select>
              </div>
            </div>

            {/* 商品列表 */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <ErrorMessage
                title={t('common:error', { defaultValue: 'Error' })}
                message={t('common:error', { defaultValue: 'Failed to load products. Please try again later.' })}
                onRetry={() => window.location.reload()}
              />
            ) : products.length === 0 ? (
              <EmptyState
                icon="search"
                title={t('products:filter.noResults', { defaultValue: 'No products found' })}
                description={t('products:filter.tryDifferentFilters', { defaultValue: 'Try adjusting your filters or search terms' })}
                action={hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline">
                    {t('common:buttons.clearAll', { defaultValue: 'Clear All Filters' })}
                  </Button>
                ) : undefined}
              />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                    <div className="text-sm text-text-secondary">
                      {t('products:filter.pageInfo', {
                        current: page,
                        total: pagination.totalPages,
                        defaultValue: `Page ${page} of ${pagination.totalPages}`
                      })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft size={16} />
                        <span>{t('common:buttons.previous', { defaultValue: 'Previous' })}</span>
                      </Button>
                      
                      {/* 页码按钮 */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                page === pageNum
                                  ? 'bg-brand-blue text-white'
                                  : 'bg-white text-text-primary hover:bg-gray-100 border border-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="flex items-center space-x-2"
                      >
                        <span>{t('common:buttons.next', { defaultValue: 'Next' })}</span>
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Products;


