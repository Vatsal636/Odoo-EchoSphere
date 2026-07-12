'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Medal, Trophy, Award, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/leaderboard');
        setData(res.data);
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;

  const top3 = data.slice(0, 3);
  const others = data.slice(3);
  const maxXp = data.length > 0 ? data[0].totalXp : 1;
  const topXp = data.length > 0 ? data[0].totalXp : 0;

  const podiumColors = ['', 'bg-yellow-100 border-yellow-300', 'bg-gray-100 border-gray-300', 'bg-amber-100 border-amber-300'];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 mt-1">Top performers ranked by total XP</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 max-w-2xl mx-auto">
        {[2, 1, 3].map(rank => {
          const entry = top3[rank - 1];
          if (!entry) return <div key={rank} className="w-32" />;
          const heights = ['', 'h-52', 'h-40', 'h-32'];
          const icons = ['', Medal, Trophy, Award];
          const Icon = icons[rank];
          const colors = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-600'];
          const bgColors = ['', 'bg-yellow-50', 'bg-gray-50', 'bg-amber-50'];
          return (
            <div key={rank} className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
              <div className={`w-16 h-16 rounded-full ${bgColors[rank]} border-2 ${podiumColors[rank].split(' ')[1] || 'border-gray-200'} flex items-center justify-center mb-2`}>
                <span className="text-2xl font-bold text-gray-700">{entry.name.charAt(0)}</span>
              </div>
              <p className="font-semibold text-sm text-gray-900">{entry.name}</p>
              <p className="text-xs text-gray-400">{entry.department?.name || ''}</p>
              <div className={`mt-2 ${heights[rank]} w-24 rounded-t-xl ${podiumColors[rank]} border flex flex-col items-center justify-center pt-4`}>
                <Icon className={`h-6 w-6 ${colors[rank]}`} />
                <p className="text-lg font-bold text-gray-900">{entry.totalXp}</p>
                <p className="text-xs text-gray-500">XP</p>
                <p className="text-xs text-gray-400 mt-1">{entry.badgeCount} badges</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Department</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">XP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Progress</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(entry => {
                const pct = Math.round((entry.totalXp / maxXp) * 100);
                const isTop3 = entry.rank <= 3;
                return (
                  <tr key={entry._id} className={`hover:bg-gray-50 transition-colors ${isTop3 ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      {isTop3 ? (
                        <Medal className={`h-5 w-5 ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                      ) : (
                        <span className="text-sm font-medium text-gray-500">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.department?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600">{entry.totalXp}</span>
                      <span className="text-gray-400 text-xs"> XP</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded-full h-2 w-32 overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" /> {entry.badgeCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
