import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp } from 'lucide-react';
import { productApi } from '@/services/products';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
  onClose: () => void;
  maxSuggestions?: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelect,
  onClose,
  maxSuggestions = 5,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 从localStorage加载最近搜索
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        // 忽略解析错误
      }
    }
  }, []);

  // 搜索建议（当有输入时）
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => productApi.searchProducts(query),
    enabled: query.length >= 2,
    staleTime: 30000, // 30秒内不重新请求
  });

  const handleSelect = (selectedQuery: string) => {
    // 保存到最近搜索
    const updated = [
      selectedQuery,
      ...recentSearches.filter(s => s !== selectedQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    onSelect(selectedQuery);
    onClose();
  };

  const productSuggestions = (suggestions || []).slice(0, maxSuggestions);
  const showRecentSearches = !query && recentSearches.length > 0;
  const showProductSuggestions = query.length >= 2 && productSuggestions.length > 0;

  if (!showRecentSearches && !showProductSuggestions) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
      >
        {showRecentSearches && (
          <div className="p-2">
            <div className="flex items-center px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
              <TrendingUp size={14} className="mr-2" />
              {t('products:search.recent', { defaultValue: 'Recent Searches' })}
            </div>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSelect(search)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
              >
                <Search size={16} className="mr-2 text-text-tertiary" />
                <span className="text-sm text-text-primary">{search}</span>
              </button>
            ))}
          </div>
        )}

        {showProductSuggestions && (
          <div className="p-2">
            <div className="flex items-center px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
              <Search size={14} className="mr-2" />
              {t('products:search.suggestions', { defaultValue: 'Suggestions' })}
            </div>
            {productSuggestions.map((product: any) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product.name)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="text-sm font-medium text-text-primary">{product.name}</div>
                {product.category && (
                  <div className="text-xs text-text-tertiary mt-1">
                    {product.category.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchSuggestions;

