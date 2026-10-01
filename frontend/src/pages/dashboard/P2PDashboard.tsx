import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { MetricCard, Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ShoppingCart,
  Clock,
  AlertTriangle,
  Truck,
  Receipt,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Boxes,
  Star,
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
  LineChart,
  Line,
} from 'recharts';

export const P2PDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/p2p')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Error loading P2P dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-5 h-5 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
          <span>Calculating Procure-to-Pay cycle times and vendor metrics...</span>
        </div>
      </div>
    );
  }

  const { metrics, poStatusDistribution, supplierScorecard, poAgingList, monthlySpendChart, lowStockMaterials } = data;

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: '#94a3b8',
    APPROVED: '#38bdf8',
    SENT_TO_VENDOR: '#0ea5e9',
    PARTIALLY_RECEIVED: '#f59e0b',
    FULLY_RECEIVED: '#10b981',
    CLOSED: '#64748b',
    CANCELLED: '#f43f5e',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Procure-to-Pay (P2P) Control Tower</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sap-blue/10 text-sap-blue font-mono font-medium">
              SAP MM MODULE
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-end monitoring of requisitions, purchase orders, Movement 101 goods receipts, and 3-way matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/purchase-requisitions')}
            className="px-3 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white text-xs font-medium shadow-xs transition-colors"
          >
            Create Requisition (PR)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg P2P Cycle Time"
          value={`${metrics.averageP2PCycleTimeDays} Days`}
          subtitle={`PR-to-PO: ${metrics.averagePRtoPOTimeDays}d • PO-to-GR: ${metrics.averagePOtoGRTimeDays}d`}
          icon={<Clock className="w-5 h-5 text-sap-blue" />}
          badge="Measured"
        />
        <MetricCard
          title="3-Way Match Rate"
          value={`${metrics.matchPassRatePct}%`}
          subtitle={`${metrics.matchedInvoices} of ${metrics.totalInvoices} invoices cleared`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          badge={metrics.matchPassRatePct > 80 ? 'Target Met' : 'Variances Found'}
          badgeType={metrics.matchPassRatePct > 80 ? 'success' : 'warning'}
          onClick={() => navigate('/supplier-invoices')}
        />
        <MetricCard
          title="Invoice Exceptions"
          value={metrics.priceVariances + metrics.qtyVariances}
          subtitle={`Price: ${metrics.priceVariances} • Qty: ${metrics.qtyVariances}`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
          badge="Blocked Run"
          badgeType="danger"
          onClick={() => navigate('/exceptions')}
        />
        <MetricCard
          title="Open Purchase Orders"
          value={metrics.openPOs}
          subtitle={`${metrics.pendingGRs} awaiting dock receipt`}
          icon={<Truck className="w-5 h-5 text-amber-500" />}
          onClick={() => navigate('/purchase-orders')}
        />
      </div>

      {/* Charts Row 1: Monthly Spend & PO Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Monthly Procurement Spend Trend"
            subtitle="Committed purchasing value across recent operational periods"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySpendChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(val) => `€${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`€${val.toLocaleString()}`, 'Monthly Spend']}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="spend" stroke="#0a6ed1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card
          title="PO Status Distribution"
          subtitle="Proportion of orders across lifecycle phases"
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={poStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {poStatusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-500">
            {poStatusDistribution.map((s: any) => (
              <span key={s.status} className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }} />
                {s.status.replace(/_/g, ' ')}: {s.count}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Supplier Scorecard & PO Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Supplier Performance Scorecard"
          subtitle="Top vendors ranked by rating and tolerance compliance"
          action={
            <button
              onClick={() => navigate('/vendors')}
              className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
            >
              <span>Vendor Master</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {supplierScorecard.map((v: any) => (
              <div key={v.vendorNumber} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{v.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {v.vendorNumber} • Tol: ±{v.priceTolerancePct}% price, ±{v.deliveryTolerancePct}% qty
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{v.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">({v._count.purchaseOrders} POs)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Open PO Aging Beyond SLA"
          subtitle="Orders awaiting vendor delivery confirmation"
          action={
            <button
              onClick={() => navigate('/purchase-orders')}
              className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
            >
              <span>All POs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {poAgingList.map((po: any) => (
              <div key={po.poNumber} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white">{po.poNumber}</div>
                  <div className="text-[11px] text-slate-400">{po.vendor}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-semibold text-xs ${
                      po.ageDays > 30 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {po.ageDays} Days Open
                  </span>
                  <div className="text-[11px] text-slate-400 font-mono">€{po.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Stock Alert Table */}
      <Card
        title="Inventory Reorder & Low Stock Risk"
        subtitle="Materials that have breached safety stock or reorder thresholds"
        action={
          <button
            onClick={() => navigate('/materials')}
            className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
          >
            <span>Material Master</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-3 py-2">Material</th>
                <th className="px-3 py-2">Plant</th>
                <th className="px-3 py-2 text-right">Current Stock</th>
                <th className="px-3 py-2 text-right">Safety Stock</th>
                <th className="px-3 py-2 text-right">Reorder Level</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockMaterials.map((m: any) => {
                const isCritical = m.currentStock < m.safetyStock;
                return (
                  <tr key={m.materialNumber}>
                    <td className="px-3 py-2 font-medium">
                      <div>{m.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{m.materialNumber}</div>
                    </td>
                    <td className="px-3 py-2 font-mono">{m.plant.code}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {m.currentStock} {m.uom}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">{m.safetyStock} {m.uom}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">{m.reorderLevel} {m.uom}</td>
                    <td className="px-3 py-2 text-right">
                      <Badge status={isCritical ? 'LOW_STOCK' : 'REORDER_RECOMMENDED'} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
