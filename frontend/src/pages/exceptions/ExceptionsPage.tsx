import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ExceptionRecord } from '../../types';
import { AlertTriangle, GitCommit, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ExceptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail & Resolution Modal
  const [selectedException, setSelectedException] = useState<ExceptionRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExceptions = () => {
    setLoading(true);
    api.get('/exceptions', {
      params: { page, limit: 10, search, severity, status, category },
    })
      .then((res) => {
        if (res.data.success) {
          setExceptions(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching exceptions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExceptions();
  }, [page, search, severity, status, category]);

  const handleOpenDetail = (ex: ExceptionRecord) => {
    setSelectedException(ex);
    setNewStatus(ex.status);
    setResolutionNotes(ex.resolutionNotes || '');
    setDetailModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;

    setActionLoading(true);
    try {
      await api.put(`/exceptions/${selectedException.id}`, {
        status: newStatus,
        resolutionNotes,
      });
      setDetailModalOpen(false);
      fetchExceptions();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error updating exception');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<ExceptionRecord>[] = [
    {
      key: 'exceptionNumber',
      header: 'Exception ID',
      render: (ex) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">{ex.exceptionNumber}</span>
          <span className="block font-mono text-[10px] text-slate-400">{ex.ruleCode}</span>
        </div>
      ),
    },
    {
      key: 'ruleName',
      header: 'Control Rule & Category',
      render: (ex) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{ex.ruleName}</div>
          <div className="text-[11px] text-slate-400">Category: {ex.category}</div>
        </div>
      ),
    },
    {
      key: 'sourceDocumentNumber',
      header: 'Source Document',
      render: (ex) => (
        <div>
          <span className="font-mono text-xs font-semibold text-sap-blue">{ex.sourceDocumentNumber}</span>
          <span className="block text-[10px] text-slate-400 uppercase">{ex.sourceDocumentType}</span>
        </div>
      ),
    },
    {
      key: 'businessImpact',
      header: 'Business Impact & Variance',
      render: (ex) => (
        <div className="max-w-md">
          <div className="text-slate-800 dark:text-slate-200 line-clamp-1">{ex.businessImpact}</div>
          <div className="font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{ex.variance}</div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (ex) => <Badge status={ex.severity} size="sm" />,
    },
    {
      key: 'status',
      header: 'Workflow Status',
      render: (ex) => <Badge status={ex.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (ex) => (
        <button
          onClick={() => handleOpenDetail(ex)}
          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors"
        >
          Review & Resolve
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Exception Management Center (Control Tower Incident Queue)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Automated control breach detection, 3-way matching discrepancies, price/quantity variances, delivery delays, and credit overruns.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={exceptions}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search exception number, document, impact, or rule..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Severities"
        statusFilterOptions={[
          { label: 'Critical Breaches', value: 'CRITICAL' },
          { label: 'High Priority', value: 'HIGH' },
          { label: 'Medium Priority', value: 'MEDIUM' },
        ]}
        statusFilterValue={severity}
        onStatusFilterChange={(v) => { setSeverity(v); setPage(1); }}
        secondaryFilterPlaceholder="All Workflow Statuses"
        secondaryFilterOptions={[
          { label: 'Open Incidents', value: 'OPEN' },
          { label: 'Under Review', value: 'UNDER_REVIEW' },
          { label: 'Resolved / Mitigated', value: 'RESOLVED' },
        ]}
        secondaryFilterValue={status}
        onSecondaryFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />

      {/* EXCEPTION DETAIL & RESOLUTION MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Exception Resolution: ${selectedException?.exceptionNumber}`}
        subtitle={`Rule: ${selectedException?.ruleCode} - ${selectedException?.ruleName}`}
        maxWidth="xl"
      >
        {selectedException && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Source Document</span>
                <div className="font-mono font-bold text-sap-blue text-sm">
                  {selectedException.sourceDocumentNumber} ({selectedException.sourceDocumentType})
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Severity</span>
                <Badge status={selectedException.severity} size="sm" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Expected Policy Threshold</span>
                <div className="text-slate-800 dark:text-slate-200 font-medium">{selectedException.expectedValue}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Captured Telemetry Value</span>
                <div className="text-slate-800 dark:text-slate-200 font-medium">{selectedException.actualValue}</div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Business Impact Assessment</label>
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
                {selectedException.businessImpact}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              >
                <option value="OPEN">OPEN (Unaddressed)</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Investigation in progress)</option>
                <option value="RESOLVED">RESOLVED (Variance accepted / corrected)</option>
                <option value="ESCALATED">ESCALATED (Forwarded to Executive Leadership)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Functional Resolution Action Log</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                rows={3}
                placeholder="Log operational justification, credit note reference, buyer confirmation, or override reason..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  navigate(`/trace?docType=${selectedException.sourceDocumentType}&docNumber=${selectedException.sourceDocumentNumber}`);
                }}
                className="text-sap-blue hover:underline flex items-center gap-1"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>View Full Document Flow</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white font-medium"
                >
                  {actionLoading ? 'Saving...' : 'Update Resolution'}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
