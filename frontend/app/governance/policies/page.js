'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { Loader2, FileText, CheckCircle, Plus } from 'lucide-react';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form, setForm] = useState({ name: '', content: '', effectiveDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchData = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAcknowledge = async (policyId) => {
    try {
      await api.post(`/policies/${policyId}/acknowledge`);
      fetchData();
    } catch (err) {
      alert('Failed to acknowledge');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/policies', form);
      fetchData();
      setShowModal(false);
      setForm({ name: '', content: '', effectiveDate: '' });
    } catch (err) {
      setError('Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-500 mt-1">Company ESG policies and acknowledgements</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Policy
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="space-y-4">
        {policies.map(policy => (
          <div key={policy._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                  <StatusBadge status={policy.userAcknowledged ? 'acknowledged' : 'pending'} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                  <span>{policy.acknowledgedCount || 0} / {policy.totalEmployees || 0} employees</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-xs overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${policy.acknowledgementRate || 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{policy.acknowledgementRate || 0}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => setSelectedPolicy(selectedPolicy?._id === policy._id ? null : policy)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  {selectedPolicy?._id === policy._id ? 'Hide' : 'View'}
                </button>
                {!policy.userAcknowledged && (
                  <button onClick={() => handleAcknowledge(policy._id)} className="text-xs text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Acknowledge
                  </button>
                )}
              </div>
            </div>
            {selectedPolicy?._id === policy._id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{policy.content}</p>
              </div>
            )}
          </div>
        ))}
        {policies.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">No policies yet</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Policy" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <input type="date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
