import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number; // Percentage (10 for 10%) or fixed amount (100 for ₹100)
  minimumOrderAmount: number;
  maximumDiscountAmount?: number; // For percentage coupons
  usageLimit: number; // Total times this coupon can be used
  usageCount: number; // Times this coupon has been used
  userUsageLimit: number; // Per user usage limit
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts: mongoose.Types.ObjectId[]; // Specific products (empty = all products)
  applicableCategories: string[]; // Specific categories (empty = all categories)
  applicableBrands: string[]; // Specific brands (empty = all brands)
  excludedProducts: mongoose.Types.ObjectId[]; // Excluded products
  firstTimeUser: boolean; // Only for first-time users
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  userUsageLimit: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    trim: true
  }],
  applicableBrands: [{
    type: String,
    trim: true
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  firstTimeUser: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Validation
couponSchema.pre('save', function(next) {
  // Ensure validUntil is after validFrom
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  }
  
  // For percentage coupons, value should be between 1-100
  if (this.type === 'percentage' && (this.value < 1 || this.value > 100)) {
    next(new Error('Percentage value must be between 1 and 100'));
  }
  
  // For fixed coupons, value should be positive
  if (this.type === 'fixed' && this.value <= 0) {
    next(new Error('Fixed discount value must be positive'));
  }
  
  // For free shipping coupons, value is not needed
  if (this.type === 'free_shipping') {
    this.value = 0;
  }
  
  next();
});

// Schema for tracking coupon usage by users
export interface ICouponUsage extends Document {
  couponId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  discountAmount: number;
  usedAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user-coupon combination
couponUsageSchema.index({ couponId: 1, userId: 1 });
couponUsageSchema.index({ orderId: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export const CouponUsage = mongoose.model<ICouponUsage>('CouponUsage', couponUsageSchema);
