import mongoose, { Document, Schema, Query } from 'mongoose';

export interface IProduct extends Document {
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

export interface IProductModel extends mongoose.Model<IProduct> {
  paginate(filter: any, options: { page?: number; limit?: number; sort?: any }): Promise<{
    docs: IProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['men', 'women', 'unisex'],
  },
  family: {
    type: String,
    required: [true, 'Fragrance family is required'],
    enum: ['citrus', 'floral', 'woody', 'oriental', 'fresh', 'gourmand'],
  },
  notes: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative'],
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
  }],
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
productSchema.index({ title: 'text', brand: 'text' });
productSchema.index({ gender: 1, family: 1, price: 1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });

// Static method for pagination
productSchema.statics.paginate = function(
  filter: any = {},
  options: { page?: number; limit?: number; sort?: any } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 12;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  return Promise.all([
    this.find(filter).sort(sort).skip(skip).limit(limit),
    this.countDocuments(filter),
  ]).then(([docs, total]) => ({
    docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }));
};

export const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema);
