'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Plus, Target } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', targetKg: '', periodStart: '', periodEnd: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gRes, dRes] = await Promise.all([api.get('/sustainability-goals'), api.get('/departments')]);
        setGoals(gRes.data);
        setDepartments(dRes.data);
      } catch (err) {
        setError('Failed to load goals');
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
      const res = await api.post('/sustainability-goals', { ...form, targetKg: Number(form.targetKg) });
      setGoals([res.data, ...goals]);
      setShowModal(false);
      setForm({ name: '', department: '', targetKg: '', periodStart: '', periodEnd: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sustainability Goals</h1>
          <p className="text-gray-500 mt-1">Track emission reduction targets by department</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
          const pct = goal.percentage || 0;
          const barColor = pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-yellow-500' : 'bg-green-500';
          return (
            <div key={goal._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500">{goal.department?.name || 'All'}</p>
                </div>
                <StatusBadge status={goal.status} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target: {goal.targetKg} kg</span>
                  <span className="text-gray-500">Current: {(goal.currentKg || 0).toFixed(1)} kg</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{pct}% of target</span>
                  <span className={pct > 100 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                    {pct > 100 ? `${(pct - 100).toFixed(0)}% over` : `${(100 - pct).toFixed(0)}% remaining`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No goals yet</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Sustainability Goal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">All</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target (kg CO2e) *</label>
            <input type="number" step="0.1" value={form.targetKg} onChange={e => setForm({...form, targetKg: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
              <input type="date" value={form.periodStart} onChange={e => setForm({...form, periodStart: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
              <input type="date" value={form.periodEnd} onChange={e => setForm({...form, periodEnd: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
