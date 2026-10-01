import { Router } from 'express';
import {
  getPurchaseRequisitions,
  getPurchaseRequisitionById,
  createPurchaseRequisition,
  approvePurchaseRequisition,
  convertPRToPO,
  getPurchaseOrders,
  getPurchaseOrderById,
  approvePurchaseOrder,
  sendPurchaseOrderToVendor,
  cancelPurchaseOrder,
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
  getSupplierInvoices,
  getSupplierInvoiceById,
  createSupplierInvoice,
  verifySupplierInvoice,
  paySupplierInvoice,
} from '../controllers/p2p.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// 1. Purchase Requisitions
router.get('/purchase-requisitions', getPurchaseRequisitions);
router.get('/purchase-requisitions/:id', getPurchaseRequisitionById);
router.post('/purchase-requisitions', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), createPurchaseRequisition);
router.post('/purchase-requisitions/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), approvePurchaseRequisition);
router.post('/purchase-requisitions/:id/convert-to-po', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), convertPRToPO);

// 2. Purchase Orders
router.get('/purchase-orders', getPurchaseOrders);
router.get('/purchase-orders/:id', getPurchaseOrderById);
router.post('/purchase-orders/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), approvePurchaseOrder);
router.post('/purchase-orders/:id/send', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), sendPurchaseOrderToVendor);
router.post('/purchase-orders/:id/cancel', authenticateToken, authorizeRoles('ADMIN', 'PROCUREMENT'), cancelPurchaseOrder);

// 3. Goods Receipts (Mvt 101)
router.get('/goods-receipts', getGoodsReceipts);
router.get('/goods-receipts/:id', getGoodsReceiptById);
router.post('/goods-receipts', authenticateToken, authorizeRoles('ADMIN', 'WAREHOUSE'), createGoodsReceipt);

// 4. Supplier Invoices & 3-Way Matching
router.get('/supplier-invoices', getSupplierInvoices);
router.get('/supplier-invoices/:id', getSupplierInvoiceById);
router.post('/supplier-invoices', authenticateToken, authorizeRoles('ADMIN', 'FINANCE'), createSupplierInvoice);
router.post('/supplier-invoices/:id/verify', authenticateToken, authorizeRoles('ADMIN', 'FINANCE'), verifySupplierInvoice);
router.post('/supplier-invoices/:id/pay', authenticateToken, authorizeRoles('ADMIN', 'FINANCE'), paySupplierInvoice);

export default router;
