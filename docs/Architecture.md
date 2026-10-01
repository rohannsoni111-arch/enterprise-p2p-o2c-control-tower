# TECHNICAL ARCHITECTURE & SYSTEM DESIGN SPECIFICATION
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower
### Subtitle: SAP MM/SD Process Simulation & Business Process Analytics Platform

> **SYSTEM CLASSIFICATION**: Educational and portfolio enterprise process simulation platform. This architecture models enterprise SAP MM/SD transactional behavior, business rule telemetry, and control tower analytics with enterprise-grade modularity and data integrity.

---

## 1. Architectural Overview & Design Principles

The Digital Control Tower is engineered using a **Layered Clean Architecture** pattern. The application cleanly decouples presentation, routing, enterprise domain logic, rule evaluation, and persistent storage.

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
│  - CORS & Rate Limiting                                                │
│  - JWT Bearer Authentication & Claims Extraction                       │
│  - Role-Based Access Control (RBAC) Guards                             │
│  - Global Audit Interceptor & Request Correlation Logging              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               ENTERPRISE SERVICE & DOMAIN LOGIC LAYER                  │
│  - P2P Transaction Orchestration (PR -> PO -> GR 101 -> MIRO)          │
│  - O2C Transaction Orchestration (Inquiry -> SO -> Picking -> GI 601)  │
│  - Real-time Credit Limit & Available-to-Promise (ATP) Verification    │
│  - Control Tower Analytics & KPI Computation Engines                   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│   BUSINESS RULE & MATCH ENGINE    │ │     AUDIT & EVENT SUBSYSTEM      │
│  - RULE-001: Invoice Qty > GR Qty │ │  - Transactional Change History  │
│  - RULE-002: Price Variance Block │ │  - Actor / Persona Attribution   │
│  - RULE-003: Dock Delivery Var    │ │  - Security & Override Auditing  │
│  - RULE-004..010 Evaluation       │ └──────────────────────────────────┘
└──────────────────┬────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               DATA ACCESS LAYER (Prisma ORM & SQL Migrations)          │
│  - Relational Schema Abstraction & Type-Safe Query Construction       │
│  - ACID Transactions (Atomic stock increments and decrements)         │
│  - Foreign Key Referential Integrity & Cascading Policies              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  PERSISTENT RELATIONAL DATA LAYER                      │
│  - Development Runtime: Embedded SQLite (`dev.db`, Zero-Config)        │
│  - Production Runtime: PostgreSQL 16 (Containerized Multi-Zone)        │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Design Principles:
1. **Single Source of Truth**: All operational KPIs (OTIF, DSO, DPO, 3-Way Match Rate) are computed in real time from transactional tables via SQL aggregation—eliminating artificial or static mock stats.
2. **Deterministic Business Rules**: Rules are decoupled into an explainable evaluation service (`RuleEngine`) that produces structured exception records containing actual values, expected benchmarks, calculated variances, and recommended actions.
3. **Atomic Material Movements**: Every Goods Receipt (Movement 101) and Goods Issue (Movement 601) operates inside an atomic database transaction to prevent inventory desynchronization.
4. **Zero-Dependency Local Portability**: While enterprise PostgreSQL is fully supported via Docker Compose, the local development environment runs seamlessly on embedded SQLite with zero external database installation prerequisites.

---

## 2. Technology Stack & Decision Rationale

| Layer | Component | Technology Selection | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | Single Page App | React 18 + TypeScript | Component-based, highly responsive virtual DOM; rigorous type safety across complex SAP data structures. |
| **Build Tooling**| Bundler & Dev Server| Vite 5 | Sub-second Hot Module Replacement (HMR) and optimized rollup production bundles. |
| **Styling** | Utility CSS | Tailwind CSS + Lucide Icons | Clean enterprise aesthetic, high-density data tables, responsive layouts, and native dark mode support. |
| **Visualization**| Analytics Charts | Recharts | Declarative SVG charting library with smooth animations for spend, velocity, and exception distribution. |
| **Backend API** | REST Server | Node.js (v20+) + Express | High-concurrency asynchronous I/O, lightweight footprint, and universal TypeScript interoperability. |
| **Type Safety** | Language | TypeScript 5.3+ | End-to-end interface parity between database models, API payloads, and frontend states. |
| **Data Access** | ORM & Query Builder | Prisma ORM | Automated migrations, type-safe query generation, relation preloading, and dialect portability. |
| **Local Database**| Embedded RDBMS | SQLite 3 | Self-contained, zero-configuration local persistence allowing immediate verification on any developer workstation. |
| **Prod Database** | Enterprise RDBMS | PostgreSQL 16 | ACID-compliant relational engine with advanced indexing, JSONB support, and high write concurrency. |
| **Security** | Auth & Encryption | JWT + bcryptjs | Industry-standard stateless bearer token authentication with cryptographically salted password hashing. |
| **Containers** | Infrastructure | Docker & Docker Compose | Multi-container reproducible runtime packaging backend, frontend, and PostgreSQL database. |

---

## 3. Security Architecture & RBAC

```
+------------------+         +-----------------------+         +-------------------------+
|   Client App     |         |     Auth Middleware   |         |      RBAC Controller    |
+--------+---------+         +-----------+-----------+         +------------+------------+
         |                               |                                  |
         | HTTP Request + Bearer JWT     |                                  |
         +------------------------------>+                                  |
         |                               | Verify Token Signature           |
         |                               | Extract User Claims              |
         |                               +--------------------------------->+
         |                                                                  | Check Required Roles
         |                                                                  | against Route Policy
         |                               <----------------------------------+
         |                               | Allow / Deny (403 Forbidden)     |
         |                               +----------------------------------+
         v                               |
    Route Execution <--------------------+
```

### 3.1 Authentication & Session Handling
- **Stateless Tokens**: The system issues cryptographically signed JWT tokens upon login (`POST /api/auth/login`).
- **Claim Structure**:
  ```json
  {
    "id": "usr-admin-uuid",
    "username": "admin",
    "role": "ADMIN",
    "plantId": "PLNT-01",
    "iat": 1759312000,
    "exp": 1759398400
  }
  ```
- **Password Protection**: Passwords are never stored in plaintext. They are hashed using `bcryptjs` with 10 salt rounds.

### 3.2 Role-Based Access Control (RBAC) Matrix
The authorization middleware (`authorize(allowedRoles)`) guards transactional write endpoints:

| Endpoint Resource | Allowed Roles | Description / Business Permission |
| :--- | :--- | :--- |
| `POST /api/purchase-requisitions` | `ADMIN`, `PROCUREMENT` | Create purchase requisitions |
| `PATCH /api/purchase-requisitions/:id/approve` | `ADMIN`, `PROCUREMENT` | Departmental PR approval |
| `POST /api/purchase-orders` | `ADMIN`, `PROCUREMENT` | Formal Purchase Order creation |
| `POST /api/goods-receipts` | `ADMIN`, `WAREHOUSE` | Post physical stock arrival (Mvt 101) |
| `POST /api/supplier-invoices` | `ADMIN`, `FINANCE` | Enter vendor invoice (MIRO) |
| `POST /api/supplier-invoices/:id/three-way-match`| `ADMIN`, `FINANCE` | Run 3-Way Match evaluation |
| `POST /api/supplier-invoices/payment-run` | `ADMIN`, `FINANCE` | Clear payable invoices for payment |
| `POST /api/sales-orders` | `ADMIN`, `SALES` | Sales order entry & credit verification |
| `POST /api/deliveries` | `ADMIN`, `WAREHOUSE`, `SALES` | Outbound delivery generation |
| `POST /api/deliveries/:id/goods-issue` | `ADMIN`, `WAREHOUSE` | Execute Goods Issue stock decrement (Mvt 601)|
| `PATCH /api/exceptions/:id/status` | `ADMIN`, `PROCUREMENT`, `FINANCE` | Resolve or override business exceptions |

---

## 4. End-to-End Transactional Data Flows

### 4.1 Procure-to-Pay (P2P) Flow with 3-Way Matching
```
[ME51N: Purchase Requisition]
       │
       ▼ (Approval & Conversion)
[ME21N: Purchase Order]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[MIGO: Goods Receipt - Mvt 101]    [MIRO: Supplier Invoice]
       │                                 │
       │ (Stock Incremented +ΔQ)         │ (Receivable Entered)
       └────────────────┬────────────────┘
                        │
                        ▼
           [3-Way Match Rule Engine]
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
   [Discrepancy Detected]    [Within Tolerances]
           │                         │
     RULE-001 / RULE-002             ▼
           ▼                  Status: MATCHED
   Status: BLOCKED                   │
   Exception Logged                  ▼
   AP Review Required         [Payment Run Executed]
```

### 4.2 Order-to-Cash (O2C) Flow with ATP & Credit Checks
```
[VA11: Customer Inquiry]
       │
       ▼
[VA01: Sales Order Creation]
       │
       ├───► [RULE-009: Credit Check] ───► If (Balance + Value > Limit) ──► Status: CREDIT_BLOCKED
       │
       ├───► [RULE-008: ATP Stock Check] ──► If (Order Qty > Available) ──► Flag: FULFILLMENT_RISK
       │
       ▼
[Order Confirmed]
       │
       ▼
[VL01N: Outbound Delivery & Picking]
       │
       ▼
[Post Goods Issue - Mvt 601] ───► Atomic DB Tx: Decrement Material Stock (-ΔQ)
       │                         Check Safety Stock (RULE-004) / Reorder (RULE-005)
       ▼
[VF01: Customer Invoice] ───────► Increment Customer Current Balance (+Δ$)
       │
       ▼
[Cash Receipt / Dunning Aging (RULE-010)]
```

---

## 5. Business Rule Engine Architecture

The rule evaluation engine (`src/rules/ruleEngine.ts`) implements a decoupled, event-driven architecture:

```
[Transactional Event Occurs] ──► [Evaluate Rules Pipeline]
                                          │
    ┌─────────────────────────────────────┼─────────────────────────────────────┐
    ▼                                     ▼                                     ▼
[P2P Rules: 001, 002, 003, 007]   [O2C Rules: 008, 009, 010]        [Inventory Rules: 004, 005, 006]
    │                                     │                                     │
    └─────────────────────────────────────┼─────────────────────────────────────┘
                                          │
                                          ▼
                               [Structured Rule Output]
                               - Rule ID & Description
                               - Expected Benchmark vs Actual Measured
                               - Quantitative Variance
                               - Severity Classification
                               - Actionable Remediation Step
                                          │
                                          ▼
                           [Persist in `Exception` Table]
                                          │
                                          ▼
                         [Log Transactional `AuditLog`]
```

---

## 6. Performance & Scalability Design

1. **Composite & Targeted Indexes**:
   - `Material`: Indexed on `materialNumber`, `plantId`, `storageLocationId`, `currentStock`.
   - `PurchaseOrder`: Indexed on `poNumber`, `vendorId`, `status`, `orderDate`.
   - `SalesOrder`: Indexed on `soNumber`, `customerId`, `status`, `orderDate`.
   - `Exception`: Indexed on `ruleId`, `severity`, `status`, `documentNumber`.
2. **Atomic In-Database Operations**:
   - Stock increments and decrements use atomic transactional steps to prevent race conditions during concurrent warehouse postings.
3. **Optimized Aggregation Queries**:
   - Executive and operational KPIs use specialized SQL `_count`, `_sum`, and `_avg` operations with indexed `WHERE` filters, keeping response times under $300\text{ms}$.

---

## 7. Deployment & Infrastructure Strategy

### 7.1 Development Environment (Zero-Config)
- **Local Engine**: SQLite embedded database file (`backend/dev.db`).
- **Prerequisites**: Node.js 18+. Zero external database service installation required.
- **Workflow**: Automated Prisma migration and seed scripts populate enterprise mock data instantly.

### 7.2 Production Environment (Docker Compose)
- **Multi-Container Architecture**:
  - `control-tower-db`: PostgreSQL 16 Alpine container with persistent named volume `postgres_data`.
  - `control-tower-backend`: Node.js Alpine container with Prisma client connecting via `DATABASE_URL`.
  - `control-tower-frontend`: Nginx Alpine container serving optimized React static assets and reverse-proxying `/api` to the backend.
