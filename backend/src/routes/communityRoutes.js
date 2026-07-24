import { Router } from 'express';
import { getPublicPizza } from '../controllers/communityController.js';

const router = Router();

router.get('/pizzas/:slug', getPublicPizza);

export default router;
