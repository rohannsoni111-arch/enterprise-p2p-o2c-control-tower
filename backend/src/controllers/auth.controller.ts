import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400, 'INVALID_CREDENTIALS');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.active) {
      throw new AppError('Invalid username or account deactivated', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid password', 401, 'INVALID_CREDENTIALS');
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    return sendSuccess(res, {
      token,
      user: tokenPayload,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function getPersonas(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
      },
      orderBy: { username: 'asc' },
    });

    return sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
}
