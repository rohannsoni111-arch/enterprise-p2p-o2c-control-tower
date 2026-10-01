import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config';
import { AppError } from '../middleware/errorHandler';
import { sendPaginated, sendSuccess } from '../utils/response';
import { logAudit } from '../middleware/audit';
import { BusinessRuleEngine } from '../rules/ruleEngine';
import { AuthRequest } from '../types';

// ==========================================
// 1. PURCHASE REQUISITIONS (PR)
// ==========================================

export async function getPurchaseRequisitions(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { prNumber: { contains: search } },
              { notes: { contains: search } },
              { requester: { fullName: { contains: search } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const total = await prisma.purchaseRequisition.count({ where });
    const prs = await prisma.purchaseRequisition.findMany({
      where,
      include: {
        requester: { select: { id: true, username: true, fullName: true, role: true } },
        items: {
          include: {
            material: { select: { id: true, materialNumber: true, name: true, uom: true } },
            plant: { select: { id: true, code: true, name: true } },
          },
        },
        purchaseOrders: { select: { id: true, poNumber: true, status: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, prs, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getPurchaseRequisitionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, username: true, fullName: true, role: true } },
        items: {
          include: {
            material: true,
            plant: true,
          },
        },
        purchaseOrders: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!pr) {
      throw new AppError(`Purchase Requisition ${id} not found`, 404, 'PR_NOT_FOUND');
    }

    return sendSuccess(res, pr);
  } catch (err) {
    next(err);
  }
}

export async function createPurchaseRequisition(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { items, notes, requestedDate } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('PR must contain at least one item', 400, 'INVALID_ITEMS');
    }

    const count = await prisma.purchaseRequisition.count();
    const prNumber = `PR-${10000 + count + 1}`;
    const requesterId = req.user?.id || (await prisma.user.findFirst({ where: { role: 'PROCUREMENT' } }))!.id;

    const pr = await prisma.purchaseRequisition.create({
      data: {
        prNumber,
        requesterId,
        status: 'SUBMITTED',
        notes: notes || 'Standard Requisition',
        requestedDate: requestedDate ? new Date(requestedDate) : new Date(),
        items: {
          create: items.map((item: any, idx: number) => ({
            itemNumber: (idx + 1) * 10,
            materialId: item.materialId,
            plantId: item.plantId,
            quantity: parseFloat(item.quantity),
            estimatedPrice: parseFloat(item.estimatedPrice),
            requiredDate: item.requiredDate ? new Date(item.requiredDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'OPEN',
          })),
        },
      },
      include: { items: { include: { material: true } }, requester: true },
    });

    await logAudit({
      req,
      action: 'PR_CREATED',
      module: 'P2P',
      documentType: 'PR',
      documentId: pr.id,
      documentNumber: pr.prNumber,
      previousStatus: null,
      newStatus: 'SUBMITTED',
      details: `Created Purchase Requisition ${pr.prNumber} with ${items.length} line items`,
    });

    return sendSuccess(res, pr, 201);
  } catch (err) {
    next(err);
  }
}

export async function approvePurchaseRequisition(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const pr = await prisma.purchaseRequisition.findUnique({ where: { id } });

    if (!pr) {
      throw new AppError(`Purchase Requisition ${id} not found`, 404, 'PR_NOT_FOUND');
    }

    if (pr.status !== 'SUBMITTED' && pr.status !== 'DRAFT') {
      throw new AppError(`Cannot approve PR in status '${pr.status}'`, 400, 'INVALID_STATE_TRANSITION');
    }

    const updated = await prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
      },
      include: { items: true },
    });

    await logAudit({
      req,
      action: 'PR_APPROVED',
      module: 'P2P',
      documentType: 'PR',
      documentId: updated.id,
      documentNumber: updated.prNumber,
      previousStatus: pr.status,
      newStatus: 'APPROVED',
      details: `Purchase Requisition ${updated.prNumber} formally approved by buyer`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function convertPRToPO(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { vendorId, purchasingOrgId, expectedDeliveryDate, notes } = req.body;

    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: { items: { include: { material: true } } },
    });

    if (!pr) {
      throw new AppError(`Purchase Requisition ${id} not found`, 404, 'PR_NOT_FOUND');
    }

    if (pr.status !== 'APPROVED') {
      throw new AppError(`Only APPROVED purchase requisitions can be converted into a Purchase Order. Current status: ${pr.status}`, 400, 'PR_NOT_APPROVED');
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      throw new AppError('A valid Vendor must be specified for conversion', 400, 'INVALID_VENDOR');
    }

    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${10000 + poCount + 1}`;

    const totalAmount = pr.items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        prId: pr.id,
        vendorId,
        purchasingOrgId: purchasingOrgId || (await prisma.purchasingOrg.findFirst())!.id,
        plantId: pr.items[0].plantId,
        status: 'APPROVED',
        orderDate: new Date(),
        approvedDate: new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : new Date(Date.now() + vendor.leadTimeDays * 24 * 60 * 60 * 1000),
        totalAmount,
        notes: notes || `Converted from ${pr.prNumber}`,
        items: {
          create: pr.items.map((item) => ({
            itemNumber: item.itemNumber,
            materialId: item.materialId,
            storageLocationId: item.material.storageLocationId,
            orderedQuantity: item.quantity,
            receivedQuantity: 0,
            invoicedQuantity: 0,
            unitPrice: item.estimatedPrice,
            netAmount: item.quantity * item.estimatedPrice,
          })),
        },
      },
      include: { items: true, vendor: true },
    });

    // Update PR status
    await prisma.purchaseRequisition.update({
      where: { id: pr.id },
      data: { status: 'CONVERTED_TO_PO' },
    });

    await prisma.purchaseRequisitionItem.updateMany({
      where: { prId: pr.id },
      data: { status: 'CONVERTED' },
    });

    await logAudit({
      req,
      action: 'PR_CONVERTED_TO_PO',
      module: 'P2P',
      documentType: 'PO',
      documentId: po.id,
      documentNumber: po.poNumber,
      previousStatus: 'APPROVED',
      newStatus: 'CONVERTED_TO_PO',
      details: `Requisition ${pr.prNumber} successfully converted to Purchase Order ${po.poNumber}`,
    });

    return sendSuccess(res, po, 201);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. PURCHASE ORDERS (PO)
// ==========================================

export async function getPurchaseOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const vendorId = (req.query.vendorId as string) || '';
    const plantId = (req.query.plantId as string) || '';
    const sortBy = (req.query.sortBy as string) || 'orderDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { poNumber: { contains: search } },
              { vendor: { name: { contains: search } } },
              { notes: { contains: search } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(plantId ? { plantId } : {}),
    };

    const total = await prisma.purchaseOrder.count({ where });
    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor: { select: { id: true, vendorNumber: true, name: true, paymentTerms: true } },
        plant: { select: { id: true, code: true, name: true } },
        purchasingOrg: { select: { id: true, code: true, name: true } },
        items: {
          include: {
            material: { select: { id: true, materialNumber: true, name: true, uom: true } },
          },
        },
        _count: {
          select: { goodsReceipts: true, supplierInvoices: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return sendPaginated(res, pos, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getPurchaseOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        plant: true,
        purchasingOrg: true,
        requisition: { select: { id: true, prNumber: true, status: true, requestedDate: true } },
        items: {
          include: {
            material: true,
            storageLocation: true,
          },
        },
        goodsReceipts: {
          include: {
            items: true,
          },
        },
        supplierInvoices: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!po) {
      throw new AppError(`Purchase Order ${id} not found`, 404, 'PO_NOT_FOUND');
    }

    return sendSuccess(res, po);
  } catch (err) {
    next(err);
  }
}

export async function approvePurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new AppError(`PO ${id} not found`, 404, 'PO_NOT_FOUND');
    }

    if (po.status !== 'DRAFT') {
      throw new AppError(`Only DRAFT purchase orders can be approved. Current: ${po.status}`, 400, 'INVALID_STATE_TRANSITION');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
      },
    });

    await logAudit({
      req,
      action: 'PO_APPROVED',
      module: 'P2P',
      documentType: 'PO',
      documentId: updated.id,
      documentNumber: updated.poNumber,
      previousStatus: 'DRAFT',
      newStatus: 'APPROVED',
      details: `PO ${updated.poNumber} approved`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function sendPurchaseOrderToVendor(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });

    if (!po) {
      throw new AppError(`PO ${id} not found`, 404, 'PO_NOT_FOUND');
    }

    if (po.status !== 'APPROVED') {
      throw new AppError(`PO must be APPROVED before dispatching to vendor. Current: ${po.status}`, 400, 'PO_NOT_APPROVED');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'SENT_TO_VENDOR' },
    });

    await logAudit({
      req,
      action: 'PO_SENT_TO_VENDOR',
      module: 'P2P',
      documentType: 'PO',
      documentId: updated.id,
      documentNumber: updated.poNumber,
      previousStatus: 'APPROVED',
      newStatus: 'SENT_TO_VENDOR',
      details: `PO ${updated.poNumber} sent to vendor EDI endpoint`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function cancelPurchaseOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { goodsReceipts: true },
    });

    if (!po) {
      throw new AppError(`PO ${id} not found`, 404, 'PO_NOT_FOUND');
    }

    if (po.goodsReceipts.length > 0) {
      throw new AppError('Cannot cancel purchase order with posted goods receipts', 400, 'PO_HAS_RECEIPTS');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await logAudit({
      req,
      action: 'PO_CANCELLED',
      module: 'P2P',
      documentType: 'PO',
      documentId: updated.id,
      documentNumber: updated.poNumber,
      previousStatus: po.status,
      newStatus: 'CANCELLED',
      details: `PO ${updated.poNumber} cancelled`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. GOODS RECEIPTS (SAP MOVEMENT 101)
// ==========================================

export async function getGoodsReceipts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'postingDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { grNumber: { contains: search } },
              { deliveryNoteNumber: { contains: search } },
              { purchaseOrder: { poNumber: { contains: search } } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const total = await prisma.goodsReceipt.count({ where });
    const grs = await prisma.goodsReceipt.findMany({
      where,
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            vendor: { select: { id: true, name: true, vendorNumber: true } },
          },
        },
        plant: { select: { id: true, code: true, name: true } },
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

    return sendPaginated(res, grs, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getGoodsReceiptById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            items: true,
          },
        },
        plant: true,
        items: {
          include: {
            material: true,
            storageLocation: true,
          },
        },
      },
    });

    if (!gr) {
      throw new AppError(`Goods Receipt ${id} not found`, 404, 'GR_NOT_FOUND');
    }

    return sendSuccess(res, gr);
  } catch (err) {
    next(err);
  }
}

export async function createGoodsReceipt(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { poId, deliveryNoteNumber, items, notes } = req.body;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true, vendor: true },
    });

    if (!po) {
      throw new AppError(`Purchase Order ${poId} not found`, 404, 'PO_NOT_FOUND');
    }

    if (po.status === 'CANCELLED') {
      throw new AppError('Goods receipt cannot be created for a cancelled purchase order.', 400, 'PO_CANCELLED');
    }

    if (po.status !== 'SENT_TO_VENDOR' && po.status !== 'PARTIALLY_RECEIVED') {
      throw new AppError(`Goods receipt cannot be created for PO in status '${po.status}'. Must be Sent to Vendor or Partially Received.`, 400, 'INVALID_PO_STATUS');
    }

    const count = await prisma.goodsReceipt.count();
    const grNumber = `GR-${10000 + count + 1}`;

    // Process line items & update stock
    let allComplete = true;

    const grItemsData = [];
    for (const item of items) {
      const poItem = po.items.find((p) => p.id === item.poItemId);
      if (!poItem) continue;

      const recQty = parseFloat(item.receivedQuantity);
      const rejQty = parseFloat(item.rejectedQuantity || '0');

      grItemsData.push({
        poItemId: poItem.id,
        materialId: poItem.materialId,
        storageLocationId: item.storageLocationId || poItem.storageLocationId,
        receivedQuantity: recQty,
        rejectedQuantity: rejQty,
        inspectionStatus: rejQty > 0 ? 'PARTIAL_REJECT' : 'ACCEPTED',
      });

      // Update PO item received quantity
      const newRecQty = poItem.receivedQuantity + recQty;
      await prisma.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: { receivedQuantity: newRecQty },
      });

      if (newRecQty < poItem.orderedQuantity) {
        allComplete = false;
      }

      // Add physical stock to Material Master
      await prisma.material.update({
        where: { id: poItem.materialId },
        data: { currentStock: { increment: recQty } },
      });

      // Check delivery tolerance rule RULE-003
      const tolEval = BusinessRuleEngine.evaluateGoodsReceiptTolerance(
        recQty,
        poItem.orderedQuantity,
        po.vendor.deliveryTolerancePct
      );
      if (!tolEval.passed) {
        await BusinessRuleEngine.recordExceptionIfFailed(
          tolEval,
          'GR',
          grNumber,
          grNumber,
          req.user?.id
        );
      }
    }

    const gr = await prisma.goodsReceipt.create({
      data: {
        grNumber,
        poId: po.id,
        plantId: po.plantId,
        movementType: '101',
        status: allComplete ? 'COMPLETE' : 'PARTIAL',
        deliveryNoteNumber,
        notes: notes || 'Standard Movement 101 Goods Receipt',
        items: {
          create: grItemsData,
        },
      },
      include: { items: true },
    });

    // Update PO status
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: allComplete ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED' },
    });

    await logAudit({
      req,
      action: 'GOODS_RECEIPT_POSTED',
      module: 'P2P',
      documentType: 'GR',
      documentId: gr.id,
      documentNumber: gr.grNumber,
      previousStatus: po.status,
      newStatus: allComplete ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED',
      details: `Goods Receipt ${gr.grNumber} posted Movement Type 101 against PO ${po.poNumber}`,
    });

    return sendSuccess(res, gr, 201);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. SUPPLIER INVOICES & 3-WAY MATCHING
// ==========================================

export async function getSupplierInvoices(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const matchStatus = (req.query.matchStatus as string) || '';
    const paymentStatus = (req.query.paymentStatus as string) || '';
    const sortBy = (req.query.sortBy as string) || 'invoiceDate';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search } },
              { purchaseOrder: { poNumber: { contains: search } } },
              { vendor: { name: { contains: search } } },
            ],
          }
        : {}),
      ...(matchStatus ? { matchStatus } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    };

    const total = await prisma.supplierInvoice.count({ where });
    const invoices = await prisma.supplierInvoice.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true, vendorNumber: true } },
        purchaseOrder: { select: { id: true, poNumber: true, totalAmount: true } },
        goodsReceipt: { select: { id: true, grNumber: true, status: true } },
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

export async function getSupplierInvoiceById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const invoice = await prisma.supplierInvoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: {
          include: {
            items: true,
          },
        },
        goodsReceipt: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            material: true,
            poItem: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError(`Supplier Invoice ${id} not found`, 404, 'INVOICE_NOT_FOUND');
    }

    return sendSuccess(res, invoice);
  } catch (err) {
    next(err);
  }
}

export async function createSupplierInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { poId, grId, items, invoiceDate, notes } = req.body;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { items: true, vendor: true, goodsReceipts: { include: { items: true } } },
    });

    if (!po) {
      throw new AppError(`Purchase Order ${poId} not found`, 404, 'PO_NOT_FOUND');
    }

    const gr = grId
      ? await prisma.goodsReceipt.findUnique({ where: { id: grId }, include: { items: true } })
      : po.goodsReceipts[0] || null;

    const count = await prisma.supplierInvoice.count();
    const invoiceNumber = `INV-${10000 + count + 1}`;

    let totalAmount = 0;
    const invItemsData = [];

    for (const item of items) {
      const poItem = po.items.find((p) => p.id === item.poItemId);
      if (!poItem) continue;

      const invQty = parseFloat(item.invoicedQuantity);
      const unitPrice = parseFloat(item.unitPrice);
      const lineTotal = invQty * unitPrice;
      totalAmount += lineTotal;

      const grItem = gr ? gr.items.find((g) => g.poItemId === poItem.id) : null;
      const recQty = grItem ? grItem.receivedQuantity : 0;

      invItemsData.push({
        poItemId: poItem.id,
        materialId: poItem.materialId,
        invoicedQuantity: invQty,
        unitPrice,
        lineTotal,
        priceVariance: unitPrice - poItem.unitPrice,
        quantityVariance: invQty - recQty,
      });
    }

    const inv = await prisma.supplierInvoice.create({
      data: {
        invoiceNumber,
        poId: po.id,
        grId: gr ? gr.id : null,
        vendorId: po.vendorId,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalAmount,
        matchStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: notes || 'Standard incoming supplier invoice',
        items: {
          create: invItemsData,
        },
      },
      include: { items: true },
    });

    await logAudit({
      req,
      action: 'INVOICE_REGISTERED',
      module: 'P2P',
      documentType: 'SUPPLIER_INVOICE',
      documentId: inv.id,
      documentNumber: inv.invoiceNumber,
      previousStatus: null,
      newStatus: 'PENDING',
      details: `Supplier invoice registered against PO ${po.poNumber}. Total: €${totalAmount.toFixed(2)}`,
    });

    return sendSuccess(res, inv, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * AUTOMATED THREE-WAY MATCHING (PO vs GR vs INVOICE)
 * Evaluates quantity and price variances against vendor tolerances
 */
export async function verifySupplierInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const invoice = await prisma.supplierInvoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        purchaseOrder: { include: { items: true } },
        goodsReceipt: { include: { items: true } },
        items: true,
      },
    });

    if (!invoice) {
      throw new AppError(`Invoice ${id} not found`, 404, 'INVOICE_NOT_FOUND');
    }

    if (!invoice.goodsReceipt) {
      await prisma.supplierInvoice.update({
        where: { id },
        data: {
          matchStatus: 'BLOCKED',
          blockReason: 'Three-Way Match Failed: No verified Goods Receipt found for referenced PO',
        },
      });

      return sendSuccess(res, {
        matchStatus: 'BLOCKED',
        passed: false,
        message: 'No Goods Receipt exists for this purchase order. Invoice blocked from payment run.',
      });
    }

    let hasPriceVariance = false;
    let hasQtyVariance = false;
    let blockReason = '';

    for (const invItem of invoice.items) {
      const poItem = invoice.purchaseOrder.items.find((p) => p.id === invItem.poItemId);
      const grItem = invoice.goodsReceipt.items.find((g) => g.poItemId === invItem.poItemId);

      if (!poItem || !grItem) continue;

      // 1. Evaluate Quantity Variance (RULE-001)
      const qtyEval = BusinessRuleEngine.evaluateInvoiceQuantity(
        invItem.invoicedQuantity,
        grItem.receivedQuantity
      );

      if (!qtyEval.passed) {
        hasQtyVariance = true;
        blockReason += `[Qty Discrepancy: Invoiced ${invItem.invoicedQuantity} > Received ${grItem.receivedQuantity}] `;
        await BusinessRuleEngine.recordExceptionIfFailed(
          qtyEval,
          'SUPPLIER_INVOICE',
          invoice.id,
          invoice.invoiceNumber,
          req.user?.id
        );
      }

      // 2. Evaluate Price Variance (RULE-002)
      const priceEval = BusinessRuleEngine.evaluateInvoicePrice(
        invItem.unitPrice,
        poItem.unitPrice,
        invoice.vendor.priceTolerancePct
      );

      if (!priceEval.passed) {
        hasPriceVariance = true;
        blockReason += `[Price Variance: Invoiced €${invItem.unitPrice.toFixed(2)} vs PO €${poItem.unitPrice.toFixed(2)}] `;
        await BusinessRuleEngine.recordExceptionIfFailed(
          priceEval,
          'SUPPLIER_INVOICE',
          invoice.id,
          invoice.invoiceNumber,
          req.user?.id
        );
      }
    }

    let newStatus = 'MATCHED';
    let newPaymentStatus = 'PAYMENT_READY';

    if (hasPriceVariance) {
      newStatus = 'PRICE_VARIANCE';
      newPaymentStatus = 'UNPAID';
    } else if (hasQtyVariance) {
      newStatus = 'QUANTITY_VARIANCE';
      newPaymentStatus = 'UNPAID';
    }

    const updated = await prisma.supplierInvoice.update({
      where: { id },
      data: {
        matchStatus: newStatus,
        paymentStatus: newPaymentStatus,
        blockReason: newStatus !== 'MATCHED' ? blockReason.trim() : null,
      },
    });

    await logAudit({
      req,
      action: newStatus === 'MATCHED' ? '3WAY_MATCH_PASSED' : '3WAY_MATCH_EXCEPTION',
      module: 'P2P',
      documentType: 'SUPPLIER_INVOICE',
      documentId: updated.id,
      documentNumber: updated.invoiceNumber,
      previousStatus: invoice.matchStatus,
      newStatus: updated.matchStatus,
      details: newStatus === 'MATCHED' ? 'Three-Way Match verified with zero tolerances breached' : blockReason,
    });

    return sendSuccess(res, {
      invoice: updated,
      matchStatus: newStatus,
      passed: newStatus === 'MATCHED',
      blockReason: updated.blockReason,
    });
  } catch (err) {
    next(err);
  }
}

export async function paySupplierInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const invoice = await prisma.supplierInvoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new AppError(`Invoice ${id} not found`, 404, 'INVOICE_NOT_FOUND');
    }

    if (invoice.matchStatus !== 'MATCHED' && invoice.matchStatus !== 'APPROVED') {
      throw new AppError(`Cannot execute payment. Invoice has match status '${invoice.matchStatus}' and is blocked`, 400, 'INVOICE_PAYMENT_BLOCKED');
    }

    const updated = await prisma.supplierInvoice.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        paidDate: new Date(),
      },
    });

    await logAudit({
      req,
      action: 'INVOICE_PAID',
      module: 'P2P',
      documentType: 'SUPPLIER_INVOICE',
      documentId: updated.id,
      documentNumber: updated.invoiceNumber,
      previousStatus: 'PAYMENT_READY',
      newStatus: 'PAID',
      details: `Cleared vendor invoice payment of €${updated.totalAmount.toFixed(2)}`,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}
