import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/types/product';

interface ProductFilterSidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  onCategoryChange: (category: string | undefined) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  onClearFilters: () => void;
  productCount?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  categories = [],
  selectedCategory,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
  productCount = 0,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
  });

  // 计算价格范围
  const priceRanges = [
    { label: t('products:filter.priceRanges.under50', { defaultValue: 'Under $50' }), min: 0, max: 50 },
    { label: t('products:filter.priceRanges.50to100', { defaultValue: '$50 - $100' }), min: 50, max: 100 },
    { label: t('products:filter.priceRanges.100to200', { defaultValue: '$100 - $200' }), min: 100, max: 200 },
    { label: t('products:filter.priceRanges.200to500', { defaultValue: '$200 - $500' }), min: 200, max: 500 },
    { label: t('products:filter.priceRanges.over500', { defaultValue: 'Over $500' }), min: 500, max: undefined },
  ];

  const [customMinPrice, setCustomMinPrice] = useState<string>(minPrice?.toString() || '');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>(maxPrice?.toString() || '');

  const hasActiveFilters = selectedCategory || minPrice || maxPrice;

  const toggleSection = (section: 'category' | 'price') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceRangeClick = (rangeMin: number, rangeMax?: number) => {
    onPriceChange(rangeMin, rangeMax);
    setCustomMinPrice(rangeMin.toString());
    setCustomMaxPrice(rangeMax?.toString() || '');
  };

  const handleCustomPriceApply = () => {
    const min = customMinPrice ? Number(customMinPrice) : undefined;
    const max = customMaxPrice ? Number(customMaxPrice) : undefined;
    onPriceChange(min, max);
  };

  return (
    <>
      {/* 移动端遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          </>
        )}
      </AnimatePresence>

      {/* 筛选侧边栏 */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } lg:block fixed lg:sticky top-0 left-0 h-screen lg:h-auto lg:max-h-[calc(100vh-2rem)] overflow-y-auto bg-white z-50 lg:z-auto w-80 lg:w-64 shadow-xl lg:shadow-none border-r border-gray-200 transition-transform duration-300`}
      >
            <div className="p-6 space-y-6">
              {/* 头部 */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal size={20} className="text-brand-blue" />
                  <h2 className="text-lg font-semibold text-text-primary">
                    {t('products:filter.title', { defaultValue: 'Filters' })}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 结果计数 */}
              {productCount > 0 && (
                <div className="text-sm text-text-secondary">
                  {t('products:filter.results', { count: productCount, defaultValue: `{{count}} products found` })}
                </div>
              )}

              {/* 清除筛选按钮 */}
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <X size={16} />
                  <span>{t('common:buttons.clearAll', { defaultValue: 'Clear All' })}</span>
                </button>
              )}

              {/* 分类筛选 */}
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleSection('category')}
                  className="w-full flex items-center justify-between py-2 text-base font-semibold text-text-primary hover:text-brand-blue transition-colors"
                >
                  <span>{t('products:filter.category', { defaultValue: 'Category' })}</span>
                  {expandedSections.category ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 space-y-2 overflow-hidden"
                    >
                      <button
                        onClick={() => onCategoryChange(undefined)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          !selectedCategory
                            ? 'bg-brand-blue text-white font-medium'
                            : 'hover:bg-gray-100 text-text-primary'
                        }`}
                      >
                        {t('common:buttons.viewAll', { defaultValue: 'All Categories' })}
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => onCategoryChange(category.slug)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                            selectedCategory === category.slug
                              ? 'bg-brand-blue text-white font-medium'
                              : 'hover:bg-gray-100 text-text-primary'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 价格筛选 */}
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between py-2 text-base font-semibold text-text-primary hover:text-brand-blue transition-colors"
                >
                  <span>{t('products:filter.price', { defaultValue: 'Price' })}</span>
                  {expandedSections.price ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 space-y-4 overflow-hidden"
                    >
                      {/* 快速价格范围 */}
                      <div className="space-y-2">
                        {priceRanges.map((range, index) => {
                          const isActive = minPrice === range.min && maxPrice === range.max;
                          return (
                            <button
                              key={index}
                              onClick={() => handlePriceRangeClick(range.min, range.max)}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                                isActive
                                  ? 'bg-brand-blue text-white font-medium'
                                  : 'hover:bg-gray-100 text-text-primary'
                              }`}
                            >
                              {range.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* 自定义价格范围 */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          {t('products:filter.customRange', { defaultValue: 'Custom Range' })}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customMinPrice}
                            onChange={(e) => setCustomMinPrice(e.target.value)}
                            placeholder="Min"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                          />
                          <span className="text-text-secondary">-</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customMaxPrice}
                            onChange={(e) => setCustomMaxPrice(e.target.value)}
                            placeholder="Max"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                          />
                        </div>
                        <button
                          onClick={handleCustomPriceApply}
                          className="w-full mt-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors text-sm font-medium"
                        >
                          {t('common:buttons.apply', { defaultValue: 'Apply' })}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
    </>
  );
};

export default ProductFilterSidebar;

