import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { CustomerInvoice } from '../../types';
import { Receipt, DollarSign, GitCommit } from 'lucide-react';

export const CustomerInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInvoices = () => {
    setLoading(true);
    api.get('/customer-invoices', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setInvoices(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching customer invoices:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search, status]);

  const handlePay = async (id: string) => {
    try {
      await api.post(`/customer-invoices/${id}/pay`);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error recording customer payment');
    }
  };

  const columns: Column<CustomerInvoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Billing Doc #',
      render: (inv) => <span className="font-mono font-bold text-emerald-600">{inv.invoiceNumber}</span>,
    },
    {
      key: 'customer',
      header: 'Customer Account',
      render: (inv) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{inv.customer.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {inv.customer.customerNumber} • Del: {inv.delivery?.deliveryNumber}
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
      key: 'dates',
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
      key: 'status',
      header: 'Payment Status',
      render: (inv) => <Badge status={inv.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv) => (
        <div className="flex items-center gap-1.5">
          {inv.status !== 'PAID' && (
            <button
              onClick={() => handlePay(inv.id)}
              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium flex items-center gap-1 transition-colors"
              title="Record customer remittance"
            >
              <DollarSign className="w-3 h-3" />
              <span>Record Pay</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/trace?docType=CUSTOMER_INVOICE&docNumber=${inv.invoiceNumber}`)}
            className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
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
          <Receipt className="w-5 h-5 text-emerald-600" />
          <span>Customer Invoices & Billing (SAP VF01/VF03 Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Outbound commercial billing documents, tracking payment terms compliance, and accounts receivable dunning statuses.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search billing document, customer, or SO..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Billing Statuses"
        statusFilterOptions={[
          { label: 'Generated (Open Receivables)', value: 'GENERATED' },
          { label: 'Paid in Full', value: 'PAID' },
          { label: 'Overdue (Breached Terms)', value: 'OVERDUE' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
