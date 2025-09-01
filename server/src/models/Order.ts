import mongoose, { Document, Schema } from 'mongoose';
import { IAddress } from './User';
import { IProduct } from './Product';

export interface IOrderItem {
  product: mongoose.Types.ObjectId | IProduct;
  qty: number;
  priceAtPurchase: number;
}

export interface IPayment {
  provider: 'razorpay' | 'stripe' | 'cod';
  orderId?: string;
  paymentId?: string;
  signature?: string;
  status: 'pending' | 'captured' | 'failed';
}

export interface IOrderStatus {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: Date;
  message: string;
  location?: string;
}

export interface IOrder extends Document {
  orderId: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: IOrderStatus[];
  estimatedDelivery: Date;
  trackingId?: string;
  payment: IPayment;
  shippingAddress: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
});

const paymentSchema = new Schema<IPayment>({
  provider: {
    type: String,
    required: true,
    enum: ['razorpay', 'stripe', 'cod'],
  },
  orderId: String,
  paymentId: String,
  signature: String,
  status: {
    type: String,
    enum: ['pending', 'captured', 'failed'],
    default: 'pending',
  },
});

const addressSchema = new Schema<IAddress>({
  label: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
});

const orderStatusSchema = new Schema<IOrderStatus>({
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  location: { type: String }
});

const orderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `SC${Date.now()}${Math.floor(Math.random() * 1000)}`
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  shipping: {
    type: Number,
    required: true,
    min: [0, 'Shipping cannot be negative'],
    default: 0,
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [orderStatusSchema],
  estimatedDelivery: { 
    type: Date, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  trackingId: { type: String },
  payment: paymentSchema,
  shippingAddress: addressSchema,
}, {
  timestamps: true
});

// Generate tracking ID when order is shipped
orderSchema.pre('save', function(next) {
  if (this.status === 'shipped' && !this.trackingId) {
    this.trackingId = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const statusMessages = {
      pending: 'Order received and awaiting confirmation',
      confirmed: 'Order confirmed and payment processed',
      processing: 'Order is being prepared for shipment',
      shipped: 'Order has been shipped and is on its way',
      delivered: 'Order has been successfully delivered',
      cancelled: 'Order has been cancelled'
    };

    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      message: statusMessages[this.status],
      location: this.status === 'shipped' ? 'Warehouse - Mumbai' : undefined
    });
  }
  next();
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ trackingId: 1 });
orderSchema.index({ 'payment.orderId': 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
