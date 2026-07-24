import { Router } from 'express';
import {
  createAdminIngredient,
  listAdminIngredients,
  updateAdminIngredient,
  uploadAdminIngredientImage,
  uploadAdminIngredientSelectorImage,
} from '../controllers/adminIngredientController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminIngredients);
router.post('/', createAdminIngredient);
router.post('/:id/image', uploadImage.single('image'), uploadAdminIngredientImage);
router.post(
  '/:id/selector-image',
  uploadImage.single('image'),
  uploadAdminIngredientSelectorImage
);
router.patch('/:id', updateAdminIngredient);

export default router;
