import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/admin/Breadcrumb';
import EmptyState from '@/components/admin/EmptyState';
import { Loader2, ShoppingBag, Eye, X } from 'lucide-react';
import { orderApi } from '@/services/orders';
import { Order, OrderStatus } from '@/types/order';
import toast from 'react-hot-toast';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: '待处理',
  CONFIRMED: '已确认',
  PROCESSING: '处理中',
  SHIPPED: '已发货',
  DELIVERED: '已送达',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

const AdminOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 調試信息
  React.useEffect(() => {
    console.log('👤 Current user:', {
      user,
      isAuthenticated,
      role: user?.role,
      hasAdminRole: user?.role === 'ADMIN',
    });
  }, [user, isAuthenticated]);

  // 获取订单列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => orderApi.getAllOrders(page, 20, statusFilter || undefined),
    retry: false,
  });

  // 更新订单状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('订单状态更新成功');
    },
    onError: () => {
      toast.error('更新失败');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewDetail = async (order: Order) => {
    try {
      const orderDetail = await orderApi.getOrderById(order.id);
      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('获取订单详情失败');
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
          { label: '订单管理' },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">订单管理</h1>
        <p className="text-text-secondary mt-2">查看和管理所有订单</p>
      </div>

      {/* 筛选栏 */}
      <Card className="p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-2">订单状态</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | '');
                setPage(1);
              }}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="">全部状态</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 订单列表 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : !data?.orders || data.orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-12 h-12 text-text-tertiary" />}
            title="暂无订单"
            description={statusFilter ? '没有找到该状态的订单' : '还没有订单'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      订单号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      客户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      商品
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-primary">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="text-sm text-text-secondary">{order.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary">
                          {order.orderItems.length} 件商品
                        </div>
                        <div className="text-xs text-text-tertiary mt-1">
                          {order.orderItems[0]?.product?.name || '-'}
                          {order.orderItems.length > 1 && ` 等 ${order.orderItems.length} 件`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-text-primary">
                          ${Number(order.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          disabled={updateStatusMutation.isPending}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-brand-blue cursor-pointer transition-colors ${statusColors[order.status]}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(order)}
                          className="flex items-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>查看</span>
                        </Button>
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

      {/* 订单详情模态框 */}
      {showDetailModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
            }
          }}
        >
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-text-primary">订单详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-text-secondary hover:text-text-primary p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 订单信息 */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">订单信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">订单号</p>
                    <p className="text-sm font-medium text-text-primary">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">订单状态</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">订单金额</p>
                    <p className="text-sm font-medium text-text-primary">${Number(selectedOrder.totalAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">支付方式</p>
                    <p className="text-sm font-medium text-text-primary">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">创建时间</p>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 客户信息 */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">客户信息</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-text-primary">
                    {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                  </p>
                  <p className="text-sm text-text-secondary">{selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* 配送地址 */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">配送地址</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-text-primary">
                    {selectedOrder.shippingAddress.street}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-text-secondary">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* 商品列表 */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">商品列表</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{item.product?.name}</p>
                        <p className="text-sm text-text-secondary">数量: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-text-primary">
                        ${Number(item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
