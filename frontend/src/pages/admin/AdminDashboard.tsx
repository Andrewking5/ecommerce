import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Navigate, Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ShoppingBag, Users, Package, TrendingUp, Loader2 } from 'lucide-react';
import { productApi } from '@/services/products';
import { orderApi } from '@/services/orders';
import { userApi } from '@/services/users';

interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });

  // 获取统计数据
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: () => orderApi.getAllOrders(1, 1),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => userApi.getAllUsers(1, 1),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products-stats'],
    queryFn: () => productApi.getProducts({ page: 1, limit: 1 }),
  });

  useEffect(() => {
    if (ordersData) {
      setStats(prev => ({
        ...prev,
        totalOrders: ordersData.pagination.total,
        totalRevenue: ordersData.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      }));
    }
    if (usersData) {
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.pagination.total,
      }));
    }
    if (productsData) {
      setStats(prev => ({
        ...prev,
        totalProducts: productsData.pagination.total,
      }));
    }
  }, [ordersData, usersData, productsData]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const isLoading = ordersLoading || usersLoading || productsLoading;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('dashboard.title')}</h1>
        <p className="text-text-secondary mt-2">{t('dashboard.welcome', { firstName: user?.firstName, lastName: user?.lastName, defaultValue: `欢迎回来, ${user?.firstName} ${user?.lastName}` })}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('dashboard.totalOrders')}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-text-secondary mt-2" />
              ) : (
                <p className="text-3xl font-bold text-text-primary">{stats.totalOrders}</p>
              )}
              <p className="text-xs text-text-tertiary mt-1">{t('dashboard.totalOrdersDesc', { defaultValue: '所有订单数量' })}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('dashboard.totalUsers')}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-text-secondary mt-2" />
              ) : (
                <p className="text-3xl font-bold text-text-primary">{stats.totalUsers}</p>
              )}
              <p className="text-xs text-text-tertiary mt-1">{t('dashboard.totalUsersDesc', { defaultValue: '注册用户总数' })}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('dashboard.totalProducts')}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-text-secondary mt-2" />
              ) : (
                <p className="text-3xl font-bold text-text-primary">{stats.totalProducts}</p>
              )}
              <p className="text-xs text-text-tertiary mt-1">{t('dashboard.totalProductsDesc', { defaultValue: '商品总数' })}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{t('dashboard.revenue')}</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-text-secondary mt-2" />
              ) : (
                <p className="text-3xl font-bold text-text-primary">
                  ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <p className="text-xs text-text-tertiary mt-1">{t('dashboard.revenueDesc', { defaultValue: '累计收入' })}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('quickActions.productManagement')}</h2>
              <p className="text-sm text-text-secondary">{t('quickActions.productManagementDesc')}</p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="block w-full text-center py-2 px-4 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            {t('quickActions.manageProducts')}
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('quickActions.orderManagement')}</h2>
              <p className="text-sm text-text-secondary">{t('quickActions.orderManagementDesc')}</p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="block w-full text-center py-2 px-4 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            {t('quickActions.manageOrders')}
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{t('quickActions.userManagement')}</h2>
              <p className="text-sm text-text-secondary">{t('quickActions.userManagementDesc')}</p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="block w-full text-center py-2 px-4 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            {t('quickActions.manageUsers')}
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

