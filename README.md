# Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower
### Subtitle: SAP MM/SD Process Simulation & Business Process Analytics Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.10+-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-20%20Passing-brightgreen.svg)]()

---

> ### ⚠️ EDUCATIONAL SIMULATION DISCLAIMER
> **This platform is an educational and portfolio business-process simulation inspired by SAP MM (Materials Management) and SAP SD (Sales and Distribution) enterprise workflows.**
> **It is NOT an official SAP product, is NOT affiliated with or endorsed by SAP SE, does NOT connect to an SAP ERP or SAP S/4HANA production instance, and does NOT execute proprietary SAP ABAP code.**
> All references to SAP transaction codes (`ME21N`, `MIGO`, `MIRO`, `VA01`, `VL01N`, `VF01`), movement types (`101`, `601`), and organizational structures are utilized exclusively for educational purposes to demonstrate functional business process modeling, enterprise data architecture, and supply chain control tower analytics.

---

## 1. Executive Summary & Target Role Alignment

The **Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower** is an enterprise-grade web application and analytical command center designed to showcase the competencies of a **Junior Functional Consultant (SAP MM/SD)** and **Business Process Analyst**.

### Target Role Alignment: Junior Consultant (Functional - SAP MM/SD)
This platform demonstrates mastery in:
- **SAP MM Functional Architecture**: Material Master maintenance, Purchasing Info Records, Reorder Point Planning, Purchase Requisitions, Purchase Orders, Goods Receipt Movement Type 101, and Supplier Invoice Verification.
- **SAP SD Functional Architecture**: Customer Master data, Sales Area setup, Sales Orders with real-time Credit Management and Available-to-Promise (ATP) checks, Outbound Deliveries, Picking, Post Goods Issue Movement Type 601, and Customer Billing.
- **Financial Controls & Internal Auditing**: Automated Three-Way Matching (PO vs GR vs Invoice), tolerance-based price/quantity variance detection, and payment release blocks (SAP R-Block).
- **Business Process Engineering**: As-Is vs To-Be process mapping, deterministic rule engine design, exception management workbenches, and cross-functional KPIs (OTIF, DSO, DPO, 3-Way Match Rate).
- **Enterprise Documentation**: Professional 21-section Functional Specification Document (FSD), BPMN 2.0 process flow diagrams, and technical architecture specifications.

---

## 2. Core Business Processes Simulated

### 2.1 Procure-to-Pay (P2P) Lifecycle
```
[Purchase Requisition (ME51N)]
            │ (Approval Workflow)
            ▼
[Purchase Order (ME21N)]
            │ (Vendor Dispatch)
            ▼
[Goods Receipt - Movement Type 101 (MIGO)]
            │ (Dock Inspection & Stock Increment)
            ▼
[Supplier Invoice Verification (MIRO)] ◄─── (3-Way Matching Engine)
            │
      ┌─────┴─────────────────────┐
      ▼                           ▼
[3-Way Matched]         [Price / Qty Variance Block]
      │                           │
      ▼                           ▼
[Payment Run: F110]     [Exception Workbench & Resolution]
```

1. **Purchase Requisition (PR)**: Internal demand document created by requestors or triggered by inventory reorder points (`RULE-004`/`RULE-005`). Transitions through `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, and `CONVERTED_TO_PO`.
2. **Purchase Order (PO)**: Legally binding commercial contract created from approved PRs. Tracks vendor lead times and open order aging (`RULE-007`).
3. **Goods Receipt (GR)**: Posted with **Movement Type 101** semantics upon dock delivery. Atomically increments `Material.currentStock` at the Plant and Storage Location level.
4. **Supplier Invoice Verification & 3-Way Match**: Evaluates invoice lines against PO and GR lines. Enforces vendor price and delivery tolerances. If invoiced quantities exceed received quantities (`RULE-001`) or unit prices deviate beyond tolerance (`RULE-002`), the invoice is automatically placed on financial payment block (`BLOCKED`).
5. **Accounts Payable Payment Run**: Releases and clears approved, unblocked invoices in batches.

---

### 2.2 Order-to-Cash (O2C) Lifecycle
```
[Customer Inquiry (VA11)]
            │ (Quotation & Negotiation)
            ▼
[Sales Order (VA01)] ◄─── (Real-time Credit & ATP Checks)
            │
            ▼
[Outbound Delivery (VL01N)]
            │
            ▼
[Warehouse Picking & Packing]
            │
            ▼
[Post Goods Issue - Movement Type 601 (PGI)] ───► (Inventory Stock Decrement)
            │
            ▼
[Customer Billing Document (VF01)]
            │
            ▼
[Cash Receipt & Accounts Receivable Clearing]
```

1. **Customer Inquiry**: Tracks commercial sales inquiries and quotations (`OPEN`, `CONVERTED`, `CLOSED`).
2. **Sales Order (SO)**: Books customer orders with real-time automated controls:
   - **Credit Limit Check (`RULE-009`)**: Verifies whether outstanding receivables plus new order value exceed authorized credit limit (`creditStatus = BLOCKED`).
   - **Available-to-Promise (ATP) Check (`RULE-008`)**: Verifies stock availability, flagging unfulfillable lines with `FULFILLMENT_RISK`.
3. **Outbound Delivery & Picking**: Stages warehouse shipping documents. Warehouse operators execute picking confirmation (`PENDING` -> `PICKING` -> `READY`).
4. **Post Goods Issue (PGI)**: Posted with **Movement Type 601** semantics upon carrier dispatch. Atomically decrements warehouse inventory and evaluates safety stock levels (`RULE-004`).
5. **Customer Billing & Invoicing**: Generates billing documents upon PGI, increments customer accounts receivable balances, and monitors overdue invoice aging (`RULE-010`).

---

## 3. SAP MM/SD Terminology & Functional Mapping

| Simulated Feature | SAP Module | Standard Transaction Code | Underlying SAP Database Table(s) | Business Function |
| :--- | :---: | :---: | :---: | :--- |
| **Material Master** | MM | `MM01` / `MM02` / `MM03` | `MARA`, `MARC`, `MARD` | Physical attributes, plant valuation, safety stock, reorder levels |
| **Vendor Master** | MM / FI | `XK01` / `XK02` / `XK03` | `LFA1`, `LFB1`, `LFM1` | Supplier terms, payment conditions, tolerances, ratings |
| **Customer Master** | SD / FI | `XD01` / `XD02` / `XD03` | `KNA1`, `KNB1`, `KNVV` | Sales area terms, credit limits, account receivable balances |
| **Purchase Requisition**| MM | `ME51N` / `ME52N` / `ME53N`| `EBAN` | Internal demand requisitioning and approval workflow |
| **Purchase Order** | MM | `ME21N` / `ME22N` / `ME23N`| `EKKO`, `EKPO` | External purchasing contract and vendor dispatch |
| **Goods Receipt** | MM / IM | `MIGO` (Movement 101) | `MKPF`, `MSEG` | Physical warehouse intake and inventory increment |
| **Invoice Verification**| MM / FI | `MIRO` / `MRBR` | `RBKP`, `RSEG` | Three-Way Matching, tolerance verification, payment block |
| **Payment Run** | FI / AP | `F110` | `BSIS`, `BSAS`, `BSIK` | Automated accounts payable disbursement |
| **Customer Inquiry** | SD | `VA11` / `VA12` / `VA13` | `VBAK`, `VBAP` | Pre-sales commercial inquiry and quotation |
| **Sales Order** | SD | `VA01` / `VA02` / `VA03` | `VBAK`, `VBAP`, `VBEP` | Contractual order booking with credit and ATP checks |
| **Credit Management** | SD / FI | `VKM1` / `FD32` | `KNKK` | Credit exposure control and sales order release blocks |
| **Outbound Delivery** | SD / LE | `VL01N` / `VL02N` | `LIKP`, `LIPS` | Warehouse logistics, shipping due lists, picking staging |
| **Post Goods Issue** | SD / IM | `VL02N` (Movement 601) | `MKPF`, `MSEG` | Stock decrement and transfer of title to customer |
| **Customer Billing** | SD / FI | `VF01` / `VF02` / `VF03` | `VBRK`, `VBRP` | Customer invoice generation and revenue booking |
| **Document Flow** | Cross | `VBFA` | `VBFA` | End-to-end predecessor and successor document lineage |

---

## 4. Deterministic Business Rule Catalog

The platform incorporates 10 active operational rules evaluated synchronously during transactional transitions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                       BUSINESS RULE TAXONOMY                           │
│                                                                        │
│   Procure-to-Pay (P2P):                                                │
│   ├─ RULE-001: Invoice Qty > Received Qty (Quantity Variance Block)    │
│   ├─ RULE-002: Invoice Price > PO Price Beyond Tolerance (Price Block) │
│   ├─ RULE-003: Dock Delivery Quantity Exceeds Tolerance                │
│   └─ RULE-007: Open PO Aging (> 30 Days Unfulfilled)                   │
│                                                                        │
│   Inventory & Logistics:                                               │
│   ├─ RULE-004: Stock Below Safety Stock Threshold (Critical Alert)     │
│   ├─ RULE-005: Stock Below Reorder Level (Replenishment Trigger)       │
│   └─ RULE-006: Supplier / Outbound Delivery Delay                      │
│                                                                        │
│   Order-to-Cash (O2C):                                                 │
│   ├─ RULE-008: Sales Order ATP Fulfillment Risk (Stock Deficit)        │
│   ├─ RULE-009: Customer Order Credit Limit Exposure Breach             │
│   └─ RULE-010: Customer Receivable Overdue Invoice Aging               │
└────────────────────────────────────────────────────────────────────────┘
```

Every generated exception features:
- **Quantitative Telemetry**: Actual value vs Expected benchmark vs Calculated variance delta.
- **Severity Classification**: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
- **Actionable Remediation**: Concrete operational guidance (e.g., "Request vendor credit memo", "Approve price override", "Execute emergency PR").
- **Audit Logging**: Actor attribution, timestamp, and resolution status history.

---

## 5. Control Tower Dashboards & Live Calculated KPIs

The platform provides three specialized command centers powered by **real database-aggregated queries** (zero hardcoded or mock statistics):

### 5.1 Executive Command Center
- **Total Spend Under Management**: Live sum of all executed Purchase Orders ($\sum \text{PO Value}$).
- **Total Booked Revenue**: Live sum of all confirmed Sales Orders ($\sum \text{SO Value}$).
- **Net Working Capital Exposure**: Dynamic delta between Accounts Receivable and Accounts Payable ($\text{Total AR} - \text{Total AP}$).
- **Active Exceptions Overview**: Total unresolved exceptions categorized by severity and functional area.

### 5.2 P2P Operational Control Tower
- **Three-Way Match Rate**:
  $$\text{Match Rate} = \frac{\text{Count of Auto-Matched Invoices}}{\text{Total Supplier Invoices}} \times 100$$
- **Days Payable Outstanding (DPO)**:
  $$\text{DPO} = \frac{\text{Outstanding Accounts Payable Balance}}{\text{Annual Procurement Spend} / 365}$$
- **Supplier On-Time Delivery (OTD)**:
  $$\text{Supplier OTD} = \frac{\text{Goods Receipts Received On or Before Due Date}}{\text{Total Goods Receipts}} \times 100$$
- **Blocked Invoices Value**: Cumulative financial value of invoices held on payment block.

### 5.3 O2C Operational Control Tower
- **Order Fulfillment Rate (OTIF - On-Time In-Full)**:
  $$\text{OTIF} = \frac{\text{Deliveries Dispatched On-Time with 100\% Picked Quantity}}{\text{Total Completed Deliveries}} \times 100$$
- **Days Sales Outstanding (DSO)**:
  $$\text{DSO} = \frac{\text{Outstanding Customer Accounts Receivable}}{\text{Annual Credit Sales} / 365}$$
- **Credit Block Rate**:
  $$\text{Credit Block Rate} = \frac{\text{Sales Orders Blocked on Credit Limit}}{\text{Total Sales Orders}} \times 100$$
- **Overdue Invoices Value**: Cumulative open customer receivables past due date.

---

## 6. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER (Vite + React 18)                 │
│  - Control Tower Dashboards (Executive, P2P, O2C)                      │
│  - Master Data Workbench (MM03 Materials, XK03 Vendors, XD03 Customers)│
│  - Transaction Terminals (ME51N, ME21N, MIGO, MIRO, VA01, VL01N, VF01) │
│  - Exception Center & Process Trace (SAP VBFA Document Flow)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 API GATEWAY & SECURITY LAYER (Express.js)               │
│  - JWT Bearer Authentication & RBAC Authorization Guards               │
│  - Request Correlation & Transactional Audit Logging Interceptor       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               ENTERPRISE SERVICE & DOMAIN LOGIC LAYER                  │
│  - P2P Transaction Orchestration (PR -> PO -> GR 101 -> MIRO)          │
│  - O2C Transaction Orchestration (Inquiry -> SO -> Picking -> GI 601)  │
│  - Real-time Credit Limit & Available-to-Promise (ATP) Verification    │
│  - Rule Engine (RULE-001..010) & 3-Way Matching Engine                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               DATA ACCESS LAYER (Prisma ORM & SQL Migrations)          │
│  - Atomic Database Transactions (Stock increments and decrements)      │
│  - Third Normal Form (3NF) Relational Models & Foreign Key Integrity  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  PERSISTENT RELATIONAL DATA LAYER                      │
│  - Development: Embedded SQLite (`dev.db`, Zero External Setup)        │
│  - Production: Containerized PostgreSQL 16 (Docker Compose)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Quick Start & Setup Guide

### 7.1 Option A: Local Development (Zero Configuration)
The local development environment uses embedded SQLite with zero external database prerequisites.

#### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/enterprise-p2p-o2c-control-tower.git
cd "Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Initialize Database & Seed Enterprise Master Data
```bash
cd ../backend

# Generate Prisma Client & Run Migrations
npm run db:migrate

# Seed 5 Plants, 10 SLocs, 15 Vendors, 25 Customers, 30 Materials,
# 50 PRs, 40 POs, 35 GRs, 40 Invoices, 50 SOs, and 32 Exceptions
npm run db:seed
```

#### 3. Run Automated Test Suite
```bash
# Execute unit and integration tests (20 tests covering rule engine and API)
npm test
```

#### 4. Launch Application
```bash
# Terminal 1: Launch Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Launch Frontend Web App (Port 5173)
cd ../frontend
npm run dev
```
Open your browser to `http://localhost:5173`.

---

### 7.2 Option B: Containerized Deployment (Docker Compose)
For production-like deployment with containerized PostgreSQL 16:

```bash
# Build and start all three containers (Database, Backend API, Frontend Nginx)
docker-compose up --build -d

# Verify container status
docker-compose ps
```
Access the application at `http://localhost:80`.

---

## 8. Demo User Personas & Credentials

The application provides a **1-Click Persona Switcher** in the top navigation bar. You can also sign in manually with any of these enterprise personas:

| Persona / Role | Username | Password | Organizational Assignment | Primary Business Scope |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Password123!` | Global Enterprise (Client 100) | Full system access, audit logs, configuration |
| **Procurement Specialist** | `procurement` | `Password123!` | Purchasing Org `PUR-01` | PRs, POs, Vendor Master, 3-Way Match |
| **Warehouse Clerk** | `warehouse` | `Password123!` | Plant `PLNT-01` / SLoc `SL-01` | Goods Receipt (101), Picking, Goods Issue (601) |
| **Finance Analyst** | `finance` | `Password123!` | Company Code `1000` | MIRO Invoices, 3-Way Match, Payment Run, Dunning |
| **Sales Representative** | `sales` | `Password123!` | Sales Org `SO-01` | Inquiries, Sales Orders, Customer Master, Deliveries |
| **Executive Management** | `executive` | `Password123!` | Corporate HQ | Executive, P2P, and O2C Control Tower Dashboards |

---

## 9. Automated Test Suite

The backend includes a comprehensive Jest test suite verifying business logic and transactional integrity:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **`RULE-001` Test**: Verifies invoice payment blocking when invoiced quantity exceeds received quantity.
- **`RULE-002` Test**: Verifies price variance detection when invoice unit price exceeds vendor tolerance.
- **`RULE-004` & `RULE-005` Tests**: Verifies safety stock and reorder point alerts upon stock decrement.
- **`RULE-008` & `RULE-009` Tests**: Verifies ATP stock deficit detection and credit limit sales order holds.
- **P2P Lifecycle Integration Test**: Verifies end-to-end execution of PR -> PO -> GR Mvt 101 -> MIRO 3-Way Match.
- **RBAC Security Guard Test**: Verifies `401 Unauthorized` on missing tokens and `403 Forbidden` on unauthorized roles.

---

## 10. Enterprise Documentation Suite

Detailed architectural and functional specifications are located in the `/docs` directory:

| Document | Description |
| :--- | :--- |
| [**Functional Specification Document (FSD)**](docs/Functional_Specification_Document.md) | Comprehensive 21-section consulting deliverable with RACI matrices, master data schemas, and functional requirements (`FR-001` to `FR-030`). |
| [**Technical Architecture Specification**](docs/Architecture.md) | Layered architecture, security model, request lifecycles, and deployment strategy. |
| [**Relational Database Design**](docs/Database_Design.md) | 3NF Entity-Relationship (ER) model, data dictionary, indexing, and constraint definitions. |
| [**Business Rule Catalog**](docs/Business_Rules.md) | Authoritative reference for `RULE-001` through `RULE-010` with formulas, tolerances, and truth tables. |
| [**REST API Documentation**](docs/API.md) | Complete endpoint specifications with sample request/response JSON payloads. |
| [**Interview Preparation Guide**](docs/Interview_Preparation.md) | 25+ real-world Junior Functional Consultant Q&As, 60s/2m elevator pitches, and SPRO mappings. |
| [**Resume Bullet Points**](docs/Resume_Bullets.md) | High-impact, STAR-formatted resume bullets and ATS keywords. |
| [**BPMN Process Diagrams**](docs/bpmn/) | Visual flowcharts for P2P As-Is/To-Be, O2C As-Is/To-Be, 3-Way Match, and Inventory Reorder. |

---

## 11. License & Academic Attribution
This project is open-source software licensed under the [MIT License](LICENSE).
Built for educational demonstration of SAP MM/SD enterprise business processes and digital control tower architecture.
