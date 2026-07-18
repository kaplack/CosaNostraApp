import { Router } from 'express';
import {
  listAdminPaymentSettings,
  updateAdminPaymentSetting,
  uploadAdminPaymentQr,
} from '../controllers/paymentSettingController.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', listAdminPaymentSettings);
router.patch('/:method', updateAdminPaymentSetting);
router.post('/:method/qr', uploadImage.single('qrImage'), uploadAdminPaymentQr);

export default router;
