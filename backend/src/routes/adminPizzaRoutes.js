import { Router } from 'express';
import {
  createAdminPizza,
  deleteAdminPizza,
  listAdminPizzas,
  updateAdminPizza,
  uploadAdminPizzaImage,
} from '../controllers/adminPizzaController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminPizzas);
router.post('/', createAdminPizza);
router.post('/:id/image', uploadImage.single('image'), uploadAdminPizzaImage);
router.patch('/:id', updateAdminPizza);
router.delete('/:id', deleteAdminPizza);

export default router;
