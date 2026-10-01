import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'enterprise_control_tower_jwt_super_secure_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  defaultPriceTolerancePct: parseFloat(process.env.DEFAULT_PRICE_TOLERANCE_PCT || '2.0'),
  defaultDeliveryTolerancePct: parseFloat(process.env.DEFAULT_DELIVERY_TOLERANCE_PCT || '5.0'),
};

// Singleton Prisma instance
export const prisma = new PrismaClient();
