import { Router } from 'express';
import {
  getPublicCreator,
  getPublicPizza,
  listPublicPizzas,
} from '../controllers/communityController.js';

const router = Router();

router.get('/pizzas', listPublicPizzas);
router.get('/pizzas/:slug', getPublicPizza);
router.get('/creators/:slug', getPublicCreator);

export default router;
