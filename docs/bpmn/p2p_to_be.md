# P2P TO-BE PROCESS MODEL (DIGITAL CONTROL TOWER)
## Enterprise Procure-to-Pay (P2P) & Order-to-Cash (O2C) Digital Control Tower

```mermaid
flowchart TD
    subgraph Department["Requesting Department / System"]
        A1([Stock Drops Below Reorder Level]) -->|RULE-005 Trigger| A2[Auto-Generate Electronic PR: ME51N]
        A2 --> A3[Manager Receives Real-Time Approval Alert]
        A3 --> A4{Approve PR?}
        A4 -->|No| A5([PR Rejected with Reason])
        A4 -->|Yes| A6[PR Status: APPROVED]
    end

    subgraph Purchasing["Procurement Specialist"]
        A6 --> B1[1-Click Convert PR to PO: ME21N]
        B1 --> B2[System Validates Vendor Info & Tolerances]
        B2 --> B3[Dispatch Electronic PO to Vendor: SENT_TO_VENDOR]
        B3 --> B4[Start Vendor Lead-Time SLA Clock: RULE-006]
    end

    subgraph Warehouse["Warehouse Logistics"]
        B3 -.-> C1[Physical Shipment Dock Arrival]
        C1 --> C2[Dock Operator Scans PO Number]
        C2 --> C3[Post Goods Receipt Mvt 101: MIGO]
        C3 --> C4[(Atomic Stock Increment +ΔQ)]
        C4 --> C5[Clear Material Low-Stock Exception if Resolved]
    end

    subgraph Matching["Automated Rule & Matching Engine"]
        C3 --> D1[Electronic Invoice Received: MIRO]
        D1 --> D2{Automated 3-Way Match Check}
        D2 -->|RULE-001: Inv Qty > GR Qty| D3[Quantity Variance Exception]
        D2 -->|RULE-002: Price Var > Tol| D4[Price Variance Exception]
        D2 -->|Within Tolerances| D5[Invoice Status: MATCHED]
        
        D3 & D4 --> D6[Invoice Status: BLOCKED / R-Block]
        D6 --> D7[Route to Exception Management Workbench]
    end

    subgraph Finance["Accounts Payable Workbench"]
        D7 --> E1[AP Review: Vendor Credit Memo / Overwrite]
        E1 -->|Resolved| D5
        D5 --> E2[Automated Scheduled Payment Run]
        E2 --> E3([Electronic Funds Transfer / Paid Status])
    end

    classDef success fill:#dcfce7,stroke:#22c55e,stroke-width:2px;
    classDef warning fill:#fef3c7,stroke:#f59e0b,stroke-width:2px;
    classDef danger fill:#fee2e2,stroke:#ef4444,stroke-width:2px;
    class D5,E2,E3,C4 success;
    class D3,D4,D6 danger;
    class A2,B1,C3,E1 warning;
```

### To-Be Process Improvements
1. **Automated Requisition Generation**: Integrated with inventory balance alerts (`RULE-004`/`RULE-005`), eliminating stockouts.
2. **Instant PR-to-PO Conversion**: Line items, pricing, and vendor terms carry over with full referential integrity.
3. **Real-Time Stock Updates**: Movement Type 101 updates inventory balances atomically at the storage location level.
4. **Deterministic 3-Way Matching**: Automated line-item reconciliation with instant payment blocks on out-of-tolerance variances.
5. **Centralized Exception Workbench**: Clear assignment, quantitative telemetry, and auditable override resolution paths.
