'use client';

import { Medal } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LeaderboardTable({ data = [], limit }) {
  const { user } = useAuth();
  const displayData = limit ? data.slice(0, limit) : data;
  const maxXp = displayData.length > 0 ? Math.max(...displayData.map(d => d.totalXp)) : 1;

  const rankColors = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{limit ? 'Top Performers' : 'Leaderboard'}</h3>
      <div className="space-y-3">
        {displayData.map((entry) => {
          const isMe = user?._id === entry._id;
          const pct = Math.round((entry.totalXp / maxXp) * 100);
          return (
            <div key={entry._id} className={`p-3 rounded-lg ${isMe ? 'bg-green-50 border border-green-200' : 'bg-gray-50'} transition-colors`}>
              <div className="flex items-center gap-3">
                <div className="w-8 text-center">
                  {entry.rank <= 3 ? (
                    <Medal className={`h-5 w-5 inline ${rankColors[entry.rank] || 'text-gray-400'}`} />
                  ) : (
                    <span className="text-sm font-medium text-gray-500">#{entry.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.name}{isMe && <span className="text-green-600 text-xs ml-1">(you)</span>}</p>
                    <p className="text-sm font-bold text-green-600">{entry.totalXp} XP</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{entry.department?.name || 'No Dept'}</p>
                    <span className="text-gray-300">·</span>
                    <p className="text-xs text-gray-500">{entry.badgeCount} badges</p>
                  </div>
                  <div className="mt-1.5 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
