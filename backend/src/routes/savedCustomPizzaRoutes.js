import { Router } from 'express';
import {
  createMySavedPizza,
  deleteMySavedPizza,
  listMySavedPizzas,
  updateMySavedPizza,
  updateMySavedPizzaPublication,
} from '../controllers/savedCustomPizzaController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('customer'));

router.get('/', listMySavedPizzas);
router.post('/', createMySavedPizza);
router.patch('/:id', updateMySavedPizza);
router.patch('/:id/publication', updateMySavedPizzaPublication);
router.delete('/:id', deleteMySavedPizza);

export default router;
