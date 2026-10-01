import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { SalesOrder } from '../../types';
import { ShoppingCart, CheckCircle, ShieldAlert, GitCommit, Truck } from 'lucide-react';

export const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [creditStatus, setCreditStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/sales-orders', {
      params: { page, limit: 10, search, status, creditStatus },
    })
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching SOs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, status, creditStatus]);

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/sales-orders/${id}/confirm`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error confirming Sales Order');
    }
  };

  const columns: Column<SalesOrder>[] = [
    {
      key: 'soNumber',
      header: 'SO Number',
      render: (so) => <span className="font-mono font-bold text-emerald-600">{so.soNumber}</span>,
    },
    {
      key: 'customer',
      header: 'Customer Account',
      render: (so) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{so.customer.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {so.customer.customerNumber} • Region: {so.customer.region}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Ordered Products & Qty',
      render: (so) => {
        const item = so.items[0];
        return (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {item?.material?.name || 'Finished Good'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Ord: {item?.orderQuantity} | Del: {item?.deliveredQuantity} | Billed: {item?.billedQuantity}
            </div>
          </div>
        );
      },
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (so) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(so.orderDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Contract Total',
      render: (so) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          €{so.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'creditStatus',
      header: 'Credit Check',
      render: (so) => (
        <Badge
          status={so.creditStatus === 'APPROVED' ? 'APPROVED' : 'BLOCKED'}
          size="sm"
        />
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment Status',
      render: (so) => <Badge status={so.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (so) => (
        <div className="flex items-center gap-1.5">
          {so.status === 'DRAFT' && so.creditStatus !== 'BLOCKED' && (
            <button
              onClick={() => handleConfirm(so.id)}
              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium"
            >
              Confirm
            </button>
          )}

          <button
            onClick={() => navigate(`/trace?docType=SO&docNumber=${so.soNumber}`)}
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
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <span>Sales Orders (SAP VA01/VA03 Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Contracted sales commitments, automated Available-to-Promise (ATP) inventory checks, and credit limits.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search SO number, customer name, or account..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Fulfillment Statuses"
        statusFilterOptions={[
          { label: 'Confirmed (Ready to Deliver)', value: 'CONFIRMED' },
          { label: 'Partially Fulfilled', value: 'PARTIALLY_FULFILLED' },
          { label: 'Fulfilled', value: 'FULFILLED' },
          { label: 'Draft', value: 'DRAFT' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        secondaryFilterPlaceholder="Credit Check Status"
        secondaryFilterOptions={[
          { label: 'Credit Approved', value: 'APPROVED' },
          { label: 'Credit Blocked (Breached Limit)', value: 'BLOCKED' },
        ]}
        secondaryFilterValue={creditStatus}
        onSecondaryFilterChange={(v) => { setCreditStatus(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
