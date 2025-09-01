import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

router.post('/', auth, createOrder);
router.get('/my', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/status', adminAuth, updateOrderStatus);

export default router;
