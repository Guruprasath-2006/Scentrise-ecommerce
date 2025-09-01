import { Router } from 'express';
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponStats
} from '../controllers/coupon.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

// Public routes (for validation during checkout)
router.post('/validate', auth, validateCoupon);

// Admin routes
router.post('/', adminAuth, createCoupon);
router.get('/', adminAuth, getAllCoupons);
router.get('/:id', adminAuth, getCouponById);
router.patch('/:id', adminAuth, updateCoupon);
router.delete('/:id', adminAuth, deleteCoupon);
router.get('/:id/stats', adminAuth, getCouponStats);

// Application routes (used during order processing)
router.post('/apply', auth, applyCoupon);

export default router;
