import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Member, User, Payment } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { getFileUrl } from '../middleware/upload';

/**
 * GET /api/members
 */
export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, offset, page } = getPagination(req);
    const { status, membership_type, search } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (membership_type) where.membership_type = membership_type;

    const userWhere: Record<string, unknown> = {};
    if (search) {
      userWhere[Op.or as symbol] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Member.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profile_image_url', 'role'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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
 * GET /api/members/:id
 */
export const getMemberById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profile_image_url', 'createdAt'],
        },
        {
          model: Payment,
          as: 'payments',
          order: [['payment_date', 'DESC']],
          limit: 10,
        },
      ],
    });

    if (!member) throw new AppError('Member not found.', 404);

    res.json({ success: true, data: { member } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/members
 */
export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      membership_type,
      start_date,
      end_date,
      status,
      emergency_contact,
      health_notes,
    } = req.body;

    // Check email uniqueness
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already registered.', 409);

    // Handle profile image
    let profileImageUrl: string | null = null;
    if (req.file) {
      profileImageUrl = getFileUrl(req.file.filename, 'profiles');
    }

    // Create user account
    const user = await User.create({
      name,
      email,
      password_hash: password || 'ChangeMePlease123!',
      role: 'member',
      profile_image_url: profileImageUrl,
      is_active: true,
      last_login: null,
    });

    // Create member profile
    const member = await Member.create({
      user_id: user.id,
      membership_type,
      start_date,
      end_date,
      status: status || 'active',
      phone: phone || null,
      emergency_contact: emergency_contact || null,
      health_notes: health_notes || null,
    });

    const fullMember = await Member.findByPk(member.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url'] }],
    });

    res.status(201).json({
      success: true,
      message: 'Member created successfully.',
      data: { member: fullMember },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/members/:id
 */
export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }],
    });
    if (!member) throw new AppError('Member not found.', 404);

    const { name, email, phone, membership_type, start_date, end_date, status, health_notes } =
      req.body;

    // Handle profile image update
    let profileImageUrl: string | undefined;
    if (req.file) {
      profileImageUrl = getFileUrl(req.file.filename, 'profiles');
    }

    // Update user fields
    const userUpdates: Record<string, unknown> = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (profileImageUrl) userUpdates.profile_image_url = profileImageUrl;

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: member.user_id } });
    }

    // Update member fields
    await member.update({
      ...(membership_type && { membership_type }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(status && { status }),
      ...(phone !== undefined && { phone }),
      ...(health_notes !== undefined && { health_notes }),
    });

    const updated = await Member.findByPk(member.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url'] }],
    });

    res.json({ success: true, message: 'Member updated.', data: { member: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/members/:id
 */
export const deleteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) throw new AppError('Member not found.', 404);

    // Deactivate instead of hard delete for data integrity
    await User.update({ is_active: false }, { where: { id: member.user_id } });
    await member.update({ status: 'inactive' });

    res.json({ success: true, message: 'Member deactivated.' });
  } catch (error) {
    next(error);
  }
};
