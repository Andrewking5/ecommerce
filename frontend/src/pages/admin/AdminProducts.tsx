import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumb from '@/components/admin/Breadcrumb';
import ImageUpload from '@/components/admin/ImageUpload';
import ProductFilters from '@/components/admin/ProductFilters';
import BulkActions from '@/components/admin/BulkActions';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Plus, Search, Edit, Trash2, Loader2, X, Package, ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { productApi } from '@/services/products';
import { Product, Category, ProductQueryParams } from '@/types/product';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = useState<{ isOpen: boolean; action: string; data?: any }>({
    isOpen: false,
    action: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [] as string[],
    isActive: true,
  });

  // 获取分类（用于筛选）
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.getCategories(),
  });

  // 获取商品列表（使用筛选参数）
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, filters],
    queryFn: () => productApi.getProducts({ 
      ...filters, 
      page, 
      limit: 20, 
      search: search || undefined,
    }),
  });

  // 删除商品
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('商品删除成功');
      setDeleteConfirm({ isOpen: false, productId: null });
      setSelectedIds([]);
    },
    onError: () => {
      toast.error('删除失败');
    },
  });

  // 批量删除
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => productApi.deleteProduct(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`成功删除 ${selectedIds.length} 个商品`);
      setSelectedIds([]);
      setBulkActionModal({ isOpen: false, action: '' });
    },
    onError: () => {
      toast.error('批量删除失败');
    },
  });

  // 批量更新商品
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: any }) => {
      await Promise.all(ids.map(id => productApi.updateProduct(id, data)));
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`成功更新 ${variables.ids.length} 个商品`);
      setSelectedIds([]);
      setBulkActionModal({ isOpen: false, action: '' });
    },
    onError: () => {
      toast.error('批量更新失败');
    },
  });

  // 创建/更新商品
  const saveMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      if (editingProduct) {
        return productApi.updateProduct(editingProduct.id, data);
      }
      return productApi.createProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(editingProduct ? '商品更新成功' : '商品创建成功');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || (editingProduct ? '更新失败' : '创建失败'));
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      isActive: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category?.slug || '',
      stock: product.stock.toString(),
      images: product.images || [],
      isActive: product.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryObj = categories?.find((c: Category) => c.slug === formData.category);
    if (!categoryObj) {
      toast.error('请选择分类');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('请至少上传一张图片');
      return;
    }

    saveMutation.mutate({
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      categoryId: categoryObj.id,
      stock: Number(formData.stock),
      images: formData.images,
      isActive: formData.isActive,
    });
  };

  const handleCloseModal = () => {
    if (saveMutation.isPending) return;
    setShowModal(false);
    resetForm();
  };

  const handleFiltersChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  const handleSortChange = (sortBy: ProductQueryParams['sortBy']) => {
    const currentSort = filters.sortBy === sortBy ? filters.sortOrder : 'desc';
    const newOrder = currentSort === 'desc' ? 'asc' : 'desc';
    setFilters({
      ...filters,
      sortBy,
      sortOrder: newOrder,
    });
  };

  const handleSelectProduct = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, productId]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(data?.products.map(p => p.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkUpdate = (action: string, data?: any) => {
    if (selectedIds.length === 0) {
      toast.error('请先选择商品');
      return;
    }

    switch (action) {
      case 'delete':
        setBulkActionModal({ isOpen: true, action: 'delete' });
        break;
      case 'activate':
        bulkUpdateMutation.mutate({ ids: selectedIds, data: { isActive: true } });
        break;
      case 'deactivate':
        bulkUpdateMutation.mutate({ ids: selectedIds, data: { isActive: false } });
        break;
      case 'changeCategory':
      case 'changePrice':
      case 'changeStock':
        setBulkActionModal({ isOpen: true, action, data });
        break;
      default:
        toast.error('未知操作');
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: '仪表板', path: '/admin' },
          { label: '商品管理' },
        ]}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">商品管理</h1>
          <p className="text-text-secondary mt-2">管理所有商品信息</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>添加商品</span>
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
            <Input
              placeholder="搜索商品名称、描述或ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* 筛选组件 */}
      <ProductFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* 批量操作 */}
      <BulkActions
        selectedIds={selectedIds}
        products={data?.products || []}
        onSelectAll={handleSelectAll}
        onBulkUpdate={handleBulkUpdate}
        totalCount={data?.pagination.total || 0}
      />

      {/* 商品列表 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : !data?.products || data.products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12 text-text-tertiary" />}
            title="暂无商品"
            description={search ? '没有找到匹配的商品，请尝试其他搜索关键词' : '还没有商品，开始添加第一个商品吧'}
            actionLabel={!search ? "添加商品" : undefined}
            onAction={!search ? () => {
              resetForm();
              setShowModal(true);
            } : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-12">
                      <button
                        onClick={() => handleSelectAll(selectedIds.length !== (data?.products.length || 0))}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="全选"
                      >
                        {selectedIds.length === (data?.products.length || 0) && (data?.products.length || 0) > 0 ? (
                          <CheckSquare size={18} className="text-brand-blue" />
                        ) : (
                          <Square size={18} className="text-text-tertiary" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      商品
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange('price')}
                        className="flex items-center space-x-1 hover:text-text-primary transition-colors"
                      >
                        <span>价格</span>
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange('stock')}
                        className="flex items-center space-x-1 hover:text-text-primary transition-colors"
                      >
                        <span>库存</span>
                        <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.products.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectProduct(product.id, !isSelected)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-brand-blue" />
                          ) : (
                            <Square size={18} className="text-text-tertiary" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-text-primary">{product.name}</div>
                            <div className="text-sm text-text-secondary line-clamp-1 max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-secondary">{product.category?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-text-primary">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isActive ? '上架' : '下架'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-brand-blue hover:text-brand-blue/80 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, productId: product.id })}
                            className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data && data.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  显示 {((page - 1) * 20) + 1} - {Math.min(page * 20, data.pagination.total)} 条，共 {data.pagination.total} 条
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4 text-sm text-text-secondary">
                    第 {page} / {data.pagination.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 创建/编辑模态框 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            {/* 模态框头部 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-text-primary">
                {editingProduct ? '编辑商品' : '添加商品'}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={saveMutation.isPending}
                className="text-text-secondary hover:text-text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* 模态框内容 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <Input
                label="商品名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="输入商品名称"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">商品描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                  rows={4}
                  required
                  placeholder="详细描述商品的特点、功能等"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="价格"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                />
                <Input
                  label="库存"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  <option value="">选择分类</option>
                  {categories?.map((cat: Category) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <ImageUpload
                images={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxImages={10}
                label="商品图片"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <label htmlFor="isActive" className="text-sm text-text-secondary">
                  立即上架商品
                </label>
              </div>

              {/* 模态框底部 */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={saveMutation.isPending}
                >
                  取消
                </Button>
                <Button type="submit" loading={saveMutation.isPending}>
                  {editingProduct ? '更新商品' : '创建商品'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除商品"
        message="确定要删除这个商品吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.productId) {
            deleteMutation.mutate(deleteConfirm.productId);
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: null })}
      />

      {/* 批量删除确认对话框 */}
      <ConfirmDialog
        isOpen={bulkActionModal.isOpen && bulkActionModal.action === 'delete'}
        title="批量删除商品"
        message={`确定要删除选中的 ${selectedIds.length} 个商品吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          bulkDeleteMutation.mutate(selectedIds);
        }}
        onCancel={() => setBulkActionModal({ isOpen: false, action: '' })}
      />
    </div>
  );
};

export default AdminProducts;
