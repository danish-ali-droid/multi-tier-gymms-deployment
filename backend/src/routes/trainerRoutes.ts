import { Router } from 'express';
import * as trainerController from '../controllers/trainerController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', trainerController.getTrainers);
router.get('/:id', trainerController.getTrainerById);
router.post(
  '/',
  authorize('admin', 'staff'),
  upload.single('profile_image'),
  trainerController.createTrainer
);
router.put(
  '/:id',
  authorize('admin', 'staff'),
  upload.single('profile_image'),
  trainerController.updateTrainer
);
router.delete('/:id', authorize('admin'), trainerController.deleteTrainer);

export default router;
