import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { sequelize, User, Member, Trainer, Payment, Attendance } from '../models';

/**
 * GET /api/dashboard/stats
 * Returns all stats needed for the dashboard in a single request
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalMembers,
      activeMembers,
      totalTrainers,
      pendingPayments,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      todayAttendance,
    ] = await Promise.all([
      Member.count(),
      Member.count({ where: { status: 'active' } }),
      Trainer.count({ where: { is_available: true } }),
      Payment.count({ where: { status: 'pending' } }),
      Payment.sum('amount', { where: { status: 'completed' } }),
      Payment.sum('amount', {
        where: { status: 'completed', payment_date: { [Op.gte]: thisMonthStart } },
      }),
      Payment.sum('amount', {
        where: {
          status: 'completed',
          payment_date: { [Op.gte]: lastMonthStart, [Op.lt]: thisMonthStart },
        },
      }),
      Attendance.count({ where: { check_in: { [Op.gte]: todayStart } } }),
    ]);

    // Revenue trend for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueByMonth = await Payment.findAll({
      attributes: [
        [sequelize.fn('TO_CHAR', sequelize.col('payment_date'), 'YYYY-MM'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      ],
      where: {
        status: 'completed',
        payment_date: { [Op.gte]: sixMonthsAgo },
      },
      group: [sequelize.fn('TO_CHAR', sequelize.col('payment_date'), 'YYYY-MM')],
      order: [[sequelize.fn('TO_CHAR', sequelize.col('payment_date'), 'YYYY-MM'), 'ASC']],
      raw: true,
    });

    // Membership distribution
    const membershipDist = await Member.findAll({
      attributes: [
        'membership_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['membership_type'],
      raw: true,
    });

    // New members by month (last 6 months)
    const newMembersByMonth = await Member.findAll({
      attributes: [
        [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM')],
      order: [[sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM'), 'ASC']],
      raw: true,
    });

    // Recent payments
    const recentPayments = await Payment.findAll({
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['name', 'email', 'profile_image_url'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Expiring memberships (next 7 days)
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const expiringMembers = await Member.findAll({
      where: {
        status: 'active',
        end_date: { [Op.gte]: now, [Op.lte]: in7Days },
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'profile_image_url'] }],
      order: [['end_date', 'ASC']],
      limit: 5,
    });

    const revenueGrowth =
      lastMonthRevenue && lastMonthRevenue > 0
        ? (((monthlyRevenue || 0) - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalMembers,
          activeMembers,
          totalTrainers,
          pendingPayments,
          totalRevenue: totalRevenue || 0,
          monthlyRevenue: monthlyRevenue || 0,
          revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
          todayAttendance,
        },
        charts: {
          revenueByMonth,
          membershipDist,
          newMembersByMonth,
        },
        recent: {
          payments: recentPayments,
          expiringMembers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
