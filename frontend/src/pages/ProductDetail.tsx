import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services/products';
import { useCartStore } from '@/store/cartStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus, Heart, Loader2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id!),
    enabled: !!id,
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

  if (error || !product) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">Product Not Found</h2>
          <p className="text-text-secondary mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-apple py-12">
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <ProductImageGallery 
          images={product.images || []} 
          productName={product.name} 
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="heading-1 mb-4">{product.name}</h1>
            <p className="text-lg text-text-secondary mb-6">{product.description}</p>
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-text-primary">
                ${product.price}
              </span>
              {product.averageRating && (
                <div className="flex items-center space-x-1">
                  <Star size={20} className="text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span className="text-text-tertiary">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-tertiary">Availability:</span>
            <span className={`text-sm font-medium ${
              product.stock > 0 ? 'text-brand-green' : 'text-red-500'
            }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-text-secondary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-text-primary">Quantity:</span>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-text-tertiary">
                Max: {product.stock}
              </span>
            </div>
          )}

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addItem(product);
                  }
                }}
                disabled={product.stock === 0}
                size="lg"
                className="flex-1"
              >
                <ShoppingCart size={20} className="mr-2" />
                {product.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`${isFavorite ? 'text-red-500 border-red-500' : ''}`}
              >
                <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="heading-2 mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-text-secondary">{review.comment}</p>
                    )}
                    <span className="text-sm text-text-tertiary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {product.category && (
        <RelatedProducts 
          categoryId={product.categoryId} 
          excludeProductId={product.id} 
        />
      )}
    </div>
  );
};

// 相关商品组件
const RelatedProducts: React.FC<{ categoryId: string; excludeProductId: string }> = ({ 
  categoryId, 
  excludeProductId 
}) => {
  const { data: relatedProducts, isLoading } = useQuery({
    queryKey: ['related-products', categoryId],
    queryFn: () => productApi.getProducts({ 
      page: 1, 
      limit: 4, 
      categoryId,
    }),
  });

  const products = relatedProducts?.products?.filter(p => p.id !== excludeProductId).slice(0, 4) || [];

  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="heading-2 mb-8">Related Products</h2>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;


