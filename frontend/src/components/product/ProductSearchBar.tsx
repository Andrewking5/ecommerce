import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchSuggestions from './SearchSuggestions';

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  value,
  onChange,
  placeholder,
  onClear,
}) => {
  const { t } = useTranslation(['products', 'common']);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // 延迟关闭，允许点击建议
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center bg-white border-2 rounded-2xl transition-all ${
          isFocused
            ? 'border-brand-blue shadow-lg shadow-brand-blue/10'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <Search
          size={20}
          className={`absolute left-4 transition-colors ${
            isFocused ? 'text-brand-blue' : 'text-text-tertiary'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || t('products:search.placeholder', { defaultValue: 'Search products...' })}
          className="w-full pl-12 pr-12 py-4 text-base bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary"
          aria-label={t('products:search.placeholder', { defaultValue: 'Search products' })}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('common:buttons.clear', { defaultValue: 'Clear search' })}
            >
              <X size={18} className="text-text-tertiary" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {showSuggestions && (
        <SearchSuggestions
          query={value}
          onSelect={handleSelect}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default ProductSearchBar;

