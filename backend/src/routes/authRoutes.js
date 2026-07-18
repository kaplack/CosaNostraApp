import { Router } from 'express';
import { login, me, registerCustomer } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/login', login);
router.post('/register', registerCustomer);
router.get('/me', requireAuth, me);

export default router;
