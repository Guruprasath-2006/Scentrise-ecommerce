import { Router } from 'express';
import { verifyRazorpayPayment } from '../controllers/payment.controller';

const router = Router();

router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
