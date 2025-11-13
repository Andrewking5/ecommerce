import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();

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
            <XCircle size={80} className="mx-auto text-orange-500" />
          </motion.div>

          <h1 className="heading-1 mb-4">Payment Cancelled</h1>
          <p className="text-text-secondary mb-8">
            Your payment was cancelled. No charges have been made. You can try again or return to your cart.
          </p>

          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft className="mr-2" size={20} />
              Return to Cart
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default CheckoutCancel;

