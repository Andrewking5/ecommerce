import React from 'react';
import Card from '@/components/ui/Card';
import { CartItem } from '@/types/cart';
import { getImageUrl } from '@/utils/imageUrl';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shippingCost,
  taxAmount,
  discountAmount,
  total,
}) => {
  return (
    <Card className="p-6 sticky top-24" role="complementary" aria-label="Order summary">
      <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto" role="list" aria-label="Order items">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3" role="listitem">
            <img
              src={getImageUrl(item.product?.images[0])}
              alt={item.product?.name}
              className="w-16 h-16 object-cover rounded-lg"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product?.name}</p>
              <p className="text-xs text-gray-500" aria-label={`Price: $${item.product?.price}, Quantity: ${item.quantity}`}>
                ${item.product?.price} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold" aria-label={`Subtotal: $${((item.product?.price || 0) * item.quantity).toFixed(2)}`}>
              ${((item.product?.price || 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <dl className="space-y-3 border-t border-gray-200 pt-4" role="list" aria-label="Price breakdown">
        <div className="flex justify-between text-sm" role="listitem">
          <dt className="text-gray-600">Subtotal</dt>
          <dd aria-label={`Subtotal: $${subtotal.toFixed(2)}`}>${subtotal.toFixed(2)}</dd>
        </div>

        {discountAmount && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600" role="listitem">
            <dt>Discount</dt>
            <dd aria-label={`Discount: -$${discountAmount.toFixed(2)}`}>-${discountAmount.toFixed(2)}</dd>
          </div>
        )}

        <div className="flex justify-between text-sm" role="listitem">
          <dt className="text-gray-600">Shipping</dt>
          <dd aria-label={shippingCost === 0 ? 'Free shipping' : `Shipping: $${shippingCost.toFixed(2)}`}>
            {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
          </dd>
        </div>

        <div className="flex justify-between text-sm" role="listitem">
          <dt className="text-gray-600">Tax</dt>
          <dd aria-label={`Tax: $${taxAmount.toFixed(2)}`}>${taxAmount.toFixed(2)}</dd>
        </div>

        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3" role="listitem">
          <dt>Total</dt>
          <dd className="font-semibold" aria-label={`Total: $${total.toFixed(2)}`}>${total.toFixed(2)}</dd>
        </div>
      </dl>
    </Card>
  );
};

export default OrderSummary;

