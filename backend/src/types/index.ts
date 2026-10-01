import { Request } from 'express';

export type UserRole = 'ADMIN' | 'PROCUREMENT' | 'WAREHOUSE' | 'FINANCE' | 'SALES' | 'MANAGEMENT';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface RuleEvaluationResult {
  ruleCode: string;
  ruleName: string;
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  businessImpact: string;
  expectedValue: string;
  actualValue: string;
  variance: string;
  recommendedAction: string;
}
