import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { BusinessRule } from '../../types';
import { Cpu, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';

export const BusinessRulesPage: React.FC = () => {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/business-rules')
      .then((res) => {
        if (res.data.success) {
          setRules(res.data.data);
        }
      })
      .catch((err) => console.error('Error fetching business rules:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-slate-500 text-center py-12">Loading Business Rule Engine Catalog...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sap-blue" />
          <span>Business Rule Engine & Governance Catalog</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Deterministic business logic evaluating transaction tolerances, inventory thresholds, aging intervals, and credit exposure.
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-sap-blue/60 transition-colors text-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sap-blue text-sm">{rule.ruleCode}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{rule.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 uppercase text-slate-500">
                  {rule.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={rule.severity} size="sm" />
                <span className="font-mono text-[11px] text-slate-400">
                  {rule._count?.exceptions || 0} Breaches Triggered
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300">{rule.description}</p>

            {/* Condition Expression in Code Box */}
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] flex items-center gap-2 overflow-x-auto">
              <Terminal className="w-3.5 h-3.5 text-sap-gold shrink-0" />
              <span className="text-slate-400 select-none">IF</span>
              <span className="text-emerald-400">{rule.conditionExpression}</span>
              <span className="text-slate-400 select-none">THEN GENERATE EXCEPTION</span>
            </div>

            <div className="flex items-start gap-2 pt-1 text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                Recommended Action:
              </span>
              <span>{rule.recommendedAction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
