import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ProductQueryParams } from '@/types/product';
import { Category } from '@/types/product';

interface ProductFiltersProps {
  filters: ProductQueryParams;
  onFiltersChange: (filters: ProductQueryParams) => void;
  categories?: Category[];
  onReset: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories = [],
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof ProductQueryParams, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // 重置到第一页
    });
  };

  const hasActiveFilters = 
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.stockStatus ||
    filters.isActive !== undefined ||
    filters.minStock ||
    filters.maxStock ||
    filters.startDate ||
    filters.endDate;

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* 基础筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">分类</label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 价格范围 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">最低价格</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">最高价格</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="无限制"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {/* 库存状态 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">库存状态</label>
            <select
              value={filters.stockStatus || ''}
              onChange={(e) => updateFilter('stockStatus', e.target.value || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">全部</option>
              <option value="in_stock">有库存</option>
              <option value="out_of_stock">无库存</option>
              <option value="low_stock">低库存</option>
            </select>
          </div>
        </div>

        {/* 高级筛选 */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* 上架状态 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">上架状态</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive === true || filters.isActive === 'true' ? 'true' : 'false'}
                onChange={(e) => updateFilter('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">全部</option>
                <option value="true">已上架</option>
                <option value="false">已下架</option>
              </select>
            </div>

            {/* 库存范围 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">最低库存</label>
              <input
                type="number"
                min="0"
                value={filters.minStock || ''}
                onChange={(e) => updateFilter('minStock', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">最高库存</label>
              <input
                type="number"
                min="0"
                value={filters.maxStock || ''}
                onChange={(e) => updateFilter('maxStock', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="无限制"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* 创建时间范围 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">开始日期</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">结束日期</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>{showAdvanced ? '收起' : '展开'}高级筛选</span>
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <X size={16} />
                <span>清除筛选</span>
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <span className="text-sm text-text-secondary">
              已应用 {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== 1 && v !== 20).length} 个筛选条件
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductFilters;

