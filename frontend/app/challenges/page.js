'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Zap, Clock, CheckCircle, XCircle, Send, Trophy } from 'lucide-react';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [allParticipations, setAllParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  // Local progress state: { [participationId]: number }
  const [localProgress, setLocalProgress] = useState({});
  const [savingProgress, setSavingProgress] = useState(null);
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const fetchData = async () => {
    try {
      const [cRes, mpRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/challenge-participations/my'),
      ]);
      setChallenges(cRes.data);
      setMyParticipations(mpRes.data);
      // Init local progress from server state
      const progressMap = {};
      mpRes.data.forEach(p => { progressMap[p._id] = p.progress; });
      setLocalProgress(progressMap);

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

  useEffect(() => { fetchData(); }, []);

  const handleJoin = async (challengeId) => {
    try {
      const res = await api.post('/challenge-participations', { challenge: challengeId });
      setMyParticipations(prev => [res.data, ...prev]);
      setLocalProgress(prev => ({ ...prev, [res.data._id]: 0 }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join');
    }
  };

  // Only update local slider — no API call
  const handleSliderChange = (id, value) => {
    setLocalProgress(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  // API call only when user explicitly saves
  const handleSaveProgress = async (id) => {
    setSavingProgress(id);
    try {
      const progress = localProgress[id] ?? 0;
      const res = await api.patch(`/challenge-participations/${id}/progress`, { progress });
      setMyParticipations(prev => prev.map(p => p._id === id ? res.data : p));
      if (progress >= 100) {
        // Auto-submitted for review
        alert('Progress saved and submitted for review!');
      }
    } catch (err) {
      alert('Failed to save progress');
    } finally {
      setSavingProgress(null);
    }
  };

  // Submit at 100%
  const handleSubmit = async (id) => {
    setSavingProgress(id);
    try {
      const res = await api.patch(`/challenge-participations/${id}/progress`, { progress: 100 });
      setMyParticipations(prev => prev.map(p => p._id === id ? res.data : p));
      setLocalProgress(prev => ({ ...prev, [id]: 100 }));
      alert('Challenge submitted for review!');
    } catch (err) {
      alert('Failed to submit');
    } finally {
      setSavingProgress(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/challenge-participations/${id}/approve`);
      const apRes = await api.get('/challenge-participations');
      setAllParticipations(apRes.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
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

  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  const hasJoined = (challengeId) =>
    myParticipations.some(p => p.challenge?._id === challengeId || p.challenge === challengeId);

  const getMyParticipation = (challengeId) =>
    myParticipations.find(p => p.challenge?._id === challengeId || p.challenge === challengeId);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  );

  const tabs = ['all', 'joined', ...(isManagerOrAdmin ? ['under_review'] : [])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <p className="text-gray-500 mt-1">Complete sustainability challenges and earn XP</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-green-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab === 'under_review' ? `Under Review (${allParticipations.filter(p => p.approvalStatus === 'pending').length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ALL CHALLENGES */}
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
                {challenge.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{challenge.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Zap className="h-3 w-3" />{challenge.xpValue} XP
                  </span>
                  {challenge.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(challenge.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={challenge.status} />
                  {joined ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Joined ({mp?.progress || 0}%)
                    </span>
                  ) : challenge.status === 'active' ? (
                    <button
                      onClick={() => handleJoin(challenge._id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Join Challenge
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
          {challenges.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No challenges available</div>
          )}
        </div>
      )}

      {/* MY JOINED CHALLENGES */}
      {activeTab === 'joined' && (
        <div className="space-y-4">
          {myParticipations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
              You haven't joined any challenges yet. Go to the All tab to join one!
            </div>
          ) : (
            myParticipations.map(p => {
              const progress = localProgress[p._id] ?? p.progress;
              const isApproved = p.approvalStatus === 'approved';
              const isPending = p.approvalStatus === 'pending' && p.progress >= 100;
              const isSaving = savingProgress === p._id;
              const isDirty = progress !== p.progress;

              return (
                <div key={p._id} className={`bg-white rounded-xl shadow-sm border p-5 ${isApproved ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.challenge?.name || 'Challenge'}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {isApproved
                          ? `Completed — earned ${p.xpAwarded} XP`
                          : isPending
                            ? 'Submitted — awaiting review'
                            : `In progress`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.approvalStatus} />
                      {isApproved && (
                        <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                          <Zap className="h-3 w-3" />{p.xpAwarded}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isApproved ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{progress}%</span>
                  </div>

                  {/* Controls — only show if not approved and not pending review */}
                  {!isApproved && !isPending && (
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={e => handleSliderChange(p._id, e.target.value)}
                        className="flex-1 accent-green-600"
                      />
                      <button
                        onClick={() => handleSaveProgress(p._id)}
                        disabled={isSaving || (!isDirty && progress < 100)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Save
                      </button>
                      <button
                        onClick={() => handleSubmit(p._id)}
                        disabled={isSaving || progress < 100}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-3 w-3" /> Submit
                      </button>
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      Submitted for review. A manager will approve your XP soon.
                    </div>
                  )}

                  {isApproved && (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> Challenge completed! XP has been added to your balance.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* UNDER REVIEW (managers only) */}
      {activeTab === 'under_review' && isManagerOrAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Challenge</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">XP Value</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Progress</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allParticipations.filter(p => p.approvalStatus === 'pending').map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.employee?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.challenge?.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" />{p.challenge?.xpValue}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="bg-gray-200 rounded-full h-2 w-24 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprove(p._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-colors"
                      >
                        <CheckCircle className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(p._id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                      >
                        <XCircle className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {allParticipations.filter(p => p.approvalStatus === 'pending').length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No submissions pending review</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
