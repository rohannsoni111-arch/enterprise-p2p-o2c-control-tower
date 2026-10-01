# P2P AS-IS PROCESS MODEL (LEGACY / MANUAL)
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower

```mermaid
flowchart TD
    subgraph Department["Requesting Department"]
        A1([Need Identified]) --> A2[Fill Paper Requisition Form]
        A2 --> A3[Physical Signature Routing]
        A3 --> A4{Approved by Manager?}
        A4 -->|No| A5([Requisition Rejected])
        A4 -->|Yes| A6[Inter-Office Mail to Purchasing]
    end

    subgraph Purchasing["Purchasing Team"]
        A6 --> B1[Manual Re-keying into Spreadsheet]
        B1 --> B2[Call / Email Vendors for Quotes]
        B2 --> B3[Issue Purchase Order via Email PDF]
        B3 --> B4[File Paper Copy in Binder]
    end

    subgraph Vendor["Supplier / Vendor"]
        B3 -.-> C1[Vendor Ships Materials]
        C1 -.-> C2[Vendor Mails Paper Invoice]
    end

    subgraph Warehouse["Warehouse Dock"]
        C1 --> D1[Physical Goods Arrive at Receiving Dock]
        D1 --> D2[Inspect Goods Against Paper Packing Slip]
        D2 --> D3[Sign Delivery Slip Copy]
        D3 --> D4[Manual Batch Log in Warehouse Binder]
    end

    subgraph Finance["Accounts Payable (Finance)"]
        C2 --> E1[Paper Invoice Received via Postal Mail]
        E1 --> E2[Invoice Staged in AP Sorting Tray]
        E2 --> E3[AP Clerk Manually Searches for Paper PO]
        E3 --> E4[AP Clerk Requests Dock Receiving Ticket]
        E4 --> E5{Discrepancy in Qty or Price?}
        E5 -->|Yes: Discrepancy Found| E6[Invoice Held in Physical Dispute Pile]
        E6 --> E7[Phone Calls / Emails to Vendor & Buyer]
        E5 -->|No: Matched| E8[Key Invoice into Accounting Journal]
        E8 --> E9[Wait for Fortnightly Check Run]
        E9 --> E10([Manual Check Signed & Mailed])
    end

    classDef error fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    classDef warning fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    class E6,A6,B1,E3,E4 error;
    class A2,B2,D4,E2 warning;
```

### Critical As-Is Process Inefficiencies
1. **Paper Requisitions & Manual Handoffs**: Requisitions sit on desks awaiting physical signatures with no SLA tracking.
2. **Double-Keying & Transcription Errors**: Purchasing re-enters requisition data into spreadsheets, introducing pricing and quantity errors.
3. **Decoupled Receiving Records**: Deliveries are logged in physical warehouse slips, leaving AP unaware that goods arrived.
4. **Post-Hoc Discrepancy Discovery**: Invoice variances are discovered weeks after shipment, delaying vendor payments and incurring late payment penalties.
5. **No Centralized Exceptions**: Unmatched invoices sit in filing cabinets without escalation workflows.
