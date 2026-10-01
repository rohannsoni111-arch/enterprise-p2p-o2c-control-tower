import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SupplierInvoice } from '../../types';
import { Receipt, Play, CheckCircle, AlertTriangle, GitCommit, DollarSign } from 'lucide-react';

export const SupplierInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [matchStatus, setMatchStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Match result dialog
  const [matchResult, setMatchResult] = useState<any>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  const fetchInvoices = () => {
    setLoading(true);
    api.get('/supplier-invoices', {
      params: { page, limit: 10, search, matchStatus, paymentStatus },
    })
      .then((res) => {
        if (res.data.success) {
          setInvoices(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching invoices:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search, matchStatus, paymentStatus]);

  const handleVerify = async (invoiceId: string) => {
    try {
      const res = await api.post(`/supplier-invoices/${invoiceId}/verify`);
      if (res.data.success) {
        setMatchResult(res.data.data);
        setResultModalOpen(true);
        fetchInvoices();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error executing 3-Way Match');
    }
  };

  const handlePay = async (invoiceId: string) => {
    try {
      await api.post(`/supplier-invoices/${invoiceId}/pay`);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error clearing invoice payment');
    }
  };

  const columns: Column<SupplierInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv) => <span className="font-mono font-bold text-sap-blue">{inv.invoiceNumber}</span>,
    },
    {
      key: 'vendor',
      header: 'Vendor & PO Reference',
      render: (inv) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{inv.vendor.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            PO: {inv.purchaseOrder?.poNumber || 'N/A'} • GR: {inv.goodsReceipt?.grNumber || 'Unverified'}
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Billed Amount',
      render: (inv) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          €{inv.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Invoice / Due Date',
      render: (inv) => (
        <div className="font-mono text-xs">
          <span className="text-slate-600 dark:text-slate-300">
            {new Date(inv.invoiceDate).toISOString().split('T')[0]}
          </span>
          <span className="block text-[10px] text-slate-400">
            Due: {new Date(inv.dueDate).toISOString().split('T')[0]}
          </span>
        </div>
      ),
    },
    {
      key: 'matchStatus',
      header: '3-Way Match Status',
      render: (inv) => (
        <div>
          <Badge status={inv.matchStatus} size="sm" />
          {inv.blockReason && (
            <span className="block text-[10px] text-rose-500 truncate max-w-xs mt-0.5" title={inv.blockReason}>
              {inv.blockReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      render: (inv) => <Badge status={inv.paymentStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv) => (
        <div className="flex items-center gap-1.5">
          {inv.matchStatus === 'PENDING' && (
            <button
              onClick={() => handleVerify(inv.id)}
              className="px-2.5 py-1 rounded bg-sap-blue hover:bg-sap-darkBlue text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Run automated 3-Way Match evaluation"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Match</span>
            </button>
          )}

          {inv.paymentStatus === 'PAYMENT_READY' && (
            <button
              onClick={() => handlePay(inv.id)}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <DollarSign className="w-3 h-3" />
              <span>Clear Pay</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/trace?docType=SUPPLIER_INVOICE&docNumber=${inv.invoiceNumber}`)}
            className="p-1 rounded text-slate-400 hover:text-sap-blue transition-colors"
            title="Trace Document Flow"
          >
            <GitCommit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-sap-blue" />
          <span>Supplier Invoices & 3-Way Matching (SAP MIRO Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Automated line-item reconciliation reconciling PO ordered quantities/prices against Movement 101 Goods Receipts and vendor invoices.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search invoice number, PO, or vendor..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Match Statuses"
        statusFilterOptions={[
          { label: 'Matched (Cleared)', value: 'MATCHED' },
          { label: 'Pending Verification', value: 'PENDING' },
          { label: 'Price Variance (Blocked)', value: 'PRICE_VARIANCE' },
          { label: 'Quantity Variance (Blocked)', value: 'QUANTITY_VARIANCE' },
          { label: 'Blocked (No GR Found)', value: 'BLOCKED' },
        ]}
        statusFilterValue={matchStatus}
        onStatusFilterChange={(v) => { setMatchStatus(v); setPage(1); }}
        secondaryFilterPlaceholder="All Payment Statuses"
        secondaryFilterOptions={[
          { label: 'Unpaid', value: 'UNPAID' },
          { label: 'Payment Ready', value: 'PAYMENT_READY' },
          { label: 'Paid', value: 'PAID' },
        ]}
        secondaryFilterValue={paymentStatus}
        onSecondaryFilterChange={(v) => { setPaymentStatus(v); setPage(1); }}
        loading={loading}
      />

      {/* 3-WAY MATCH RESULT MODAL */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Three-Way Match Verification Outcome"
        subtitle="Automated reconciliation of PO line item, Goods Receipt, and Invoice"
      >
        <div className="space-y-4 text-xs">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              matchResult?.passed
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {matchResult?.passed ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {matchResult?.passed ? '3-Way Match Verified (Passed)' : `Verification Failed: ${matchResult?.matchStatus}`}
              </div>
              <p className="mt-1 text-xs">
                {matchResult?.passed
                  ? 'All billed line items strictly conform to the purchase order price and dock goods receipt quantities within configured tolerances.'
                  : matchResult?.blockReason || matchResult?.message}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Reconciliation Logic Evaluated:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>RULE-001 (Quantity Check): Invoiced Quantity ≤ Movement 101 GR Received Quantity</li>
              <li>RULE-002 (Price Check): Invoiced Price within Vendor Price Tolerance % of PO Price</li>
              <li>Status Transition: Set to {matchResult?.matchStatus}</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setResultModalOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-sap-blue text-white font-medium"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
