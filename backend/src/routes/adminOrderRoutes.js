import { Router } from 'express';
import {
  getAdminOrder,
  listAdminOrders,
  updateAdminPaymentStatus,
  updateAdminOrderStatus,
} from '../controllers/adminOrderController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminOrders);
router.get('/:id', getAdminOrder);
router.patch('/:id/status', updateAdminOrderStatus);
router.patch('/:id/payment-status', updateAdminPaymentStatus);

export default router;
