import React, { useState } from 'react';
import { couponApi } from '@/services/coupons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CouponInputProps {
  onCouponApplied: (code: string, discountAmount: number) => void;
  onCouponRemoved: () => void;
  subtotal: number;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
}

const CouponInput: React.FC<CouponInputProps> = ({
  onCouponApplied,
  onCouponRemoved,
  subtotal,
  appliedCoupon,
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const result = await couponApi.validateCoupon(code.trim().toUpperCase(), subtotal);

      if (result.valid && result.coupon && result.discountAmount !== undefined) {
        onCouponApplied(result.coupon.code, result.discountAmount);
        toast.success(`Coupon "${result.coupon.code}" applied!`);
        setCode('');
      } else {
        toast.error(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    onCouponRemoved();
    toast.success('Coupon removed');
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <Check className="text-green-600" size={20} />
          <div>
            <p className="text-sm font-medium text-green-900">
              Coupon {appliedCoupon.code} applied
            </p>
            <p className="text-xs text-green-700">
              Save ${appliedCoupon.discountAmount.toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-600 hover:text-green-800 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label="Remove coupon"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Coupon code">
      <label htmlFor="coupon-code" className="block text-sm font-medium mb-2">
        Coupon Code
      </label>
      <div className="flex space-x-2">
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1"
          aria-label="Coupon code input"
          aria-describedby="coupon-helper"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleApply();
            }
          }}
        />
        <Button
          onClick={handleApply}
          variant="outline"
          disabled={isValidating || !code.trim()}
          loading={isValidating}
          aria-label="Apply coupon code"
        >
          {isValidating ? 'Validating...' : 'Apply'}
        </Button>
      </div>
      <p id="coupon-helper" className="mt-1 text-xs text-text-tertiary">
        Enter a valid coupon code to get a discount
      </p>
    </div>
  );
};

export default CouponInput;

