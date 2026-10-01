export type UserRole = 'ADMIN' | 'PROCUREMENT' | 'WAREHOUSE' | 'FINANCE' | 'SALES' | 'MANAGEMENT';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active?: boolean;
}

export interface Plant {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  storageLocations?: StorageLocation[];
}

export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  plantId: string;
}

export interface Material {
  id: string;
  materialNumber: string;
  name: string;
  category: 'RAW' | 'FINISHED' | 'TRADING';
  description?: string;
  uom: string;
  plantId: string;
  storageLocationId?: string;
  currentStock: number;
  safetyStock: number;
  reorderLevel: number;
  standardCost: number;
  sellingPrice: number;
  stockStatus: 'HEALTHY' | 'REORDER_RECOMMENDED' | 'LOW_STOCK';
  plant?: { id: string; code: string; name: string; city: string };
  storageLocation?: { id: string; code: string; name: string };
}

export interface Vendor {
  id: string;
  vendorNumber: string;
  name: string;
  contactPerson: string;
  email: string;
  paymentTerms: string;
  currency: string;
  deliveryTolerancePct: number;
  priceTolerancePct: number;
  leadTimeDays: number;
  rating: number;
  _count?: {
    purchaseOrders: number;
    supplierInvoices: number;
  };
}

export interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  contactPerson: string;
  email: string;
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  shippingAddress: string;
  region: string;
  creditUtilizationPct: number;
  creditRiskStatus: 'HEALTHY' | 'HIGH_EXPOSURE' | 'EXCEEDED';
}

export interface PurchaseRequisitionItem {
  id: string;
  itemNumber: number;
  materialId: string;
  plantId: string;
  quantity: number;
  estimatedPrice: number;
  requiredDate: string;
  status: string;
  material?: Material;
  plant?: Plant;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  requesterId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_PO';
  notes?: string;
  requestedDate: string;
  approvedDate?: string;
  requester?: User;
  items: PurchaseRequisitionItem[];
  purchaseOrders?: { id: string; poNumber: string; status: string }[];
}

export interface PurchaseOrderItem {
  id: string;
  itemNumber: number;
  materialId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  invoicedQuantity: number;
  unitPrice: number;
  netAmount: number;
  material?: Material;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId?: string;
  vendorId: string;
  purchasingOrgId: string;
  plantId: string;
  status: 'DRAFT' | 'APPROVED' | 'SENT_TO_VENDOR' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CLOSED' | 'CANCELLED';
  orderDate: string;
  approvedDate?: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  notes?: string;
  vendor: Vendor;
  plant?: Plant;
  items: PurchaseOrderItem[];
  goodsReceipts?: GoodsReceipt[];
  supplierInvoices?: SupplierInvoice[];
}

export interface GoodsReceiptItem {
  id: string;
  poItemId: string;
  materialId: string;
  receivedQuantity: number;
  rejectedQuantity: number;
  inspectionStatus: string;
  material?: Material;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  poId: string;
  plantId: string;
  postingDate: string;
  movementType: string;
  status: 'PENDING' | 'PARTIAL' | 'COMPLETE' | 'REJECTED';
  deliveryNoteNumber?: string;
  notes?: string;
  purchaseOrder?: { id: string; poNumber: string; vendor: Vendor };
  plant?: Plant;
  items: GoodsReceiptItem[];
}

export interface SupplierInvoiceItem {
  id: string;
  poItemId: string;
  materialId: string;
  invoicedQuantity: number;
  unitPrice: number;
  lineTotal: number;
  priceVariance: number;
  quantityVariance: number;
  material?: Material;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  grId?: string;
  vendorId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  matchStatus: 'PENDING' | 'MATCHED' | 'PRICE_VARIANCE' | 'QUANTITY_VARIANCE' | 'BLOCKED' | 'APPROVED';
  paymentStatus: 'UNPAID' | 'PAYMENT_READY' | 'PAID';
  blockReason?: string;
  notes?: string;
  vendor: Vendor;
  purchaseOrder?: { id: string; poNumber: string; totalAmount: number };
  goodsReceipt?: { id: string; grNumber: string; status: string };
  items: SupplierInvoiceItem[];
}

export interface CustomerInquiryItem {
  id: string;
  itemNumber: number;
  materialId: string;
  requestedQuantity: number;
  targetPrice: number;
  material?: Material;
}

export interface CustomerInquiry {
  id: string;
  inqNumber: string;
  customerId: string;
  salesOrgId: string;
  status: 'OPEN' | 'CONVERTED' | 'CLOSED';
  inquiryDate: string;
  validUntil: string;
  notes?: string;
  customer: Customer;
  items: CustomerInquiryItem[];
}

export interface SalesOrderItem {
  id: string;
  itemNumber: number;
  materialId: string;
  orderQuantity: number;
  deliveredQuantity: number;
  billedQuantity: number;
  unitPrice: number;
  netAmount: number;
  material?: Material;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  inquiryId?: string;
  customerId: string;
  salesOrgId: string;
  distributionChannelId: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
  creditStatus: 'APPROVED' | 'BLOCKED' | 'REVIEW';
  orderDate: string;
  requestedDeliveryDate: string;
  totalAmount: number;
  notes?: string;
  customer: Customer;
  items: SalesOrderItem[];
}

export interface DeliveryItem {
  id: string;
  soItemId: string;
  materialId: string;
  deliveryQuantity: number;
  pickedQuantity: number;
  material?: Material;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  soId: string;
  shippingPoint: string;
  deliveryDate: string;
  plannedGoodsIssueDate: string;
  actualGoodsIssueDate?: string;
  status: 'PENDING' | 'PICKING' | 'READY' | 'DISPATCHED' | 'DELAYED' | 'DELIVERED';
  trackingNumber?: string;
  notes?: string;
  salesOrder: {
    id: string;
    soNumber: string;
    customer: Customer;
  };
  goodsIssue?: {
    id: string;
    giNumber: string;
    postingDate: string;
  };
  items: DeliveryItem[];
}

export interface CustomerInvoiceItem {
  id: string;
  materialId: string;
  billedQuantity: number;
  unitPrice: number;
  netAmount: number;
  material?: Material;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  deliveryId: string;
  soId: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  status: 'PENDING' | 'GENERATED' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  customer: Customer;
  delivery?: { id: string; deliveryNumber: string; status: string };
  so?: { id: string; soNumber: string };
  items: CustomerInvoiceItem[];
}

export interface ExceptionRecord {
  id: string;
  exceptionNumber: string;
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  sourceDocumentType: string;
  sourceDocumentId: string;
  sourceDocumentNumber: string;
  businessImpact: string;
  expectedValue: string;
  actualValue: string;
  variance: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  rule?: { ruleCode: string; name: string; severity: string; recommendedAction: string };
  assignedUser?: User;
}

export interface BusinessRule {
  id: string;
  ruleCode: string;
  name: string;
  description: string;
  category: string;
  conditionExpression: string;
  thresholdValue?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  _count?: { exceptions: number };
}

export interface AuditLog {
  id: string;
  username: string;
  role?: string;
  action: string;
  module: string;
  documentType: string;
  documentId: string;
  documentNumber: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface TraceNode {
  id: string;
  type: string;
  label: string;
  status: string;
  date: string;
  details: string;
}

export interface TraceLink {
  from: string;
  to: string;
  label: string;
}

export interface ProcessTraceData {
  process: 'P2P' | 'O2C' | 'UNKNOWN';
  rootDoc: string;
  nodes: TraceNode[];
  links: TraceLink[];
  exceptions: ExceptionRecord[];
}
