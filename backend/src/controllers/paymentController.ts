import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { sequelize, Payment, Member, User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/payments
 */
export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, offset, page } = getPagination(req);
    const { status, member_id, start_date, end_date } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (member_id) where.member_id = member_id;
    if (start_date || end_date) {
      where.payment_date = {
        ...(start_date && { [Op.gte]: start_date }),
        ...(end_date && { [Op.lte]: end_date }),
      };
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
      limit,
      offset,
      order: [['payment_date', 'DESC']],
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
 * POST /api/payments
 */
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { member_id, amount, payment_date, due_date, status, payment_method, description } =
      req.body;

    const member = await Member.findByPk(member_id);
    if (!member) throw new AppError('Member not found.', 404);

    const payment = await Payment.create({
      member_id,
      amount: parseFloat(amount),
      payment_date: payment_date || new Date(),
      due_date: due_date || null,
      status: status || 'completed',
      payment_method: payment_method || 'cash',
      description: description || null,
      transaction_id: `TXN-${uuidv4().split('-')[0].toUpperCase()}`,
    });

    const fullPayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Member,
          as: 'member',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded.',
      data: { payment: fullPayment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/payments/:id
 */
export const updatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) throw new AppError('Payment not found.', 404);

    const { status, amount, description } = req.body;

    await payment.update({
      ...(status && { status }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(description !== undefined && { description }),
    });

    res.json({ success: true, message: 'Payment updated.', data: { payment } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/stats
 */
export const getPaymentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [totalRevenue, monthlyRevenue, pendingCount, completedCount] = await Promise.all([
      Payment.sum('amount', { where: { status: 'completed' } }),
      Payment.sum('amount', {
        where: {
          status: 'completed',
          payment_date: {
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      Payment.count({ where: { status: 'pending' } }),
      Payment.count({ where: { status: 'completed' } }),
    ]);

    // Monthly revenue for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyData = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('payment_date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: {
        status: 'completed',
        payment_date: { [Op.gte]: sixMonthsAgo },
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('payment_date'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('payment_date')), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingCount,
        completedCount,
        monthlyData,
      },
    });
  } catch (error) {
    next(error);
  }
};
