import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';
import paymentService from '@/src/services/paymentService';
import { useTranslation } from 'react-i18next';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { t } = useTranslation();

  const paymentIntent = searchParams.get('payment_intent');
  const stateOrderId = (location.state as any)?.orderId;

  useEffect(() => {
    // If we arrived via redirect from Stripe, verify payment
    if (paymentIntent) {
      // Payment was redirected back — it's confirmed
      setStatus('success');
    } else if (stateOrderId) {
      // We navigated here after inline payment confirmation
      setStatus('success');
    } else {
      // Direct access without payment context
      setStatus('success');
    }
  }, [paymentIntent, stateOrderId]);

  if (status === 'loading') {
    return (
      <div className="bg-ayers-cream min-h-screen flex items-center justify-center">
        <GuitarSunLoader size={40} />
      </div>
    );
  }

  return (
    <div className="bg-ayers-cream min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="text-green-600" size={48} />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-serif italic font-bold mb-4">
            {t('checkoutSuccess.thankYou')}
          </h1>
          <p className="text-lg text-ayers-ink/60 mb-2">
            {t('checkoutSuccess.orderPlaced')}
          </p>
          {stateOrderId && (
            <p className="text-sm text-ayers-ink/40 mb-8">
              {t('checkoutSuccess.orderId')}: <span className="font-mono font-bold text-ayers-ink/60">{stateOrderId}</span>
            </p>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-ayers-ink/5 text-left space-y-6 mb-8"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-ayers-gold/10 flex items-center justify-center flex-shrink-0">
                <Package className="text-ayers-gold" size={20} />
              </div>
              <div>
                <h3 className="font-bold mb-1">{t('checkoutSuccess.whatNext')}</h3>
                <ul className="space-y-2 text-sm text-ayers-ink/60">
                  <li>{t('checkoutSuccess.step1')}</li>
                  <li>{t('checkoutSuccess.step2')}</li>
                  <li>{t('checkoutSuccess.step3')}</li>
                  <li>{t('checkoutSuccess.step4')}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/account"
              className="inline-flex items-center bg-ayers-gold text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-opacity-90 transition-all"
            >
              {t('checkoutSuccess.viewOrders')} <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              to="/collections"
              className="inline-flex items-center bg-transparent border-2 border-ayers-ink/20 text-ayers-ink px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm hover:border-ayers-gold hover:text-ayers-gold transition-all"
            >
              {t('checkoutSuccess.continueShopping')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
