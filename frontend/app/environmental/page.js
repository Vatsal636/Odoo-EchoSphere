'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import ScopeBreakdownChart from '@/components/ScopeBreakdownChart';
import { Loader2, Plus, Trash2, Flame, Calendar, Filter } from 'lucide-react';

const SCOPE3_CATEGORY_LABELS = {
  purchased_goods_services: 'Purchased Goods & Services', capital_goods: 'Capital Goods',
  fuel_energy_activities: 'Fuel & Energy Activities', upstream_transportation: 'Upstream Transportation',
  waste_generated: 'Waste Generated', business_travel: 'Business Travel',
  employee_commuting: 'Employee Commuting', upstream_leased_assets: 'Upstream Leased Assets',
  downstream_transportation: 'Downstream Transportation', processing_of_sold_products: 'Processing of Sold Products',
  use_of_sold_products: 'Use of Sold Products', end_of_life_treatment: 'End-of-Life Treatment',
  downstream_leased_assets: 'Downstream Leased Assets', franchises: 'Franchises',
  investments: 'Investments', other: 'Other'
};

export default function EnvironmentalPage() {
  const [transactions, setTransactions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [factors, setFactors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [scopeData, setScopeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', emissionFactor: '', quantity: '', date: '', source: 'manual', notes: '', scope: 'scope_1', scope3Category: '', vendor: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, deptRes, factorRes, vendorRes, scopeRes] = await Promise.all([
          api.get('/carbon-transactions'),
          api.get('/departments'),
          api.get('/emission-factors'),
          api.get('/vendors').catch(() => ({ data: [] })),
          api.get('/carbon-transactions/by-scope').catch(() => ({ data: [] })),
        ]);
        setTransactions(txRes.data);
        setDepartments(deptRes.data);
        setFactors(factorRes.data);
        setVendors(vendorRes.data);
        setScopeData(scopeRes.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/carbon-transactions', form);
      setTransactions([res.data, ...transactions]);
      setShowModal(false);
      setForm({ name: '', department: '', emissionFactor: '', quantity: '', date: '', source: 'manual', notes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/carbon-transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const totalKg = transactions.reduce((s, t) => s + (t.emissionKg || 0), 0);
  const thisMonth = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth());
  const monthKg = thisMonth.reduce((s, t) => s + (t.emissionKg || 0), 0);
  const bySource = {};
  transactions.forEach(t => { bySource[t.source] = (bySource[t.source] || 0) + (t.emissionKg || 0); });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carbon Transactions</h1>
          <p className="text-gray-500 mt-1">Track and manage carbon emissions</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Emissions</p>
          <p className="text-lg font-bold text-gray-900">{totalKg.toFixed(1)} kg</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-lg font-bold text-gray-900">{monthKg.toFixed(1)} kg</p>
        </div>
        {Object.entries(bySource).slice(0, 2).map(([src, kg]) => (
          <div key={src} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 capitalize">{src}</p>
            <p className="text-lg font-bold text-gray-900">{kg.toFixed(1)} kg</p>
          </div>
        ))}
      </div>

      {/* Scope Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScopeBreakdownChart data={scopeData} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Factor</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Quantity</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">kg CO2e</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Scope</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                {isManagerOrAdmin && <th className="text-center px-4 py-3 font-medium text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{tx.name}</td>
                  <td className="px-4 py-3 text-gray-600">{tx.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{tx.emissionFactor?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{tx.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{tx.emissionKg?.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.scope === 'scope_1' ? 'bg-green-100 text-green-700' :
                      tx.scope === 'scope_2' ? 'bg-yellow-100 text-yellow-700' :
                      tx.scope === 'scope_3' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{tx.scope === 'scope_3' && tx.vendor ? `S3-${tx.vendor.name}` : tx.scope?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={tx.source} /></td>
                  {isManagerOrAdmin && (
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(tx._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Carbon Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">Select</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emission Factor *</label>
              <select value={form.emissionFactor} onChange={e => setForm({...form, emissionFactor: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">Select</option>
                {factors.map(f => <option key={f._id} value={f._id}>{f.name} ({f.factorValue} kg/{f.unit})</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope *</label>
            <div className="flex gap-4">
              {['scope_1', 'scope_2', 'scope_3'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="scope" value={s} checked={form.scope === s} onChange={e => setForm({...form, scope: e.target.value, scope3Category: '', vendor: ''})} className="text-green-600 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">{s === 'scope_1' ? 'Scope 1' : s === 'scope_2' ? 'Scope 2' : 'Scope 3'}</span>
                </label>
              ))}
            </div>
          </div>
          {form.scope === 'scope_3' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope 3 Category</label>
                <select value={form.scope3Category} onChange={e => setForm({...form, scope3Category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select category</option>
                  {Object.entries(SCOPE3_CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="manual">Manual</option>
                <option value="purchase">Purchase</option>
                <option value="fleet">Fleet</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
