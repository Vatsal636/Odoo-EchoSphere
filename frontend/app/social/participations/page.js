'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, CheckCircle, XCircle, User, Calendar } from 'lucide-react';

export default function ParticipationsPage() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchData = async () => {
    try {
      const res = isManagerOrAdmin ? await api.get('/participations') : await api.get('/participations/my');
      setParticipations(res.data);
    } catch (err) {
      setError('Failed to load participations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/participations/${id}/approve`);
      fetchData();
    } catch (err) {
      setError('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/participations/${id}/reject`, { notes: '' });
      fetchData();
    } catch (err) {
      setError('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Participations</h1>
        <p className="text-gray-500 mt-1">{isManagerOrAdmin ? 'Review and manage employee participations' : 'Your activity participations'}</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Activity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Points</th>
                {isManagerOrAdmin && <th className="text-center px-4 py-3 font-medium text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participations.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{p.employee?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.activity?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={p.approvalStatus} /></td>
                  <td className="px-4 py-3 text-right font-medium">{p.pointsEarned || '-'}</td>
                  {isManagerOrAdmin && (
                    <td className="px-4 py-3 text-center">
                      {p.approvalStatus === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleApprove(p._id)} disabled={actionLoading === p._id} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg disabled:opacity-50">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleReject(p._id)} disabled={actionLoading === p._id} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg disabled:opacity-50">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {participations.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No participations found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
