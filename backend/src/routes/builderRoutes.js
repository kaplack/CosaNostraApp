import { Router } from 'express';
import {
  listBuilderIngredients,
  listBuilderPizzaSizes,
} from '../controllers/builderController.js';

const router = Router();

router.get('/sizes', listBuilderPizzaSizes);
router.get('/ingredients', listBuilderIngredients);

export default router;
