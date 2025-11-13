import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAddress, CreateAddressRequest } from '@/types/address';
import { addressApi } from '@/services/addresses';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddressForm from '@/components/address/AddressForm';
import AddressList from '@/components/address/AddressList';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Addresses: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    addressId: string | null;
  }>({
    isOpen: false,
    addressId: null,
  });

  // 获取地址列表
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => addressApi.getUserAddresses(),
  });

  // 创建地址
  const createMutation = useMutation({
    mutationFn: (data: CreateAddressRequest) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      toast.success('地址添加成功');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '添加地址失败');
    },
  });

  // 更新地址
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAddressRequest> }) =>
      addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      toast.success('地址更新成功');
      setShowForm(false);
      setEditingAddress(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '更新地址失败');
    },
  });

  // 删除地址
  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      toast.success('地址删除成功');
      setDeleteConfirm({ isOpen: false, addressId: null });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除地址失败');
    },
  });

  // 设置默认地址
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
      toast.success('默认地址设置成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '设置默认地址失败');
    },
  });

  const handleSubmit = (data: CreateAddressRequest) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, addressId: id });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.addressId) {
      deleteMutation.mutate(deleteConfirm.addressId);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <div className="container-apple py-12">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/user/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回个人中心
          </button>
          <div className="flex items-center justify-between">
            <h1 className="heading-1">地址管理</h1>
            {!showForm && (
              <Button
                onClick={() => {
                  setEditingAddress(null);
                  setShowForm(true);
                }}
                size="lg"
              >
                <Plus size={20} className="mr-2" />
                添加新地址
              </Button>
            )}
          </div>
        </div>

        {/* 地址表单 */}
        {showForm && (
          <Card className="p-6 mb-8">
            <AddressForm
              defaultValues={editingAddress || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              title={editingAddress ? '编辑地址' : '添加新地址'}
              buttonText={editingAddress ? '更新地址' : '保存地址'}
            />
          </Card>
        )}

        {/* 地址列表 */}
        {!showForm && (
          <AddressList
            addresses={addresses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            isLoading={isLoading}
          />
        )}

        {/* 删除确认对话框 */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onCancel={() => setDeleteConfirm({ isOpen: false, addressId: null })}
          onConfirm={handleConfirmDelete}
          title="删除地址"
          message="确定要删除这个地址吗？删除后无法恢复。"
          confirmText="删除"
          cancelText="取消"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default Addresses;

