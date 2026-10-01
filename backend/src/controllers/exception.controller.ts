import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendPaginated, sendSuccess } from '../utils/response';
import { logAudit } from '../middleware/audit';
import { AuthRequest } from '../types';

export async function getExceptions(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const severity = (req.query.severity as string) || '';
    const category = (req.query.category as string) || '';
    const status = (req.query.status as string) || '';
    const ruleCode = (req.query.ruleCode as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { exceptionNumber: { contains: search } },
              { ruleName: { contains: search } },
              { sourceDocumentNumber: { contains: search } },
              { businessImpact: { contains: search } },
              { resolutionNotes: { contains: search } },
            ],
          }
        : {}),
      ...(severity ? { severity } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(ruleCode ? { ruleCode } : {}),
    };

    const total = await prisma.exceptionRecord.count({ where });
    const exceptions = await prisma.exceptionRecord.findMany({
      where,
      include: {
        rule: { select: { id: true, ruleCode: true, name: true, severity: true, recommendedAction: true } },
        assignedUser: { select: { id: true, username: true, fullName: true, role: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, exceptions, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getExceptionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const exception = await prisma.exceptionRecord.findUnique({
      where: { id },
      include: {
        rule: true,
        assignedUser: true,
      },
    });

    if (!exception) {
      throw new AppError(`Exception ${id} not found`, 404, 'EXCEPTION_NOT_FOUND');
    }

    return sendSuccess(res, exception);
  } catch (err) {
    next(err);
  }
}

export async function updateException(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, assignedUserId, resolutionNotes } = req.body;

    const exception = await prisma.exceptionRecord.findUnique({ where: { id } });
    if (!exception) {
      throw new AppError(`Exception ${id} not found`, 404, 'EXCEPTION_NOT_FOUND');
    }

    const isResolving = status === 'RESOLVED' && exception.status !== 'RESOLVED';

    const updated = await prisma.exceptionRecord.update({
      where: { id },
      data: {
        status: status || exception.status,
        assignedUserId: assignedUserId !== undefined ? assignedUserId : exception.assignedUserId,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : exception.resolutionNotes,
        resolvedAt: isResolving ? new Date() : exception.resolvedAt,
      },
      include: { rule: true, assignedUser: true },
    });

    await logAudit({
      req,
      action: isResolving ? 'EXCEPTION_RESOLVED' : 'EXCEPTION_UPDATED',
      module: 'EXCEPTION',
      documentType: 'EXCEPTION',
      documentId: updated.id,
      documentNumber: updated.exceptionNumber,
      previousStatus: exception.status,
      newStatus: updated.status,
      details: resolutionNotes || `Status updated from ${exception.status} to ${updated.status}`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function getBusinessRules(req: Request, res: Response, next: NextFunction) {
  try {
    const rules = await prisma.businessRule.findMany({
      include: {
        _count: {
          select: { exceptions: true },
        },
      },
      orderBy: { ruleCode: 'asc' },
    });

    return sendSuccess(res, rules);
  } catch (err) {
    next(err);
  }
}
