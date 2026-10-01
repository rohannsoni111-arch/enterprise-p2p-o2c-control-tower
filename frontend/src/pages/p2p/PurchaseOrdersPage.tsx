import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { PurchaseOrder } from '../../types';
import { Package, Send, GitCommit, CheckCircle, XCircle } from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPOs = () => {
    setLoading(true);
    api.get('/purchase-orders', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setPos(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching POs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPOs();
  }, [page, search, status]);

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/purchase-orders/${id}/approve`);
      fetchPOs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error approving PO');
    }
  };

  const handleSendToVendor = async (id: string) => {
    try {
      await api.post(`/purchase-orders/${id}/send`);
      fetchPOs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error sending PO');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this purchase order?')) return;
    try {
      await api.post(`/purchase-orders/${id}/cancel`);
      fetchPOs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error cancelling PO');
    }
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (po) => <span className="font-mono font-bold text-sap-blue">{po.poNumber}</span>,
    },
    {
      key: 'vendor',
      header: 'Vendor & Plant',
      render: (po) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{po.vendor.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {po.vendor.vendorNumber} • Plant {po.plant?.code || 'PL1000'}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Order Items & Qty',
      render: (po) => {
        const item = po.items[0];
        return (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {item?.material?.name || 'Material item'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Ord: {item?.orderedQuantity} | Rec: {item?.receivedQuantity} | Inv: {item?.invoicedQuantity}
            </div>
          </div>
        );
      },
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (po) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(po.orderDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Net Total',
      render: (po) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          €{po.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (po) => <Badge status={po.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (po) => (
        <div className="flex items-center gap-1.5">
          {po.status === 'DRAFT' && (
            <button
              onClick={() => handleApprove(po.id)}
              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium"
            >
              Approve
            </button>
          )}

          {po.status === 'APPROVED' && (
            <button
              onClick={() => handleSendToVendor(po.id)}
              className="px-2 py-1 rounded bg-sap-blue hover:bg-sap-darkBlue text-white text-[11px] font-medium flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Send to Vendor</span>
            </button>
          )}

          {po.status !== 'CANCELLED' && po.status !== 'FULLY_RECEIVED' && po.status !== 'CLOSED' && (
            <button
              onClick={() => handleCancel(po.id)}
              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
              title="Cancel PO"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => navigate(`/trace?docType=PO&docNumber=${po.poNumber}`)}
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
          <Package className="w-5 h-5 text-sap-blue" />
          <span>Purchase Orders (SAP ME21N/ME23N Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Binding procurement commitments, tracking order fulfillment, receipt progression, and downstream invoice matching.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pos}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search PO number or vendor..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Statuses"
        statusFilterOptions={[
          { label: 'Approved (Ready to Send)', value: 'APPROVED' },
          { label: 'Sent to Vendor (Open)', value: 'SENT_TO_VENDOR' },
          { label: 'Partially Received', value: 'PARTIALLY_RECEIVED' },
          { label: 'Fully Received', value: 'FULLY_RECEIVED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
