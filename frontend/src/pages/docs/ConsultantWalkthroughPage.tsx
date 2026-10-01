import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import {
  Compass,
  FileText,
  Layers,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Sparkles,
  ChevronRight,
  Shield,
  Briefcase,
} from 'lucide-react';

export const ConsultantWalkthroughPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'asis-tobe' | 'bpmn' | 'fsd' | 'interview'>('asis-tobe');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-500" />
          <span>Functional Consultant Walkthrough & Process Engineering Suite</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Curated business process re-engineering artifacts, BPMN swimlane models, Functional Specifications (FSD), and interview talking points.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-medium">
        {[
          { id: 'asis-tobe', label: 'As-Is vs To-Be Re-engineering', icon: Layers },
          { id: 'bpmn', label: 'BPMN 2.0 Swimlane Workflows', icon: Workflow },
          { id: 'fsd', label: 'Functional Specification (FSD)', icon: FileText },
          { id: 'interview', label: 'Junior Consultant Interview Q&A', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 flex items-center gap-2 border-b-2 font-semibold transition-colors ${
                isActive
                  ? 'border-sap-blue text-sap-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: AS-IS VS TO-BE PROCESS RE-ENGINEERING */}
      {activeTab === 'asis-tobe' && (
        <div className="space-y-6">
          {/* P2P Process Improvement */}
          <Card
            title="Procure-to-Pay (P2P): Legacy As-Is vs Modern Digital Control Tower To-Be"
            subtitle="Eliminating manual purchasing friction, late price leakage, and delayed goods receipt visibility"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* As-Is Column */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 space-y-3">
                <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[11px]">
                  <span>P2P As-Is Baseline (Fragmented / Manual)</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 font-mono">High Latency</span>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">1. Paper/Email Purchase Requisition:</span>
                    Requisitions submitted over email or spreadsheet without real-time plant budget or standard cost validation.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">2. Manual Vendor Negotiation & Open PO Blindness:</span>
                    Buyers re-enter data into PO drafts; lack visibility into supplier open aging beyond standard lead time SLAs.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">3. Disconnected Receiving Dock Logs:</span>
                    Warehouse records physical receipts on paper manifests; inventory stock updates in ERP are delayed by 24-48 hours.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">4. Post-Payment Discrepancy Discovery:</span>
                    Invoices matched manually by AP clerks; price variances (over-billing) and quantity shortfalls discovered weeks after payment runs.
                  </div>
                </div>
              </div>

              {/* To-Be Column */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                  <span>P2P To-Be Architecture (Control Tower Automated)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-mono">Streamlined</span>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">1. Role-Governed Digital PR Workflow:</span>
                    Real-time material valuation, plant allocation, and one-click buyer approvals with automated conversion to PO.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">2. Automated PO Release & Open Aging Telemetry:</span>
                    System evaluates RULE-007 (Open PO aging past SLA) to alert buyers proactively before production run shortages.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">3. Real-Time Movement 101 Goods Receipt:</span>
                    Immediate dock registration, automated delivery tolerance validation (RULE-003), and instant inventory stock replenishment.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">4. Pre-Payment 3-Way Match Verification Engine:</span>
                    Automated line-item reconciliation of PO price vs Invoice price (RULE-002) and GR qty vs Invoice qty (RULE-001). Blocks payment run automatically on variance.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* O2C Process Improvement */}
          <Card
            title="Order-to-Cash (O2C): Legacy As-Is vs Modern Digital Control Tower To-Be"
            subtitle="Mitigating fulfillment bottlenecks, eliminating credit overrun risks, and optimizing on-time in-full (OTIF)"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* As-Is Column */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 space-y-3">
                <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider text-[11px]">
                  <span>O2C As-Is Baseline (Fragmented / Manual)</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 font-mono">High Risk</span>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">1. Siloed Inquiry Quotation:</span>
                    Sales reps quote without verifying warehouse stock availability, resulting in promised dates that cannot be met.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">2. Unmonitored Credit Overruns:</span>
                    Orders confirmed without verifying customer open balance against sanctioned credit limit, elevating bad debt risk.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">3. Delayed Outbound Delivery Scheduling:</span>
                    Warehouse dispatch relies on verbal alerts; customer deliveries frequently delayed past SLA without carrier tracking.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">4. Manual Billing & Dunning Delays:</span>
                    Invoices drafted days after shipping dock departure; overdue receivables aged without automated dunning reminders.
                  </div>
                </div>
              </div>

              {/* To-Be Column */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10 space-y-3">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                  <span>O2C To-Be Architecture (Control Tower Automated)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-mono">Governed</span>
                </div>

                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">1. Automated Available-to-Promise (ATP):</span>
                    System evaluates stock availability (RULE-008) in real-time during quotation and sales order creation.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">2. Automatic SAP Credit Hold (RULE-009):</span>
                    Orders exceeding credit limit are automatically blocked from delivery release until Credit Manager review.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">3. Movement Type 601 Goods Issue & OTIF Tracking:</span>
                    Picking confirmed, Movement 601 posted instantly with stock deduction, and delivery delays (RULE-006) flagged on dashboard.
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold block text-slate-900 dark:text-white">4. Integrated Billing & Overdue Telemetry:</span>
                    Immediate commercial invoice creation upon Goods Issue, with automated aging tracking (RULE-010) and dunning notices.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BPMN 2.0 WORKFLOWS */}
      {activeTab === 'bpmn' && (
        <div className="space-y-6">
          <Card
            title="BPMN 2.0 Enterprise Process Models (Multi-Swimlane Specification)"
            subtitle="Standardized business process choreography spanning Requester, Buyer, Warehouse, Finance, and Supplier"
          >
            <div className="space-y-6 text-xs">
              {/* Diagram 1: P2P */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Procure-to-Pay (P2P) To-Be Workflow & 3-Way Match Verification
                </h4>
                <div className="font-mono text-[11px] p-4 bg-slate-950 text-slate-100 rounded-lg overflow-x-auto leading-relaxed">
                  +---------------------------------------------------------------------------------------------------------+<br />
                  | SWIMLANE 1: Requester      | [Create Purchase Requisition (PR)] --&gt; (Submit for Buyer Approval)         |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 2: Procurement    | [Review PR] --&gt; &lt;Approved?&gt; ==Yes==&gt; [Convert PR to PO] --&gt; [Send to Vendor]|<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 3: Vendor Dock    | [Ship Goods] --&gt; [Deliver Physical Stock with Delivery Note to Warehouse]  |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 4: Warehouse      | [Post Goods Receipt (Mvt 101)] --&gt; [Increment Material Master Stock]       |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 5: Finance / AP   | [Receive Supplier Invoice] --&gt; &lt;Run Automated 3-Way Match: PO vs GR vs Inv&gt;|<br />
                  |                            |       |-- Variances Found (RULE-001/002) --&gt; [Set SAP Block R &amp; Raise EXC] |<br />
                  |                            |       +-- Tolerances Satisfied   --&gt; [Set Payment-Ready &amp; Execute Payment] |<br />
                  +---------------------------------------------------------------------------------------------------------+
                </div>
              </div>

              {/* Diagram 2: O2C */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Order-to-Cash (O2C) To-Be Workflow & Credit Governance
                </h4>
                <div className="font-mono text-[11px] p-4 bg-slate-950 text-slate-100 rounded-lg overflow-x-auto leading-relaxed">
                  +---------------------------------------------------------------------------------------------------------+<br />
                  | SWIMLANE 1: Customer       | [Submit Inquiry / RFQ] ------------------&gt; [Receive Shipment &amp; Pay Invoice] |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 2: Sales Team     | [Qualify Inquiry] --&gt; [Convert to Sales Order] --&gt; &lt;ATP Stock &amp; Credit Check&gt;|<br />
                  |                            |       |-- Credit Exceeded (RULE-009) --&gt; [Apply SAP Credit Block &amp; Raise EXC]|<br />
                  |                            |       +-- Credit &amp; Stock Validated  --&gt; [Confirm Sales Order]               |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 3: Logistics      | [Generate Outbound Delivery Document] --&gt; [Warehouse Picking Confirmation]   |<br />
                  |                            |       --&gt; [Post Outbound Goods Issue (Mvt 601)] --&gt; [Deduct Material Stock]  |<br />
                  +----------------------------+----------------------------------------------------------------------------+<br />
                  | SWIMLANE 4: Finance / AR   | [Generate Customer Billing Document (Invoice)] --&gt; &lt;Monitor Receivables&gt;  |<br />
                  |                            |       |-- Past Due Date (RULE-010) --&gt; [Trigger Automated Dunning Notice]  |<br />
                  |                            |       +-- Payment Received       --&gt; [Clear Customer Balance &amp; Close SO]   |<br />
                  +---------------------------------------------------------------------------------------------------------+
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: FUNCTIONAL SPECIFICATION (FSD) */}
      {activeTab === 'fsd' && (
        <div className="space-y-6">
          <Card
            title="Functional Specification Document (FSD) Summary"
            subtitle="Adhering to enterprise SAP consulting deliverable standards"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">Document Control</span>
                <span className="text-slate-500">
                  Doc ID: FSD-MM-SD-CT-001 • Version: 2.4 • Author: Junior Functional Consultant • Status: Approved for Implementation
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'FR-P2P-001',
                    title: 'Purchase Requisition Conversion to Purchase Order',
                    desc: 'The system shall allow an approved Purchase Requisition to be converted into a binding Purchase Order.',
                    input: 'Approved PR ID, Target Vendor ID, Purchasing Org ID, Planned Delivery Date.',
                    proc: 'Validate vendor active status, verify purchasing tolerances, instantiate PO line items, and transition PR status to CONVERTED_TO_PO.',
                    output: 'Purchase Order in APPROVED or SENT_TO_VENDOR status with linked line items.',
                    rules: 'RULE-007 (Open PO aging tracking).',
                    accept: 'A valid approved PR generates an operational PO with complete relational integrity; no duplicate conversions permitted.',
                  },
                  {
                    id: 'FR-P2P-002',
                    title: 'Movement Type 101 Goods Receipt Dock Posting',
                    desc: 'The warehouse team shall record physical delivery against an open PO, updating inventory stock on hand.',
                    input: 'PO Number, Delivery Note Number, Received Quantity, Rejected Quantity.',
                    proc: 'Verify PO status is Sent/Partial. Validate delivery tolerance (RULE-003). Increment Material Master current stock. Update PO item received quantity.',
                    output: 'Goods Receipt document (Movement 101), updated Material stock.',
                    rules: 'RULE-003 (Delivery Tolerance), RULE-004 (Safety stock buffer), RULE-005 (Reorder level).',
                    accept: 'Physical receipts instantly reflect in warehouse stock on hand and unlock 3-way invoice matching.',
                  },
                  {
                    id: 'FR-P2P-003',
                    title: 'Automated Three-Way Matching (PO vs GR vs Invoice)',
                    desc: 'Incoming vendor invoices shall be reconciled against PO contractual prices and verified dock receipts.',
                    input: 'Supplier Invoice Number, Referenced PO ID, Line item invoiced quantities and unit prices.',
                    proc: 'Execute automated comparison: (1) Invoiced Qty vs GR Qty (RULE-001); (2) Invoiced Price vs PO Price within Vendor Price Tolerance % (RULE-002).',
                    output: 'Invoice Match Status: MATCHED (Payment Ready) or PRICE_VARIANCE / QUANTITY_VARIANCE (Blocked with Exception EXC-XXX).',
                    rules: 'RULE-001 (Quantity variance), RULE-002 (Price variance).',
                    accept: 'Discrepancies automatically halt financial payment runs and log structured exceptions with root cause analysis.',
                  },
                  {
                    id: 'FR-O2C-001',
                    title: 'Sales Order Credit Exposure Check & Available-to-Promise (ATP)',
                    desc: 'During sales order creation, system shall evaluate customer credit limits and warehouse inventory availability.',
                    input: 'Customer ID, Requested Material ID, Order Quantity, Sales Org ID.',
                    proc: 'Verify stock on hand >= requested quantity (RULE-008). Compute total exposure = Customer Current Balance + Order Value. Check exposure <= Credit Limit (RULE-009).',
                    output: 'Sales Order confirmed or placed on SAP Credit Hold (Status: DRAFT / Credit: BLOCKED).',
                    rules: 'RULE-008 (ATP fulfillment risk), RULE-009 (Credit limit breach).',
                    accept: 'Over-limit orders are blocked from warehouse delivery release until Credit Manager financial clearance.',
                  },
                  {
                    id: 'FR-O2C-002',
                    title: 'Movement Type 601 Goods Issue & Billing Generation',
                    desc: 'Outbound dispatch of goods shall decrement physical inventory and trigger commercial billing.',
                    input: 'Outbound Delivery Note ID, Picking confirmation.',
                    proc: 'Verify picking complete. Post Goods Issue Movement 601 deducting stock from Material Master. Generate Customer Billing Document with payment terms.',
                    output: 'Goods Issue document, Customer Invoice, and updated customer balance.',
                    rules: 'RULE-006 (Delivery Delay), RULE-010 (Overdue receivables monitoring).',
                    accept: 'Goods Issue posting decrements warehouse stock and generates official VAT-compliant billing document.',
                  },
                ].map((fr) => (
                  <div
                    key={fr.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sap-blue">{fr.id}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fr.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{fr.rules}</span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">{fr.desc}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-200">Input:</span> {fr.input}</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-200">Processing:</span> {fr.proc}</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-200">Output:</span> {fr.output}</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-200">Acceptance:</span> {fr.accept}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: INTERVIEW PREPARATION */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <Card
            title="Junior Functional Consultant (MM/SD) Interview Preparation Suite"
            subtitle="25 Rigorous functional questions with strong factual answers grounded in the project codebase"
          >
            <div className="space-y-4 text-xs">
              {[
                {
                  q: '1. How did you model the Procure-to-Pay (P2P) lifecycle in this platform?',
                  a: 'I modeled the standard SAP MM process flow: Purchase Requisition (PR) -> Purchase Order (PO) -> Goods Receipt (Mvt 101 GR) -> Supplier Invoice Verification (MIRO) -> Payment-Ready status. Each document maintains explicit relational integrity with upstream and downstream records. State transitions enforce business rules—for instance, a PO cannot receive goods if cancelled, and an invoice cannot be paid without passing automated 3-way matching.',
                },
                {
                  q: '2. How does the Automated 3-Way Matching mechanism function in your project?',
                  a: 'Our 3-way matching engine compares three distinct operational sources: the Purchase Order (contracted price and ordered quantity), the Movement 101 Goods Receipt (physically accepted quantity at the warehouse dock), and the incoming Supplier Invoice (billed price and quantity). It evaluates RULE-001 (Quantity Variance: Invoiced > Received) and RULE-002 (Price Variance: Invoiced Price vs. PO Price against the Vendor Master price tolerance percentage). If a variance breaches tolerance, the system sets an SAP-style Block R, stops payment clearance, and generates an exception in the control tower queue.',
                },
                {
                  q: '3. What SAP Master Data entities did you implement and why are they important?',
                  a: 'I implemented Material Master (with Raw, Finished, and Trading categories, standard cost, selling price, current stock, safety stock, and reorder levels), Vendor Master (with payment terms, delivery lead times, price tolerances, and ratings), Customer Master (with credit limits, current receivables balances, and regional assignments), and Enterprise Structure (Plants, Storage Locations, Purchasing Organizations, Sales Organizations, and Distribution Channels). These masters enforce transactional governance and prevent orphaned records.',
                },
                {
                  q: '4. How did you model the Order-to-Cash (O2C) sales flow and credit checking?',
                  a: 'The O2C flow begins with a Customer Inquiry (RFQ), converted into a confirmed Sales Order. During conversion, the system executes an Available-to-Promise (ATP) check against Material stock on hand (RULE-008) and an automated Credit Check (RULE-009) comparing Customer Balance + Order Value against the Credit Limit. If credit is breached, the order is placed on SAP Credit Hold (Status: DRAFT, Credit: BLOCKED). After confirmation, Outbound Delivery is picked, and Posting Goods Issue (Movement Type 601) decrements physical stock and triggers Customer Billing.',
                },
                {
                  q: '5. What KPIs are tracked in your Control Towers, and are they real or mocked?',
                  a: 'All KPIs are calculated dynamically from actual database records and timestamps. In P2P, we compute PR Approval Time, PR-to-PO conversion duration, PO-to-GR dock receipt time, total P2P cycle time, 3-way match pass rate, and PO aging beyond 30 days. In O2C, we compute On-Time In-Full (OTIF) delivery rate, Order-to-Delivery duration, O2C cycle time, credit exposure utilization, and overdue customer invoice rates.',
                },
                {
                  q: '6. What is the difference between Movement Type 101 and Movement Type 601 in your system?',
                  a: 'Movement Type 101 represents Goods Receipt into the warehouse from a purchase order, increasing physical inventory stock on hand in the Material Master. Movement Type 601 represents Goods Issue for an outbound delivery to a customer, deducting inventory from the Material Master and committing the shipment.',
                },
                {
                  q: '7. How does your system handle exceptions and what is the functional resolution workflow?',
                  a: 'Exceptions are logged deterministically by the Business Rule Engine (RULE-001 through RULE-010). Each exception record captures rule ID, severity (Critical, High, Medium, Low), source document number, business impact, expected policy threshold, actual telemetry value, and variance. In the Exception Management Center, functional users can review the incident, investigate the discrepancy, assign notes, update workflow status (Open, Under Review, Resolved, Escalated), and unblock or amend documents with a full audit log entry.',
                },
                {
                  q: '8. How did you design the database to ensure enterprise data integrity?',
                  a: 'I designed a 3NF normalized relational PostgreSQL schema managed via Prisma ORM. Key design principles include mandatory foreign key constraints preventing orphaned transactions, check constraints on stock and tolerances, unique document numbers (PR-XXXXX, PO-XXXXX, etc.), composite keys on plant storage locations, and dedicated AuditLog and ExceptionRecord tables capturing state mutations.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
                >
                  <div className="font-bold text-slate-900 dark:text-white flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-sap-blue shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
