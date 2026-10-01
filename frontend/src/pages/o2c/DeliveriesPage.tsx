import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Delivery } from '../../types';
import { Truck, CheckSquare, PackageCheck, GitCommit } from 'lucide-react';

export const DeliveriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = () => {
    setLoading(true);
    api.get('/deliveries', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setDeliveries(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching deliveries:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeliveries();
  }, [page, search, status]);

  const handlePick = async (deliveryId: string) => {
    try {
      await api.post(`/deliveries/${deliveryId}/pick`, {});
      fetchDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error picking delivery');
    }
  };

  const handleGoodsIssue = async (deliveryId: string) => {
    try {
      const res = await api.post(`/deliveries/${deliveryId}/goods-issue`, {});
      if (res.data.success) {
        alert(`Goods Issue posted: ${res.data.data.goodsIssue.giNumber}. Physical stock deducted via Movement Type 601.`);
        fetchDeliveries();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error posting Goods Issue');
    }
  };

  const columns: Column<Delivery>[] = [
    {
      key: 'deliveryNumber',
      header: 'Delivery Note #',
      render: (del) => (
        <div>
          <span className="font-mono font-bold text-emerald-600">{del.deliveryNumber}</span>
          <span className="block text-[10px] text-slate-400 font-mono">SO: {del.salesOrder?.soNumber}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer Destination',
      render: (del) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">
            {del.salesOrder?.customer?.name || 'Customer'}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Ship Point: {del.shippingPoint}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Fulfillment Quantities',
      render: (del) => {
        const item = del.items[0];
        return (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {item?.material?.name || 'Finished Product'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Planned: {item?.deliveryQuantity} | Picked: {item?.pickedQuantity}
            </div>
          </div>
        );
      },
    },
    {
      key: 'deliveryDate',
      header: 'Scheduled Date',
      render: (del) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(del.deliveryDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'goodsIssue',
      header: 'Movement 601 GI',
      render: (del) =>
        del.goodsIssue ? (
          <span className="font-mono text-xs text-emerald-600 font-semibold">
            {del.goodsIssue.giNumber}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Unposted</span>
        ),
    },
    {
      key: 'status',
      header: 'Delivery Status',
      render: (del) => <Badge status={del.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (del) => (
        <div className="flex items-center gap-1.5">
          {del.status === 'PENDING' && (
            <button
              onClick={() => handlePick(del.id)}
              className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-medium flex items-center gap-1"
            >
              <CheckSquare className="w-3 h-3" />
              <span>Pick Items</span>
            </button>
          )}

          {del.status === 'READY' && (
            <button
              onClick={() => handleGoodsIssue(del.id)}
              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1"
              title="Post Goods Issue (Movement 601)"
            >
              <PackageCheck className="w-3 h-3" />
              <span>Post GI (601)</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/trace?docType=DEL&docNumber=${del.deliveryNumber}`)}
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
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Outbound Deliveries & Picking (SAP VL01N/VL02N Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Warehouse picking, staged shipment tracking, and Posting Goods Issue (Movement Type 601) to deduct inventory stock.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search delivery note number, SO, or tracking..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Delivery Statuses"
        statusFilterOptions={[
          { label: 'Pending Picking', value: 'PENDING' },
          { label: 'Ready for Dispatch', value: 'READY' },
          { label: 'Delivered (Mvt 601 Posted)', value: 'DELIVERED' },
          { label: 'Delayed Delivery', value: 'DELAYED' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
