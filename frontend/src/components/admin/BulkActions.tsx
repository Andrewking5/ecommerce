import React, { useState } from 'react';
import { CheckSquare, Square, MoreVertical, Trash2, Package, Tag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Product } from '@/types/product';

interface BulkActionsProps {
  selectedIds: string[];
  products: Product[];
  onSelectAll: (selected: boolean) => void;
  onBulkUpdate: (action: string, data?: any) => void;
  totalCount: number;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  products,
  onSelectAll,
  onBulkUpdate,
  totalCount,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const allSelected = selectedIds.length === products.length && products.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handleBulkAction = (action: string, data?: any) => {
    onBulkUpdate(action, data);
    setShowMenu(false);
  };

  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={handleSelectAll}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="全选"
        >
          {allSelected ? (
            <CheckSquare size={20} className="text-brand-blue" />
          ) : (
            <Square size={20} className="text-text-tertiary" />
          )}
        </button>
        <span className="text-sm text-text-secondary">
          已选择 {selectedIds.length} / {totalCount} 个商品
        </span>
      </div>
    );
  }

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title={allSelected ? '取消全选' : '全选'}
          >
            {allSelected ? (
              <CheckSquare size={20} className="text-brand-blue" />
            ) : someSelected ? (
              <div className="w-5 h-5 border-2 border-brand-blue rounded bg-white flex items-center justify-center">
                <div className="w-3 h-3 bg-brand-blue rounded-sm" />
              </div>
            ) : (
              <Square size={20} className="text-text-tertiary" />
            )}
          </button>
          <span className="text-sm font-medium text-text-primary">
            已选择 <span className="text-brand-blue font-semibold">{selectedIds.length}</span> 个商品
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 批量操作按钮 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2"
            >
              <MoreVertical size={16} />
              <span>批量操作</span>
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20 py-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <TrendingUp size={16} />
                    <span>批量上架</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <TrendingDown size={16} />
                    <span>批量下架</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('changeCategory')}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Tag size={16} />
                    <span>批量修改分类</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('changePrice')}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <DollarSign size={16} />
                    <span>批量修改价格</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('changeStock')}
                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Package size={16} />
                    <span>批量修改库存</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>批量删除</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(false)}
            className="text-text-secondary"
          >
            取消选择
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BulkActions;

