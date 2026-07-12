'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Gift, ShoppingBag, Zap } from 'lucide-react';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(null);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [rRes, uRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/leaderboard'),
      ]);
      setRewards(rRes.data);
      const me = uRes.data.find(e => e._id === user?.id);
      setUserData(me || user);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    try {
      const res = await api.post(`/rewards/${rewardId}/redeem`);
      setUserData(prev => ({ ...prev, totalXp: res.data.totalXp }));
      fetchData();
      alert('Reward redeemed successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to redeem');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;

  const currentXp = userData?.totalXp || user?.totalXp || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
          <p className="text-gray-500 mt-1">Redeem your XP for exciting rewards</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-sm">
          <p className="text-xs opacity-80">Your XP Balance</p>
          <p className="text-2xl font-bold flex items-center gap-1"><Zap className="h-5 w-5" />{currentXp}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map(reward => {
          const canRedeem = currentXp >= reward.pointsRequired && reward.stock > 0 && reward.status === 'available';
          const progressPct = Math.min(Math.round((currentXp / reward.pointsRequired) * 100), 100);
          return (
            <div key={reward._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{reward.name}</h3>
              <p className="text-xs text-gray-500 mt-1 flex-1">{reward.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-green-600">{reward.pointsRequired} XP</span>
                  <StatusBadge status={reward.status === 'out_of_stock' ? 'out_of_stock' : reward.stock > 0 ? 'available' : 'out_of_stock'} size="sm" />
                </div>
                {!canRedeem && currentXp < reward.pointsRequired && (
                  <div className="mb-2">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{reward.pointsRequired - currentXp} XP more needed</p>
                  </div>
                )}
                <div className="text-xs text-gray-400 mb-3">Stock: {reward.stock} remaining</div>
                <button
                  onClick={() => handleRedeem(reward._id)}
                  disabled={!canRedeem || redeeming === reward._id}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${canRedeem ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {redeeming === reward._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                  {redeeming === reward._id ? 'Redeeming...' : canRedeem ? 'Redeem' : reward.stock <= 0 ? 'Out of Stock' : 'Insufficient XP'}
                </button>
              </div>
            </div>
          );
        })}
        {rewards.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No rewards available</div>
        )}
      </div>
    </div>
  );
}
