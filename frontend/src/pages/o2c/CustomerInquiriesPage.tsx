import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { CustomerInquiry, Customer, Material } from '../../types';
import { FileText, Plus, ArrowRight } from 'lucide-react';

export const CustomerInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);

  // Dropdown lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Create form state
  const [customerId, setCustomerId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('20');
  const [targetPrice, setTargetPrice] = useState('150');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInquiries = () => {
    setLoading(true);
    api.get('/customer-inquiries', {
      params: { page, limit: 10, search, status },
    })
      .then((res) => {
        if (res.data.success) {
          setInquiries(res.data.data);
          setTotal(res.data.meta.total);
        }
      })
      .catch((err) => console.error('Error fetching inquiries:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, search, status]);

  useEffect(() => {
    api.get('/customers?limit=50').then((r) => r.data.success && setCustomers(r.data.data));
    api.get('/materials?category=FINISHED&limit=50').then((r) => r.data.success && setMaterials(r.data.data));
  }, []);

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !materialId) return;

    setActionLoading(true);
    try {
      await api.post('/customer-inquiries', {
        customerId,
        notes,
        items: [
          {
            materialId,
            requestedQuantity: parseFloat(quantity),
            targetPrice: parseFloat(targetPrice),
          },
        ],
      });
      setCreateModalOpen(false);
      fetchInquiries();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error creating inquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToSO = async (id: string) => {
    try {
      const res = await api.post(`/customer-inquiries/${id}/convert-to-so`, {});
      if (res.data.success) {
        alert(`Successfully converted into Sales Order: ${res.data.data.soNumber}. Credit Status: ${res.data.data.creditStatus}`);
        fetchInquiries();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error converting inquiry');
    }
  };

  const columns: Column<CustomerInquiry>[] = [
    {
      key: 'inqNumber',
      header: 'Inquiry Number',
      render: (inq) => <span className="font-mono font-bold text-emerald-600">{inq.inqNumber}</span>,
    },
    {
      key: 'customer',
      header: 'Customer Name & Region',
      render: (inq) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{inq.customer.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {inq.customer.customerNumber} • Region: {inq.customer.region}
          </div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Requested Finished Goods',
      render: (inq) => {
        const item = inq.items[0];
        return (
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {item?.material?.name || 'Finished Product'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Qty: {item?.requestedQuantity} {item?.material?.uom} @ €{item?.targetPrice}
            </div>
          </div>
        );
      },
    },
    {
      key: 'inquiryDate',
      header: 'Inquiry Date',
      render: (inq) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(inq.inquiryDate).toISOString().split('T')[0]}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inq) => <Badge status={inq.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inq) => (
        <div>
          {inq.status === 'OPEN' && (
            <button
              onClick={() => handleConvertToSO(inq.id)}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <span>Convert to SO</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {inq.status === 'CONVERTED' && (
            <span className="text-[11px] font-mono text-slate-400">Order Placed</span>
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
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Customer Inquiries (SAP VA11/VA13 Simulation)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customer RFQs, product quotations, and pre-sales qualification converted into commercial contracts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Inquiry</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        total={total}
        page={page}
        limit={10}
        onPageChange={setPage}
        searchPlaceholder="Search inquiry number or customer..."
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilterPlaceholder="All Statuses"
        statusFilterOptions={[
          { label: 'Open Inquiries', value: 'OPEN' },
          { label: 'Converted to Sales Order', value: 'CONVERTED' },
        ]}
        statusFilterValue={status}
        onStatusFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
      />

      {/* CREATE INQUIRY MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Customer Inquiry (VA11)"
        subtitle="Record quotation request from B2B customer account"
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Account</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerNumber} - {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Finished Good / Material</label>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value);
                const mat = materials.find((m) => m.id === e.target.value);
                if (mat) setTargetPrice(String(mat.sellingPrice));
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              required
            >
              <option value="">Select Product</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.materialNumber} - {m.name} (Selling Price: €{m.sellingPrice})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Requested Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Price (€)</label>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Commercial Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
              rows={2}
              placeholder="Commercial contract inquiry parameters"
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
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {actionLoading ? 'Saving...' : 'Register Inquiry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
