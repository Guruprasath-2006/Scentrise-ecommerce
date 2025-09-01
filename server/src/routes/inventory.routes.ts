import { Router } from 'express';
import {
  getInventoryReport,
  updateStock,
  bulkUpdateStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getStockMovementHistory,
  generateRestockSuggestions
} from '../controllers/inventory.controller';
import { adminAuth, auth } from '../middleware/auth';

const router = Router();

// All inventory routes require authentication
router.use(auth);

// Inventory reporting
router.get('/report', adminAuth, getInventoryReport);
router.get('/low-stock', adminAuth, getLowStockProducts);
router.get('/out-of-stock', adminAuth, getOutOfStockProducts);
router.get('/restock-suggestions', adminAuth, generateRestockSuggestions);

// Stock management
router.patch('/:productId/stock', adminAuth, updateStock);
router.patch('/bulk-update', adminAuth, bulkUpdateStock);

// Stock history
router.get('/:productId/history', adminAuth, getStockMovementHistory);

export default router;
