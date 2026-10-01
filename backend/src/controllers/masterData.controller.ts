import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendPaginated, sendSuccess } from '../utils/response';
import { logAudit } from '../middleware/audit';
import { AuthRequest } from '../types';

// ==========================================
// MATERIALS MASTER (SAP MM MM01/MM03)
// ==========================================

export async function getMaterials(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const plantId = (req.query.plantId as string) || '';
    const stockStatus = (req.query.stockStatus as string) || '';
    const sortBy = (req.query.sortBy as string) || 'materialNumber';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

    const where: any = {
      active: true,
      ...(search
        ? {
            OR: [
              { materialNumber: { contains: search } },
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
      ...(plantId ? { plantId } : {}),
    };

    const total = await prisma.material.count({ where });

    let materials = await prisma.material.findMany({
      where,
      include: {
        plant: { select: { id: true, code: true, name: true, city: true } },
        storageLocation: { select: { id: true, code: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    // Compute stock status tags dynamically
    const enriched = materials.map((m) => {
      let status = 'HEALTHY';
      if (m.currentStock < m.safetyStock) {
        status = 'LOW_STOCK';
      } else if (m.currentStock <= m.reorderLevel) {
        status = 'REORDER_RECOMMENDED';
      }
      return {
        ...m,
        stockStatus: status,
      };
    });

    const filtered = stockStatus ? enriched.filter((m) => m.stockStatus === stockStatus) : enriched;

    return sendPaginated(res, filtered, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getMaterialById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        plant: true,
        storageLocation: true,
        poItems: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { purchaseOrder: { select: { poNumber: true, status: true, orderDate: true } } },
        },
      },
    });

    if (!material) {
      throw new AppError(`Material not found with ID ${id}`, 404, 'MATERIAL_NOT_FOUND');
    }

    let stockStatus = 'HEALTHY';
    if (material.currentStock < material.safetyStock) {
      stockStatus = 'LOW_STOCK';
    } else if (material.currentStock <= material.reorderLevel) {
      stockStatus = 'REORDER_RECOMMENDED';
    }

    return sendSuccess(res, { ...material, stockStatus });
  } catch (err) {
    next(err);
  }
}

export async function createMaterial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      materialNumber,
      name,
      category,
      uom,
      plantId,
      storageLocationId,
      currentStock,
      safetyStock,
      reorderLevel,
      standardCost,
      sellingPrice,
      description,
    } = req.body;

    if (!materialNumber || !name || !category || !uom || !plantId) {
      throw new AppError('Mandatory material fields missing', 400, 'VALIDATION_ERROR');
    }

    const existing = await prisma.material.findUnique({ where: { materialNumber } });
    if (existing) {
      throw new AppError(`Material number '${materialNumber}' already exists`, 409, 'DUPLICATE_MATERIAL');
    }

    const material = await prisma.material.create({
      data: {
        materialNumber,
        name,
        category,
        uom,
        plantId,
        storageLocationId: storageLocationId || null,
        currentStock: parseFloat(currentStock || '0'),
        safetyStock: parseFloat(safetyStock || '0'),
        reorderLevel: parseFloat(reorderLevel || '0'),
        standardCost: parseFloat(standardCost || '0'),
        sellingPrice: parseFloat(sellingPrice || '0'),
        description,
      },
      include: { plant: true, storageLocation: true },
    });

    await logAudit({
      req,
      action: 'MATERIAL_CREATED',
      module: 'MASTER_DATA',
      documentType: 'MATERIAL',
      documentId: material.id,
      documentNumber: material.materialNumber,
      details: `Created new material ${material.materialNumber} (${material.name})`,
    });

    return sendSuccess(res, material, 201);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// VENDORS MASTER (SAP MM XK01/XK03)
// ==========================================

export async function getVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const paymentTerms = (req.query.paymentTerms as string) || '';
    const sortBy = (req.query.sortBy as string) || 'vendorNumber';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

    const where: any = {
      active: true,
      ...(search
        ? {
            OR: [
              { vendorNumber: { contains: search } },
              { name: { contains: search } },
              { contactPerson: { contains: search } },
            ],
          }
        : {}),
      ...(paymentTerms ? { paymentTerms } : {}),
    };

    const total = await prisma.vendor.count({ where });
    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        _count: {
          select: { purchaseOrders: true, supplierInvoices: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, vendors, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getVendorById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          take: 5,
          orderBy: { orderDate: 'desc' },
          select: { poNumber: true, totalAmount: true, status: true, orderDate: true },
        },
        _count: {
          select: { purchaseOrders: true, supplierInvoices: true },
        },
      },
    });

    if (!vendor) {
      throw new AppError(`Vendor not found with ID ${id}`, 404, 'VENDOR_NOT_FOUND');
    }

    return sendSuccess(res, vendor);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// CUSTOMERS MASTER (SAP SD XD01/XD03)
// ==========================================

export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const region = (req.query.region as string) || '';
    const sortBy = (req.query.sortBy as string) || 'customerNumber';
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

    const where: any = {
      active: true,
      ...(search
        ? {
            OR: [
              { customerNumber: { contains: search } },
              { name: { contains: search } },
              { contactPerson: { contains: search } },
            ],
          }
        : {}),
      ...(region ? { region } : {}),
    };

    const total = await prisma.customer.count({ where });
    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { salesOrders: true, customerInvoices: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    // Calculate credit utilization percentage
    const enriched = customers.map((c) => ({
      ...c,
      creditUtilizationPct: c.creditLimit > 0 ? Number(((c.currentBalance / c.creditLimit) * 100).toFixed(1)) : 0,
      creditRiskStatus: c.currentBalance >= c.creditLimit ? 'EXCEEDED' : c.currentBalance >= c.creditLimit * 0.85 ? 'HIGH_EXPOSURE' : 'HEALTHY',
    }));

    return sendPaginated(res, enriched, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          take: 5,
          orderBy: { orderDate: 'desc' },
          select: { soNumber: true, totalAmount: true, status: true, orderDate: true },
        },
        _count: {
          select: { salesOrders: true, customerInvoices: true },
        },
      },
    });

    if (!customer) {
      throw new AppError(`Customer not found with ID ${id}`, 404, 'CUSTOMER_NOT_FOUND');
    }

    const creditUtilizationPct = customer.creditLimit > 0 ? Number(((customer.currentBalance / customer.creditLimit) * 100).toFixed(1)) : 0;
    const creditRiskStatus = customer.currentBalance >= customer.creditLimit ? 'EXCEEDED' : customer.currentBalance >= customer.creditLimit * 0.85 ? 'HIGH_EXPOSURE' : 'HEALTHY';

    return sendSuccess(res, { ...customer, creditUtilizationPct, creditRiskStatus });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// ORGANIZATIONAL STRUCTURE
// ==========================================

export async function getPlants(req: Request, res: Response, next: NextFunction) {
  try {
    const plants = await prisma.plant.findMany({
      where: { active: true },
      include: {
        storageLocations: { where: { active: true } },
      },
      orderBy: { code: 'asc' },
    });

    return sendSuccess(res, plants);
  } catch (err) {
    next(err);
  }
}

export async function getOrgStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const [purchasingOrgs, salesOrgs, distChannels] = await Promise.all([
      prisma.purchasingOrg.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
      prisma.salesOrg.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
      prisma.distributionChannel.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
    ]);

    return sendSuccess(res, {
      purchasingOrgs,
      salesOrgs,
      distributionChannels: distChannels,
    });
  } catch (err) {
    next(err);
  }
}
