# BUSINESS RULE CATALOG & EXCEPTION ENGINE SPECIFICATION
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower
### Subtitle: SAP MM/SD Process Simulation & Business Process Analytics Platform

> **SPECIFICATION OVERVIEW**: This document provides the authoritative definition of all automated business rules, mathematical variance calculations, tolerance thresholds, and exception remediation workflows implemented in the Digital Control Tower.

---

## 1. Rule Engine Architecture & Philosophy

In modern ERP architectures (such as SAP S/4HANA BRFplus or Flexible Workflows), business rules protect enterprise liquidity, prevent operational stockouts, and enforce contract compliance.

The Rule Engine operates on three core principles:
1. **Explainability**: Every exception generated must be fully explainable to business auditors, presenting the exact mathematical equation, expected benchmark, actual measured input, and calculated delta.
2. **Deterministic Evaluation**: Given identical transactional parameters, the engine will consistently produce identical exception severity and category outcomes.
3. **Actionable Remediation**: An alert is not merely a notification; it must prescribe the exact operational action required (e.g., "Request vendor credit memo", "Post supplementary GR Mvt 101", "Request credit limit increase via FD32").

---

## 2. Business Rule Catalog (RULE-001 Through RULE-010)

```
┌────────────────────────────────────────────────────────────────────────┐
│                       BUSINESS RULE TAXONOMY                           │
│                                                                        │
│   P2P Financial & Receiving:                                           │
│   ├─ RULE-001: Invoice Quantity > Received Quantity (3-Way Match Qty) │
│   ├─ RULE-002: Invoice Price > PO Price Beyond Tolerance (Price Match) │
│   ├─ RULE-003: Dock Received Quantity Variance                         │
│   └─ RULE-007: Open Purchase Order Aging (> 30 Days)                   │
│                                                                        │
│   Inventory & Logistics:                                               │
│   ├─ RULE-004: Stock Below Safety Stock Threshold (Critical Floor)     │
│   ├─ RULE-005: Stock Below Reorder Level (Replenishment Trigger)       │
│   └─ RULE-006: Supplier / Outbound Delivery Delay                      │
│                                                                        │
│   O2C Commercial & Fulfillment:                                        │
│   ├─ RULE-008: Sales Order Available-to-Promise (ATP) Fulfillment Risk │
│   ├─ RULE-009: Customer Order Credit Limit Exposure Breach             │
│   └─ RULE-010: Customer Receivable Overdue Invoice Aging               │
└────────────────────────────────────────────────────────────────────────┘
```

---

### RULE-001: Invoice Quantity > Received Quantity
- **Functional Module**: SAP MM / FI (Invoice Verification - MIRO)
- **Category**: `QUANTITY`
- **Severity**: `CRITICAL`
- **Trigger Event**: Supplier invoice entry or automated 3-way match execution.
- **Business Rationale**: Prevents paying for goods that were never physically received or accepted at the warehouse dock.
- **Mathematical Condition**:
  $$Q_{\text{Invoiced}} > Q_{\text{Accepted}}$$
- **Variance Formula**:
  $$\Delta Q = Q_{\text{Invoiced}} - Q_{\text{Accepted}}$$
- **Operational Action**:
  1. System flags invoice status as `BLOCKED` with SAP R-block equivalent.
  2. Generates `QUANTITY_VARIANCE` exception assigned to Accounts Payable & Warehouse Receiving.
  3. AP holds payment until vendor issues credit memo or warehouse posts supplementary Goods Receipt.

---

### RULE-002: Invoice Price Differs From PO Price Beyond Tolerance
- **Functional Module**: SAP MM / FI (Invoice Verification - MIRO)
- **Category**: `PRICE`
- **Severity**: `HIGH`
- **Trigger Event**: Supplier invoice entry or automated 3-way match execution.
- **Business Rationale**: Enforces contracted purchase pricing and prevents supplier overcharging.
- **Mathematical Condition**:
  $$\frac{P_{\text{Invoiced}} - P_{\text{PO}}}{P_{\text{PO}}} > \text{Vendor.priceTolerance}$$
- **Variance Formula**:
  $$\Delta P = P_{\text{Invoiced}} - P_{\text{PO}}, \quad \% \Delta P = \left( \frac{\Delta P}{P_{\text{PO}}} \right) \times 100$$
- **Operational Action**:
  1. If price variance percentage exceeds vendor tolerance (typically 3.0%), set invoice to `BLOCKED`.
  2. Generates `PRICE_VARIANCE` exception assigned to Procurement Specialist.
  3. Purchasing agent contacts vendor to contest unit price or submits formal price adjustment approval.

---

### RULE-003: Received Quantity Differs From Ordered Quantity Beyond Tolerance
- **Functional Module**: SAP MM (Inventory Management - MIGO Movement 101)
- **Category**: `DELIVERY`
- **Severity**: `MEDIUM`
- **Trigger Event**: Warehouse clerk posts Goods Receipt.
- **Business Rationale**: Tracks supplier delivery accuracy and prevents unauthorized over-shipments.
- **Mathematical Condition**:
  $$\left| \frac{Q_{\text{Received}} - Q_{\text{Ordered}}}{Q_{\text{Ordered}}} \right| > \text{Vendor.deliveryTolerance}$$
- **Variance Formula**:
  $$\Delta Q_{\text{Delivery}} = Q_{\text{Received}} - Q_{\text{Ordered}}$$
- **Operational Action**:
  1. System records Goods Receipt but flags PO line item as over/under-delivered.
  2. Generates `QUANTITY_EXCEPTION` exception assigned to Purchasing Agent.
  3. Sourcing team updates vendor scorecard rating.

---

### RULE-004: Stock Below Safety Stock
- **Functional Module**: SAP MM (Material Requirements Planning - MRP)
- **Category**: `INVENTORY`
- **Severity**: `CRITICAL`
- **Trigger Event**: Any stock decrement event (Post Goods Issue Mvt 601, scrap, or inventory adjustment).
- **Business Rationale**: Alerts plant management before production lines halt or orders are backlogged due to stockout.
- **Mathematical Condition**:
  $$\text{Material.currentStock} < \text{Material.safetyStock}$$
- **Variance Formula**:
  $$\text{Deficit} = \text{Material.safetyStock} - \text{Material.currentStock}$$
- **Operational Action**:
  1. System generates urgent `LOW_STOCK` exception with `CRITICAL` priority.
  2. Automatically suggests immediate Purchase Requisition (PR) creation for the standard lot size.
  3. Escalates to Plant Procurement Lead.

---

### RULE-005: Stock Below Reorder Level
- **Functional Module**: SAP MM (Reorder Point Planning)
- **Category**: `INVENTORY`
- **Severity**: `HIGH`
- **Trigger Event**: Any stock decrement event.
- **Business Rationale**: Triggers standard procurement cycle before inventory penetrates safety stock buffer.
- **Mathematical Condition**:
  $$\text{Material.currentStock} \le \text{Material.reorderLevel}$$
- **Variance Formula**:
  $$\text{Reorder Shortfall} = \text{Material.reorderLevel} - \text{Material.currentStock}$$
- **Operational Action**:
  1. System generates `REORDER_RECOMMENDED` exception.
  2. Recommends standard replenishment PR creation based on vendor lead time.

---

### RULE-006: Delivery Exceeds Expected Date
- **Functional Module**: SAP MM / SD (Logistics Execution)
- **Category**: `DELIVERY`
- **Severity**: `MEDIUM`
- **Trigger Event**: Daily cron or Goods Receipt / Outbound Delivery posting.
- **Business Rationale**: Monitors vendor lead-time reliability and customer shipping SLAs.
- **Mathematical Condition**:
  $$\text{Actual Delivery Date} > \text{Expected / Promised Delivery Date}$$
- **Variance Formula**:
  $$\text{Delay Days} = \text{Date}_{\text{Actual}} - \text{Date}_{\text{Expected}}$$
- **Operational Action**:
  1. Flags delivery record with `DELAYED` status.
  2. Generates `DELIVERY_DELAY` exception.
  3. Degrades vendor reliability rating or notifies sales representative to alert customer.

---

### RULE-007: Purchase Order Remains Open Beyond Threshold
- **Functional Module**: SAP MM (Purchasing - Open Item Monitoring)
- **Category**: `PROCESS_AGING`
- **Severity**: `MEDIUM`
- **Trigger Event**: Daily batch or control tower refresh.
- **Business Rationale**: Eliminates committed spend encumbrances that are stale or abandoned by suppliers.
- **Mathematical Condition**:
  $$\text{Status} \in \{\text{SENT\_TO\_VENDOR}, \text{PARTIALLY\_RECEIVED}\} \land (\text{Date}_{\text{Current}} - \text{Date}_{\text{Order}} > 30 \text{ Days})$$
- **Variance Formula**:
  $$\text{Aging Days} = \text{Date}_{\text{Current}} - \text{Date}_{\text{Order}} - 30$$
- **Operational Action**:
  1. Generates `OPEN_PO_AGING` exception.
  2. Expediting team contacts supplier for delivery confirmation or closes unfulfilled balances.

---

### RULE-008: Sales Order Exceeds Available Inventory (ATP Risk)
- **Functional Module**: SAP SD (Available-to-Promise Check)
- **Category**: `INVENTORY`
- **Severity**: `HIGH`
- **Trigger Event**: Sales Order line item entry.
- **Business Rationale**: Prevents confirming shipping dates to customers when stock is unavailable.
- **Mathematical Condition**:
  $$Q_{\text{Requested}} > \text{Material.currentStock}$$
- **Variance Formula**:
  $$\text{Stock Deficit} = Q_{\text{Requested}} - \text{Material.currentStock}$$
- **Operational Action**:
  1. Flags sales order line item with `FULFILLMENT_RISK`.
  2. Generates exception advising sales rep to split delivery or request production expediting.

---

### RULE-009: Customer Order Exceeds Credit Limit
- **Functional Module**: SAP SD / FI (Credit Management - VKM1)
- **Category**: `CREDIT`
- **Severity**: `CRITICAL`
- **Trigger Event**: Sales Order submission.
- **Business Rationale**: Prevents bad debt exposure by blocking order processing when customer credit is exhausted.
- **Mathematical Condition**:
  $$\text{Customer.currentBalance} + \text{SalesOrder.totalValue} > \text{Customer.creditLimit}$$
- **Variance Formula**:
  $$\text{Excess Exposure} = (\text{Customer.currentBalance} + \text{SalesOrder.totalValue}) - \text{Customer.creditLimit}$$
- **Operational Action**:
  1. Blocks sales order from Outbound Delivery generation (`creditStatus = BLOCKED`).
  2. Generates `CREDIT_EXCEPTION` assigned to Corporate Credit Manager.
  3. Requires cash receipt against open invoices or formal credit limit increase.

---

### RULE-010: Customer Invoice Remains Unpaid Beyond Due Date
- **Functional Module**: SAP FI (Accounts Receivable & Dunning - F150)
- **Category**: `INVOICE`
- **Severity**: `HIGH`
- **Trigger Event**: Daily aging evaluation.
- **Business Rationale**: Protects working capital by accelerating collections on delinquent accounts.
- **Mathematical Condition**:
  $$\text{CustomerInvoice.paymentStatus} \ne \text{'PAID'} \land \text{Date}_{\text{Current}} > \text{CustomerInvoice.dueDate}$$
- **Variance Formula**:
  $$\text{Days Past Due} = \text{Date}_{\text{Current}} - \text{CustomerInvoice.dueDate}$$
- **Operational Action**:
  1. Sets invoice payment status to `OVERDUE`.
  2. Generates `OVERDUE_INVOICE` exception.
  3. Initiates Dunning Level 1/2 notifications and freezes new credit lines.

---

## 3. Decision Tables & Truth Matrices

### 3.1 Three-Way Match Decision Table (RULE-001 & RULE-002)

| Condition 1: $Q_{\text{inv}} \le Q_{\text{rec}}$ | Condition 2: $P_{\text{inv}} \le P_{\text{po}} \times (1 + \text{Tol})$ | Match Status | Financial Action | Generated Exception |
| :---: | :---: | :---: | :--- | :--- |
| **TRUE** | **TRUE** | `MATCHED` | Auto-approved for payment run | None |
| **FALSE** | **TRUE** | `QUANTITY_VARIANCE` | Payment Blocked (R-Block) | `RULE-001` (Critical) |
| **TRUE** | **FALSE** | `PRICE_VARIANCE` | Payment Blocked (R-Block) | `RULE-002` (High) |
| **FALSE** | **FALSE** | `BLOCKED` | Payment Blocked (Multiple) | `RULE-001` & `RULE-002` |

---

### 3.2 Sales Order Fulfillment & Credit Decision Table (RULE-008 & RULE-009)

| Condition 1: Total Exposure $\le$ Credit Limit | Condition 2: Order Qty $\le$ Current Stock | Order Status | Logistics Action | Generated Exception |
| :---: | :---: | :---: | :--- | :--- |
| **TRUE** | **TRUE** | `CONFIRMED` | Release for Outbound Delivery | None |
| **FALSE** | **TRUE** | `CREDIT_BLOCKED` | Hold shipping until credit release | `RULE-009` (Critical) |
| **TRUE** | **FALSE** | `FULFILLMENT_RISK`| Backlog order or split delivery | `RULE-008` (High) |
| **FALSE** | **FALSE** | `BLOCKED` | Total hold on credit & inventory | `RULE-009` & `RULE-008` |

---

## 4. Edge Cases & Exception Handling

1. **Split Goods Receipts**:
   - When a supplier ships in batches (e.g., PO = 100; GR1 = 40, GR2 = 60), the 3-way match engine aggregates cumulative accepted quantities across all GR documents referencing the PO before evaluating $Q_{\text{inv}}$.
2. **Partial Supplier Billing**:
   - If an invoice is submitted for less than the received quantity ($Q_{\text{inv}} < Q_{\text{rec}}$), this is recognized as a valid partial bill. The invoice is marked `MATCHED` without generating an exception.
3. **Price Reductions**:
   - If the supplier invoices at a lower unit price than the PO ($P_{\text{inv}} < P_{\text{po}}$), the favorable price variance is accepted without blocking payment.
4. **Zero-Stock Edge Cases**:
   - If a material's stock reaches exactly zero, both `RULE-004` (Low Stock) and `RULE-005` (Reorder Recommended) fire in tandem, alerting both plant operations and central purchasing.
