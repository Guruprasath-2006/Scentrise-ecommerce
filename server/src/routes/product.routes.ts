import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { 
  getRecommendations, 
  getPersonalizedRecommendations, 
  getTrendingProducts, 
  getBoughtTogether 
} from '../controllers/recommendations.controller';
import { auth, adminAuth } from '../middleware/auth';

const router = Router();

// Product routes
router.get('/', getProducts);
router.get('/id/:id', getProductById);  // Route for getting by ID
router.get('/:slug', getProductBySlug); // Route for getting by slug (must come after specific routes)
router.post('/', adminAuth, createProduct);
router.patch('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

// Recommendation routes
router.get('/recommendations/:productId', getRecommendations);
router.get('/recommendations/personalized/:userId', auth, getPersonalizedRecommendations);
router.get('/recommendations/trending', getTrendingProducts);
router.get('/recommendations/bought-together/:productId', getBoughtTogether);

export default router;
