# REST API SPECIFICATION & INTEGRATION MANUAL
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower
### Subtitle: SAP MM/SD Process Simulation & Business Process Analytics Platform

> **SPECIFICATION BASELINE**: Version 1.0.0. All endpoints accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Global API Standards & Envelope Conventions

### 1.1 Base URL & Environment Ports
- **Local Development**: `http://localhost:5000/api`
- **Docker Containerized**: `http://backend:5000/api` (reverse-proxied via Nginx on `http://localhost:80/api`)

### 1.2 Standard Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### 1.3 Standard Error Response Envelope
```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "VALIDATION_FAILED | UNAUTHORIZED | NOT_FOUND | INTERNAL_ERROR",
  "details": [ ... ]
}
```

### 1.4 HTTP Status Codes
- `200 OK`: Request succeeded and returned data.
- `201 Created`: Resource successfully created in database.
- `400 Bad Request`: Input validation failed or business rule violation occurred.
- `401 Unauthorized`: Missing or invalid JWT bearer token.
- `403 Forbidden`: Authenticated user lacks required role.
- `404 Not Found`: Resource identifier does not exist.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & Identity Endpoints

### 2.1 Authenticate User / Obtain JWT
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Payload**:
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "usr-admin-uuid",
        "username": "admin",
        "email": "admin@enterprise.com",
        "role": "ADMIN",
        "firstName": "System",
        "lastName": "Administrator",
        "plantId": "PLNT-01"
      }
    }
  }
  ```

### 2.2 Get Current User Profile
- **Route**: `GET /api/auth/me`
- **Access**: Authenticated

---

## 3. Master Data Endpoints

### 3.1 Materials (SAP MM03)
- **`GET /api/materials`**: Retrieve material master list with stock levels.
  - Query Params: `plantId`, `category`, `lowStockOnly` (`true`/`false`), `search`
- **`POST /api/materials`**: Create new material master record.
  - Body:
    ```json
    {
      "materialNumber": "MAT-20050",
      "materialName": "Precision Stainless Bearing 25mm",
      "materialCategory": "RAW_MATERIALS",
      "description": "High precision ball bearing for assembly works",
      "uom": "EA",
      "plantId": "PLNT-01",
      "storageLocationId": "SL-01",
      "currentStock": 500,
      "safetyStock": 100,
      "reorderLevel": 200,
      "standardCost": 45.50,
      "sellingPrice": 72.00
    }
    ```

### 3.2 Vendors (SAP XK03)
- **`GET /api/vendors`**: Retrieve vendor list with rating and tolerances.
- **`POST /api/vendors`**: Register new supplier.
  - Body:
    ```json
    {
      "vendorNumber": "VEND-10020",
      "vendorName": "Apex Precision Components Ltd",
      "email": "procurement@apexprecision.com",
      "paymentTerms": "NET30",
      "currency": "USD",
      "deliveryTolerance": 5.0,
      "priceTolerance": 3.0,
      "leadTimeDays": 10,
      "vendorRating": 4.7
    }
    ```

### 3.3 Customers (SAP XD03)
- **`GET /api/customers`**: Retrieve customer master records with credit balances.
- **`POST /api/customers`**: Register new enterprise customer.
  - Body:
    ```json
    {
      "customerNumber": "CUST-10030",
      "customerName": "Titan Industrial Machinery Corp",
      "email": "ap@titanmachinery.com",
      "paymentTerms": "NET30",
      "creditLimit": 250000.00,
      "shippingAddress": "4000 Industry Way, Detroit, MI 48201",
      "region": "North America"
    }
    ```

---

## 4. Procure-to-Pay (P2P) Endpoints

### 4.1 Purchase Requisitions (SAP ME51N)
- **`GET /api/purchase-requisitions`**: List all PRs.
- **`POST /api/purchase-requisitions`**: Create PR.
  - Body:
    ```json
    {
      "requestor": "John Doe",
      "department": "Manufacturing Ops",
      "plantId": "PLNT-01",
      "purchasingOrgId": "PUR-01",
      "items": [
        {
          "materialId": "mat-bearing-uuid",
          "quantity": 250,
          "uom": "EA",
          "estimatedPrice": 45.50,
          "deliveryDate": "2026-10-25"
        }
      ]
    }
    ```
- **`PATCH /api/purchase-requisitions/:id/approve`**: Departmental approval.
- **`PATCH /api/purchase-requisitions/:id/reject`**: Reject PR.

### 4.2 Purchase Orders (SAP ME21N)
- **`GET /api/purchase-orders`**: List POs with item lines.
- **`POST /api/purchase-orders`**: Create PO (or convert from PR).
  - Body:
    ```json
    {
      "purchaseRequisitionId": "pr-uuid-optional",
      "vendorId": "vend-apex-uuid",
      "purchasingOrgId": "PUR-01",
      "plantId": "PLNT-01",
      "expectedDeliveryDate": "2026-10-30",
      "paymentTerms": "NET30",
      "items": [
        {
          "lineNumber": 10,
          "materialId": "mat-bearing-uuid",
          "orderedQuantity": 250,
          "unitPrice": 45.50
        }
      ]
    }
    ```
- **`PATCH /api/purchase-orders/:id/send`**: Mark PO as sent to vendor (triggers lead-time clock).

### 4.3 Goods Receipts (SAP MIGO Movement 101)
- **`GET /api/goods-receipts`**: List Goods Receipts.
- **`POST /api/goods-receipts`**: Post physical Goods Receipt.
  - Body:
    ```json
    {
      "purchaseOrderId": "po-uuid",
      "deliveryNote": "BL-992144",
      "plantId": "PLNT-01",
      "storageLocationId": "SL-01",
      "items": [
        {
          "materialId": "mat-bearing-uuid",
          "receivedQuantity": 250,
          "acceptedQuantity": 250,
          "rejectedQuantity": 0,
          "uom": "EA"
        }
      ]
    }
    ```
  - *Effect*: Atomically updates `Material.currentStock` ($+250$) and updates PO status.

### 4.4 Supplier Invoices & 3-Way Match (SAP MIRO)
- **`GET /api/supplier-invoices`**: List supplier invoices.
- **`POST /api/supplier-invoices`**: Enter supplier invoice.
  - Body:
    ```json
    {
      "purchaseOrderId": "po-uuid",
      "goodsReceiptId": "gr-uuid",
      "vendorId": "vend-apex-uuid",
      "supplierInvoiceRef": "INV-APEX-8831",
      "dueDate": "2026-11-15",
      "items": [
        {
          "materialId": "mat-bearing-uuid",
          "invoicedQuantity": 250,
          "unitPrice": 45.50
        }
      ]
    }
    ```
- **`POST /api/supplier-invoices/:id/three-way-match`**: Execute 3-way match evaluation.
  - Response on success:
    ```json
    {
      "success": true,
      "data": {
        "invoiceId": "inv-uuid",
        "matchStatus": "MATCHED",
        "quantityMatched": true,
        "priceMatched": true,
        "varianceDetails": []
      }
    }
    ```
- **`POST /api/supplier-invoices/payment-run`**: Execute automated payment run for all approved, unblocked invoices.

---

## 5. Order-to-Cash (O2C) Endpoints

### 5.1 Sales Orders (SAP VA01)
- **`GET /api/sales-orders`**: List sales orders with credit and fulfillment statuses.
- **`POST /api/sales-orders`**: Create sales order.
  - Evaluates `RULE-009` (Credit limit) and `RULE-008` (ATP Inventory).
  - Body:
    ```json
    {
      "customerId": "cust-titan-uuid",
      "salesOrgId": "SO-01",
      "plantId": "PLNT-01",
      "requestedDeliveryDate": "2026-10-28",
      "items": [
        {
          "lineNumber": 10,
          "materialId": "mat-bearing-uuid",
          "orderedQuantity": 50,
          "unitPrice": 72.00
        }
      ]
    }
    ```

### 5.2 Outbound Deliveries & Goods Issue (SAP VL01N & Mvt 601)
- **`POST /api/deliveries`**: Create Outbound Delivery from Sales Order.
- **`POST /api/deliveries/:id/pick`**: Confirm warehouse picking.
- **`POST /api/deliveries/:id/goods-issue`**: Post Goods Issue (Movement 601).
  - *Effect*: Atomically decrements `Material.currentStock` ($-50$) and marks delivery as `DISPATCHED`.

### 5.3 Customer Invoicing (SAP VF01)
- **`POST /api/customer-invoices`**: Generate billing document referencing delivery.
  - *Effect*: Increments `Customer.currentBalance`.
- **`POST /api/customer-invoices/:id/pay`**: Record customer payment receipt.

---

## 6. Exception Management & Control Tower Analytics

### 6.1 Exception Center
- **`GET /api/exceptions`**: List exceptions with multi-parameter filtering.
  - Query Params: `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `category`, `status` (`OPEN`, `RESOLVED`, `UNDER_REVIEW`), `search`.
- **`PATCH /api/exceptions/:id/status`**: Update exception status.
  - Body:
    ```json
    {
      "status": "RESOLVED",
      "resolutionNotes": "Vendor provided credit memo CM-102 for $500 overbilling."
    }
    ```

### 6.2 Control Tower Dashboards
- **`GET /api/dashboard/executive`**: Executive KPIs (Spend, Revenue, Working Capital, Exception distributions).
- **`GET /api/dashboard/p2p`**: Operational P2P metrics (3-Way Match Rate, DPO, Vendor OTD, Open PO Aging).
- **`GET /api/dashboard/o2c`**: Operational O2C metrics (OTIF, DSO, Credit Block Rate, Overdue AR).
- **`GET /api/trace/:docType/:docId`**: Document Flow trace (returns complete graph tree for document).
- **`GET /api/audit-logs`**: Immutable transactional audit logs.
