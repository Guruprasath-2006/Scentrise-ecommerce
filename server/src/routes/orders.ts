import { Router } from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  trackOrder, 
  updateOrderStatus, 
  cancelOrder 
} from '../controllers/orderController';
import { auth } from '../middleware/auth';

const router = Router();

// Public route for tracking orders
router.get('/track/:trackingId', trackOrder);

// Protected routes (require authentication)
router.post('/', auth, createOrder);
router.get('/', auth, getUserOrders);
router.get('/:orderId', auth, getOrderById);
router.patch('/:orderId/cancel', auth, cancelOrder);

// Admin routes (would need admin middleware in real app)
router.patch('/:orderId/status', updateOrderStatus);

export default router;
