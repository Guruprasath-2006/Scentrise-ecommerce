import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  getAddresses 
} from '../controllers/user.controller';
import { auth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;
