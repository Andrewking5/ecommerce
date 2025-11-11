import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/products';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const Products: React.FC = () => {
  const [page, setPage] = useState(1);
  const { addItem } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page],
    queryFn: () => productApi.getProducts({ page, limit: 12 }),
  });

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

  return (
    <div className="container-apple py-12">
      <div className="text-center mb-12">
        <h1 className="heading-1 mb-4">Our Products</h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Discover our curated collection of premium products designed for the modern lifestyle.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="heading-2 mb-4">No Products Found</h2>
          <p className="text-text-secondary">Check back later for new arrivals.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
              <Card key={product.id} hover className="overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  {product.averageRating && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {product.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-text-primary">
                        ${product.price}
                      </span>
                    </div>
                    <span className="text-sm text-text-tertiary">
                      {product.stock} in stock
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => addItem(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </Card>
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


