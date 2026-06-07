import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Trainer, User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginatedResponse } from '../utils/pagination';
import { getFileUrl } from '../middleware/upload';

/**
 * GET /api/trainers
 */
export const getTrainers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit, offset, page } = getPagination(req);
    const { search, is_available } = req.query;

    const where: Record<string, unknown> = {};
    if (is_available !== undefined) where.is_available = is_available === 'true';

    const userWhere: Record<string, unknown> = {};
    if (search) {
      userWhere[Op.or as symbol] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Trainer.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'profile_image_url'],
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
 * GET /api/trainers/:id
 */
export const getTrainerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainer = await Trainer.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url', 'createdAt'] }],
    });

    if (!trainer) throw new AppError('Trainer not found.', 404);

    res.json({ success: true, data: { trainer } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trainers
 */
export const createTrainer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      experience_years,
      bio,
      certifications,
      hourly_rate,
    } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already registered.', 409);

    let profileImageUrl: string | null = null;
    if (req.file) {
      profileImageUrl = getFileUrl(req.file.filename, 'trainers');
    }

    const user = await User.create({
      name,
      email,
      password_hash: password || 'ChangeMePlease123!',
      role: 'trainer',
      profile_image_url: profileImageUrl,
      is_active: true,
      last_login: null,
    });

    const specializationArr = Array.isArray(specialization)
      ? specialization
      : (specialization || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const certificationsArr = Array.isArray(certifications)
      ? certifications
      : (certifications || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const trainer = await Trainer.create({
      user_id: user.id,
      specialization: specializationArr,
      experience_years: parseInt(experience_years, 10) || 0,
      bio: bio || null,
      certifications: certificationsArr,
      hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
      is_available: true,
    });

    const fullTrainer = await Trainer.findByPk(trainer.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url'] }],
    });

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully.',
      data: { trainer: fullTrainer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/trainers/:id
 */
export const updateTrainer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) throw new AppError('Trainer not found.', 404);

    const { name, email, specialization, experience_years, bio, certifications, hourly_rate, is_available } =
      req.body;

    let profileImageUrl: string | undefined;
    if (req.file) {
      profileImageUrl = getFileUrl(req.file.filename, 'trainers');
    }

    const userUpdates: Record<string, unknown> = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (profileImageUrl) userUpdates.profile_image_url = profileImageUrl;

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: trainer.user_id } });
    }

    const specializationArr = specialization
      ? Array.isArray(specialization)
        ? specialization
        : specialization.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    await trainer.update({
      ...(specializationArr && { specialization: specializationArr }),
      ...(experience_years !== undefined && { experience_years: parseInt(experience_years, 10) }),
      ...(bio !== undefined && { bio }),
      ...(certifications !== undefined && {
        certifications: Array.isArray(certifications)
          ? certifications
          : certifications.split(',').map((s: string) => s.trim()).filter(Boolean),
      }),
      ...(hourly_rate !== undefined && { hourly_rate: parseFloat(hourly_rate) }),
      ...(is_available !== undefined && { is_available: is_available === 'true' || is_available === true }),
    });

    const updated = await Trainer.findByPk(trainer.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'profile_image_url'] }],
    });

    res.json({ success: true, message: 'Trainer updated.', data: { trainer: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trainers/:id
 */
export const deleteTrainer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) throw new AppError('Trainer not found.', 404);

    await User.update({ is_active: false }, { where: { id: trainer.user_id } });
    await trainer.update({ is_available: false });

    res.json({ success: true, message: 'Trainer deactivated.' });
  } catch (error) {
    next(error);
  }
};
