'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Target, Zap, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [allParticipations, setAllParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, mpRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/challenge-participations/my'),
        ]);
        setChallenges(cRes.data);
        setMyParticipations(mpRes.data);
        if (isManagerOrAdmin) {
          const apRes = await api.get('/challenge-participations');
          setAllParticipations(apRes.data);
        }
      } catch (err) {
        setError('Failed to load challenges');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoin = async (challengeId) => {
    try {
      const res = await api.post('/challenge-participations', { challenge: challengeId });
      setMyParticipations([res.data, ...myParticipations]);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join');
    }
  };

  const handleProgress = async (id, progress) => {
    try {
      const res = await api.patch(`/challenge-participations/${id}/progress`, { progress });
      setMyParticipations(myParticipations.map(p => p._id === id ? res.data : p));
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/challenge-participations/${id}/approve`);
      const apRes = await api.get('/challenge-participations');
      setAllParticipations(apRes.data);
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/challenge-participations/${id}/reject`);
      const apRes = await api.get('/challenge-participations');
      setAllParticipations(apRes.data);
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const difficultyColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };
  const hasJoined = (challengeId) => myParticipations.some(p => p.challenge?._id === challengeId || p.challenge === challengeId);
  const getMyParticipation = (challengeId) => myParticipations.find(p => p.challenge?._id === challengeId || p.challenge === challengeId);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <p className="text-gray-500 mt-1">Participate in sustainability challenges and earn XP</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {['all', ...(isManagerOrAdmin ? ['under_review'] : []), 'joined'].filter(Boolean).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            {tab === 'under_review' ? 'Under Review' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Under Review Tab */}
      {activeTab === 'under_review' && isManagerOrAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Challenge</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Progress</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allParticipations.filter(p => p.approvalStatus === 'pending').map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.employee?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.challenge?.name}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="bg-gray-200 rounded-full h-2 w-24 overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.approvalStatus} /></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleApprove(p._id)} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => handleReject(p._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"><XCircle className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allParticipations.filter(p => p.approvalStatus === 'pending').length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No submissions to review</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Joined Tab */}
      {activeTab === 'joined' && (
        <div className="space-y-4">
          {myParticipations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">You haven't joined any challenges yet</div>
          ) : (
            myParticipations.map(p => (
              <div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.challenge?.name || 'Challenge'}</h3>
                    <p className="text-xs text-gray-500">Status: {p.approvalStatus}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.approvalStatus} />
                    <span className="text-sm font-bold text-green-600">{p.xpAwarded || p.challenge?.xpValue || 0} XP</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">{p.progress}%</span>
                </div>
                {p.approvalStatus === 'pending' && p.progress < 100 && (
                  <div className="mt-3 flex items-center gap-2">
                    <input type="range" min="0" max="100" value={p.progress} onChange={e => handleProgress(p._id, parseInt(e.target.value))} className="flex-1 accent-green-600" />
                    <button onClick={() => handleProgress(p._id, 100)} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center gap-1"><Send className="h-3 w-3" /> Submit</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* All Challenges Tab */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => {
            const joined = hasJoined(challenge._id);
            const mp = getMyParticipation(challenge._id);
            return (
              <div key={challenge._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{challenge.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[challenge.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                {challenge.description && <p className="text-xs text-gray-500 mb-3">{challenge.description}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{challenge.xpValue} XP</span>
                  {challenge.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(challenge.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={challenge.status} />
                  {joined ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Joined ({mp?.progress || 0}%)</span>
                  ) : challenge.status === 'active' ? (
                    <button onClick={() => handleJoin(challenge._id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                      Join Challenge
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
