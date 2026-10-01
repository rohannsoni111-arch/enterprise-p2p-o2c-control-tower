import { describe, it, expect } from 'vitest';
import { BusinessRuleEngine } from '../src/rules/ruleEngine';

describe('SAP MM/SD Enterprise Business Rule Engine (RULE-001 through RULE-010)', () => {
  // RULE-001: Quantity Variance
  it('RULE-001: should detect invoice quantity discrepancy when invoiced > received', () => {
    const passedResult = BusinessRuleEngine.evaluateInvoiceQuantity(100, 100);
    expect(passedResult.passed).toBe(true);

    const failedResult = BusinessRuleEngine.evaluateInvoiceQuantity(100, 85);
    expect(failedResult.passed).toBe(false);
    expect(failedResult.ruleCode).toBe('RULE-001');
    expect(failedResult.severity).toBe('HIGH');
    expect(failedResult.variance).toContain('+15 EA');
  });

  // RULE-002: Price Variance
  it('RULE-002: should detect price variance when invoiced price exceeds PO price beyond vendor tolerance', () => {
    // 1% variance with 2% tolerance -> PASS
    const passResult = BusinessRuleEngine.evaluateInvoicePrice(101, 100, 2.0);
    expect(passResult.passed).toBe(true);

    // 8% variance with 2% tolerance -> FAIL (Price Variance exception)
    const failResult = BusinessRuleEngine.evaluateInvoicePrice(108, 100, 2.0);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-002');
    expect(failResult.severity).toBe('HIGH');
    expect(failResult.recommendedAction).toContain('SAP Block R');
  });

  // RULE-003: Goods Receipt Quantity Tolerance
  it('RULE-003: should flag dock delivery when received quantity deviates beyond delivery tolerance', () => {
    // 3% deviation with 5% tolerance -> PASS
    const passResult = BusinessRuleEngine.evaluateGoodsReceiptTolerance(97, 100, 5.0);
    expect(passResult.passed).toBe(true);

    // 15% under-delivery with 5% tolerance -> FAIL
    const failResult = BusinessRuleEngine.evaluateGoodsReceiptTolerance(85, 100, 5.0);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-003');
    expect(failResult.severity).toBe('MEDIUM');
  });

  // RULE-004: Low Stock Alert
  it('RULE-004: should raise CRITICAL exception when current stock is below safety stock', () => {
    const passResult = BusinessRuleEngine.evaluateLowStock(120, 100);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluateLowStock(85, 100);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-004');
    expect(failResult.severity).toBe('CRITICAL');
  });

  // RULE-005: Reorder Recommendation
  it('RULE-005: should recommend replenishment PR when stock is at or below reorder level', () => {
    const passResult = BusinessRuleEngine.evaluateReorderPoint(250, 200);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluateReorderPoint(190, 200);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-005');
  });

  // RULE-006: Outbound Delivery Delay
  it('RULE-006: should flag delivery delay when current date exceeds planned delivery date and not delivered', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const passResult = BusinessRuleEngine.evaluateDeliveryDelay(futureDate, false);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluateDeliveryDelay(pastDate, false);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-006');
    expect(failResult.severity).toBe('HIGH');
  });

  // RULE-007: Open PO Aging
  it('RULE-007: should identify PO aging when open past SLA threshold', () => {
    const recentOrderDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const oldOrderDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

    const passResult = BusinessRuleEngine.evaluatePOAge(recentOrderDate, true, 30);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluatePOAge(oldOrderDate, true, 30);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-007');
  });

  // RULE-008: Sales Order Inventory Fulfillment Risk
  it('RULE-008: should detect fulfillment deficit when requested quantity exceeds available stock', () => {
    const passResult = BusinessRuleEngine.evaluateFulfillmentRisk(50, 100);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluateFulfillmentRisk(150, 100);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-008');
  });

  // RULE-009: Customer Credit Limit Exception
  it('RULE-009: should place order on credit hold when exposure exceeds credit limit', () => {
    // Current balance €50k + Order €30k <= Limit €100k -> PASS
    const passResult = BusinessRuleEngine.evaluateCustomerCredit(50000, 30000, 100000);
    expect(passResult.passed).toBe(true);

    // Current balance €90k + Order €30k > Limit €100k -> FAIL (Credit hold)
    const failResult = BusinessRuleEngine.evaluateCustomerCredit(90000, 30000, 100000);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-009');
    expect(failResult.severity).toBe('CRITICAL');
  });

  // RULE-010: Overdue Customer Receivables
  it('RULE-010: should identify overdue customer billing when due date has elapsed and invoice is unpaid', () => {
    const futureDueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const pastDueDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const passResult = BusinessRuleEngine.evaluateOverdueInvoice(futureDueDate, false);
    expect(passResult.passed).toBe(true);

    const failResult = BusinessRuleEngine.evaluateOverdueInvoice(pastDueDate, false);
    expect(failResult.passed).toBe(false);
    expect(failResult.ruleCode).toBe('RULE-010');
  });
});
