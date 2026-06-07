import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', attendanceController.getAttendanceStats);
router.get('/', attendanceController.getAttendance);
router.post('/check-in', authorize('admin', 'staff'), attendanceController.checkIn);
router.put('/:id/check-out', authorize('admin', 'staff'), attendanceController.checkOut);

export default router;
