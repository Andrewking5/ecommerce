import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { inventoryApi, InventoryStats } from '@/services/inventory';
import toast from 'react-hot-toast';
import { Product } from '@/types/product';

const AdminInventory: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState(10);
  const [page, setPage] = useState(1);
  const [adjustingProduct, setAdjustingProduct] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState<number>(0);

  // 获取库存统计
  const { data: stats, isLoading: statsLoading } = useQuery<InventoryStats>({
    queryKey: ['inventory-stats', threshold],
    queryFn: () => inventoryApi.getInventoryStats(threshold),
  });

  // 获取低库存商品
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock-products', threshold, page],
    queryFn: () => inventoryApi.getLowStockProducts(threshold, page, 20),
  });

  // 快速调整库存
  const adjustStockMutation = useMutation({
    mutationFn: ({ productId, adjustment, newStock }: { productId: string; adjustment?: number; newStock?: number }) =>
      inventoryApi.quickAdjustStock(productId, { adjustment, newStock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(t('admin:inventory.stockAdjusted'));
      setAdjustingProduct(null);
      setAdjustment(0);
    },
    onError: (error: any) => {
      toast.error(error.message || t('common:error'));
    },
  });

  const handleAdjustStock = (productId: string, type: 'add' | 'subtract' | 'set') => {
    if (type === 'set' && adjustment <= 0) {
      toast.error(t('admin:inventory.invalidStock'));
      return;
    }

    const data: { adjustment?: number; newStock?: number } = {};
    if (type === 'set') {
      data.newStock = adjustment;
    } else {
      data.adjustment = type === 'add' ? Math.abs(adjustment) : -Math.abs(adjustment);
    }

    adjustStockMutation.mutate({ productId, ...data });
  };

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('admin:inventory.title')}</h1>
        <p className="text-text-secondary mt-2">{t('admin:inventory.description')}</p>
      </div>

      {/* 库存统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{t('admin:inventory.totalProducts')}</p>
                <p className="text-3xl font-bold text-text-primary">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-brand-blue" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{t('admin:inventory.inStock')}</p>
                <p className="text-3xl font-bold text-brand-green">{stats.inStockProducts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-brand-green" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{t('admin:inventory.outOfStock')}</p>
                <p className="text-3xl font-bold text-red-500">{stats.outOfStockProducts}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{t('admin:inventory.lowStock')}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.lowStockProducts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{t('admin:inventory.totalValue')}</p>
                <p className="text-3xl font-bold text-text-primary">{stats.totalStockValue}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* 预警阈值设置 */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">{t('admin:inventory.threshold')}</h2>
            <p className="text-sm text-text-secondary">{t('admin:inventory.thresholdDescription')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24"
            />
            <Button onClick={() => setPage(1)}>{t('common:buttons.apply')}</Button>
          </div>
        </div>
      </Card>

      {/* 低库存商品列表 */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6">{t('admin:inventory.lowStockList')}</h2>

        {lowStockLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : lowStockData && lowStockData.products.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      {t('admin:products.name')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      {t('admin:products.category')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      {t('admin:inventory.currentStock')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                      {t('admin:inventory.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockData.products.map((product: Product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-text-primary">{product.name}</div>
                            <div className="text-sm text-text-secondary">${product.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock <= threshold
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {adjustingProduct === product.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              value={adjustment}
                              onChange={(e) => setAdjustment(Number(e.target.value))}
                              className="w-20"
                              placeholder="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAdjustStock(product.id, 'add')}
                              disabled={adjustStockMutation.isPending}
                            >
                              <Plus size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(product.id, 'subtract')}
                              disabled={adjustStockMutation.isPending}
                            >
                              <Minus size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(product.id, 'set')}
                              disabled={adjustStockMutation.isPending}
                            >
                              {t('common:buttons.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAdjustingProduct(null);
                                setAdjustment(0);
                              }}
                            >
                              {t('common:buttons.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAdjustingProduct(product.id);
                              setAdjustment(product.stock);
                            }}
                          >
                            {t('admin:inventory.adjust')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {lowStockData.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {t('common:buttons.previous')}
                </Button>
                <span className="px-4 text-text-secondary">
                  {t('common:buttons.page')} {page} {t('common:buttons.of')} {lowStockData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === lowStockData.pagination.totalPages}
                >
                  {t('common:buttons.next')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">{t('admin:inventory.noLowStock')}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminInventory;

