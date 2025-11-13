import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  return (
    <div className="container-apple py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6"
          >
            <CheckCircle size={80} className="mx-auto text-green-500" />
          </motion.div>

          <h1 className="heading-1 mb-4">Order Confirmed!</h1>
          <p className="text-text-secondary mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {orderId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-lg font-semibold font-mono">{orderId}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/user/orders')}
            >
              <Package className="mr-2" size={20} />
              View My Orders
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              You will receive an email confirmation shortly with your order details.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;

