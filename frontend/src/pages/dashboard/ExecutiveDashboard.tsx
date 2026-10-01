import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { MetricCard, Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  Activity,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  Boxes,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/executive')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Error loading executive dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-5 h-5 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
          <span>Aggregating enterprise telemetry across MM/SD pipelines...</span>
        </div>
      </div>
    );
  }

  const { kpiCards, operationalCounts, recentExceptions, recentAudits } = data;

  const comparisonData = [
    { name: 'Procurement Spend', value: Math.round(kpiCards.totalProcurementSpend) },
    { name: 'Sales Revenue', value: Math.round(kpiCards.totalSalesRevenue) },
  ];

  const processVolumeData = [
    { name: 'Requisitions', count: operationalCounts.totalPRs, color: '#0a6ed1' },
    { name: 'Purchase Orders', count: operationalCounts.totalPOs, color: '#0854a0' },
    { name: 'Sales Orders', count: operationalCounts.totalSOs, color: '#107e3e' },
    { name: 'Deliveries', count: operationalCounts.totalDeliveries, color: '#e29e00' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Executive Digital Control Tower</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
              LIVE TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise high-level governance, cross-functional health metrics, and exception monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/p2p-dashboard')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium hover:border-sap-blue text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-sap-blue" />
            <span>P2P Tower</span>
          </button>
          <button
            onClick={() => navigate('/o2c-dashboard')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium hover:border-sap-blue text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>O2C Tower</span>
          </button>
        </div>
      </div>

      {/* Top 8 Enterprise KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="P2P Process Health"
          value={`${kpiCards.p2pHealthScore}%`}
          subtitle="Variance & aging compliance"
          icon={<ShieldCheck className="w-5 h-5 text-sap-blue" />}
          badge={kpiCards.p2pHealthScore > 85 ? 'HEALTHY' : 'NEEDS ATTENTION'}
          badgeType={kpiCards.p2pHealthScore > 85 ? 'success' : 'warning'}
          onClick={() => navigate('/p2p-dashboard')}
        />
        <MetricCard
          title="O2C Process Health"
          value={`${kpiCards.o2cHealthScore}%`}
          subtitle="OTIF fulfillment benchmark"
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
          badge={kpiCards.o2cHealthScore > 85 ? 'HEALTHY' : 'NEEDS ATTENTION'}
          badgeType={kpiCards.o2cHealthScore > 85 ? 'success' : 'warning'}
          onClick={() => navigate('/o2c-dashboard')}
        />
        <MetricCard
          title="Open Exceptions"
          value={kpiCards.openExceptions}
          subtitle={`${kpiCards.criticalExceptions} critical breaches`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          badge={`${kpiCards.criticalExceptions} Critical`}
          badgeType="danger"
          onClick={() => navigate('/exceptions')}
        />
        <MetricCard
          title="Delayed Deliveries"
          value={kpiCards.delayedDeliveries}
          subtitle="Past promised customer ETA"
          icon={<Clock className="w-5 h-5 text-rose-500" />}
          badge={kpiCards.delayedDeliveries > 0 ? 'Action Req.' : 'Zero Delay'}
          badgeType={kpiCards.delayedDeliveries > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/deliveries')}
        />

        <MetricCard
          title="Procurement Spend"
          value={`€${(kpiCards.totalProcurementSpend / 1000).toFixed(1)}k`}
          subtitle="Approved Purchase Orders"
          icon={<ShoppingCart className="w-5 h-5 text-sap-blue" />}
          onClick={() => navigate('/purchase-orders')}
        />
        <MetricCard
          title="Commercial Sales"
          value={`€${(kpiCards.totalSalesRevenue / 1000).toFixed(1)}k`}
          subtitle="Contracted Sales Orders"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          onClick={() => navigate('/sales-orders')}
        />
        <MetricCard
          title="Low Stock Items"
          value={kpiCards.lowStockItemsCount}
          subtitle="Below safety stock buffer"
          icon={<Boxes className="w-5 h-5 text-amber-600" />}
          badge={kpiCards.lowStockItemsCount > 0 ? 'Stockout Risk' : 'Buffer OK'}
          badgeType={kpiCards.lowStockItemsCount > 0 ? 'warning' : 'success'}
          onClick={() => navigate('/materials')}
        />
        <MetricCard
          title="Transaction Velocity"
          value={operationalCounts.totalPRs + operationalCounts.totalSOs}
          subtitle="Active document flows"
          icon={<FileCheck2 className="w-5 h-5 text-sky-600" />}
          onClick={() => navigate('/trace')}
        />
      </div>

      {/* Financial & Document Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Financial Spend vs Commercial Sales"
          subtitle="Comparison of committed procurement spend against contracted revenue"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                  tickFormatter={(val) => `€${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`€${val.toLocaleString()}`, 'Total Amount']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#0a6ed1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Enterprise Document Volume"
          subtitle="Core transaction entities across MM and SD lifecycle states"
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processVolumeData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 12 }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#107e3e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Exceptions Queue Preview & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exception Feed */}
        <Card
          title="Priority Exception Queue"
          subtitle="Immediate action items requiring business resolution"
          action={
            <button
              onClick={() => navigate('/exceptions')}
              className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
            >
              <span>View All ({kpiCards.openExceptions})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3">
            {recentExceptions.map((ex: any) => (
              <div
                key={ex.id}
                onClick={() => navigate('/exceptions')}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-sap-blue/50 dark:hover:border-sap-blue/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all cursor-pointer flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{ex.exceptionNumber}</span>
                    <span className="font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                      {ex.ruleCode}
                    </span>
                    <Badge status={ex.severity} size="sm" />
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium">{ex.businessImpact}</div>
                  <div className="text-[11px] text-slate-400">
                    Source: <span className="font-mono text-slate-600 dark:text-slate-300">{ex.sourceDocumentNumber}</span> • Variance: {ex.variance}
                  </div>
                </div>

                <Badge status={ex.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Audit Log Preview */}
        <Card
          title="Enterprise Audit Trail"
          subtitle="Trace of system state mutations, buyer actions, and SAP movement postings"
          action={
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
            >
              <span>Full Audit Log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-2.5">
            {recentAudits.map((log: any) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                      {log.documentNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                    {log.details}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono block">@{log.username}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
