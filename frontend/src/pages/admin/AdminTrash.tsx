import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumb from '@/components/admin/Breadcrumb';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import DeleteProgressOverlay from '@/components/admin/DeleteProgressOverlay';
import { Search, RotateCcw, Trash2, Loader2, Package, Calendar, Tag, CheckSquare, Square } from 'lucide-react';
import { productApi } from '@/services/products';
import { Product } from '@/types/product';
import { getImageUrl } from '@/utils/imageUrl';
import toast from 'react-hot-toast';

const AdminTrash: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [restoreConfirm, setRestoreConfirm] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
    isOpen: false,
    productId: null,
    productName: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = useState<{ isOpen: boolean; action: 'restore' | 'delete' | '' }>({
    isOpen: false,
    action: '',
  });
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  // 获取已删除的商品列表（带重试逻辑）
  const { data, isLoading } = useQuery({
    queryKey: ['admin-trash', page, search],
    queryFn: async () => {
      let retries = 3;
      let lastError: any;
      
      while (retries > 0) {
        try {
          return await productApi.getDeletedProducts({
            page,
            limit: 20,
            search: search || undefined,
          });
        } catch (error: any) {
          lastError = error;
          // 如果是 429 错误，等待后重试
          if (error?.response?.status === 429 && retries > 1) {
            const delay = (4 - retries) * 1000; // 递增延迟：1s, 2s, 3s
            await new Promise(resolve => setTimeout(resolve, delay));
            retries--;
          } else {
            throw error;
          }
        }
      }
      
      throw lastError;
    },
    retry: false, // 禁用默认重试，使用自定义重试逻辑
  });

  // 恢复商品
  const restoreMutation = useMutation({
    mutationFn: (id: string) => productApi.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trash'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('商品已恢复');
      setRestoreConfirm({ isOpen: false, productId: null, productName: '' });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || '恢复商品失败');
    },
  });

  // 永久删除商品
  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => productApi.permanentlyDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trash'] });
      toast.success('商品已永久删除');
      setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
      setDeleteProgress(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || '永久删除商品失败');
      setDeleteProgress(null);
    },
  });

  // 批量恢复商品（串行处理，避免触发速率限制）
  const bulkRestoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results: { success: string[]; failed: Array<{ id: string; error: string }> } = {
        success: [],
        failed: [],
      };

      // 串行处理，每个请求之间延迟 200ms，避免触发速率限制
      for (let i = 0; i < ids.length; i++) {
        try {
          await productApi.restoreProduct(ids[i]);
          results.success.push(ids[i]);
          
          // 除了最后一个请求，其他请求之间添加延迟
          if (i < ids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || '恢复失败';
          results.failed.push({ id: ids[i], error: errorMessage });
          
          // 如果是速率限制错误，增加延迟
          if (error?.response?.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // 如果有失败的请求，抛出错误
      if (results.failed.length > 0) {
        throw new Error(`部分恢复失败：${results.failed.length} 个商品恢复失败`);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['admin-trash'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`已成功恢复 ${results.success.length} 个商品`);
      setSelectedIds([]);
      setBulkActionModal({ isOpen: false, action: '' });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '批量恢复商品失败';
      toast.error(errorMessage);
    },
  });

  // 批量永久删除商品（串行处理，避免触发速率限制）
  const bulkPermanentDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results: { success: string[]; failed: Array<{ id: string; error: string }> } = {
        success: [],
        failed: [],
      };

      // 初始化进度
      setDeleteProgress({ current: 0, total: ids.length });

      // 串行处理，每个请求之间延迟 200ms，避免触发速率限制
      for (let i = 0; i < ids.length; i++) {
        try {
          await productApi.permanentlyDeleteProduct(ids[i]);
          results.success.push(ids[i]);
          
          // 更新进度
          setDeleteProgress({ current: i + 1, total: ids.length });
          
          // 除了最后一个请求，其他请求之间添加延迟
          if (i < ids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || '删除失败';
          results.failed.push({ id: ids[i], error: errorMessage });
          
          // 更新进度（即使失败也计入）
          setDeleteProgress({ current: i + 1, total: ids.length });
          
          // 如果是速率限制错误，增加延迟
          if (error?.response?.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // 如果有失败的请求，抛出错误
      if (results.failed.length > 0) {
        throw new Error(`部分删除失败：${results.failed.length} 个商品删除失败`);
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['admin-trash'] });
      toast.success(`已成功永久删除 ${results.success.length} 个商品`);
      setSelectedIds([]);
      setBulkActionModal({ isOpen: false, action: '' });
      setDeleteProgress(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || '批量永久删除商品失败';
      toast.error(errorMessage);
      setDeleteProgress(null);
    },
  });

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  const handleRestore = (product: Product) => {
    setRestoreConfirm({
      isOpen: true,
      productId: product.id,
      productName: product.name,
    });
  };

  const handlePermanentDelete = (product: Product) => {
    setDeleteConfirm({
      isOpen: true,
      productId: product.id,
      productName: product.name,
    });
  };

  const confirmRestore = () => {
    if (restoreConfirm.productId) {
      restoreMutation.mutate(restoreConfirm.productId);
    }
  };

  const confirmPermanentDelete = () => {
    if (deleteConfirm.productId) {
      setDeleteProgress({ current: 0, total: 1 });
      permanentDeleteMutation.mutate(deleteConfirm.productId);
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  // 切换单个选择
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkRestore = () => {
    if (selectedIds.length === 0) {
      toast.error('请先选择要恢复的商品');
      return;
    }
    setBulkActionModal({ isOpen: true, action: 'restore' });
  };

  const handleBulkPermanentDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('请先选择要永久删除的商品');
      return;
    }
    setBulkActionModal({ isOpen: true, action: 'delete' });
  };

  const confirmBulkRestore = () => {
    bulkRestoreMutation.mutate(selectedIds);
  };

  const confirmBulkPermanentDelete = () => {
    bulkPermanentDeleteMutation.mutate(selectedIds);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t('menu.dashboard'), path: '/admin' },
          { label: '垃圾桶', path: '/admin/trash' },
        ]}
      />

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">垃圾桶</h1>
        </div>
        <p className="text-gray-600">管理已删除的商品，可以恢复或永久删除</p>
      </div>

      {/* 搜索栏和批量操作 */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="搜索已删除的商品..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* 批量操作栏 */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">已选择 {selectedIds.length} 个商品</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkRestore}
                  disabled={bulkRestoreMutation.isPending || bulkPermanentDeleteMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  批量恢复
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkPermanentDelete}
                  disabled={bulkRestoreMutation.isPending || bulkPermanentDeleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  批量永久删除
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  取消选择
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 商品列表 */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Trash2 className="w-12 h-12 text-text-tertiary" />}
            title="垃圾桶是空的"
            description={search ? '没有找到匹配的商品' : '还没有删除任何商品'}
          />
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center justify-center"
                        title={selectedIds.length === products.length ? '取消全选' : '全选'}
                      >
                        {selectedIds.length === products.length && products.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">商品</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">分类</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">价格</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">库存</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">删除时间</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr 
                      key={product.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.includes(product.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSelect(product.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.includes(product.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {product.category ? (
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{product.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {product.updatedAt
                              ? new Date(product.updatedAt).toLocaleDateString('zh-TW', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(product)}
                            disabled={restoreMutation.isPending || permanentDeleteMutation.isPending || bulkRestoreMutation.isPending || bulkPermanentDeleteMutation.isPending}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            恢复
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handlePermanentDelete(product)}
                            disabled={restoreMutation.isPending || permanentDeleteMutation.isPending || bulkRestoreMutation.isPending || bulkPermanentDeleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            永久删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* 恢复确认对话框 */}
      <ConfirmDialog
        isOpen={restoreConfirm.isOpen}
        onClose={() => setRestoreConfirm({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmRestore}
        title="恢复商品"
        message={`确定要恢复商品 "${restoreConfirm.productName}" 吗？恢复后商品将重新出现在商品列表中。`}
        confirmText="恢复"
        cancelText="取消"
        variant="default"
        isLoading={restoreMutation.isPending}
      />

      {/* 永久删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null, productName: '' })}
        onConfirm={confirmPermanentDelete}
        title="永久删除商品"
        message={`确定要永久删除商品 "${deleteConfirm.productName}" 吗？此操作无法撤销，商品及其所有关联数据将被永久删除。`}
        confirmText="永久删除"
        cancelText="取消"
        variant="danger"
        isLoading={permanentDeleteMutation.isPending}
      />

      {/* 批量恢复确认对话框 */}
      <ConfirmDialog
        isOpen={bulkActionModal.isOpen && bulkActionModal.action === 'restore'}
        onClose={() => setBulkActionModal({ isOpen: false, action: '' })}
        onConfirm={confirmBulkRestore}
        title="批量恢复商品"
        message={`确定要恢复选中的 ${selectedIds.length} 个商品吗？恢复后这些商品将重新出现在商品列表中。`}
        confirmText="批量恢复"
        cancelText="取消"
        variant="default"
        isLoading={bulkRestoreMutation.isPending}
      />

      {/* 批量永久删除确认对话框 */}
      <ConfirmDialog
        isOpen={bulkActionModal.isOpen && bulkActionModal.action === 'delete'}
        onClose={() => setBulkActionModal({ isOpen: false, action: '' })}
        onConfirm={confirmBulkPermanentDelete}
        title="批量永久删除商品"
        message={`确定要永久删除选中的 ${selectedIds.length} 个商品吗？此操作无法撤销，这些商品及其所有关联数据将被永久删除。`}
        confirmText="批量永久删除"
        cancelText="取消"
        variant="danger"
        isLoading={bulkPermanentDeleteMutation.isPending}
      />

      {/* 删除进度覆盖层 */}
      <DeleteProgressOverlay
        isVisible={
          permanentDeleteMutation.isPending || bulkPermanentDeleteMutation.isPending
        }
        current={deleteProgress?.current}
        total={deleteProgress?.total}
        message={
          deleteProgress?.total && deleteProgress.total > 1
            ? `正在删除 ${deleteProgress.current}/${deleteProgress.total} 个商品...`
            : '正在永久删除商品，请稍候...'
        }
      />
    </div>
  );
};

export default AdminTrash;

