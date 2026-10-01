# O2C AS-IS PROCESS MODEL (LEGACY / MANUAL)
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower

```mermaid
flowchart TD
    subgraph Customer["Customer Commercial Channel"]
        A1([Customer Requests Quote]) --> A2[Email / Phone Order to Sales Rep]
    end

    subgraph Sales["Sales Operations"]
        A2 --> B1[Sales Rep Records Order in Spreadsheet]
        B1 --> B2[Call Warehouse to Inquire on Stock Availability]
        B2 --> B3[Call Credit Department for Customer Credit Standing]
        B3 --> B4[Manually Type Sales Order into Local Order Book]
        B4 --> B5[Print Order Confirmation PDF & Email Customer]
        B5 --> B6[Print Paper Pick Ticket for Warehouse]
    end

    subgraph Warehouse["Warehouse Dock & Logistics"]
        B6 --> C1[Pick Ticket Placed in Physical Dispatch Queue]
        C1 --> C2[Forklift Operator Picks Items from Memory / Bin]
        C2 --> C3{Is Full Stock Actually on Shelf?}
        C3 -->|No: Stock Missing| C4[Order Sits Partially Picked on Staging Floor]
        C4 --> C5[Phone Call Back to Sales Rep: Stockout]
        C3 -->|Yes: Full Stock| C6[Pack & Load onto Carrier Truck]
        C6 --> C7[Driver Signs Paper Bill of Lading]
        C7 --> C8[Warehouse Clerk Marks Ticket 'Shipped' in Day Log]
    end

    subgraph Billing["Finance & Accounts Receivable"]
        C8 --> D1[Paper Shipping Ticket Sent to Billing Clerk (Weekly)]
        D1 --> D2[Clerk Manually Types Invoice into AR Journal]
        D2 --> D3[Mail Paper Invoice to Customer Accounts Payable]
        D3 --> D4[Customer Pays 45-60 Days Later]
        D4 --> D5{Customer Paid Overdue Balance?}
        D5 -->|No: Delinquent| D6[Manual Collection Calls]
        D5 -->|Yes: Paid| D7([Deposit Check into Corporate Bank])
    end

    classDef error fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    classDef warning fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    class C4,C5,B2,B3,D1 error;
    class A2,B1,B4,C1,D2 warning;
```

### Critical As-Is Process Inefficiencies
1. **Manual Inquiries & Stockout Surprises**: Sales representatives confirm orders without real-time inventory visibility, discovering physical stockouts during warehouse picking.
2. **Blind Credit Exposure**: Orders are committed before finance verifies whether the customer is delinquent or exceeding credit lines.
3. **Delayed Billing Cycle**: Billing occurs days or weeks after physical dispatch, artificially inflating Days Sales Outstanding (DSO).
4. **Opaque Delivery Tracking**: Customers and sales reps lack real-time order tracking, leading to status inquiries and friction.
