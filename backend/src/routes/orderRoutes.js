import { Router } from 'express';
import {
  createOrder,
  getOrder,
  listMyOrders,
  updateOrder,
  uploadOrderPaymentProof,
} from '../controllers/orderController.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/requireAuth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/mine/list', requireAuth, requireRole('customer'), listMyOrders);
router.get('/:id', getOrder);
router.post(
  '/:id/payment-proof',
  uploadImage.single('paymentProof'),
  uploadOrderPaymentProof
);
router.patch('/:id', updateOrder);

export default router;
