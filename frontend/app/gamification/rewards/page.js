'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, Gift, ShoppingBag, Zap, CheckCircle } from 'lucide-react';

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [currentXp, setCurrentXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(null);
  const [redeemed, setRedeemed] = useState(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const [rRes, meRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/auth/me'),
      ]);
      setRewards(rRes.data);
      setCurrentXp(meRes.data.totalXp || 0);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    setRedeemed(null);
    try {
      const res = await api.post(`/rewards/${rewardId}/redeem`);
      setCurrentXp(res.data.totalXp);
      setRedeemed(rewardId);
      // Refresh rewards list to update stock
      const rRes = await api.get('/rewards');
      setRewards(rRes.data);
      setTimeout(() => setRedeemed(null), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to redeem');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
          <p className="text-gray-500 mt-1">Redeem your XP for exciting rewards</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-sm">
          <p className="text-xs opacity-80">Your XP Balance</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            <Zap className="h-5 w-5" />{currentXp}
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>}

      {redeemed && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Reward redeemed successfully! Your XP balance has been updated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map(reward => {
          const canRedeem = currentXp >= reward.pointsRequired && reward.stock > 0 && reward.status === 'available';
          const progressPct = Math.min(Math.round((currentXp / reward.pointsRequired) * 100), 100);
          const isRedeeming = redeeming === reward._id;
          const justRedeemed = redeemed === reward._id;

          return (
            <div key={reward._id} className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all flex flex-col ${justRedeemed ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                {justRedeemed
                  ? <CheckCircle className="h-6 w-6 text-green-600" />
                  : <Gift className="h-6 w-6 text-green-600" />
                }
              </div>
              <h3 className="font-semibold text-gray-900">{reward.name}</h3>
              <p className="text-xs text-gray-500 mt-1 flex-1">{reward.description}</p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-green-600 flex items-center gap-1">
                    <Zap className="h-3 w-3" />{reward.pointsRequired} XP
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${reward.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {reward.stock > 0 ? `${reward.stock} left` : 'Out of stock'}
                  </span>
                </div>

                {currentXp < reward.pointsRequired && (
                  <div className="mb-3">
                    <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {reward.pointsRequired - currentXp} XP more needed
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleRedeem(reward._id)}
                  disabled={!canRedeem || isRedeeming}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                    canRedeem
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isRedeeming
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Redeeming...</>
                    : canRedeem
                      ? <><ShoppingBag className="h-4 w-4" /> Redeem</>
                      : reward.stock <= 0
                        ? 'Out of Stock'
                        : 'Insufficient XP'
                  }
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
