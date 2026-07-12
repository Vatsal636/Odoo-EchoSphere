'use client';

import { Trophy, Loader2 } from 'lucide-react';

export default function BenchmarkTable({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-8 bg-gray-100 animate-pulse rounded mb-2"></div>
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded mb-1"></div>)}
      </div>
    );
  }

  if (!data) return null;

  const { departments = [], companyAverageKg } = data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Department Benchmarking</h3>
        <span className="text-sm text-gray-500">Avg: {Number(companyAverageKg).toLocaleString()} kg</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-3 py-2 font-medium text-gray-500">Rank</th>
              <th className="text-left px-3 py-2 font-medium text-gray-500">Department</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500">Total (kg)</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500">Transactions</th>
              <th className="text-right px-3 py-2 font-medium text-gray-500">vs. Average</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">No department data available</td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    {dept.rank === 1 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <span className="text-gray-400 font-medium">#{dept.rank}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900">{dept.name}</td>
                  <td className="px-3 py-3 text-right text-gray-700">{Number(dept.totalKg).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-gray-500">{dept.transactionCount}</td>
                  <td className={`px-3 py-3 text-right font-medium ${dept.variancePct < 0 ? 'text-green-600' : dept.variancePct > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {dept.variancePct > 0 ? '+' : ''}{dept.variancePct}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
