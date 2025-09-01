import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, totals } = req.body;
    
    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.qty}` 
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.user!._id,
      items: items.map((item: any) => ({
        product: item.product._id,
        qty: item.qty,
        priceAtPurchase: item.product.price
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total + (paymentMethod === 'cod' ? 25 : 0),
      payment: {
        provider: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'captured'
      },
      shippingAddress,
      status: paymentMethod === 'cod' ? 'pending' : 'confirmed'
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.qty } }
      );
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'title brand images slug')
      .populate('user', 'name email');

    res.status(201).json({ 
      message: 'Order created successfully', 
      order: populatedOrder 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user!._id })
      .populate('items.product', 'title brand images slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user!._id });

    res.json({
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get single order with tracking
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ 
      $or: [
        { _id: orderId },
        { orderId: orderId },
        { trackingId: orderId }
      ],
      user: req.user!._id 
    })
    .populate('items.product', 'title brand images slug')
    .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// Track order by tracking ID (public endpoint)
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    
    const order = await Order.findOne({ 
      $or: [
        { orderId: trackingId },
        { trackingId: trackingId }
      ]
    })
    .populate('items.product', 'title brand images')
    .select('orderId trackingId status statusHistory estimatedDelivery items shippingAddress createdAt');

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your tracking ID.' });
    }

    res.json({ 
      order: {
        orderId: order.orderId,
        trackingId: order.trackingId,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        itemCount: order.items.length,
        shippingCity: order.shippingAddress.city,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, message, location } = req.body;
    
    const order = await Order.findOne({ 
      $or: [{ _id: orderId }, { orderId: orderId }] 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    order.status = status;
    
    // Add custom status entry if message provided
    if (message) {
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        message,
        location
      });
    }

    await order.save();

    res.json({ 
      message: 'Order status updated successfully', 
      order: {
        orderId: order.orderId,
        status: order.status,
        trackingId: order.trackingId,
        statusHistory: order.statusHistory
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      $or: [{ _id: orderId }, { orderId: orderId }],
      user: req.user!._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.qty } }
      );
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      message: reason || 'Order cancelled by customer',
    });

    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};
