import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/orders';
import { getImageUrl } from '@/utils/imageUrl';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ArrowLeft, MapPin, CreditCard, Calendar } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { t } = useTranslation(['orders', 'common']);
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrderById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container-apple py-12">
        <LoadingSpinner size="lg" text={t('common:loading')} className="py-20" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">{t('orders:errors.notFound', { defaultValue: 'Order Not Found' })}</h2>
          <p className="text-text-secondary mb-6">{t('orders:errors.notFound', { defaultValue: 'The order you\'re looking for doesn\'t exist.' })}</p>
          <Link to="/user/orders">
            <Button>{t('common:buttons.back')} {t('orders:title')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-apple py-12">
      <div className="mb-6">
        <Link
          to="/user/orders"
          className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('common:buttons.back')} {t('orders:title')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="heading-2">{t('orders:orderNumber')} #{order.id.slice(-8)}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-text-tertiary" />
                <span className="text-text-tertiary">{t('orders:date')}:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard size={16} className="text-text-tertiary" />
                <span className="text-text-tertiary">{t('orders:detail.paymentMethod')}:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('orders:detail.items')}</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={getImageUrl(item.product?.images[0])}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-sm text-text-tertiary">
                      {t('orders:detail.quantity')}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-text-tertiary">
                      ${item.price.toFixed(2)} {t('common:each', { defaultValue: 'each' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              {t('orders:detail.shippingAddress')}
            </h3>
            <div className="text-text-secondary">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-6">{t('orders:detail.title', { defaultValue: 'Order Summary' })}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:subtotal')}</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:shipping')}</span>
                <span>{t('common:free', { defaultValue: 'Free' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:tax')}</span>
                <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('cart:total')}</span>
                  <span>${(order.totalAmount * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                {t('orders:trackPackage', { defaultValue: 'Track Package' })}
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                {t('orders:reorder', { defaultValue: 'Reorder Items' })}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


