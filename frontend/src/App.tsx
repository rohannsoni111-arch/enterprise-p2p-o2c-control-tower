import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ExecutiveDashboard } from './pages/dashboard/ExecutiveDashboard';
import { P2PDashboard } from './pages/dashboard/P2PDashboard';
import { O2CDashboard } from './pages/dashboard/O2CDashboard';
import { PurchaseRequisitionsPage } from './pages/p2p/PurchaseRequisitionsPage';
import { PurchaseOrdersPage } from './pages/p2p/PurchaseOrdersPage';
import { GoodsReceiptsPage } from './pages/p2p/GoodsReceiptsPage';
import { SupplierInvoicesPage } from './pages/p2p/SupplierInvoicesPage';
import { CustomerInquiriesPage } from './pages/o2c/CustomerInquiriesPage';
import { SalesOrdersPage } from './pages/o2c/SalesOrdersPage';
import { DeliveriesPage } from './pages/o2c/DeliveriesPage';
import { CustomerInvoicesPage } from './pages/o2c/CustomerInvoicesPage';
import { ExceptionsPage } from './pages/exceptions/ExceptionsPage';
import { ProcessTracePage } from './pages/trace/ProcessTracePage';
import { BusinessRulesPage } from './pages/rules/BusinessRulesPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { MaterialsPage } from './pages/master-data/MaterialsPage';
import { VendorsPage } from './pages/master-data/VendorsPage';
import { CustomersPage } from './pages/master-data/CustomersPage';
import { OrgStructurePage } from './pages/master-data/OrgStructurePage';
import { ConsultantWalkthroughPage } from './pages/docs/ConsultantWalkthroughPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-500">
        Authenticating enterprise session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboards */}
          <Route index element={<ExecutiveDashboard />} />
          <Route path="p2p-dashboard" element={<P2PDashboard />} />
          <Route path="o2c-dashboard" element={<O2CDashboard />} />

          {/* Procure-to-Pay (MM) */}
          <Route path="purchase-requisitions" element={<PurchaseRequisitionsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="goods-receipts" element={<GoodsReceiptsPage />} />
          <Route path="supplier-invoices" element={<SupplierInvoicesPage />} />

          {/* Order-to-Cash (SD) */}
          <Route path="customer-inquiries" element={<CustomerInquiriesPage />} />
          <Route path="sales-orders" element={<SalesOrdersPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="customer-invoices" element={<CustomerInvoicesPage />} />

          {/* Governance & Exceptions */}
          <Route path="exceptions" element={<ExceptionsPage />} />
          <Route path="trace" element={<ProcessTracePage />} />
          <Route path="business-rules" element={<BusinessRulesPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />

          {/* Master Data */}
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="org-structure" element={<OrgStructurePage />} />

          {/* Consultant Walkthrough */}
          <Route path="consultant-walkthrough" element={<ConsultantWalkthroughPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
