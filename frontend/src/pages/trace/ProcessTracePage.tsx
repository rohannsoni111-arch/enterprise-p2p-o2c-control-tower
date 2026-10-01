import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProcessTraceData, TraceNode, TraceLink } from '../../types';
import {
  GitCommit,
  Search,
  ArrowRight,
  FileText,
  Package,
  Truck,
  Receipt,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

export const ProcessTracePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [docType, setDocType] = useState(searchParams.get('docType') || 'PO');
  const [docNumber, setDocNumber] = useState(searchParams.get('docNumber') || 'PO-10001');

  const [traceData, setTraceData] = useState<ProcessTraceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrace = (type = docType, num = docNumber) => {
    if (!num) return;
    setLoading(true);
    setError('');

    api.get('/trace', {
      params: { docType: type, docNumber: num },
    })
      .then((res) => {
        if (res.data.success) {
          setTraceData(res.data.data);
          setSearchParams({ docType: type, docNumber: num });
        }
      })
      .catch((err) => {
        console.error('Error fetching process trace:', err);
        setError('No document flow trace found for specified parameters.');
        setTraceData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrace();
  }, []);

  const handleQuickSelect = (type: string, num: string) => {
    setDocType(type);
    setDocNumber(num);
    fetchTrace(type, num);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'PR':
      case 'INQ':
        return <FileText className="w-4 h-4 text-sky-500" />;
      case 'PO':
      case 'SO':
        return <Package className="w-4 h-4 text-sap-blue" />;
      case 'GR':
      case 'DEL':
      case 'GI':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'SUPPLIER_INVOICE':
      case 'CUSTOMER_INVOICE':
        return <Receipt className="w-4 h-4 text-amber-500" />;
      default:
        return <GitCommit className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-sap-blue" />
          <span>Process Traceability & Document Flow (SAP VBFA Simulation)</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          End-to-end relational audit trail tracing upstream and downstream lineage across Requisitions, Orders, Goods Receipts/Issues, Invoices, and Exceptions.
        </p>
      </div>

      {/* Query Bar & Presets */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full sm:w-48">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              >
                <optgroup label="Procure-to-Pay (P2P)">
                  <option value="PR">Purchase Requisition (PR)</option>
                  <option value="PO">Purchase Order (PO)</option>
                  <option value="GR">Goods Receipt (GR)</option>
                  <option value="SUPPLIER_INVOICE">Supplier Invoice (INV)</option>
                </optgroup>
                <optgroup label="Order-to-Cash (O2C)">
                  <option value="INQ">Customer Inquiry (INQ)</option>
                  <option value="SO">Sales Order (SO)</option>
                  <option value="DEL">Outbound Delivery (DEL)</option>
                  <option value="CUSTOMER_INVOICE">Customer Billing (CINV)</option>
                </optgroup>
              </select>
            </div>

            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Enter document number (e.g. PO-10001, SO-10004, GR-10003)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              onClick={() => fetchTrace()}
              disabled={loading}
              className="px-4 py-2 bg-sap-blue hover:bg-sap-darkBlue text-white text-xs font-medium rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Trace Lifecycle</span>
            </button>
          </div>

          {/* Quick Scenario Selectors */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">1-Click Test Scenarios:</span>
            {[
              { label: 'PO-10001 (P2P Complete Match)', type: 'PO', num: 'PO-10001' },
              { label: 'PO-10003 (P2P Short-Shipment Qty)', type: 'PO', num: 'PO-10003' },
              { label: 'PO-10005 (P2P Price Variance Block)', type: 'PO', num: 'PO-10005' },
              { label: 'SO-10001 (O2C Fulfilled)', type: 'SO', num: 'SO-10001' },
              { label: 'SO-10004 (O2C Credit Limit Block)', type: 'SO', num: 'SO-10004' },
              { label: 'DEL-10007 (O2C Delayed Delivery)', type: 'DEL', num: 'DEL-10007' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => handleQuickSelect(s.type, s.num)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-mono transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Visual Lifecycle Flow Graph */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-xs text-slate-500 gap-2">
          <div className="w-4 h-4 border-2 border-sap-blue border-t-transparent rounded-full animate-spin" />
          <span>Tracing relational document graph...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      ) : traceData ? (
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Detected Business Process Flow
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {traceData.process === 'P2P' ? 'Procure-to-Pay (SAP MM Lineage)' : 'Order-to-Cash (SAP SD Lineage)'}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sap-blue/10 text-sap-blue">
                  Target: {traceData.rootDoc}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">
                {traceData.nodes.length} Lifecycle Milestones • {traceData.exceptions.length} Linked Exceptions
              </span>
            </div>
          </div>

          {/* Vertical Visual Timeline Node Graph */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {traceData.nodes.map((node: TraceNode, idx: number) => (
              <div key={node.id} className="relative flex items-start gap-4 group">
                {/* Node Milestone Circle */}
                <div className="absolute -left-6 sm:-left-8 mt-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-sap-blue flex items-center justify-center text-xs shadow-xs z-10">
                  {getNodeIcon(node.type)}
                </div>

                {/* Node Content Card */}
                <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-sap-blue transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {node.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 uppercase text-slate-500">
                        {node.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge status={node.status} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(node.date).toISOString().split('T')[0]}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{node.details}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Exceptions Triggered along this Document Chain */}
          {traceData.exceptions.length > 0 && (
            <Card
              title="Automated Exceptions Triggered on this Lineage"
              subtitle="Control variances captured during transaction lifecycle execution"
            >
              <div className="space-y-3">
                {traceData.exceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{ex.exceptionNumber}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                          {ex.ruleCode}
                        </span>
                        <Badge status={ex.severity} size="sm" />
                      </div>
                      <Badge status={ex.status} size="sm" />
                    </div>

                    <div className="text-slate-800 dark:text-slate-200 font-medium">{ex.businessImpact}</div>
                    <div className="text-[11px] text-slate-500">
                      Policy Expected: <span className="font-semibold text-slate-700 dark:text-slate-300">{ex.expectedValue}</span> • Actual Telemetry: <span className="font-mono text-rose-600 font-semibold">{ex.actualValue}</span> ({ex.variance})
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
};
