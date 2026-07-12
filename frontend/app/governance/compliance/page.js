'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { Loader2, AlertTriangle, Clock, User, Plus, ArrowUpDown } from 'lucide-react';

export default function CompliancePage() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', severity: 'medium', owner: '', dueDate: '', status: 'open' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchData = async () => {
    try {
      const [iRes, uRes] = await Promise.all([api.get('/compliance-issues'), api.get('/leaderboard')]);
      setIssues(iRes.data);
      setUsers(uRes.data);
    } catch (err) {
      setError('Failed to load compliance issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/compliance-issues/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/compliance-issues', form);
      fetchData();
      setShowModal(false);
      setForm({ name: '', description: '', severity: 'medium', owner: '', dueDate: '', status: 'open' });
    } catch (err) {
      setError('Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dueDate, status) => {
    return new Date(dueDate) < new Date() && status !== 'resolved';
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  const openIssues = issues.filter(i => i.status !== 'resolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Issues</h1>
          <p className="text-gray-500 mt-1">Track and manage compliance and audit findings</p>
        </div>
        {isManagerOrAdmin && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Issue
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      {/* Open Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Open Issues ({openIssues.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Issue</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Due Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                {isManagerOrAdmin && <th className="text-center px-4 py-3 font-medium text-gray-500">Update</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {openIssues.map(issue => {
                const overdue = isOverdue(issue.dueDate, issue.status);
                return (
                  <tr key={issue._id} className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{issue.name}</p>
                        {issue.description && <p className="text-xs text-gray-500 mt-0.5">{issue.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={issue.severity} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{issue.owner?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${overdue ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {new Date(issue.dueDate).toLocaleDateString()}
                          {overdue && <span className="text-xs ml-1">(Overdue)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={issue.status} /></td>
                    {isManagerOrAdmin && (
                      <td className="px-4 py-3 text-center">
                        <select value={issue.status} onChange={e => handleStatusUpdate(issue._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
              {openIssues.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No open issues</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700">Resolved ({resolvedIssues.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Issue</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Due Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resolvedIssues.map(issue => (
                <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{issue.name}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={issue.severity} /></td>
                  <td className="px-4 py-3 text-gray-600">{issue.owner?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(issue.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={issue.status} /></td>
                </tr>
              ))}
              {resolvedIssues.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No resolved issues</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Compliance Issue" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
              <select value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="">Select</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
