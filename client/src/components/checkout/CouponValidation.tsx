import React, { useState } from 'react';
import { Tag, Percent, Gift, Truck, X } from 'lucide-react';

interface CouponValidationProps {
  onCouponApply: (discount: any) => void;
  cartTotal: number;
  cartItems: any[];
  className?: string;
}

const CouponValidation: React.FC<CouponValidationProps> = ({
  onCouponApply,
  cartTotal,
  cartItems,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [availableCoupons] = useState([
    {
      code: 'WELCOME10',
      description: 'Get 10% off on your first order',
      type: 'percentage',
      value: 10,
      minimumOrderAmount: 500,
      firstTimeUser: true
    },
    {
      code: 'SAVE500',
      description: 'Save ₹500 on orders above ₹2000',
      type: 'fixed',
      value: 500,
      minimumOrderAmount: 2000,
      firstTimeUser: false
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      type: 'free_shipping',
      value: 0,
      minimumOrderAmount: 0,
      firstTimeUser: false
    }
  ]);

  const validateCoupon = async (code: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          code: code.toUpperCase(),
          cartItems,
          cartTotal
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon(data.discount);
        onCouponApply(data.discount);
        setCouponCode('');
      } else {
        setError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim());
    }
  };

  const handleQuickApply = (code: string) => {
    validateCoupon(code);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    onCouponApply(null);
    setError('');
  };

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed':
        return <Gift className="w-4 h-4" />;
      case 'free_shipping':
        return <Truck className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getDiscountText = (coupon: any) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `₹${coupon.value} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'DISCOUNT';
    }
  };

  const isEligibleForCoupon = (coupon: any) => {
    return cartTotal >= coupon.minimumOrderAmount;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                {getCouponIcon(appliedCoupon.type)}
              </div>
              <div>
                <h4 className="font-medium text-green-800">Coupon Applied!</h4>
                <p className="text-sm text-green-600">
                  {appliedCoupon.code} - {appliedCoupon.description}
                </p>
                <p className="text-sm font-medium text-green-800">
                  You saved ₹{appliedCoupon.discountAmount}
                  {appliedCoupon.freeShipping && ' + Free Shipping'}
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input Form */}
      {!appliedCoupon && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-800 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Apply Coupon
          </h3>

          <form onSubmit={handleApplyCoupon} className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Available Coupons */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Available Offers</h4>
            <div className="space-y-2">
              {availableCoupons.map((coupon) => {
                const isEligible = isEligibleForCoupon(coupon);
                return (
                  <div
                    key={coupon.code}
                    className={`p-3 border rounded-lg transition-all ${
                      isEligible
                        ? 'border-purple-200 bg-purple-50 cursor-pointer hover:bg-purple-100'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    onClick={isEligible ? () => handleQuickApply(coupon.code) : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          isEligible ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {getCouponIcon(coupon.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{coupon.code}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              isEligible 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getDiscountText(coupon)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{coupon.description}</p>
                          {coupon.minimumOrderAmount > 0 && (
                            <p className="text-xs text-gray-500">
                              Min order: ₹{coupon.minimumOrderAmount}
                              {!isEligible && (
                                <span className="text-red-500 ml-1">
                                  (Add ₹{coupon.minimumOrderAmount - cartTotal} more)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      {isEligible && (
                        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors">
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponValidation;
