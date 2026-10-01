import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Customer } from '../../types';
import { Users } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/customers', {
      params: { page, limit: 10, search, region },
    })
      .then((res) => {
        if (res.data.success) {
          setCustomers(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching customers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, region]);

  const columns: Column<Customer>[] = [
    {
      key: 'customerNumber',
      header: 'Customer ID',
      render: (c) => <span className="font-mono font-bold text-sap-blue">{c.customerNumber}</span>,
    },
    {
      key: 'name',
      header: 'Customer Name & Territory',
      render: (c) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{c.name}</div>
          <div className="text-[11px] text-slate-400">
            {c.contactPerson} • {c.region}
          </div>
        </div>
      ),
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      render: (c) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {c.paymentTerms}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      header: 'Credit Limit',
      render: (c) => (
        <span className="font-mono text-slate-600 dark:text-slate-300">
          €{c.creditLimit.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'currentBalance',
      header: 'Current Exposure',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          €{c.currentBalance.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'creditUtilization',
      header: 'Credit Utilization',
      render: (c) => {
        const util = c.creditUtilizationPct || 0;
        return (
          <div className="min-w-[130px]">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span>{util.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  util >= 100 ? 'bg-rose-500' : util >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, util)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'riskStatus',
      header: 'Credit Status',
      render: (c) => <Badge status={c.creditRiskStatus} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-sap-blue" />
          <span>Customer Master (SAP XD03 Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Commercial B2B account profiles, sanctioned credit limits, and real-time open receivables exposure.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search customer name, account number, or contact..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Regions"
        statusFilterOptions={[
          { label: 'EMEA', value: 'EMEA' },
          { label: 'APAC', value: 'APAC' },
          { label: 'NA', value: 'NA' },
        ]}
        statusFilterValue={region}
        onStatusFilterChange={(v) => { setRegion(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
