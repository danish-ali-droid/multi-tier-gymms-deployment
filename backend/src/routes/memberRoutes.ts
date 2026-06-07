import { Router } from 'express';
import * as memberController from '../controllers/memberController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All member routes require authentication
router.use(authenticate);

router.get('/', memberController.getMembers);
router.get('/:id', memberController.getMemberById);
router.post(
  '/',
  authorize('admin', 'staff'),
  upload.single('profile_image'),
  memberController.createMember
);
router.put(
  '/:id',
  authorize('admin', 'staff'),
  upload.single('profile_image'),
  memberController.updateMember
);
router.delete('/:id', authorize('admin'), memberController.deleteMember);

export default router;
