import { motion } from 'motion/react';
import { ShieldCheck, ChevronDown, Lock, Truck, CreditCard, ShoppingBag, AlertCircle, Tag, X, MapPin, Check } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useCartContext } from '@/src/contexts/CartContext';
import orderService from '@/src/services/orderService';
import paymentService from '@/src/services/paymentService';
import couponService from '@/src/services/couponService';
import addressService, { type Address } from '@/src/services/addressService';
import { useLocalizedNavigate as useNavigate, LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/src/lib/stripe';
import { useTranslation } from 'react-i18next';
import { trackBeginCheckout, trackAddShippingInfo, trackAddPaymentInfo } from '@/src/lib/analytics';

const COUNTRIES = [
  { value: 'Taiwan', label: '台灣 Taiwan' },
  { value: 'Japan', label: '日本 Japan' },
  { value: 'Hong Kong', label: '香港 Hong Kong' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'China', label: '中國 China' },
  { value: 'South Korea', label: '韓國 South Korea' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Canada', label: 'Canada' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Thailand', label: 'Thailand' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'New Zealand', label: 'New Zealand' },
];

function formatCurrency(amount: number): string {
  return `NT$ ${Math.round(amount).toLocaleString()}`;
}

// ─── Stripe Payment Form (rendered inside <Elements>) ───────────────────────

function StripePaymentForm({
  onReady,
  onError,
}: {
  onReady: () => void;
  onError: (msg: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PaymentElement
        onReady={onReady}
        options={{
          layout: 'tabs',
        }}
      />
      <div className="flex items-center space-x-3 bg-ayers-cream/60 rounded-xl p-4">
        <Lock className="text-ayers-gold flex-shrink-0" size={16} />
        <p className="text-xs text-ayers-ink/60">
          {t('checkout.securePaymentNote')}
        </p>
      </div>
    </div>
  );
}

// ─── Main Checkout (wrapped with Elements when clientSecret is ready) ───────

export default function Checkout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items: cartItems, total: totalPrice, clearCart } = useCartContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeStep, setActiveStep] = useState('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Stripe state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentReady, setPaymentReady] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Taiwan',
  });

  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Track begin_checkout event
  useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(
        cartItems.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
        totalPrice,
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch saved addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAddressesLoading(true);
      addressService.getAddresses()
        .then((res) => {
          if (res.success) {
            setSavedAddresses(res.data);
            // Auto-select default address
            const defaultAddr = res.data.find(a => a.isDefault);
            if (defaultAddr) {
              applyAddress(defaultAddr);
              setSelectedAddressId(defaultAddr.id);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch saved addresses:', err);
        })
        .finally(() => setAddressesLoading(false));
    }
  }, [isAuthenticated]);

  const applyAddress = (addr: Address) => {
    const nameParts = addr.recipientName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    setShippingInfo(prev => ({
      ...prev,
      firstName,
      lastName,
      phone: addr.phone,
      address: addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : ''),
      city: addr.city,
      state: addr.state,
      zipCode: addr.postalCode,
      country: addr.country,
    }));
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    applyAddress(addr);
  };

  const steps = [
    { id: 'shipping', label: t('checkout.shipping') },
    { id: 'payment', label: t('checkout.payment') },
    { id: 'review', label: t('checkout.review') },
  ];

  const stepIndex = steps.findIndex(s => s.id === activeStep);

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const goToStep = (stepId: string) => {
    const targetIndex = steps.findIndex(s => s.id === stepId);
    if (targetIndex <= stepIndex + 1) {
      setActiveStep(stepId);
    }
  };

  // When user clicks "Continue to Payment", create order + payment intent
  const handleContinueToPayment = async () => {
    if (cartItems.length === 0) return;

    setError('');
    setIsSubmitting(true);

    try {
      // 1. Create order in PENDING state
      const orderRes = await orderService.createOrder({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        paymentMethod: 'stripe',
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      });

      const createdOrder = orderRes.data;
      setOrderId(createdOrder.id);

      // 2. Create Stripe payment intent
      const paymentRes = await paymentService.createPaymentIntent(
        createdOrder.id,
        Math.round(total), // amount in NTD (Stripe handles cents conversion on backend)
        'twd'
      );

      setClientSecret(paymentRes.data.clientSecret);
      setActiveStep('payment');
      trackAddShippingInfo(total, shippingInfo.country);
      trackAddPaymentInfo(total, 'stripe');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = totalPrice;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * 0.05;
  const total = afterDiscount + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponService.validateCoupon(couponCode.trim(), subtotal);
      if (res.success && res.data.valid && res.data.coupon) {
        const c = res.data.coupon;
        const discountAmount = res.data.discountAmount ??
          (c.discountType === 'percentage'
            ? Math.round(subtotal * c.discountValue / 100)
            : c.discountValue);
        setAppliedCoupon({
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          discountAmount,
        });
        setCouponCode('');
      } else {
        setCouponError(res.data.message || t('checkout.invalidCoupon', 'Invalid or expired coupon code'));
      }
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || t('checkout.invalidCoupon', 'Invalid or expired coupon code'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  if (authLoading) {
    return (
      <div className="bg-ayers-cream min-h-screen flex items-center justify-center">
        <GuitarSunLoader size={40} />
      </div>
    );
  }

  if (cartItems.length === 0 && !orderId) {
    return (
      <div className="bg-ayers-cream min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <ShoppingBag className="mx-auto mb-6 text-ayers-ink/20" size={64} />
            <h1 className="text-4xl md:text-5xl font-serif italic font-bold mb-4">{t('checkout.emptyCart')}</h1>
            <p className="text-ayers-ink/60 mb-8">{t('checkout.emptyCartDesc')}</p>
            <Link
              to="/collections"
              className="inline-block bg-ayers-gold text-white py-4 px-10 rounded-2xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              {t('checkout.browseCollections')}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Payment step content — needs to be inside <Elements> provider
  const paymentStepContent = clientSecret ? (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#c5a059',
            colorBackground: '#f5f2ed',
            colorText: '#1a1a1a',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              backgroundColor: '#f5f2ed',
              border: 'none',
              padding: '16px 24px',
              fontSize: '14px',
            },
            '.Input:focus': {
              boxShadow: '0 0 0 2px #c5a059',
            },
            '.Label': {
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: '0.4',
            },
          },
        },
      }}
    >
      <PaymentStepInner
        onContinue={() => setActiveStep('review')}
        onError={(msg) => setError(msg)}
      />
    </Elements>
  ) : (
    <div className="flex items-center justify-center py-12">
      <GuitarSunLoader size={24} text={t('checkout.preparingPayment')} />
    </div>
  );

  return (
    <div className="bg-ayers-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif italic font-bold mb-8">{t('checkout.title')}</h1>
          <div className="flex items-center justify-center space-x-12 relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-ayers-ink/10 -translate-y-1/2 z-0" />
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center cursor-pointer"
                onClick={() => goToStep(step.id)}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full mb-2 transition-all duration-500",
                  activeStep === step.id ? "bg-ayers-gold scale-125 shadow-[0_0_15px_rgba(197,160,89,0.5)]" :
                  steps.findIndex(s => s.id === step.id) < stepIndex ? "bg-ayers-gold/60" : "bg-ayers-ink/20"
                )} />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-opacity",
                  activeStep === step.id ? "opacity-100" : "opacity-40"
                )}>{step.label}</span>
              </div>
            ))}
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 overflow-hidden">
              <div
                className="p-8 border-b border-ayers-ink/5 flex justify-between items-center group cursor-pointer"
                onClick={() => setActiveStep('shipping')}
              >
                <div className="flex items-center space-x-4">
                  <Truck className="text-ayers-gold" size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest">{t('checkout.shippingInfo')}</h2>
                </div>
                <ChevronDown size={20} className={cn("opacity-40 transition-transform", activeStep === 'shipping' && "rotate-180")} />
              </div>
              {activeStep === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-10 space-y-8"
                >
                  {/* Saved Addresses */}
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center space-x-2">
                        <MapPin size={12} />
                        <span>{t('checkout.savedAddresses', 'Saved Addresses')}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={cn(
                              "relative text-left p-5 rounded-2xl border-2 transition-all",
                              selectedAddressId === addr.id
                                ? "border-ayers-gold bg-ayers-gold/5 shadow-sm"
                                : "border-ayers-ink/10 hover:border-ayers-gold/40 bg-ayers-cream/30"
                            )}
                          >
                            {selectedAddressId === addr.id && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-ayers-gold rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                            {addr.isDefault && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-ayers-gold/10 text-ayers-gold mb-2">
                                {t('checkout.defaultLabel', 'Default')}
                              </span>
                            )}
                            <p className="text-sm font-bold mb-1">{addr.recipientName}</p>
                            <p className="text-xs text-ayers-ink/60 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 && <>, {addr.addressLine2}</>}
                              <br />
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                              <br />
                              {addr.country}
                            </p>
                            <p className="text-xs text-ayers-ink/40 mt-1">{addr.phone}</p>
                          </button>
                        ))}
                      </div>
                      <div className="border-b border-ayers-ink/5 pt-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-center">
                        {t('checkout.orEnterManually', 'Or enter a new address below')}
                      </p>
                    </div>
                  )}

                  {addressesLoading && (
                    <div className="flex items-center justify-center py-4">
                      <GuitarSunLoader size={16} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label={t('checkout.firstName')} placeholder="e.g. Wei-Lin" value={shippingInfo.firstName} onChange={(v) => { handleInputChange('firstName', v); setSelectedAddressId(null); }} />
                    <Input label={t('checkout.lastName')} placeholder="e.g. Chen" value={shippingInfo.lastName} onChange={(v) => handleInputChange('lastName', v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label={t('checkout.email')} placeholder="you@email.com" type="email" value={shippingInfo.email} onChange={(v) => handleInputChange('email', v)} />
                    <Input label={t('checkout.phone')} placeholder="+886 912 345 678" type="tel" value={shippingInfo.phone} onChange={(v) => handleInputChange('phone', v)} />
                  </div>
                  <Input label={t('checkout.address')} placeholder="Street address, apartment, suite, etc." value={shippingInfo.address} onChange={(v) => handleInputChange('address', v)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label={t('checkout.city')} placeholder="e.g. Taipei" value={shippingInfo.city} onChange={(v) => handleInputChange('city', v)} />
                    <Input label={t('checkout.state')} placeholder="e.g. Taipei City" value={shippingInfo.state} onChange={(v) => handleInputChange('state', v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label={t('checkout.zipCode')} placeholder="e.g. 106" value={shippingInfo.zipCode} onChange={(v) => handleInputChange('zipCode', v)} />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t('checkout.country')}</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full bg-ayers-cream border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all appearance-none"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleContinueToPayment}
                      disabled={isSubmitting}
                      className={cn(
                        "bg-ayers-gold text-white py-3 px-8 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all flex items-center",
                        isSubmitting && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <GuitarSunLoader size={16} className="mr-2" />
                          {t('checkout.creatingOrder')}
                        </>
                      ) : (
                        t('checkout.continueToPayment')
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </section>

            {/* Payment */}
            <section className={cn("bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 overflow-hidden", stepIndex < 1 && activeStep !== 'payment' && "opacity-40")}>
              <div
                className={cn("p-8 border-b border-ayers-ink/5 flex justify-between items-center", stepIndex >= 1 ? "cursor-pointer" : "cursor-not-allowed")}
                onClick={() => stepIndex >= 1 && setActiveStep('payment')}
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="text-ayers-gold" size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest">{t('checkout.paymentMethod')}</h2>
                </div>
                <ChevronDown size={20} className={cn("opacity-40 transition-transform", activeStep === 'payment' && "rotate-180")} />
              </div>
              {activeStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-10 space-y-8"
                >
                  {paymentStepContent}
                </motion.div>
              )}
            </section>

            {/* Review */}
            <section className={cn("bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 overflow-hidden", stepIndex < 2 && activeStep !== 'review' && "opacity-40")}>
              <div
                className={cn("p-8 border-b border-ayers-ink/5 flex justify-between items-center", stepIndex >= 2 ? "cursor-pointer" : "cursor-not-allowed")}
                onClick={() => stepIndex >= 2 && setActiveStep('review')}
              >
                <div className="flex items-center space-x-4">
                  <ShoppingBag className="text-ayers-gold" size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest">{t('checkout.orderReview')}</h2>
                </div>
                <ChevronDown size={20} className={cn("opacity-40 transition-transform", activeStep === 'review' && "rotate-180")} />
              </div>
              {activeStep === 'review' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <ReviewStepInner
                    shippingInfo={shippingInfo}
                    cartItems={cartItems}
                    formatCurrency={formatCurrency}
                    orderId={orderId}
                    total={total}
                    clearCart={clearCart}
                    navigate={navigate}
                    setError={setError}
                  />
                </Elements>
              )}
            </section>
          </div>

          {/* Order Summary */}
          <aside className="space-y-8">
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-ayers-ink/5 space-y-8">
              <h2 className="text-2xl font-serif italic font-bold">{t('checkout.orderSummary')}</h2>

              <div className="space-y-6">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex items-center space-x-6 pb-6 border-b border-ayers-ink/5 last:border-b-0 last:pb-0">
                    <div className="w-20 aspect-[3/4] bg-ayers-cream rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ShoppingBag className="text-ayers-ink/20" size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold mb-1 truncate">{item.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-gold">{t('checkout.qty')}: {item.quantity}</p>
                      <p className="text-sm font-bold mt-1">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="pt-4 border-t border-ayers-ink/5 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                  <Tag size={12} />
                  {t('checkout.couponCode', 'Coupon Code')}
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discountType === 'percentage'
                          ? `-${appliedCoupon.discountValue}%`
                          : `-${formatCurrency(appliedCoupon.discountValue)}`}
                        {' '}{t('checkout.applied', 'applied')}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-red-500 transition-colors"
                      title={t('checkout.removeCoupon', 'Remove coupon')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder={t('checkout.enterCoupon', 'Enter code')}
                      className="flex-1 bg-ayers-cream border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-ayers-gold transition-all placeholder:text-ayers-ink/20 uppercase tracking-wider"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className={cn(
                        "px-4 py-3 rounded-xl bg-ayers-gold text-white text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all",
                        (couponLoading || !couponCode.trim()) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {couponLoading ? <GuitarSunLoader size={14} /> : t('checkout.apply', 'Apply')}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {couponError}
                  </p>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div className="pt-4 border-t border-ayers-ink/5 space-y-4">
                  <div className="flex justify-between">
                    <span className="opacity-60">{t('checkout.subtotal')}</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {t('checkout.discount', 'Discount')}
                      </span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="opacity-60">{t('checkout.tax')}</span>
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif italic font-bold pt-4 border-t border-ayers-ink/5">
                    <span>{t('checkout.grandTotal')}</span>
                    <span className="text-ayers-gold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                <ShieldCheck size={14} />
                <span>{t('checkout.secureCheckout')}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Step Inner (must be inside <Elements>) ─────────────────────────

function PaymentStepInner({
  onContinue,
  onError,
}: {
  onContinue: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <StripePaymentForm
        onReady={() => setReady(true)}
        onError={onError}
      />
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={!stripe || !elements || !ready}
          className={cn(
            "bg-ayers-gold text-white py-3 px-8 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all",
            (!stripe || !elements || !ready) && "opacity-50 cursor-not-allowed"
          )}
        >
          {t('checkout.continueToReview')}
        </button>
      </div>
    </div>
  );
}

// ─── Review Step Inner (must be inside <Elements> to call confirmPayment) ───

function ReviewStepInner({
  shippingInfo,
  cartItems,
  formatCurrency: fmt,
  orderId,
  total,
  clearCart,
  navigate,
  setError,
}: {
  shippingInfo: { firstName: string; lastName: string; address: string; city: string; state: string; zipCode: string; country: string };
  cartItems: Array<{ productId: string; name: string; quantity: number; price: number }>;
  formatCurrency: (n: number) => string;
  orderId: string | null;
  total: number;
  clearCart: () => void;
  navigate: (to: string, options?: any) => void;
  setError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements || !orderId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname.replace(/\/checkout$/, '/checkout/success')}`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Payment succeeded (no redirect needed)
      clearCart();
      navigate('/checkout/success', {
        state: {
          orderId,
          purchaseData: {
            value: total,
            tax,
            shipping: 0,
            coupon: appliedCoupon?.code,
            items: cartItems.map((i) => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
          },
        },
      });
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="p-10 space-y-6"
    >
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">{t('checkout.shippingTo')}</h3>
        <p className="text-sm">
          {shippingInfo.firstName} {shippingInfo.lastName}<br />
          {shippingInfo.address}<br />
          {shippingInfo.city}{shippingInfo.state ? `, ${shippingInfo.state}` : ''} {shippingInfo.zipCode}<br />
          {shippingInfo.country}
        </p>
      </div>
      <div className="space-y-4 pt-4 border-t border-ayers-ink/5">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">{t('checkout.items')}</h3>
        {cartItems.map(item => (
          <div key={item.productId} className="flex items-center justify-between text-sm">
            <span>{item.name} x{item.quantity}</span>
            <span className="font-bold">{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="pt-6">
        <button
          onClick={handleConfirmPayment}
          disabled={isSubmitting || !stripe || !elements}
          className={cn(
            "w-full bg-ayers-gold text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center group",
            (isSubmitting || !stripe || !elements) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <GuitarSunLoader size={16} className="mr-2" />
              {t('checkout.processing')}
            </>
          ) : (
            <>
              {t('checkout.confirmAndPay')} {fmt(total)} <Lock size={16} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Shared Input Component ─────────────────────────────────────────────────

function Input({ label, placeholder, type = "text", value, onChange }: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-ayers-cream border-none rounded-xl py-4 px-6 text-sm focus:ring-2 focus:ring-ayers-gold transition-all placeholder:text-ayers-ink/20"
      />
    </div>
  );
}
