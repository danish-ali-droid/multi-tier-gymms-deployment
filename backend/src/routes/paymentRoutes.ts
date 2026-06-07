import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', paymentController.getPaymentStats);
router.get('/', paymentController.getPayments);
router.post('/', authorize('admin', 'staff'), paymentController.createPayment);
router.put('/:id', authorize('admin', 'staff'), paymentController.updatePayment);

export default router;
