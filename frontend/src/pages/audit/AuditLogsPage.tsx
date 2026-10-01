import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { AuditLog } from '../../types';
import { History, Shield, Clock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    api.get('/audit-logs', {
      params: { page, limit: 15, search, module },
    })
      .then((res) => {
        if (res.data.success) {
          setLogs(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, module]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (log) => (
        <div className="font-mono text-xs">
          <span className="text-slate-800 dark:text-slate-200">
            {new Date(log.createdAt).toLocaleDateString()}
          </span>
          <span className="block text-[10px] text-slate-400">
            {new Date(log.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Actor & Role',
      render: (log) => (
        <div>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">@{log.username}</span>
          <span className="block text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 w-max mt-0.5">
            {log.role || 'USER'}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action & Module',
      render: (log) => (
        <div>
          <span className="font-mono font-bold text-sap-blue text-xs">{log.action}</span>
          <span className="block text-[10px] text-slate-400 uppercase font-mono">{log.module}</span>
        </div>
      ),
    },
    {
      key: 'documentNumber',
      header: 'Referenced Document',
      render: (log) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{log.documentNumber}</span>
          <span className="block text-[10px] text-slate-400 uppercase">{log.documentType}</span>
        </div>
      ),
    },
    {
      key: 'transition',
      header: 'State Transition',
      render: (log) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {log.previousStatus || 'INIT'} → {log.newStatus || 'N/A'}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Event Details',
      render: (log) => <span className="text-xs text-slate-500 max-w-sm truncate block">{log.details || '-'}</span>,
    },
    {
      key: 'ipAddress',
      header: 'IP Origin',
      render: (log) => <span className="font-mono text-[11px] text-slate-400">{log.ipAddress || '127.0.0.1'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-sap-blue" />
          <span>Enterprise Audit Trail (SAP Change Documents CDHDR/CDPOS)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Immutable logging of transactional state changes, approval events, movement postings, and user actor provenance.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        total={total}
        page={page}
        limit={15}
        onPageChange={setPage}
        searchPlaceholder="Search audit action, document number, or username..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Enterprise Modules"
        statusFilterOptions={[
          { label: 'Procure-to-Pay (P2P)', value: 'P2P' },
          { label: 'Order-to-Cash (O2C)', value: 'O2C' },
          { label: 'Master Data', value: 'MASTER_DATA' },
          { label: 'Exceptions Governance', value: 'EXCEPTION' },
        ]}
        statusFilterValue={module}
        onStatusFilterChange={(v) => { setModule(v); setPage(1); }}
        loading={loading}
      />
    </div>
  );
};
