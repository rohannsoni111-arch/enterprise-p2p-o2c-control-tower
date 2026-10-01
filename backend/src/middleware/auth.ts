import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, AuthenticatedUser, UserRole } from '../types';
import { AppError } from './errorHandler';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new AppError('Authentication token missing or invalid', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token', 401, 'TOKEN_EXPIRED'));
  }
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthenticated request', 401, 'UNAUTHORIZED'));
    }

    // ADMIN has global access to all operational modules
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied for role '${req.user.role}'. Required one of: [${allowedRoles.join(', ')}]`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
}
