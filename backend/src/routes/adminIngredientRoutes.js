import { Router } from 'express';
import {
  createAdminIngredient,
  listAdminIngredients,
  updateAdminIngredient,
  uploadAdminIngredientImage,
} from '../controllers/adminIngredientController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminIngredients);
router.post('/', createAdminIngredient);
router.post('/:id/image', uploadImage.single('image'), uploadAdminIngredientImage);
router.patch('/:id', updateAdminIngredient);

export default router;
