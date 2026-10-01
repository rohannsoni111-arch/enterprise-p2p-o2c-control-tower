import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { MetricCard, Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Truck,
  Receipt,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Globe2,
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

export const O2CDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/o2c')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Error loading O2C dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing Order-to-Cash fulfillment velocity and customer balances...</span>
        </div>
      </div>
    );
  }

  const { metrics, soStatusDistribution, salesByRegion, topCustomers } = data;

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: '#94a3b8',
    CONFIRMED: '#38bdf8',
    PARTIALLY_FULFILLED: '#f59e0b',
    FULFILLED: '#10b981',
    CANCELLED: '#f43f5e',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Order-to-Cash (O2C) Control Tower</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
              SAP SD MODULE
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time monitoring of inquiries, sales commitments, credit limits, deliveries, and revenue collection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/customer-inquiries')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors"
          >
            New Customer Inquiry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="On-Time Delivery (OTIF)"
          value={`${metrics.otifRatePct}%`}
          subtitle={`${metrics.delayedDeliveries} deliveries delayed`}
          icon={<Truck className="w-5 h-5 text-emerald-600" />}
          badge={metrics.otifRatePct > 90 ? 'Target Met' : 'Bottleneck'}
          badgeType={metrics.otifRatePct > 90 ? 'success' : 'warning'}
          onClick={() => navigate('/deliveries')}
        />
        <MetricCard
          title="Avg O2C Cycle Time"
          value={`${metrics.averageO2CCycleTimeDays} Days`}
          subtitle={`Order-to-Delivery: ${metrics.averageOrderToDeliveryDays}d`}
          icon={<Clock className="w-5 h-5 text-sap-blue" />}
          badge="Measured"
        />
        <MetricCard
          title="Credit Exceptions"
          value={metrics.creditBlockedOrders}
          subtitle="Orders held on credit limit"
          icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
          badge="Action Req."
          badgeType="danger"
          onClick={() => navigate('/exceptions')}
        />
        <MetricCard
          title="Overdue Receivables"
          value={metrics.overdueInvoices}
          subtitle="Past due customer invoices"
          icon={<Receipt className="w-5 h-5 text-amber-500" />}
          badge="Dunning Notice"
          badgeType="warning"
          onClick={() => navigate('/customer-invoices')}
        />
      </div>

      {/* Charts Row 1: Sales by Region & SO Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Commercial Receivables by Sales Region"
            subtitle="Customer balance exposure across EMEA and global sales territories"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByRegion} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="region" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(val) => `€${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`€${val.toLocaleString()}`, 'Balance Exposure']}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="balance" fill="#107e3e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card
          title="Sales Order Fulfillment Funnel"
          subtitle="Status breakdown of confirmed commercial contracts"
        >
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={soStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {soStatusDistribution.map((entry: any, index: number) => (
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
            {soStatusDistribution.map((s: any) => (
              <span key={s.status} className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || '#94a3b8' }} />
                {s.status.replace(/_/g, ' ')}: {s.count}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Top Customer Receivables Exposure */}
      <Card
        title="Top Enterprise Customer Accounts (Credit Utilization)"
        subtitle="Current outstanding balance against credit ceiling"
        action={
          <button
            onClick={() => navigate('/customers')}
            className="text-xs font-medium text-sap-blue hover:underline flex items-center gap-1"
          >
            <span>Customer Master</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2 text-right">Credit Limit</th>
                <th className="px-3 py-2 text-right">Current Balance</th>
                <th className="px-3 py-2">Utilization</th>
                <th className="px-3 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topCustomers.map((c: any) => {
                const util = c.creditLimit > 0 ? (c.currentBalance / c.creditLimit) * 100 : 0;
                return (
                  <tr key={c.customerNumber}>
                    <td className="px-3 py-2 font-medium">
                      <div>{c.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{c.customerNumber}</div>
                    </td>
                    <td className="px-3 py-2 font-mono">{c.region}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">
                      €{c.creditLimit.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                      €{c.currentBalance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              util >= 100 ? 'bg-rose-500' : util >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, util)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0">{util.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Badge
                        status={util >= 100 ? 'EXCEEDED' : util >= 85 ? 'HIGH_EXPOSURE' : 'HEALTHY'}
                        size="sm"
                      />
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
