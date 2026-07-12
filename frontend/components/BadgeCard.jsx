'use client';

import { Award, Lock, CheckCircle } from 'lucide-react';

export default function BadgeCard({ badge }) {
  return (
    <div className={`relative bg-white rounded-xl shadow-sm border p-6 text-center transition-all ${badge.unlocked ? 'border-green-200 shadow-md' : 'border-gray-200 opacity-75'}`}>
      {badge.unlocked && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
      )}
      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${badge.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
        {badge.unlocked ? (
          <Award className={`h-8 w-8 ${badge.unlocked ? 'text-green-600' : 'text-gray-400'}`} />
        ) : (
          <Lock className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <h4 className={`font-semibold text-sm ${badge.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>{badge.name}</h4>
      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
      <div className={`mt-2 text-xs font-medium px-2 py-1 rounded-full inline-block ${badge.unlocked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {badge.unlockType === 'xp_threshold' ? `${badge.unlockValue} XP` : `${badge.unlockValue} Challenges`}
      </div>
      {badge.unlocked && badge.awardedDate && (
        <p className="text-xs text-gray-400 mt-2">Awarded {new Date(badge.awardedDate).toLocaleDateString()}</p>
      )}
    </div>
  );
}
