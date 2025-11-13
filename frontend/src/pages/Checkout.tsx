import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderApi } from '@/services/orders';
import { Address, CreateOrderRequest } from '@/types/order';
import { UserAddress, toOrderAddress } from '@/types/address';
import AddressSelector from '@/components/address/AddressSelector';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CouponInput from '@/components/checkout/CouponInput';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

type CheckoutStep = 'address' | 'payment';

const Checkout: React.FC = () => {
  const { t } = useTranslation(['checkout', 'common']);
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // 检查认证
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue checkout');
      navigate('/auth/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [isAuthenticated, items.length, navigate]);

  // 计算价格
  const subtotal = total;
  const shippingCost = subtotal >= 100 ? 0 : 10; // 满100免运费
  const taxRate = 0.08;
  const taxAmount = (subtotal - discountAmount + shippingCost) * taxRate;
  const finalTotal = subtotal - discountAmount + shippingCost + taxAmount;

  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddress(address);
    const orderAddress = toOrderAddress(address);
    setShippingAddress(orderAddress);
    if (useSameAddress) {
      setBillingAddress(orderAddress);
    }
  };

  const handleNewAddress = (address: UserAddress) => {
    setSelectedAddress(address);
    const orderAddress = toOrderAddress(address);
    setShippingAddress(orderAddress);
    if (useSameAddress) {
      setBillingAddress(orderAddress);
    }
  };

  const handleCouponApplied = (code: string, discount: number) => {
    setCouponCode(code);
    setDiscountAmount(discount);
  };

  const handleCouponRemoved = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const handleCreateOrder = async () => {
    if (!shippingAddress || !selectedAddress) {
      toast.error('请选择收货地址');
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderData: CreateOrderRequest = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        billingAddress: useSameAddress ? undefined : billingAddress || undefined,
        paymentMethod: 'stripe',
        couponCode: couponCode || undefined,
        shippingCost,
        addressId: selectedAddress.id, // 传递地址ID
      };

      const order = await orderApi.createOrder(orderData);
      setOrderId(order.id);
      toast.success('Order created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/checkout/success', {
      state: { orderId },
    });
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    setIsCreatingOrder(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <main className="container-apple py-12" aria-label={t('checkout:title', { defaultValue: 'Checkout' })}>
      <div className="mb-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          aria-label={t('common:buttons.back', { defaultValue: 'Back to cart' })}
        >
          <ArrowLeft size={20} className="mr-2" aria-hidden="true" />
          {t('common:buttons.back', { defaultValue: 'Back to Cart' })}
        </button>
        <h1 className="heading-1">{t('checkout:title', { defaultValue: 'Checkout' })}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <section className="lg:col-span-2 space-y-6" aria-label={t('checkout:steps', { defaultValue: 'Checkout steps' })}>
          {/* Step Indicator */}
          <nav className="flex items-center space-x-4 mb-8" aria-label={t('checkout:progress', { defaultValue: 'Checkout progress' })}>
            <div
              className={`flex items-center ${
                currentStep === 'address' ? 'text-black' : 'text-gray-400'
              }`}
              aria-current={currentStep === 'address' ? 'step' : undefined}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'address'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-hidden="true"
              >
                <MapPin size={16} />
              </div>
              <span className="ml-2 font-medium">{t('checkout:steps.shipping', { defaultValue: 'Shipping' })}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" aria-hidden="true" />
            <div
              className={`flex items-center ${
                currentStep === 'payment' ? 'text-black' : 'text-gray-400'
              }`}
              aria-current={currentStep === 'payment' ? 'step' : undefined}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'payment'
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-hidden="true"
              >
                <CreditCard size={16} />
              </div>
              <span className="ml-2 font-medium">{t('checkout:steps.payment', { defaultValue: 'Payment' })}</span>
            </div>
          </nav>

          {/* Address Step */}
          {currentStep === 'address' && (
            <Card className="p-6" role="region" aria-labelledby="address-step-title">
              <h2 id="address-step-title" className="text-lg font-semibold mb-4">
                {t('checkout:address.title', { defaultValue: 'Shipping Address' })}
              </h2>
              
              <AddressSelector
                selectedAddressId={selectedAddress?.id}
                onSelect={handleAddressSelect}
                onNewAddress={handleNewAddress}
                showAddButton={true}
              />

              {selectedAddress && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4" role="region" aria-label={t('checkout:address.selected', { defaultValue: 'Selected address' })}>
                    <p className="text-sm text-gray-600 mb-1">{t('checkout:address.label', { defaultValue: 'Shipping Address' })}</p>
                    <p className="font-medium">{selectedAddress.recipientName} {selectedAddress.phone}</p>
                    <address className="text-sm text-gray-700 not-italic">
                      {selectedAddress.province}
                      {selectedAddress.city}
                      {selectedAddress.district}
                      {selectedAddress.street}
                    </address>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => {
                        setUseSameAddress(e.target.checked);
                        if (e.target.checked && shippingAddress) {
                          setBillingAddress(shippingAddress);
                        }
                      }}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-brand-blue"
                      aria-label={t('checkout:address.useSameBilling', { defaultValue: 'Use same address for billing' })}
                    />
                    <span className="text-sm">{t('checkout:address.useSameBilling', { defaultValue: 'Use same address for billing' })}</span>
                  </label>

                  <Button
                    onClick={() => setCurrentStep('payment')}
                    size="lg"
                    className="w-full"
                    aria-label={t('checkout:buttons.continueToPayment', { defaultValue: 'Continue to payment' })}
                  >
                    {t('checkout:buttons.continueToPayment', { defaultValue: 'Continue to Payment' })}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <Card className="p-6" role="region" aria-labelledby="payment-step-title">
              {!orderId ? (
                <div className="space-y-6">
                  <div>
                    <h2 id="payment-step-title" className="text-lg font-semibold mb-4">
                      {t('checkout:payment.title', { defaultValue: 'Payment Method' })}
                    </h2>
                    <Button
                      onClick={handleCreateOrder}
                      size="lg"
                      className="w-full"
                      loading={isCreatingOrder}
                      aria-label={t('checkout:buttons.createOrder', { defaultValue: 'Create order and continue to payment' })}
                    >
                      {isCreatingOrder 
                        ? t('checkout:buttons.creatingOrder', { defaultValue: 'Creating Order...' })
                        : t('checkout:buttons.createOrder', { defaultValue: 'Create Order & Continue to Payment' })
                      }
                    </Button>
                  </div>
                </div>
              ) : (
                <PaymentForm
                  orderId={orderId}
                  amount={finalTotal}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </Card>
          )}
        </section>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-1" aria-label={t('checkout:summary.title', { defaultValue: 'Order summary' })}>
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            taxAmount={taxAmount}
            discountAmount={discountAmount > 0 ? discountAmount : undefined}
            total={finalTotal}
          />

          {/* Coupon Input */}
          {currentStep === 'address' && (
            <Card className="p-6 mt-6" role="region" aria-label={t('checkout:coupon.title', { defaultValue: 'Coupon code' })}>
              <CouponInput
                onCouponApplied={handleCouponApplied}
                onCouponRemoved={handleCouponRemoved}
                subtotal={subtotal}
                appliedCoupon={
                  couponCode && discountAmount > 0
                    ? { code: couponCode, discountAmount }
                    : undefined
                }
              />
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
};

export default Checkout;

