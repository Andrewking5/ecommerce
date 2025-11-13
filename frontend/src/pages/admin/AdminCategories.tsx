import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumb from '@/components/admin/Breadcrumb';
import SingleImageUpload from '@/components/admin/SingleImageUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Plus, Search, Edit, Trash2, Loader2, X, FolderTree, Package } from 'lucide-react';
import { categoryApi, CategoryWithCount } from '@/services/categories';
import toast from 'react-hot-toast';

const AdminCategories: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: undefined as string | undefined,
    isActive: true,
  });

  // 获取分类列表
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryApi.getCategories(true), // 包含非活跃分类
  });

  // 删除分类
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // 同时更新公开的分类列表
      toast.success('分类删除成功');
      setDeleteConfirm({ isOpen: false, categoryId: null });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || '删除失败');
    },
  });

  // 创建/更新分类
  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingCategory) {
        return categoryApi.updateCategory(editingCategory.id, data);
      }
      return categoryApi.createCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // 同时更新公开的分类列表
      toast.success(editingCategory ? '分类更新成功' : '分类创建成功');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || (editingCategory ? '更新失败' : '创建失败'));
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: undefined,
      isActive: true,
    });
    setEditingCategory(null);
  };

  // 自动生成 slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
      .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name), // 编辑时不自动更新slug
    });
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || undefined,
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('请输入分类标识符');
      return;
    }

    // 验证 slug 格式
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error('分类标识符只能包含小写字母、数字和连字符');
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      image: formData.image || undefined,
      isActive: formData.isActive,
    };

    saveMutation.mutate(submitData);
  };

  const handleCloseModal = () => {
    if (saveMutation.isPending) return;
    setShowModal(false);
    resetForm();
  };

  // 过滤分类
  const filteredCategories = categories?.filter(
    (category) =>
      !search ||
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.slug.toLowerCase().includes(search.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: '仪表板', path: '/admin' },
          { label: '分类管理' },
        ]}
      />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">分类管理</h1>
          <p className="text-text-secondary mt-2 text-sm md:text-base">管理所有商品分类</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 w-full md:w-auto"
        >
          <Plus size={20} />
          <span>添加分类</span>
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
            <Input
              placeholder="搜索分类名称、标识符或描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* 分类列表 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : !filteredCategories || filteredCategories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-12 h-12 text-text-tertiary" />}
            title="暂无分类"
            description={search ? '没有找到匹配的分类，请尝试其他搜索关键词' : '还没有分类，开始添加第一个分类吧'}
            actionLabel={!search ? "添加分类" : undefined}
            onAction={!search ? () => {
              resetForm();
              setShowModal(true);
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    标识符
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    商品数量
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
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-text-primary">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-text-secondary line-clamp-1 max-w-xs">{category.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary font-mono">{category.slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-secondary">
                        <Package size={16} className="mr-1" />
                        {category.productCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.isActive ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-brand-blue hover:text-brand-blue/80 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, categoryId: category.id })}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                          disabled={!!(category.productCount && category.productCount > 0)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            {/* 模态框头部 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-text-primary">
                {editingCategory ? '编辑分类' : '添加分类'}
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
                label="分类名称"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="输入分类名称"
              />

              <Input
                label="分类标识符 (Slug)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                required
                placeholder="category-slug"
                helperText="只能包含小写字母、数字和连字符，用于URL"
              />

              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-text-primary mb-2">
                  分类描述
                </label>
                <textarea
                  id="category-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                  rows={3}
                  placeholder="描述这个分类的特点..."
                  aria-describedby="category-description-helper"
                />
                <p id="category-description-helper" className="mt-1 text-xs text-text-tertiary">
                  可选：提供分类的详细描述
                </p>
              </div>

              <SingleImageUpload
                image={formData.image}
                onChange={(image) => setFormData({ ...formData, image })}
                label="分类图片"
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
                  启用分类
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
                  {editingCategory ? '更新分类' : '创建分类'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除分类"
        message="确定要删除这个分类吗？此操作无法撤销。如果分类下有商品，将无法删除。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.categoryId) {
            deleteMutation.mutate(deleteConfirm.categoryId);
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, categoryId: null })}
      />
    </div>
  );
};

export default AdminCategories;

