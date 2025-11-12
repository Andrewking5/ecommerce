import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
  const { t } = useTranslation(['cart', 'common']);
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container-apple py-12">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-6" />
          <h2 className="heading-2 mb-4">{t('cart:empty')}</h2>
          <p className="text-text-secondary mb-8">
            {t('cart:emptyDescription')}
          </p>
          <Link to="/products">
            <Button size="lg">{t('common:buttons.shopNow')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-apple py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-1">{t('cart:title')}</h1>
        <Button variant="outline" onClick={clearCart}>
          {t('common:buttons.delete')} {t('cart:title', { defaultValue: 'Cart' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={item.product?.images[0]}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.product?.name}</h3>
                  <p className="text-text-secondary text-sm mb-2">
                    ${item.product?.price}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-6">{t('cart:title', { defaultValue: 'Order Summary' })}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:subtotal')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:shipping')}</span>
                <span>{t('common:free', { defaultValue: 'Free' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('cart:tax')}</span>
                <span>${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('cart:total')}</span>
                  <span>${(total * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                {t('cart:checkout')}
              </Button>
              <Link to="/products" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  {t('cart:continueShopping')}
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-text-tertiary">
                {itemCount} {itemCount === 1 ? t('cart:item') : t('cart:items')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;


