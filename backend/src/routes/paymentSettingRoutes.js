import { Router } from 'express';
import { listPaymentSettings } from '../controllers/paymentSettingController.js';

const router = Router();

router.get('/', listPaymentSettings);

export default router;
