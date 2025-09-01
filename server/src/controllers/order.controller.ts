import { Response } from 'express';
import { z } from 'zod';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { emailService } from '../services/emailService';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || '',
  key_secret: env.RAZORPAY_KEY_SECRET || '',
});

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    qty: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one item is required'),
  addressId: z.string().min(1, 'Address ID is required'),
  provider: z.enum(['razorpay', 'stripe', 'cod']),
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, addressId, provider } = createOrderSchema.parse(req.body);
    const userId = req.user._id;

    // Find user address
    const userAddress = req.user.addresses.find((addr: any) => addr._id.toString() === addressId);
    if (!userAddress) {
      res.status(400).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    // Validate products and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
        return;
      }

      if (product.stock < item.qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}`,
        });
        return;
      }

      const itemTotal = product.price * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        qty: item.qty,
        priceAtPurchase: product.price,
      });
    }

    // Calculate shipping and tax
    const shipping = subtotal < 999 ? 49 : 0;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress: userAddress,
      payment: {
        provider,
        status: 'pending',
      },
    });

    // Handle payment based on provider
    if (provider === 'razorpay') {
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: total * 100, // Convert to paise
          currency: 'INR',
          receipt: uuidv4(),
          notes: {
            orderId: (order._id as any).toString(),
          },
        });

        order.payment.orderId = razorpayOrder.id;
        await order.save();

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: {
            order,
            payment: {
              keyId: env.RAZORPAY_KEY_ID,
              orderId: razorpayOrder.id,
              amount: total * 100,
              currency: 'INR',
            },
          },
        });
        return;
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Failed to create Razorpay order',
        });
        return;
      }
    } else if (provider === 'cod') {
      order.status = 'confirmed';
      order.payment.status = 'captured';
      await order.save();

      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.qty } }
        );
      }

      // Send order confirmation email (async, don't block response)
      const populatedOrder = await Order.findById(order._id).populate('items.product');
      emailService.sendOrderConfirmationEmail(
        req.user.email, 
        req.user.name, 
        populatedOrder
      ).catch((error: any) => {
        console.error('Failed to send order confirmation email:', error);
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order },
      });
    } else {
      await order.save();
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order },
      });
    }
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

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'title slug brand images price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.product', 'title slug brand images price');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.product', 'title slug brand images price');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
