import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user including password hash
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user || !(await user.validatePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Please contact support.', 403);
    }

    // Update last login timestamp
    await user.update({ last_login: new Date() });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/register  (admin only for creating staff/admin accounts)
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role = 'member', profile_image_url } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new AppError('Email already in use.', 409);
    }

    const user = await User.create({
      name,
      email,
      password_hash: password, // hashed by model hook
      role,
      profile_image_url: profile_image_url || null,
      is_active: true,
      last_login: null,
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required.', 400);

    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      throw new AppError('Invalid refresh token.', 401);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) throw new AppError('User not found.', 404);

    res.json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.scope('withPassword').findByPk(req.user!.id);
    if (!user) throw new AppError('User not found.', 404);

    const valid = await user.validatePassword(currentPassword);
    if (!valid) throw new AppError('Current password is incorrect.', 401);

    await user.update({ password_hash: newPassword });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
