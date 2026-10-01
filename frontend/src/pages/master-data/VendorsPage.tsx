import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Vendor } from '../../types';
import { Building2, Star } from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVendors = () => {
    setLoading(true);
    api.get('/vendors', {
      params: { page, limit: 10, search, paymentTerms },
    })
      .then((res) => {
        if (res.data.success) {
          setVendors(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching vendors:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors();
  }, [page, search, paymentTerms]);

  const columns: Column<Vendor>[] = [
    {
      key: 'vendorNumber',
      header: 'Vendor ID',
      render: (v) => <span className="font-mono font-bold text-sap-blue">{v.vendorNumber}</span>,
    },
    {
      key: 'name',
      header: 'Vendor Name & Contact',
      render: (v) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{v.name}</div>
          <div className="text-[11px] text-slate-400">
            {v.contactPerson} • {v.email}
          </div>
        </div>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      render: (v) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {v.paymentTerms}
        </span>
      ),
    },
    {
      key: 'tolerances',
      header: 'Tolerances (Price / Del)',
      render: (v) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          ±{v.priceTolerancePct}% price • ±{v.deliveryTolerancePct}% qty
        </span>
      ),
    },
    {
      key: 'leadTimeDays',
      header: 'Lead Time',
      render: (v) => <span className="font-mono text-xs">{v.leadTimeDays} Days</span>,
    },
    {
      key: 'rating',
      header: 'Performance Rating',
      render: (v) => (
        <div className="flex items-center gap-1 font-mono font-bold text-amber-500">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{v.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'ordersCount',
      header: 'Active POs',
      render: (v) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {v._count?.purchaseOrders || 0} POs
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sap-blue" />
          <span>Vendor Master (SAP XK03 Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Supplier directory with contractual payment terms, delivery lead times, and 3-way matching tolerance parameters.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search vendor name, ID, or contact person..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Payment Terms"
        statusFilterOptions={[
          { label: 'NET 30', value: 'NET30' },
          { label: 'NET 45', value: 'NET45' },
          { label: 'NET 60', value: 'NET60' },
        ]}
        statusFilterValue={paymentTerms}
        onStatusFilterChange={(v) => { setPaymentTerms(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
