import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get product recommendations
// @route   GET /api/products/recommendations
// @access  Public
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, limit = 4 } = req.query;

    let recommendations;

    if (productId) {
      // Get similar products based on the current product
      const currentProduct = await Product.findById(productId);
      if (!currentProduct) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      // Find products with similar brand, gender, or fragrance family
      recommendations = await Product.find({
        _id: { $ne: productId },
        $or: [
          { brand: currentProduct.brand },
          { gender: currentProduct.gender },
          { family: currentProduct.family },
        ],
        stock: { $gt: 0 },
      })
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });

      // If not enough similar products, fill with popular products
      if (recommendations.length < Number(limit)) {
        const additionalProducts = await Product.find({
          _id: { $ne: productId, $nin: recommendations.map(p => p._id) },
          stock: { $gt: 0 },
        })
        .limit(Number(limit) - recommendations.length)
        .sort({ rating: -1, createdAt: -1 });

        recommendations = [...recommendations, ...additionalProducts];
      }
    } else {
      // Get general recommendations (popular/featured products)
      recommendations = await Product.find({
        stock: { $gt: 0 },
        $or: [
          { isFeatured: true },
          { rating: { $gte: 4.0 } },
        ],
      })
      .limit(Number(limit))
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 });
    }

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get personalized recommendations for logged-in user
// @route   GET /api/products/recommendations/personal
// @access  Private
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 6 } = req.query;
    const userId = req.user._id;

    // For now, this is a simplified recommendation system
    // In a real-world scenario, you'd analyze user's purchase history, wishlist, etc.
    
    // Get user's order history to understand preferences
    const { Order } = await import('../models/Order');
    const userOrders = await Order.find({ user: userId })
      .populate('items.product')
      .limit(10)
      .sort({ createdAt: -1 });

    let userPreferences = {
      brands: [] as string[],
      genders: [] as string[],
      families: [] as string[],
    };

    // Analyze user's purchase history
    userOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.product) {
          userPreferences.brands.push(item.product.brand);
          userPreferences.genders.push(item.product.gender);
          userPreferences.families.push(item.product.family);
        }
      });
    });

    // Get unique preferences
    userPreferences.brands = [...new Set(userPreferences.brands)];
    userPreferences.genders = [...new Set(userPreferences.genders)];
    userPreferences.families = [...new Set(userPreferences.families)];

    let recommendations;

    if (userPreferences.brands.length > 0 || userPreferences.genders.length > 0) {
      // Get products based on user preferences
      recommendations = await Product.find({
        stock: { $gt: 0 },
        $or: [
          { brand: { $in: userPreferences.brands } },
          { gender: { $in: userPreferences.genders } },
          { family: { $in: userPreferences.families } },
        ],
      })
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });
    } else {
      // User has no purchase history, show popular products
      recommendations = await Product.find({
        stock: { $gt: 0 },
        $or: [
          { isFeatured: true },
          { rating: { $gte: 4.0 } },
        ],
      })
      .limit(Number(limit))
      .sort({ isFeatured: -1, rating: -1 });
    }

    res.json({
      success: true,
      data: { 
        recommendations,
        basedOn: userOrders.length > 0 ? 'purchase_history' : 'popular_products'
      },
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 8 } = req.query;

    // Get products with high ratings and recent activity
    const trending = await Product.find({
      stock: { $gt: 0 },
    })
    .sort({ 
      rating: -1,
      reviewCount: -1,
      createdAt: -1 
    })
    .limit(Number(limit));

    res.json({
      success: true,
      data: { trending },
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Get frequently bought together products
// @route   GET /api/products/:id/bought-together
// @access  Public
export const getBoughtTogether = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    // This is a simplified implementation
    // In a real scenario, you'd analyze order data to find products frequently bought together
    
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // For now, return products from the same brand or category
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { brand: currentProduct.brand },
        { family: currentProduct.family },
      ],
      stock: { $gt: 0 },
      price: { 
        $gte: currentProduct.price * 0.5, 
        $lte: currentProduct.price * 1.5 
      },
    })
    .limit(Number(limit))
    .sort({ rating: -1 });

    res.json({
      success: true,
      data: { products: relatedProducts },
    });
  } catch (error) {
    console.error('Get bought together error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
