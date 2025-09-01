import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { env } from '../config/env';

// Validation schema
const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  localOrderId: z.string().min(1, 'Local order ID is required'),
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
// @access  Public (but secure with signature verification)
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, paymentId, signature, localOrderId } = verifyPaymentSchema.parse(req.body);

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
      return;
    }

    // Find and update order
    const order = await Order.findById(localOrderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check if order is already paid
    if (order.payment.status === 'captured') {
      res.status(400).json({
        success: false,
        message: 'Payment already captured',
      });
      return;
    }

    // Update order payment details
    order.payment.paymentId = paymentId;
    order.payment.signature = signature;
    order.payment.status = 'captured';
    order.status = 'confirmed';
    await order.save();

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order },
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
