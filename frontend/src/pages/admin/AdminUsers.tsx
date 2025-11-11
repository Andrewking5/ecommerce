import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Breadcrumb from '@/components/admin/Breadcrumb';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Search, Edit, Trash2, Loader2, X, Users } from 'lucide-react';
import { userApi } from '@/services/users';
import { User } from '@/types/auth';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'USER' as 'USER' | 'ADMIN',
    isActive: true,
  });

  // 获取用户列表
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () => userApi.getAllUsers(page, 20, roleFilter || undefined),
  });

  // 更新用户
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('用户更新成功');
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      toast.error('更新失败');
    },
  });

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('用户删除成功');
      setDeleteConfirm({ isOpen: false, userId: null });
    },
    onError: () => {
      toast.error('删除失败');
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      role: 'USER',
      isActive: true,
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateMutation.mutate({
      id: editingUser.id,
      data: formData,
    });
  };

  const handleCloseModal = () => {
    if (updateMutation.isPending) return;
    setShowModal(false);
    resetForm();
  };

  // 过滤用户（前端搜索）
  const filteredUsers = data?.users.filter(
    (user) =>
      !search ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: '仪表板', path: '/admin' },
          { label: '用户管理' },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">用户管理</h1>
        <p className="text-text-secondary mt-2">查看和管理所有用户账户</p>
      </div>

      {/* 搜索和筛选栏 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
            <Input
              placeholder="搜索用户邮箱或姓名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">全部角色</option>
              <option value="USER">普通用户</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 用户列表 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12 text-text-tertiary" />}
            title="暂无用户"
            description={search || roleFilter ? '没有找到匹配的用户' : '还没有用户'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      电话
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-secondary">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-secondary">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role === 'ADMIN' ? '管理员' : '用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? '活跃' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-brand-blue hover:text-brand-blue/80 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit size={18} />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, userId: user.id })}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {data && data.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  显示 {((page - 1) * 20) + 1} - {Math.min(page * 20, data.pagination.total)} 条，共{' '}
                  {data.pagination.total} 条
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-text-secondary">
                    第 {page} / {data.pagination.totalPages} 页
                  </span>
                  <div className="flex space-x-2">
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
                      onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 编辑用户模态框 */}
      {showModal && editingUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <Card className="w-full max-w-md animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-text-primary">编辑用户</h2>
              <button
                onClick={handleCloseModal}
                disabled={updateMutation.isPending}
                className="text-text-secondary hover:text-text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="名"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="姓"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                label="电话"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="USER">用户</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                />
                <label htmlFor="isActive" className="text-sm text-text-secondary">
                  账户激活
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={updateMutation.isPending}
                >
                  取消
                </Button>
                <Button type="submit" loading={updateMutation.isPending}>
                  更新
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除用户"
        message="确定要删除这个用户吗？此操作无法撤销，用户的所有数据将被永久删除。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.userId) {
            deleteMutation.mutate(deleteConfirm.userId);
          }
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, userId: null })}
      />
    </div>
  );
};

export default AdminUsers;
