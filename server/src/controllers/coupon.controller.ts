import { Request, Response } from 'express';
import { Coupon, CouponUsage, ICoupon } from '../models/Coupon';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user?.id
    };

    const coupon = new Coupon(couponData);
    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating coupon'
    });
  }
};

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, isActive, type, search } = req.query;
    
    const filter: any = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Coupon.countDocuments(filter);

    res.json({
      success: true,
      coupons,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons'
    });
  }
};

export const getCouponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id).populate('createdBy', 'name email');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon'
    });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating coupon'
    });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon'
    });
  }
};

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, cartItems, cartTotal } = req.body;
    const userId = req.user?.id;

    if (!code || !cartItems || cartTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired or is not yet active'
      });
    }

    // Check usage limits
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check user usage limit
    const userUsageCount = await CouponUsage.countDocuments({
      couponId: coupon._id,
      userId
    });

    if (userUsageCount >= coupon.userUsageLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the usage limit for this coupon'
      });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
      });
    }

    // Check first-time user requirement
    if (coupon.firstTimeUser) {
      const userOrderCount = await Order.countDocuments({ user: userId });
      if (userOrderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is only for first-time users'
        });
      }
    }

    // Calculate applicable cart items
    let applicableTotal = 0;
    const applicableItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      let isApplicable = true;

      // Check excluded products
      if (coupon.excludedProducts.length > 0 && 
          coupon.excludedProducts.some(id => id.toString() === (product._id as any).toString())) {
        isApplicable = false;
      }

      // Check applicable products (if specified)
      if (isApplicable && coupon.applicableProducts.length > 0 && 
          !coupon.applicableProducts.some(id => id.toString() === (product._id as any).toString())) {
        isApplicable = false;
      }

      // Check applicable categories (if specified)
      if (isApplicable && coupon.applicableCategories.length > 0 && 
          !coupon.applicableCategories.includes(product.family)) {
        isApplicable = false;
      }

      // Check applicable brands (if specified)
      if (isApplicable && coupon.applicableBrands.length > 0 && 
          !coupon.applicableBrands.includes(product.brand)) {
        isApplicable = false;
      }

      if (isApplicable) {
        applicableItems.push(item);
        applicableTotal += item.price * item.quantity;
      }
    }

    if (applicableTotal === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in your cart are eligible for this coupon'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    let freeShipping = false;

    switch (coupon.type) {
      case 'percentage':
        discountAmount = (applicableTotal * coupon.value) / 100;
        if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
          discountAmount = coupon.maximumDiscountAmount;
        }
        break;
      
      case 'fixed':
        discountAmount = Math.min(coupon.value, applicableTotal);
        break;
      
      case 'free_shipping':
        freeShipping = true;
        discountAmount = 0; // Shipping cost will be handled separately
        break;
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      discount: {
        couponId: coupon._id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        discountAmount: Math.round(discountAmount * 100) / 100,
        freeShipping,
        applicableItems: applicableItems.length,
        totalApplicableAmount: applicableTotal
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating coupon'
    });
  }
};

export const applyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId, orderId, discountAmount } = req.body;
    const userId = req.user?.id;

    // Record coupon usage
    const couponUsage = new CouponUsage({
      couponId,
      userId,
      orderId,
      discountAmount
    });

    await couponUsage.save();

    // Increment coupon usage count
    await Coupon.findByIdAndUpdate(couponId, {
      $inc: { usageCount: 1 }
    });

    res.json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying coupon'
    });
  }
};

export const getCouponStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Get usage statistics
    const usageStats = await CouponUsage.aggregate([
      { $match: { couponId: coupon._id } },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    const stats = usageStats[0] || {
      totalUsage: 0,
      totalDiscount: 0,
      uniqueUsers: []
    };

    // Get recent usage
    const recentUsage = await CouponUsage.find({ couponId: coupon._id })
      .populate('userId', 'name email')
      .populate('orderId', 'total orderDate')
      .sort({ usedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsage: stats.totalUsage,
        totalDiscount: stats.totalDiscount,
        uniqueUsers: stats.uniqueUsers.length,
        usageRate: coupon.usageLimit > 0 ? (stats.totalUsage / coupon.usageLimit * 100) : 0,
        recentUsage
      }
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon statistics'
    });
  }
};
