'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Plus, Users, Calendar, Clock } from 'lucide-react';

export default function SocialPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', description: '', date: '', pointsValue: '', maxParticipants: '', status: 'upcoming' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, cRes] = await Promise.all([api.get('/csr-activities'), api.get('/categories')]);
        setActivities(aRes.data);
        setCategories(cRes.data.filter(c => c.type === 'csr'));
      } catch (err) {
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoin = async (activityId) => {
    try {
      await api.post('/participations', { activity: activityId });
      alert('Joined activity! Status: pending approval.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/csr-activities', { ...form, pointsValue: Number(form.pointsValue), maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined });
      setActivities([res.data, ...activities]);
      setShowModal(false);
      setForm({ name: '', category: '', description: '', date: '', pointsValue: '', maxParticipants: '', status: 'upcoming' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create activity');
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = { upcoming: [], ongoing: [], completed: [], cancelled: [] };
  activities.forEach(a => { if (grouped[a.status]) grouped[a.status].push(a); });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CSR Activities</h1>
          <p className="text-gray-500 mt-1">Environmental and social initiatives</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Activity
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'upcoming' ? 'bg-blue-500' : status === 'ongoing' ? 'bg-green-500' : status === 'completed' ? 'bg-gray-400' : 'bg-red-400'}`} />
              {status} ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map(activity => (
                <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{activity.name}</h4>
                    <StatusBadge status={activity.status} />
                  </div>
                  {activity.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{activity.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    {activity.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(activity.date).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.pointsValue} pts</span>
                    {activity.maxParticipants && <span className="flex items-center gap-1"><Users className="h-3 w-3" />Max {activity.maxParticipants}</span>}
                  </div>
                  {activity.status !== 'cancelled' && activity.status !== 'completed' && (
                    <button onClick={() => handleJoin(activity._id)} className="mt-3 w-full bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium py-2 rounded-lg transition-colors">
                      Join Activity
                    </button>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm bg-white rounded-lg border border-dashed border-gray-200">
                  No {status} activities
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add CSR Activity">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">Select</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points *</label>
              <input type="number" value={form.pointsValue} onChange={e => setForm({...form, pointsValue: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">{submitting ? 'Creating...' : 'Create Activity'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
