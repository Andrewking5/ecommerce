import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/orders';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Package, Calendar, DollarSign } from 'lucide-react';

const Orders: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => orderApi.getUserOrders(),
  });

  if (isLoading) {
    return (
      <div className="container-apple py-12">
        <div className="flex justify-center items-center h-64">
          <div className="spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">Error Loading Orders</h2>
          <p className="text-text-secondary">Please try again later.</p>
        </div>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="container-apple py-12">
      <h1 className="heading-1 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-6" />
          <h2 className="heading-2 mb-4">No orders yet</h2>
          <p className="text-text-secondary mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link to="/products">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Package size={24} className="text-text-tertiary" />
                  <div>
                    <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
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
                      src={item.product?.images[0]}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-text-tertiary">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-text-tertiary">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Ordered on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} />
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>
                
                <Link to={`/user/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;


