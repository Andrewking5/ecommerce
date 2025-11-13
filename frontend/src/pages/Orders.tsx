import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/orders';
import { getImageUrl } from '@/utils/imageUrl';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Package, Calendar, DollarSign } from 'lucide-react';

const Orders: React.FC = () => {
  const { t } = useTranslation(['orders', 'common']);
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => orderApi.getUserOrders(),
  });

  if (isLoading) {
    return (
      <div className="container-apple py-12">
        <LoadingSpinner size="lg" text={t('common:loading')} className="py-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-apple py-12">
        <ErrorMessage
          title={t('common:error', { defaultValue: 'Error' })}
          message={t('common:error', { defaultValue: 'Failed to load orders. Please try again later.' })}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <main className="container-apple py-12" aria-label={t('orders:title', { defaultValue: 'Orders' })}>
      <h1 className="heading-1 mb-8">{t('orders:title')}</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="package"
          title={t('orders:noOrders', { defaultValue: 'No orders yet' })}
          description={t('orders:noOrders', { defaultValue: 'You haven\'t placed any orders yet. Start shopping to see your orders here.' })}
          action={
            <Link to="/products">
              <Button size="lg">{t('common:buttons.shopNow', { defaultValue: 'Shop Now' })}</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Package size={24} className="text-text-tertiary" />
                  <div>
                    <h3 className="font-semibold">{t('orders:orderNumber')} #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-text-tertiary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={getImageUrl(item.product?.images[0])}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-text-tertiary">
                        {t('orders:detail.quantity')}: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-text-tertiary">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{t('orders:date')}: {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} />
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
                
                <Link to={`/user/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    {t('orders:viewDetails')}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default Orders;


