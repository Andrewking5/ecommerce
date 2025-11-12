import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Star, Eye, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation(['products', 'common']);
  const { addItem } = useCartStore();
  const [imageError, setImageError] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const mainImage = product.images && product.images.length > 0 
    ? (product.images[hoveredImage] || product.images[0])
    : null;

  return (
    <Link to={`/products/${product.id}`}>
      <Card hover className="overflow-hidden group h-full flex flex-col">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 group">
          {mainImage && !imageError ? (
            <>
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
                onMouseEnter={() => {
                  if (product.images && product.images.length > 1) {
                    setHoveredImage(1);
                  }
                }}
                onMouseLeave={() => setHoveredImage(0)}
              />
              
              {/* 多图指示器 */}
              {product.images && product.images.length > 1 && (
                <div className="absolute top-4 left-4 flex space-x-1">
                  {product.images.slice(0, 3).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === hoveredImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                  {product.images.length > 3 && (
                    <span className="text-xs text-white bg-black/30 px-1.5 py-0.5 rounded">
                      +{product.images.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* 评分标签 */}
              {product.averageRating && product.averageRating > 0 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1 shadow-sm">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">
                    {product.averageRating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* 库存状态 */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                    {t('products:detail.outOfStock')}
                  </span>
                </div>
              )}

              {/* 快速查看按钮 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Eye size={16} className="mr-1" />
                  {t('common:buttons.viewAll', { defaultValue: 'Quick View' })}
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <Package size={48} className="text-text-tertiary mb-2" />
              <span className="text-sm text-text-tertiary">No Image</span>
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="p-6 flex-1 flex flex-col">
          {/* 分类标签 */}
          {product.category && (
            <span className="text-xs text-brand-blue font-medium mb-2 inline-block">
              {product.category.name}
            </span>
          )}

          <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-text-primary group-hover:text-brand-blue transition-colors">
            {product.name}
          </h3>
          
          <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
            {product.stock > 0 && (
              <span className="text-xs text-text-tertiary bg-green-50 text-green-700 px-2 py-1 rounded">
                {t('products:detail.stock')}
              </span>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="w-full"
            disabled={product.stock === 0}
            size="sm"
          >
            <ShoppingCart size={16} className="mr-2" />
            {product.stock === 0 ? t('products:detail.outOfStock') : t('products:detail.addToCart')}
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;

