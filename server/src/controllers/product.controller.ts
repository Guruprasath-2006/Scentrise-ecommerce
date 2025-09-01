import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';

// Validation schemas
const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1, 'Slug is required'),
  brand: z.string().min(1, 'Brand is required'),
  gender: z.enum(['men', 'women', 'unisex']),
  family: z.enum(['citrus', 'floral', 'woody', 'oriental', 'fresh', 'gourmand']),
  notes: z.array(z.string()).min(1, 'At least one note is required'),
  description: z.string().min(1, 'Description is required').max(2000),
  price: z.number().min(0, 'Price cannot be negative'),
  mrp: z.number().min(0, 'MRP cannot be negative'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    publicId: z.string().optional(),
  })).min(1, 'At least one image is required'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  isFeatured: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      q,
      gender,
      family,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (q) {
      filter.$text = { $search: q as string };
    }

    if (gender && gender !== 'all') {
      filter.gender = gender;
    }

    if (family && family !== 'all') {
      filter.family = family;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'price':
        sortObj = { price: 1 };
        break;
      case '-price':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { ratingAvg: 1 };
        break;
      case '-rating':
        sortObj = { ratingAvg: -1 };
        break;
      case 'new':
        sortObj = { createdAt: 1 };
        break;
      case '-new':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Use pagination method from model
    const result = await Product.paginate(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: sortObj,
    });

    res.json({
      success: true,
      data: result.docs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = createProductSchema.parse(req.body);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: productData.slug });
    if (existingProduct) {
      res.status(400).json({
        success: false,
        message: 'Product with this slug already exists',
      });
      return;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update product
// @route   PATCH /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = updateProductSchema.parse(req.body);

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
