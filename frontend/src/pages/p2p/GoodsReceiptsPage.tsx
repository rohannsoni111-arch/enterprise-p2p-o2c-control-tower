import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { GoodsReceipt, PurchaseOrder } from '../../types';
import { Truck, Plus, GitCommit, CheckCircle2 } from 'lucide-react';

export const GoodsReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [grs, setGrs] = useState<GoodsReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Post GR Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openPOs, setOpenPOs] = useState<PurchaseOrder[]>([]);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receivedQty, setReceivedQty] = useState('');
  const [rejectedQty, setRejectedQty] = useState('0');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGRs = () => {
    setLoading(true);
    api.get('/goods-receipts', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setGrs(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching GRs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGRs();
  }, [page, search, status]);

  // Load open POs ready for dock receipt
  useEffect(() => {
    api.get('/purchase-orders?status=SENT_TO_VENDOR&limit=30')
      .then((r) => r.data.success && setOpenPOs(r.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    const target = openPOs.find((p) => p.id === poId);
    if (target) {
      setSelectedPO(target);
      const remaining = target.items[0]?.orderedQuantity - target.items[0]?.receivedQuantity;
      setReceivedQty(String(remaining > 0 ? remaining : target.items[0]?.orderedQuantity));
    }
  };

  const handlePostGR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !receivedQty) return;

    setActionLoading(true);
    try {
      await api.post('/goods-receipts', {
        poId: selectedPO.id,
        deliveryNoteNumber: deliveryNote || `DN-DOCK-${Date.now().toString().slice(-4)}`,
        notes,
        items: [
          {
            poItemId: selectedPO.items[0].id,
            receivedQuantity: parseFloat(receivedQty),
            rejectedQuantity: parseFloat(rejectedQty || '0'),
          },
        ],
      });
      setCreateModalOpen(false);
      setSelectedPO(null);
      setSelectedPOId('');
      fetchGRs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error posting Goods Receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<GoodsReceipt>[] = [
    {
      key: 'grNumber',
      header: 'GR Document #',
      render: (gr) => (
        <div>
          <span className="font-mono font-bold text-sap-blue">{gr.grNumber}</span>
          <span className="block text-[10px] text-slate-400 font-mono">Movement {gr.movementType}</span>
        </div>
      ),
    },
    {
      key: 'purchaseOrder',
      header: 'Referenced PO & Vendor',
      render: (gr) => (
        <div>
          <div className="font-mono font-semibold text-slate-900 dark:text-white">
            {gr.purchaseOrder?.poNumber || 'PO-10001'}
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs">
            {gr.purchaseOrder?.vendor?.name || 'Industrial Vendor'}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Received Line Items',
      render: (gr) => {
        const item = gr.items[0];
        return (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {item?.material?.name || 'Material item'}
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Rec: {item?.receivedQuantity} {item?.material?.uom}
              {item?.rejectedQuantity > 0 && (
                <span className="text-rose-500 ml-1">({item?.rejectedQuantity} Rej)</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'postingDate',
      header: 'Posting Date',
      render: (gr) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(gr.postingDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'deliveryNote',
      header: 'Delivery Note #',
      render: (gr) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {gr.deliveryNoteNumber || 'DN-DIRECT'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Receipt Status',
      render: (gr) => <Badge status={gr.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Trace',
      render: (gr) => (
        <button
          onClick={() => navigate(`/trace?docType=GR&docNumber=${gr.grNumber}`)}
          className="p-1 rounded text-slate-400 hover:text-sap-blue transition-colors"
          title="Trace Document Flow"
        >
          <GitCommit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-sap-blue" />
            <span>Goods Receipts (SAP MIGO Movement Type 101)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physical receiving dock verification, updating inventory stock on hand, and releasing downstream invoice matching.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post Goods Receipt (MIGO 101)</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={grs}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search GR number, delivery note, or PO..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Statuses"
        statusFilterOptions={[
          { label: 'Complete', value: 'COMPLETE' },
          { label: 'Partial', value: 'PARTIAL' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />

      {/* POST GR MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post Goods Receipt (MIGO Movement 101)"
        subtitle="Verify physical delivery against open Purchase Order"
      >
        <form onSubmit={handlePostGR} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Select Open Purchase Order</label>
            <select
              value={selectedPOId}
              onChange={(e) => handlePOSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select PO</option>
              {openPOs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.poNumber} - {p.vendor.name} (Ordered: {p.items[0]?.orderedQuantity})
                </option>
              ))}
            </select>
          </div>

          {selectedPO && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedPO.poNumber} Line Item Details</div>
              <div className="text-slate-600 dark:text-slate-400">
                Material: {selectedPO.items[0]?.material?.name} • Ordered Qty: {selectedPO.items[0]?.orderedQuantity} • Received so far: {selectedPO.items[0]?.receivedQuantity}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Accepted Received Quantity</label>
              <input
                type="number"
                value={receivedQty}
                onChange={(e) => setReceivedQty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Rejected Quantity (Damaged)</label>
              <input
                type="number"
                value={rejectedQty}
                onChange={(e) => setRejectedQty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Delivery Note #</label>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="e.g. DN-APEX-8892"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white font-medium"
            >
              {actionLoading ? 'Posting...' : 'Post Movement 101 GR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
