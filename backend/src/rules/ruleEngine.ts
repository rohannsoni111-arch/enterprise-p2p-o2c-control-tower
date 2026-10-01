import { prisma } from '../config';
import { RuleEvaluationResult } from '../types';

export class BusinessRuleEngine {
  /**
   * RULE-001: Invoice Quantity Variance
   * Business Condition: Invoice.InvoicedQty > GoodsReceipt.ReceivedQty
   */
  static evaluateInvoiceQuantity(invoicedQty: number, receivedQty: number): RuleEvaluationResult {
    const passed = invoicedQty <= receivedQty;
    const variance = invoicedQty - receivedQty;
    return {
      ruleCode: 'RULE-001',
      ruleName: 'Invoice Quantity Variance',
      passed,
      severity: 'HIGH',
      category: 'Quantity',
      businessImpact: `Short-shipment overbill risk. Invoiced ${invoicedQty} EA exceeds verified dock receipt of ${receivedQty} EA.`,
      expectedValue: `Max billable: ${receivedQty} EA`,
      actualValue: `Invoiced: ${invoicedQty} EA`,
      variance: `+${variance} EA discrepancy`,
      recommendedAction: 'Hold payment run; request vendor credit note or verify unposted dock goods receipt.',
    };
  }

  /**
   * RULE-002: Invoice Price Variance
   * Business Condition: abs(Invoice.UnitPrice - PO.UnitPrice) / PO.UnitPrice > PriceTolerancePct / 100
   */
  static evaluateInvoicePrice(
    invoicePrice: number,
    poPrice: number,
    priceTolerancePct: number = 2.0
  ): RuleEvaluationResult {
    const priceDiff = Math.abs(invoicePrice - poPrice);
    const pctDiff = poPrice > 0 ? (priceDiff / poPrice) * 100 : 0;
    const passed = pctDiff <= priceTolerancePct;

    return {
      ruleCode: 'RULE-002',
      ruleName: 'Invoice Price Variance',
      passed,
      severity: 'HIGH',
      category: 'Price',
      businessImpact: `Commercial price leakage. Unit price of €${invoicePrice.toFixed(2)} deviates ${pctDiff.toFixed(2)}% from contracted PO price of €${poPrice.toFixed(2)}.`,
      expectedValue: `Contract price: €${poPrice.toFixed(2)} (±${priceTolerancePct.toFixed(1)}% tol)`,
      actualValue: `Invoiced price: €${invoicePrice.toFixed(2)}`,
      variance: `${pctDiff.toFixed(2)}% variance`,
      recommendedAction: 'Apply SAP Block R; route to purchasing category manager for price amendment or vendor rebate.',
    };
  }

  /**
   * RULE-003: Goods Receipt Quantity Discrepancy
   * Business Condition: abs(GR.ReceivedQty - PO.OrderedQty) / PO.OrderedQty > DeliveryTolerancePct / 100
   */
  static evaluateGoodsReceiptTolerance(
    receivedQty: number,
    orderedQty: number,
    deliveryTolerancePct: number = 5.0
  ): RuleEvaluationResult {
    const qtyDiff = Math.abs(receivedQty - orderedQty);
    const pctDiff = orderedQty > 0 ? (qtyDiff / orderedQty) * 100 : 0;
    const passed = pctDiff <= deliveryTolerancePct;

    return {
      ruleCode: 'RULE-003',
      ruleName: 'Goods Receipt Quantity Discrepancy',
      passed,
      severity: 'MEDIUM',
      category: 'Quantity',
      businessImpact: `Delivery quantity deviation of ${pctDiff.toFixed(1)}% exceeds agreed delivery tolerance of ${deliveryTolerancePct.toFixed(1)}%.`,
      expectedValue: `Ordered: ${orderedQty} EA (±${deliveryTolerancePct.toFixed(1)}% tol)`,
      actualValue: `Received at dock: ${receivedQty} EA`,
      variance: `${(receivedQty - orderedQty > 0 ? '+' : '')}${receivedQty - orderedQty} EA (${pctDiff.toFixed(1)}%)`,
      recommendedAction: 'Flag warehouse receiving note; confirm partial shipment or issue formal vendor discrepancy log.',
    };
  }

  /**
   * RULE-004: Low Stock Alert
   * Business Condition: CurrentStock < SafetyStock
   */
  static evaluateLowStock(currentStock: number, safetyStock: number): RuleEvaluationResult {
    const passed = currentStock >= safetyStock;
    const deficit = safetyStock - currentStock;

    return {
      ruleCode: 'RULE-004',
      ruleName: 'Safety Stock Breach (Low Stock)',
      passed,
      severity: 'CRITICAL',
      category: 'Inventory',
      businessImpact: `Critical inventory buffer depleted. Stock level (${currentStock}) is below minimum safety threshold (${safetyStock}).`,
      expectedValue: `Minimum safety threshold: ${safetyStock}`,
      actualValue: `Current on-hand stock: ${currentStock}`,
      variance: `-${deficit} below safety buffer`,
      recommendedAction: 'Expedite open purchase orders immediately; review production schedules to avoid stoppage.',
    };
  }

  /**
   * RULE-005: Reorder Recommendation
   * Business Condition: CurrentStock <= ReorderLevel
   */
  static evaluateReorderPoint(currentStock: number, reorderLevel: number): RuleEvaluationResult {
    const passed = currentStock > reorderLevel;

    return {
      ruleCode: 'RULE-005',
      ruleName: 'Reorder Level Recommendation',
      passed,
      severity: 'MEDIUM',
      category: 'Inventory',
      businessImpact: `Stock level (${currentStock}) reached economic replenishment trigger (${reorderLevel}).`,
      expectedValue: `Reorder threshold: ${reorderLevel}`,
      actualValue: `Current on-hand: ${currentStock}`,
      variance: `At or below reorder trigger`,
      recommendedAction: 'Auto-generate Purchase Requisition draft for Economic Order Quantity (EOQ).',
    };
  }

  /**
   * RULE-006: Outbound Delivery Delay
   * Business Condition: CurrentDate > PlannedDeliveryDate AND Status != DELIVERED
   */
  static evaluateDeliveryDelay(plannedDeliveryDate: Date, isDelivered: boolean): RuleEvaluationResult {
    const now = new Date();
    const isPastDue = now.getTime() > plannedDeliveryDate.getTime();
    const passed = !isPastDue || isDelivered;
    const daysDelayed = Math.max(0, Math.floor((now.getTime() - plannedDeliveryDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ruleCode: 'RULE-006',
      ruleName: 'Outbound Delivery Delay',
      passed,
      severity: 'HIGH',
      category: 'Delivery',
      businessImpact: `Customer fulfillment delay of ${daysDelayed} days risks SLA contractual penalties and relationship damage.`,
      expectedValue: `Planned delivery: ${plannedDeliveryDate.toISOString().split('T')[0]}`,
      actualValue: isDelivered ? 'Delivered' : `Pending / Past due by ${daysDelayed} days`,
      variance: `${daysDelayed} days delay`,
      recommendedAction: 'Escalate to warehouse dispatch supervisor; reassign carrier and send proactive delay notice to customer.',
    };
  }

  /**
   * RULE-007: Open PO Aging
   * Business Condition: CurrentDate - OrderDate > 30 days AND Status in (SENT, PARTIAL)
   */
  static evaluatePOAge(orderDate: Date, isOpen: boolean, thresholdDays = 30): RuleEvaluationResult {
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const passed = !isOpen || ageDays <= thresholdDays;

    return {
      ruleCode: 'RULE-007',
      ruleName: 'Open PO Aging Beyond SLA',
      passed,
      severity: 'MEDIUM',
      category: 'Process Aging',
      businessImpact: `Unfulfilled Purchase Order aging for ${ageDays} days blocks committed capital and disrupts material planning.`,
      expectedValue: `Max open aging SLA: ${thresholdDays} days`,
      actualValue: `Current PO age: ${ageDays} days`,
      variance: `+${Math.max(0, ageDays - thresholdDays)} days overdue`,
      recommendedAction: 'Procurement buyer to contact vendor for shipment confirmation or cancel order line items.',
    };
  }

  /**
   * RULE-008: Sales Order Inventory Fulfillment Risk
   * Business Condition: OrderQty > AvailableStock
   */
  static evaluateFulfillmentRisk(requestedQty: number, availableStock: number): RuleEvaluationResult {
    const passed = requestedQty <= availableStock;
    const deficit = requestedQty - availableStock;

    return {
      ruleCode: 'RULE-008',
      ruleName: 'Sales Order Stock Fulfillment Risk',
      passed,
      severity: 'HIGH',
      category: 'Inventory',
      businessImpact: `Insufficient stock on hand (${availableStock}) to fulfill order quantity (${requestedQty}).`,
      expectedValue: `Required inventory: ${requestedQty} EA`,
      actualValue: `Available stock: ${availableStock} EA`,
      variance: `-${deficit} EA deficit`,
      recommendedAction: 'Trigger partial delivery or initiate stock transfer order from regional warehouse hub.',
    };
  }

  /**
   * RULE-009: Customer Credit Limit Exception
   * Business Condition: CurrentBalance + OrderTotal > CreditLimit
   */
  static evaluateCustomerCredit(
    currentBalance: number,
    orderTotal: number,
    creditLimit: number
  ): RuleEvaluationResult {
    const totalExposure = currentBalance + orderTotal;
    const passed = totalExposure <= creditLimit;
    const overrun = totalExposure - creditLimit;

    return {
      ruleCode: 'RULE-009',
      ruleName: 'Customer Credit Limit Exceeded',
      passed,
      severity: 'CRITICAL',
      category: 'Credit',
      businessImpact: `Total receivables exposure (€${totalExposure.toLocaleString()}) exceeds sanctioned credit ceiling of €${creditLimit.toLocaleString()}.`,
      expectedValue: `Credit limit ceiling: €${creditLimit.toLocaleString()}`,
      actualValue: `Total exposure with order: €${totalExposure.toLocaleString()}`,
      variance: `+€${overrun.toLocaleString()} credit overrun`,
      recommendedAction: 'Place Sales Order on SAP Credit Block; route to Credit Risk Manager for financial guarantee.',
    };
  }

  /**
   * RULE-010: Overdue Customer Receivables
   * Business Condition: CurrentDate > DueDate AND Status == PENDING
   */
  static evaluateOverdueInvoice(dueDate: Date, isPaid: boolean): RuleEvaluationResult {
    const now = new Date();
    const isPastDue = now.getTime() > dueDate.getTime();
    const passed = !isPastDue || isPaid;
    const overdueDays = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      ruleCode: 'RULE-010',
      ruleName: 'Overdue Customer Receivables',
      passed,
      severity: 'MEDIUM',
      category: 'Invoice',
      businessImpact: `Commercial invoice remains unpaid ${overdueDays} days past terms, impacting corporate working capital.`,
      expectedValue: `Payment due date: ${dueDate.toISOString().split('T')[0]}`,
      actualValue: isPaid ? 'Settled' : `Unpaid / ${overdueDays} days overdue`,
      variance: `${overdueDays} days past terms`,
      recommendedAction: 'Dispatch Level-1/2 Dunning Notice; restrict creation of new outbound deliveries.',
    };
  }

  /**
   * Helper to create or ensure an ExceptionRecord in the database when a rule fails
   */
  static async recordExceptionIfFailed(
    evaluation: RuleEvaluationResult,
    sourceDocType: string,
    sourceDocId: string,
    sourceDocNumber: string,
    assignedUserId?: string
  ) {
    if (evaluation.passed) return null;

    const rule = await prisma.businessRule.findUnique({
      where: { ruleCode: evaluation.ruleCode },
    });

    if (!rule) return null;

    const count = await prisma.exceptionRecord.count();
    const exceptionNumber = `EXC-${2000 + count + 1}`;

    return prisma.exceptionRecord.create({
      data: {
        exceptionNumber,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleName: rule.name,
        category: evaluation.category,
        severity: evaluation.severity,
        status: 'OPEN',
        sourceDocumentType: sourceDocType,
        sourceDocumentId: sourceDocId,
        sourceDocumentNumber: sourceDocNumber,
        businessImpact: evaluation.businessImpact,
        expectedValue: evaluation.expectedValue,
        actualValue: evaluation.actualValue,
        variance: evaluation.variance,
        assignedUserId: assignedUserId || null,
        resolutionNotes: evaluation.recommendedAction,
      },
    });
  }
}
