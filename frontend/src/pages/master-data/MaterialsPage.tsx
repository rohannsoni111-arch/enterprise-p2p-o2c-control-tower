import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Material } from '../../types';
import { Boxes, AlertCircle } from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMaterials = () => {
    setLoading(true);
    api.get('/materials', {
      params: {
        page,
        limit: 10,
        search,
        category,
        stockStatus,
      },
    })
      .then((res) => {
        if (res.data.success) {
          setMaterials(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching materials:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, [page, search, category, stockStatus]);

  const columns: Column<Material>[] = [
    {
      key: 'materialNumber',
      header: 'Material Number',
      render: (m) => (
        <div>
          <span className="font-mono font-bold text-sap-blue">{m.materialNumber}</span>
          <span className="block text-[11px] text-slate-400">{m.category}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Material Description',
      render: (m) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{m.name}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs">{m.description || 'Standard industrial material'}</div>
        </div>
      ),
    },
    {
      key: 'plant',
      header: 'Plant / Storage Loc',
      render: (m) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {m.plant?.code || 'PL1000'} / {m.storageLocation?.code || 'SL01'}
        </span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Current Stock',
      render: (m) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {m.currentStock} {m.uom}
        </span>
      ),
    },
    {
      key: 'safetyStock',
      header: 'Safety Stock',
      render: (m) => (
        <span className="font-mono text-slate-500">
          {m.safetyStock} {m.uom}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      render: (m) => (
        <span className="font-mono text-slate-500">
          {m.reorderLevel} {m.uom}
        </span>
      ),
    },
    {
      key: 'standardCost',
      header: 'Standard Cost',
      render: (m) => <span className="font-mono text-slate-600 dark:text-slate-300">€{m.standardCost.toFixed(2)}</span>,
    },
    {
      key: 'stockStatus',
      header: 'Stock Status',
      render: (m) => <Badge status={m.stockStatus} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-sap-blue" />
          <span>Material Master (SAP MM03 Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive inventory valuation, plant/storage location mapping, safety buffers, and economic reorder points.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={materials}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search material number, name, or description..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Categories"
        statusFilterOptions={[
          { label: 'Raw Materials (RAW)', value: 'RAW' },
          { label: 'Finished Goods (FINISHED)', value: 'FINISHED' },
          { label: 'Trading Goods (TRADING)', value: 'TRADING' },
        ]}
        statusFilterValue={category}
        onStatusFilterChange={(v) => { setCategory(v); setPage(1); }}
        secondaryFilterPlaceholder="All Stock Statuses"
        secondaryFilterOptions={[
          { label: 'Healthy Stock', value: 'HEALTHY' },
          { label: 'Reorder Recommended', value: 'REORDER_RECOMMENDED' },
          { label: 'Low Stock (Safety Buffer Breached)', value: 'LOW_STOCK' },
        ]}
        secondaryFilterValue={stockStatus}
        onSecondaryFilterChange={(v) => { setStockStatus(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
