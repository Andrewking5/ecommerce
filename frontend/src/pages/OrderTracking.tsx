import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  ExternalLink,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { cn } from '@/src/lib/utils';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import { useAuth } from '@/src/contexts/AuthContext';
import orderService, { type Order } from '@/src/services/orderService';
import { useTranslation } from 'react-i18next';

const ORDER_STEP_ICONS = [ShoppingBag, CheckCircle, Package, Truck, MapPin];
const ORDER_STEP_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function getStepIndex(status: string): number {
  const idx = ORDER_STEP_STATUSES.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const ORDER_STEPS = [
    { status: 'PENDING', label: t('tracking.orderPlaced'), icon: ORDER_STEP_ICONS[0], description: t('tracking.orderPlacedDesc') },
    { status: 'CONFIRMED', label: t('tracking.confirmed'), icon: ORDER_STEP_ICONS[1], description: t('tracking.confirmedDesc') },
    { status: 'PROCESSING', label: t('tracking.processing'), icon: ORDER_STEP_ICONS[2], description: t('tracking.processingDesc') },
    { status: 'SHIPPED', label: t('tracking.shipped'), icon: ORDER_STEP_ICONS[3], description: t('tracking.shippedDesc') },
    { status: 'DELIVERED', label: t('tracking.delivered'), icon: ORDER_STEP_ICONS[4], description: t('tracking.deliveredDesc') },
  ];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService
      .getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bg-ayers-cream min-h-screen flex items-center justify-center">
        <GuitarSunLoader size={40} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-ayers-cream min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 text-center py-24">
          <AlertCircle className="mx-auto mb-6 text-red-400" size={48} />
          <h1 className="text-3xl font-serif italic font-bold mb-4">{t('tracking.orderNotFound')}</h1>
          <p className="text-ayers-ink/60 mb-8">{error || t('tracking.orderNotFoundDesc')}</p>
          <Link to="/account" className="inline-flex items-center bg-ayers-gold text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all">
            {t('tracking.backToAccount')} <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

  return (
    <div className="bg-ayers-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4">{t('tracking.title')}</p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif italic font-bold mb-4">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-ayers-ink/50">{t('tracking.placedOn')} {formatDate(order.createdAt)}</p>
        </motion.div>

        {isCancelled && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={24} />
            <p className="font-bold text-red-700 mb-1">{order.status === 'CANCELLED' ? t('tracking.cancelled') : t('tracking.refunded')}</p>
            <p className="text-sm text-red-600/70">{t('tracking.cancelledDesc')}</p>
          </motion.div>
        )}

        {!isCancelled && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5 mb-8">
            <div className="relative">
              {ORDER_STEPS.map((step, i) => {
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                const StepIcon = step.icon;
                return (
                  <div key={step.status} className="flex items-start mb-8 last:mb-0">
                    <div className="flex flex-col items-center mr-6">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * i, type: 'spring', stiffness: 300 }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                          isCurrent ? "bg-ayers-gold text-white shadow-[0_0_20px_rgba(197,160,89,0.4)]" :
                          isActive ? "bg-ayers-gold/20 text-ayers-gold" : "bg-ayers-ink/5 text-ayers-ink/20"
                        )}
                      >
                        <StepIcon size={18} />
                      </motion.div>
                      {i < ORDER_STEPS.length - 1 && (
                        <div className={cn("w-[2px] h-12 mt-2 rounded-full transition-all", i < currentStep ? "bg-ayers-gold/30" : "bg-ayers-ink/5")} />
                      )}
                    </div>
                    <div className="pt-1.5 flex-1">
                      <h3 className={cn("font-bold text-sm uppercase tracking-widest mb-1", isActive ? "text-ayers-ink" : "text-ayers-ink/30")}>{step.label}</h3>
                      <p className={cn("text-xs", isCurrent ? "text-ayers-ink/60" : "text-ayers-ink/30")}>{step.description}</p>
                      {step.status === 'SHIPPED' && isActive && order.trackingNumber && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 bg-ayers-cream rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40">{t('tracking.trackingNumber')}</span>
                            <span className="font-mono text-sm font-bold">{order.trackingNumber}</span>
                          </div>
                          {order.carrier && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40">{t('tracking.carrier')}</span>
                              <span className="text-sm">{order.carrier}</span>
                            </div>
                          )}
                          {order.estimatedDelivery && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40">{t('tracking.estDelivery')}</span>
                              <span className="text-sm">{formatDate(order.estimatedDelivery)}</span>
                            </div>
                          )}
                          {order.trackingUrl && (
                            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-bold text-ayers-gold hover:opacity-70 transition-opacity mt-2">
                              {t('tracking.trackWithCarrier')} <ExternalLink size={12} className="ml-1" />
                            </a>
                          )}
                        </motion.div>
                      )}
                      {step.status === 'DELIVERED' && isActive && order.deliveredAt && (
                        <p className="text-xs text-green-600 mt-2 font-medium">{t('tracking.deliveredOn')} {formatDate(order.deliveredAt)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-sm border border-ayers-ink/5 mb-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-ayers-gold mb-6">{t('tracking.orderItems')}</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-ayers-ink/5 last:border-b-0 last:pb-0">
                <div className="w-16 h-16 bg-ayers-cream rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Package className="text-ayers-ink/20" size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.product.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ayers-ink/40">{t('checkout.qty')}: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold">NT$ {Number(item.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-ayers-ink/5 flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-widest">{t('tracking.total')}</span>
            <span className="text-xl font-serif italic font-bold text-ayers-gold">NT$ {Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap justify-center gap-4">
          <Link to="/account" className="inline-flex items-center bg-ayers-gold text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all">{t('tracking.backToAccount')}</Link>
          <Link to="/contact" className="inline-flex items-center bg-transparent border-2 border-ayers-ink/20 text-ayers-ink px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:border-ayers-gold hover:text-ayers-gold transition-all">{t('tracking.needHelp')}</Link>
        </motion.div>
      </div>
    </div>
  );
}
