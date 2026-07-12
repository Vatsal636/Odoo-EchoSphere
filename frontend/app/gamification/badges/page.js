'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import BadgeCard from '@/components/BadgeCard';
import { Loader2 } from 'lucide-react';

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/badges');
        setBadges(res.data);
      } catch (err) {
        setError('Failed to load badges');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
        <p className="text-gray-500 mt-1">Earn badges by completing challenges and accumulating XP</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Total Badges: <strong>{badges.length}</strong></span>
        <span className="text-green-600">Unlocked: <strong>{unlocked.length}</strong></span>
        <span className="text-gray-400">Locked: <strong>{locked.length}</strong></span>
      </div>

      {unlocked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Unlocked</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {unlocked.map(badge => <BadgeCard key={badge._id} badge={badge} />)}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Locked</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {locked.map(badge => <BadgeCard key={badge._id} badge={badge} />)}
          </div>
        </div>
      )}
    </div>
  );
}
