import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PurchaseRequisition, Material, Vendor, Plant } from '../../types';
import { FileText, Plus, CheckCircle, ArrowRight, ShoppingCart } from 'lucide-react';

export const PurchaseRequisitionsPage: React.FC = () => {
  const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);

  // Form references
  const [materials, setMaterials] = useState<Material[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);

  // Create form state
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newPlantId, setNewPlantId] = useState('');
  const [newQuantity, setNewQuantity] = useState('50');
  const [newPrice, setNewPrice] = useState('100');
  const [newNotes, setNewNotes] = useState('');

  // Convert form state
  const [convertVendorId, setConvertVendorId] = useState('');
  const [convertNotes, setConvertNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPRs = () => {
    setLoading(true);
    api.get('/purchase-requisitions', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setPrs(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching PRs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPRs();
  }, [page, search, status]);

  // Load master data for dropdowns
  useEffect(() => {
    api.get('/materials?limit=50').then((r) => r.data.success && setMaterials(r.data.data));
    api.get('/vendors?limit=50').then((r) => r.data.success && setVendors(r.data.data));
    api.get('/plants').then((r) => r.data.success && setPlants(r.data.data));
  }, []);

  const handleApprove = async (prId: string) => {
    try {
      await api.post(`/purchase-requisitions/${prId}/approve`);
      fetchPRs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error approving PR');
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialId || !newPlantId) return;

    setActionLoading(true);
    try {
      await api.post('/purchase-requisitions', {
        notes: newNotes,
        items: [
          {
            materialId: newMaterialId,
            plantId: newPlantId,
            quantity: parseFloat(newQuantity),
            estimatedPrice: parseFloat(newPrice),
          },
        ],
      });
      setCreateModalOpen(false);
      fetchPRs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error creating PR');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPR || !convertVendorId) return;

    setActionLoading(true);
    try {
      await api.post(`/purchase-requisitions/${selectedPR.id}/convert-to-po`, {
        vendorId: convertVendorId,
        notes: convertNotes,
      });
      setConvertModalOpen(false);
      setSelectedPR(null);
      fetchPRs();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error converting PR to PO');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<PurchaseRequisition>[] = [
    {
      key: 'prNumber',
      header: 'PR Number',
      render: (pr) => <span className="font-mono font-bold text-sap-blue">{pr.prNumber}</span>,
    },
    {
      key: 'material',
      header: 'Requested Material & Qty',
      render: (pr) => {
        const item = pr.items[0];
        return (
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {item?.material?.name || 'Industrial Material'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Qty: {item?.quantity} {item?.material?.uom} • Est: €{item?.estimatedPrice}
            </div>
          </div>
        );
      },
    },
    {
      key: 'plant',
      header: 'Plant',
      render: (pr) => <span className="font-mono text-xs">{pr.items[0]?.plant?.code || 'PL1000'}</span>,
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (pr) => <span className="text-xs text-slate-600 dark:text-slate-300">{pr.requester?.fullName}</span>,
    },
    {
      key: 'requestedDate',
      header: 'Request Date',
      render: (pr) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(pr.requestedDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (pr) => <Badge status={pr.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (pr) => (
        <div className="flex items-center gap-1.5">
          {pr.status === 'SUBMITTED' && (
            <button
              onClick={() => handleApprove(pr.id)}
              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 text-[11px] font-medium transition-colors"
            >
              Approve
            </button>
          )}

          {pr.status === 'APPROVED' && (
            <button
              onClick={() => {
                setSelectedPR(pr);
                setConvertModalOpen(true);
              }}
              className="px-2 py-1 rounded bg-sap-blue hover:bg-sap-darkBlue text-white text-[11px] font-medium transition-colors flex items-center gap-1"
            >
              <span>Convert to PO</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {pr.status === 'CONVERTED_TO_PO' && pr.purchaseOrders && pr.purchaseOrders[0] && (
            <span className="font-mono text-[11px] text-slate-400">
              → {pr.purchaseOrders[0].poNumber}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sap-blue" />
            <span>Purchase Requisitions (SAP ME51N/ME53N)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Internal demand requests awaiting functional approval and conversion into binding supplier purchase orders.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Requisition</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={prs}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search PR number or requester..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Statuses"
        statusFilterOptions={[
          { label: 'Submitted (Pending Review)', value: 'SUBMITTED' },
          { label: 'Approved (Ready to Convert)', value: 'APPROVED' },
          { label: 'Converted to PO', value: 'CONVERTED_TO_PO' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />

      {/* CREATE PR MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Purchase Requisition (ME51N)"
        subtitle="Specify plant, material demand, and estimated purchasing valuation"
      >
        <form onSubmit={handleCreatePR} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Plant</label>
            <select
              value={newPlantId}
              onChange={(e) => setNewPlantId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Material Master</label>
            <select
              value={newMaterialId}
              onChange={(e) => {
                setNewMaterialId(e.target.value);
                const mat = materials.find((m) => m.id === e.target.value);
                if (mat) {
                  setNewPrice(String(mat.standardCost));
                  if (!newPlantId) setNewPlantId(mat.plantId);
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select Material</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialNumber} - {m.name} ({m.uom})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Required Quantity</label>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Unit Price (€)</label>
              <input
                type="number"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Business Justification / Notes</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              rows={2}
              placeholder="e.g. Scheduled quarterly equipment maintenance requirement"
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
              {actionLoading ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONVERT TO PO MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`Convert ${selectedPR?.prNumber} to Purchase Order (ME21N)`}
        subtitle="Assign vendor and generate legally binding procurement order"
      >
        <form onSubmit={handleConvertToPO} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Requisition Summary</div>
            <div className="text-slate-600 dark:text-slate-400">
              Material: {selectedPR?.items[0]?.material?.name} • Quantity: {selectedPR?.items[0]?.quantity}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Vendor (Vendor Master)</label>
            <select
              value={convertVendorId}
              onChange={(e) => setConvertVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendorNumber} - {v.name} (Lead Time: {v.leadTimeDays}d)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Purchase Order Notes</label>
            <textarea
              value={convertNotes}
              onChange={(e) => setConvertNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              rows={2}
              placeholder="Commercial contract release notes"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-1.5 rounded-lg bg-sap-blue hover:bg-sap-darkBlue text-white font-medium"
            >
              {actionLoading ? 'Converting...' : 'Generate Purchase Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
