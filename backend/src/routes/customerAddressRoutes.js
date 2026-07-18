import { Router } from 'express';
import {
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  updateMyAddress,
} from '../controllers/customerAddressController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('customer'));

router.get('/', listMyAddresses);
router.post('/', createMyAddress);
router.patch('/:id', updateMyAddress);
router.delete('/:id', deleteMyAddress);

export default router;
