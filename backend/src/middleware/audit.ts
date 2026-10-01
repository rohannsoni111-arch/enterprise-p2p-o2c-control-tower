import { prisma, config } from '../config';
import { AuthRequest } from '../types';

export interface AuditParams {
  req?: AuthRequest;
  username?: string;
  role?: string;
  action: string;
  module: 'P2P' | 'O2C' | 'MASTER_DATA' | 'EXCEPTION' | 'SYSTEM';
  documentType: string;
  documentId: string;
  documentNumber: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string;
}

export async function logAudit(params: AuditParams) {
  if (!config.enableAuditLogging) return;

  try {
    const user = params.req?.user;
    const ipAddress = params.req?.ip || params.req?.socket?.remoteAddress || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        username: user?.username || params.username || 'system',
        role: user?.role || params.role || 'SYSTEM',
        action: params.action,
        module: params.module,
        documentType: params.documentType,
        documentId: params.documentId,
        documentNumber: params.documentNumber,
        previousStatus: params.previousStatus || null,
        newStatus: params.newStatus || null,
        details: params.details || null,
        ipAddress: String(ipAddress),
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
