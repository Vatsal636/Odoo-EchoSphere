'use client';

import { AlertTriangle, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

export default function AnomalyList({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded"></div>)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const monthly = data.monthlyAnomalies || [];
  const tx = data.transactionAnomalies || [];
  const totalAnomalies = monthly.length + tx.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection</h3>
        {totalAnomalies > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
            <AlertTriangle className="h-3 w-3" />
            {totalAnomalies} flag{totalAnomalies !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {totalAnomalies === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-gray-400">
          <p className="text-sm">No statistical anomalies detected</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {monthly.map((a, i) => (
            <div key={`m-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50">
              <div className={`p-1.5 rounded-full ${a.direction === 'spike' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {a.direction === 'spike' ? <ArrowUp className="h-4 w-4 text-red-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{a.month} — {a.direction === 'spike' ? 'Spike' : 'Drop'}</p>
                <p className="text-xs text-gray-500">Total: {Number(a.totalKg).toLocaleString()} kg &middot; z-score: {a.zScore}</p>
              </div>
            </div>
          ))}
          {tx.map((a, i) => (
            <div key={`t-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50">
              <div className={`p-1.5 rounded-full ${a.direction === 'spike' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {a.direction === 'spike' ? <ArrowUp className="h-4 w-4 text-red-600" /> : <ArrowDown className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                <p className="text-xs text-gray-500">
                  {a.department} &middot; {new Date(a.date).toLocaleDateString()} &middot; {Number(a.emissionKg).toFixed(1)} kg &middot; z-score: {a.zScore}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
