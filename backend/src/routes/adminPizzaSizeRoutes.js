import { Router } from 'express';
import {
  createAdminPizzaSize,
  listAdminPizzaSizes,
  updateAdminPizzaSize,
} from '../controllers/adminPizzaSizeController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminPizzaSizes);
router.post('/', createAdminPizzaSize);
router.patch('/:id', updateAdminPizzaSize);

export default router;
