import { Router } from 'express';
import {
  getCustomerInquiries,
  getCustomerInquiryById,
  createCustomerInquiry,
  convertInquiryToSalesOrder,
  getSalesOrders,
  getSalesOrderById,
  confirmSalesOrder,
  getDeliveries,
  getDeliveryById,
  createDelivery,
  pickDelivery,
  postGoodsIssue,
  getCustomerInvoices,
  getCustomerInvoiceById,
  createCustomerInvoice,
  payCustomerInvoice,
} from '../controllers/o2c.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// 1. Customer Inquiries
router.get('/customer-inquiries', getCustomerInquiries);
router.get('/customer-inquiries/:id', getCustomerInquiryById);
router.post('/customer-inquiries', authenticateToken, authorizeRoles('ADMIN', 'SALES'), createCustomerInquiry);
router.post('/customer-inquiries/:id/convert-to-so', authenticateToken, authorizeRoles('ADMIN', 'SALES'), convertInquiryToSalesOrder);

// 2. Sales Orders
router.get('/sales-orders', getSalesOrders);
router.get('/sales-orders/:id', getSalesOrderById);
router.post('/sales-orders/:id/confirm', authenticateToken, authorizeRoles('ADMIN', 'SALES'), confirmSalesOrder);

// 3. Outbound Deliveries & Picking & Goods Issue
router.get('/deliveries', getDeliveries);
router.get('/deliveries/:id', getDeliveryById);
router.post('/deliveries', authenticateToken, authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES'), createDelivery);
router.post('/deliveries/:id/pick', authenticateToken, authorizeRoles('ADMIN', 'WAREHOUSE'), pickDelivery);
router.post('/deliveries/:id/goods-issue', authenticateToken, authorizeRoles('ADMIN', 'WAREHOUSE'), postGoodsIssue);

// 4. Customer Invoices / Billing
router.get('/customer-invoices', getCustomerInvoices);
router.get('/customer-invoices/:id', getCustomerInvoiceById);
router.post('/customer-invoices', authenticateToken, authorizeRoles('ADMIN', 'FINANCE'), createCustomerInvoice);
router.post('/customer-invoices/:id/pay', authenticateToken, authorizeRoles('ADMIN', 'FINANCE'), payCustomerInvoice);

export default router;
