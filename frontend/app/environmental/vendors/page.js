'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/Modal';
import { Loader2, Plus, Trash2, Pencil, Building2 } from 'lucide-react';

const CATEGORY_LABELS = {
  raw_materials: 'Raw Materials', logistics: 'Logistics', manufacturing: 'Manufacturing',
  services: 'Services', energy: 'Energy', other: 'Other'
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'other', contactEmail: '', sustainabilityRating: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (err) {
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'other', contactEmail: '', sustainabilityRating: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (vendor) => {
    setEditing(vendor);
    setForm({ name: vendor.name, category: vendor.category, contactEmail: vendor.contactEmail || '', sustainabilityRating: vendor.sustainabilityRating?.toString() || '', notes: vendor.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, sustainabilityRating: form.sustainabilityRating ? Number(form.sustainabilityRating) : undefined };
      if (editing) {
        const res = await api.put(`/vendors/${editing._id}`, payload);
        setVendors(vendors.map(v => v._id === editing._id ? res.data : v));
      } else {
        const res = await api.post('/vendors', payload);
        setVendors([...vendors, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      setVendors(vendors.filter(v => v._id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage supply chain partners and their ESG profiles</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map(v => (
          <div key={v._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{v.name}</h3>
                  <p className="text-xs text-gray-500">{CATEGORY_LABELS[v.category] || v.category}</p>
                </div>
              </div>
              {isManagerOrAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(v._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>
            {v.contactEmail && <p className="text-sm text-gray-500 mb-1">{v.contactEmail}</p>}
            {v.sustainabilityRating != null && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">ESG Rating:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${v.sustainabilityRating}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700">{v.sustainabilityRating}/100</span>
              </div>
            )}
            {v.notes && <p className="text-xs text-gray-400 mt-2 truncate">{v.notes}</p>}
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No vendors yet</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Vendor' : 'Add Vendor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sustainability Rating (0-100)</label>
            <input type="number" min="0" max="100" value={form.sustainabilityRating} onChange={e => setForm({...form, sustainabilityRating: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
