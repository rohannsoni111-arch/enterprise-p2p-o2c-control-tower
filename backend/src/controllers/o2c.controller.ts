import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendPaginated, sendSuccess } from '../utils/response';
import { logAudit } from '../middleware/audit';
import { BusinessRuleEngine } from '../rules/ruleEngine';
import { AuthRequest } from '../types';

// ==========================================
// 1. CUSTOMER INQUIRIES (INQ)
// ==========================================

export async function getCustomerInquiries(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'inquiryDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { inqNumber: { contains: search } },
              { customer: { name: { contains: search } } },
              { notes: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const total = await prisma.customerInquiry.count({ where });
    const inqs = await prisma.customerInquiry.findMany({
      where,
      include: {
        customer: { select: { id: true, customerNumber: true, name: true, region: true } },
        salesOrg: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            material: { select: { id: true, materialNumber: true, name: true, uom: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, inqs, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerInquiryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const inq = await prisma.customerInquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrg: true,
        items: { include: { material: true } },
        salesOrders: { select: { id: true, soNumber: true, status: true, totalAmount: true } },
      },
    });

    if (!inq) {
      throw new AppError(`Customer Inquiry ${id} not found`, 404, 'INQUIRY_NOT_FOUND');
    }

    return sendSuccess(res, inq);
  } catch (err) {
    next(err);
  }
}

export async function createCustomerInquiry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { customerId, salesOrgId, items, validUntil, notes } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Inquiry must contain a valid Customer and line items', 400, 'VALIDATION_ERROR');
    }

    const count = await prisma.customerInquiry.count();
    const inqNumber = `INQ-${10000 + count + 1}`;

    const inq = await prisma.customerInquiry.create({
      data: {
        inqNumber,
        customerId,
        salesOrgId: salesOrgId || (await prisma.salesOrg.findFirst())!.id,
        status: 'OPEN',
        inquiryDate: new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: notes || 'Standard Customer Quotation Request',
        items: {
          create: items.map((item: any, idx: number) => ({
            itemNumber: (idx + 1) * 10,
            materialId: item.materialId,
            requestedQuantity: parseFloat(item.requestedQuantity),
            targetPrice: parseFloat(item.targetPrice),
          })),
        },
      },
      include: { items: true, customer: true },
    });

    await logAudit({
      req,
      action: 'INQUIRY_CREATED',
      module: 'O2C',
      documentType: 'INQUIRY',
      documentId: inq.id,
      documentNumber: inq.inqNumber,
      previousStatus: null,
      newStatus: 'OPEN',
      details: `Created Customer Inquiry ${inq.inqNumber} for ${inq.customer.name}`,
    });

    return sendSuccess(res, inq, 201);
  } catch (err) {
    next(err);
  }
}

export async function convertInquiryToSalesOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { distributionChannelId, requestedDeliveryDate, notes } = req.body;

    const inq = await prisma.customerInquiry.findUnique({
      where: { id },
      include: { items: { include: { material: true } }, customer: true },
    });

    if (!inq) {
      throw new AppError(`Inquiry ${id} not found`, 404, 'INQUIRY_NOT_FOUND');
    }

    if (inq.status === 'CONVERTED') {
      throw new AppError('Inquiry has already been converted to a Sales Order', 400, 'INQUIRY_ALREADY_CONVERTED');
    }

    const distChannel = distributionChannelId || (await prisma.distributionChannel.findFirst())!.id;
    const count = await prisma.salesOrder.count();
    const soNumber = `SO-${10000 + count + 1}`;

    let totalAmount = 0;
    const soItemsData = [];

    for (const item of inq.items) {
      const lineTotal = item.requestedQuantity * item.targetPrice;
      totalAmount += lineTotal;

      soItemsData.push({
        itemNumber: item.itemNumber,
        materialId: item.materialId,
        plantId: item.material.plantId,
        orderQuantity: item.requestedQuantity,
        deliveredQuantity: 0,
        billedQuantity: 0,
        unitPrice: item.targetPrice,
        netAmount: lineTotal,
      });

      // ATP check (RULE-008)
      const atpEval = BusinessRuleEngine.evaluateFulfillmentRisk(
        item.requestedQuantity,
        item.material.currentStock
      );
      if (!atpEval.passed) {
        await BusinessRuleEngine.recordExceptionIfFailed(
          atpEval,
          'SO',
          soNumber,
          soNumber,
          req.user?.id
        );
      }
    }

    // Credit limit check (RULE-009)
    const creditEval = BusinessRuleEngine.evaluateCustomerCredit(
      inq.customer.currentBalance,
      totalAmount,
      inq.customer.creditLimit
    );

    let creditStatus = 'APPROVED';
    if (!creditEval.passed) {
      creditStatus = 'BLOCKED';
      await BusinessRuleEngine.recordExceptionIfFailed(
        creditEval,
        'SO',
        soNumber,
        soNumber,
        req.user?.id
      );
    }

    const so = await prisma.salesOrder.create({
      data: {
        soNumber,
        inquiryId: inq.id,
        customerId: inq.customerId,
        salesOrgId: inq.salesOrgId,
        distributionChannelId: distChannel,
        status: creditStatus === 'BLOCKED' ? 'DRAFT' : 'CONFIRMED',
        creditStatus,
        orderDate: new Date(),
        requestedDeliveryDate: requestedDeliveryDate ? new Date(requestedDeliveryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalAmount,
        notes: notes || `Converted from ${inq.inqNumber}`,
        items: {
          create: soItemsData,
        },
      },
      include: { items: true, customer: true },
    });

    // Update Inquiry status
    await prisma.customerInquiry.update({
      where: { id: inq.id },
      data: { status: 'CONVERTED' },
    });

    await logAudit({
      req,
      action: 'INQUIRY_CONVERTED_TO_SO',
      module: 'O2C',
      documentType: 'SO',
      documentId: so.id,
      documentNumber: so.soNumber,
      previousStatus: 'OPEN',
      newStatus: so.status,
      details: `Converted ${inq.inqNumber} to Sales Order ${so.soNumber}. Credit Status: ${creditStatus}`,
    });

    return sendSuccess(res, so, 201);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. SALES ORDERS (SO)
// ==========================================

export async function getSalesOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const customerId = (req.query.customerId as string) || '';
    const creditStatus = (req.query.creditStatus as string) || '';
    const sortBy = (req.query.sortBy as string) || 'orderDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { soNumber: { contains: search } },
              { customer: { name: { contains: search } } },
              { notes: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(creditStatus ? { creditStatus } : {}),
    };

    const total = await prisma.salesOrder.count({ where });
    const orders = await prisma.salesOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, customerNumber: true, name: true, region: true, creditLimit: true } },
        salesOrg: { select: { id: true, code: true, name: true } },
        distributionChannel: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            material: { select: { id: true, materialNumber: true, name: true, uom: true } },
          },
        },
        _count: {
          select: { deliveries: true, customerInvoices: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, orders, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getSalesOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const so = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrg: true,
        distributionChannel: true,
        inquiry: { select: { id: true, inqNumber: true, status: true, inquiryDate: true } },
        items: {
          include: {
            material: true,
            plant: true,
          },
        },
        deliveries: {
          include: {
            goodsIssue: true,
            items: true,
          },
        },
        customerInvoices: true,
      },
    });

    if (!so) {
      throw new AppError(`Sales Order ${id} not found`, 404, 'SO_NOT_FOUND');
    }

    return sendSuccess(res, so);
  } catch (err) {
    next(err);
  }
}

export async function confirmSalesOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const so = await prisma.salesOrder.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!so) {
      throw new AppError(`Sales Order ${id} not found`, 404, 'SO_NOT_FOUND');
    }

    if (so.creditStatus === 'BLOCKED') {
      throw new AppError('Cannot confirm Sales Order on credit block. Requires Credit Manager override.', 400, 'CREDIT_BLOCK_ACTIVE');
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    await logAudit({
      req,
      action: 'SO_CONFIRMED',
      module: 'O2C',
      documentType: 'SO',
      documentId: updated.id,
      documentNumber: updated.soNumber,
      previousStatus: so.status,
      newStatus: 'CONFIRMED',
      details: `Sales Order ${updated.soNumber} confirmed for fulfillment`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. OUTBOUND DELIVERIES & GOODS ISSUE (SAP 601)
// ==========================================

export async function getDeliveries(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'deliveryDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { deliveryNumber: { contains: search } },
              { trackingNumber: { contains: search } },
              { salesOrder: { soNumber: { contains: search } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const total = await prisma.delivery.count({ where });
    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        salesOrder: {
          select: {
            id: true,
            soNumber: true,
            customer: { select: { id: true, name: true, customerNumber: true } },
          },
        },
        goodsIssue: { select: { id: true, giNumber: true, postingDate: true } },
        items: {
          include: {
            material: { select: { id: true, materialNumber: true, name: true, uom: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, deliveries, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getDeliveryById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const del = await prisma.delivery.findUnique({
      where: { id },
      include: {
        salesOrder: {
          include: {
            customer: true,
            items: true,
          },
        },
        goodsIssue: true,
        items: {
          include: {
            material: true,
            storageLocation: true,
          },
        },
        customerInvoices: true,
      },
    });

    if (!del) {
      throw new AppError(`Delivery ${id} not found`, 404, 'DELIVERY_NOT_FOUND');
    }

    return sendSuccess(res, del);
  } catch (err) {
    next(err);
  }
}

export async function createDelivery(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { soId, plannedDate, notes } = req.body;

    const so = await prisma.salesOrder.findUnique({
      where: { id: soId },
      include: { items: { include: { material: true } } },
    });

    if (!so) {
      throw new AppError(`Sales Order ${soId} not found`, 404, 'SO_NOT_FOUND');
    }

    if (so.status !== 'CONFIRMED' && so.status !== 'PARTIALLY_FULFILLED') {
      throw new AppError(`Cannot create delivery for Sales Order in status '${so.status}'. Order must be Confirmed.`, 400, 'INVALID_SO_STATUS');
    }

    const count = await prisma.delivery.count();
    const deliveryNumber = `DEL-${10000 + count + 1}`;
    const pDate = plannedDate ? new Date(plannedDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const del = await prisma.delivery.create({
      data: {
        deliveryNumber,
        soId: so.id,
        shippingPoint: 'SP10',
        deliveryDate: pDate,
        plannedGoodsIssueDate: pDate,
        status: 'PENDING',
        notes: notes || `Outbound shipment for SO ${so.soNumber}`,
        items: {
          create: so.items.map((item) => ({
            soItemId: item.id,
            materialId: item.materialId,
            storageLocationId: item.material.storageLocationId,
            deliveryQuantity: item.orderQuantity - item.deliveredQuantity,
            pickedQuantity: 0,
          })),
        },
      },
      include: { items: true },
    });

    await logAudit({
      req,
      action: 'DELIVERY_CREATED',
      module: 'O2C',
      documentType: 'DELIVERY',
      documentId: del.id,
      documentNumber: del.deliveryNumber,
      previousStatus: null,
      newStatus: 'PENDING',
      details: `Created Outbound Delivery ${del.deliveryNumber} for SO ${so.soNumber}`,
    });

    return sendSuccess(res, del, 201);
  } catch (err) {
    next(err);
  }
}

export async function pickDelivery(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { pickedItems } = req.body;

    const del = await prisma.delivery.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!del) {
      throw new AppError(`Delivery ${id} not found`, 404, 'DELIVERY_NOT_FOUND');
    }

    if (del.status === 'DELIVERED') {
      throw new AppError('Delivery is already fully shipped and delivered', 400, 'ALREADY_DELIVERED');
    }

    // Update picked quantities
    for (const pi of pickedItems || del.items) {
      const target = del.items.find((item) => item.id === pi.id || item.soItemId === pi.soItemId);
      if (target) {
        await prisma.deliveryItem.update({
          where: { id: target.id },
          data: { pickedQuantity: parseFloat(pi.pickedQuantity || target.deliveryQuantity) },
        });
      }
    }

    const updated = await prisma.delivery.update({
      where: { id },
      data: { status: 'READY' },
      include: { items: true },
    });

    await logAudit({
      req,
      action: 'DELIVERY_PICKED',
      module: 'O2C',
      documentType: 'DELIVERY',
      documentId: updated.id,
      documentNumber: updated.deliveryNumber,
      previousStatus: del.status,
      newStatus: 'READY',
      details: `Warehouse picking completed for ${updated.deliveryNumber}`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST GOODS ISSUE (SAP MOVEMENT TYPE 601)
 * Decreases physical stock from Material Master and completes dispatch
 */
export async function postGoodsIssue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const del = await prisma.delivery.findUnique({
      where: { id },
      include: {
        items: true,
        salesOrder: { include: { items: true } },
        goodsIssue: true,
      },
    });

    if (!del) {
      throw new AppError(`Delivery ${id} not found`, 404, 'DELIVERY_NOT_FOUND');
    }

    if (del.goodsIssue) {
      throw new AppError(`Goods Issue already posted: ${del.goodsIssue.giNumber}`, 400, 'GI_ALREADY_POSTED');
    }

    if (del.status !== 'READY' && del.status !== 'PICKING') {
      throw new AppError(`Cannot post Goods Issue on delivery in status '${del.status}'. Must be Picked / Ready.`, 400, 'INVALID_DELIVERY_STATUS');
    }

    // Check inventory stock and deduct via Movement 601
    for (const item of del.items) {
      const material = await prisma.material.findUnique({ where: { id: item.materialId } });
      if (!material) continue;

      if (material.currentStock < item.deliveryQuantity) {
        throw new AppError(
          `Insufficient stock to issue material ${material.materialNumber}. Required: ${item.deliveryQuantity}, Available: ${material.currentStock}`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }

      // Deduct stock from Material Master
      await prisma.material.update({
        where: { id: item.materialId },
        data: { currentStock: { decrement: item.deliveryQuantity } },
      });

      // Update SO item delivered quantity
      await prisma.salesOrderItem.update({
        where: { id: item.soItemId },
        data: { deliveredQuantity: { increment: item.deliveryQuantity } },
      });

      // Check for Low Stock / Reorder rules after deduction
      const updatedStock = material.currentStock - item.deliveryQuantity;
      const lowStockEval = BusinessRuleEngine.evaluateLowStock(updatedStock, material.safetyStock);
      if (!lowStockEval.passed) {
        await BusinessRuleEngine.recordExceptionIfFailed(
          lowStockEval,
          'MATERIAL',
          material.id,
          material.materialNumber,
          req.user?.id
        );
      }
    }

    const giCount = await prisma.goodsIssue.count();
    const giNumber = `GI-${10000 + giCount + 1}`;

    const gi = await prisma.goodsIssue.create({
      data: {
        giNumber,
        deliveryId: del.id,
        movementType: '601',
        postingDate: new Date(),
        issuedBy: req.user?.username || 'warehouse',
        notes: `Outbound Goods Issue Mvt 601 posted for Delivery ${del.deliveryNumber}`,
      },
    });

    const updatedDel = await prisma.delivery.update({
      where: { id: del.id },
      data: {
        status: 'DELIVERED',
        actualGoodsIssueDate: new Date(),
      },
      include: { goodsIssue: true },
    });

    // Update SO status
    await prisma.salesOrder.update({
      where: { id: del.soId },
      data: { status: 'FULFILLED' },
    });

    await logAudit({
      req,
      action: 'GOODS_ISSUE_POSTED',
      module: 'O2C',
      documentType: 'GI',
      documentId: gi.id,
      documentNumber: gi.giNumber,
      previousStatus: del.status,
      newStatus: 'DELIVERED',
      details: `Goods Issue ${gi.giNumber} (Movement Type 601) posted. Stock successfully deducted.`,
    });

    return sendSuccess(res, { delivery: updatedDel, goodsIssue: gi }, 201);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. CUSTOMER INVOICES / BILLING (SD BILLING)
// ==========================================

export async function getCustomerInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const customerId = (req.query.customerId as string) || '';
    const sortBy = (req.query.sortBy as string) || 'invoiceDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search } },
              { customer: { name: { contains: search } } },
              { delivery: { deliveryNumber: { contains: search } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    };

    const total = await prisma.customerInvoice.count({ where });
    const invoices = await prisma.customerInvoice.findMany({
      where,
      include: {
        customer: { select: { id: true, customerNumber: true, name: true, region: true } },
        delivery: { select: { id: true, deliveryNumber: true, status: true } },
        so: { select: { id: true, soNumber: true, orderDate: true } },
        items: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, invoices, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getCustomerInvoiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        delivery: {
          include: {
            items: true,
            goodsIssue: true,
          },
        },
        so: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError(`Customer Invoice ${id} not found`, 404, 'INVOICE_NOT_FOUND');
    }

    return sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function createCustomerInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { deliveryId, notes } = req.body;

    const del = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        salesOrder: { include: { items: true, customer: true } },
        items: true,
        goodsIssue: true,
      },
    });

    if (!del) {
      throw new AppError(`Delivery ${deliveryId} not found`, 404, 'DELIVERY_NOT_FOUND');
    }

    if (!del.goodsIssue) {
      throw new AppError('Cannot generate Customer Invoice before Goods Issue (Movement 601) is posted.', 400, 'NO_GOODS_ISSUE');
    }

    const count = await prisma.customerInvoice.count();
    const invoiceNumber = `CINV-${10000 + count + 1}`;

    const totalAmount = del.salesOrder.totalAmount;
    const invoiceDate = new Date();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const cinv = await prisma.customerInvoice.create({
      data: {
        invoiceNumber,
        deliveryId: del.id,
        soId: del.salesOrder.id,
        customerId: del.salesOrder.customerId,
        invoiceDate,
        dueDate,
        totalAmount,
        status: 'GENERATED',
        notes: notes || `Billing document for outbound delivery ${del.deliveryNumber}`,
        items: {
          create: del.items.map((item) => {
            const soItem = del.salesOrder.items.find((s) => s.id === item.soItemId);
            const unitPrice = soItem ? soItem.unitPrice : 0;
            return {
              materialId: item.materialId,
              billedQuantity: item.deliveryQuantity,
              unitPrice,
              netAmount: item.deliveryQuantity * unitPrice,
            };
          }),
        },
      },
      include: { items: true },
    });

    // Update customer open balance
    await prisma.customer.update({
      where: { id: del.salesOrder.customerId },
      data: { currentBalance: { increment: totalAmount } },
    });

    await logAudit({
      req,
      action: 'BILLING_DOCUMENT_GENERATED',
      module: 'O2C',
      documentType: 'CUSTOMER_INVOICE',
      documentId: cinv.id,
      documentNumber: cinv.invoiceNumber,
      previousStatus: null,
      newStatus: 'GENERATED',
      details: `Generated commercial billing document ${cinv.invoiceNumber}. Total: €${totalAmount.toFixed(2)}`,
    });

    return sendSuccess(res, cinv, 201);
  } catch (err) {
    next(err);
  }
}

export async function payCustomerInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!invoice) {
      throw new AppError(`Customer Invoice ${id} not found`, 404, 'INVOICE_NOT_FOUND');
    }

    if (invoice.status === 'PAID') {
      throw new AppError('Customer Invoice is already paid', 400, 'ALREADY_PAID');
    }

    const updated = await prisma.customerInvoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });

    // Decrement customer open balance
    await prisma.customer.update({
      where: { id: invoice.customerId },
      data: { currentBalance: { decrement: Math.min(invoice.customer.currentBalance, invoice.totalAmount) } },
    });

    await logAudit({
      req,
      action: 'CUSTOMER_INVOICE_SETTLED',
      module: 'O2C',
      documentType: 'CUSTOMER_INVOICE',
      documentId: updated.id,
      documentNumber: updated.invoiceNumber,
      previousStatus: invoice.status,
      newStatus: 'PAID',
      details: `Remittance advice received; customer invoice ${updated.invoiceNumber} paid in full`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}
