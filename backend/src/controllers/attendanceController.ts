import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Attendance, Member, User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';

/**
 * GET /api/attendance
 */
export const getAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, offset, page } = getPagination(req);
    const { member_id, date } = req.query;

    const where: Record<string, unknown> = {};
    if (member_id) where.member_id = member_id;
    if (date) {
      const day = new Date(date as string);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.check_in = { [Op.gte]: day, [Op.lt]: nextDay };
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url'] }],
        },
      ],
      limit,
      offset,
      order: [['check_in', 'DESC']],
    });

    res.json({
      success: true,
      ...buildPaginatedResponse(rows, count, { limit, offset, page }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/attendance/check-in
 */
export const checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { member_id } = req.body;

    const member = await Member.findByPk(member_id);
    if (!member) throw new AppError('Member not found.', 404);
    if (member.status !== 'active') throw new AppError('Member membership is not active.', 400);

    // Check for open session
    const openSession = await Attendance.findOne({
      where: { member_id, check_out: null },
    });
    if (openSession) throw new AppError('Member already checked in.', 409);

    const attendance = await Attendance.create({ member_id, check_in: new Date() });

    res.status(201).json({
      success: true,
      message: 'Check-in recorded.',
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/attendance/:id/check-out
 */
export const checkOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) throw new AppError('Attendance record not found.', 404);
    if (attendance.check_out) throw new AppError('Already checked out.', 400);

    await attendance.update({ check_out: new Date() });

    res.json({ success: true, message: 'Check-out recorded.', data: { attendance } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/attendance/stats
 */
export const getAttendanceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCount, weekCount] = await Promise.all([
      Attendance.count({ where: { check_in: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
      Attendance.count({
        where: {
          check_in: {
            [Op.gte]: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: { todayCount, weekCount, averageDaily: Math.round(weekCount / 7) },
    });
  } catch (error) {
    next(error);
  }
};
