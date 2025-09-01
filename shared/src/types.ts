export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  addresses: IAddress[];
  createdAt: Date;
}

export interface IAddress {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  brand: string;
  gender: 'men' | 'women' | 'unisex';
  family: 'citrus' | 'floral' | 'woody' | 'oriental' | 'fresh' | 'gourmand';
  notes: string[];
  description: string;
  price: number;
  mrp: number;
  images: {
    url: string;
    publicId?: string;
  }[];
  stock: number;
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  createdAt: Date;
}

export interface IOrderItem {
  product: IProduct;
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

export interface IOrder {
  _id: string;
  user: string | IUser;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment: IPayment;
  shippingAddress: IAddress;
  createdAt: Date;
}

export interface CartItem {
  product: IProduct;
  qty: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  q?: string;
  gender?: string;
  family?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'rating' | 'new' | '-price' | '-rating' | '-new';
  page?: number;
  limit?: number;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
