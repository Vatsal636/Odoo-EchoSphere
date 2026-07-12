'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

export default function ForecastChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
        <div className="h-[280px] bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = [];
  const historicalMap = {};
  for (const m of data.historical) {
    historicalMap[m.month] = m.totalKg;
    chartData.push({ month: m.month, actual: m.totalKg, projected: null });
  }
  for (const m of data.projected) {
    const existing = chartData.find(d => d.month === m.month);
    if (existing) {
      existing.projected = m.totalKg;
    } else {
      chartData.push({ month: m.month, actual: null, projected: m.totalKg });
    }
  }
  chartData.sort((a, b) => a.month.localeCompare(b.month));

  const trendIcon = data.trend === 'rising' ? TrendingUp : data.trend === 'falling' ? TrendingDown : Minus;
  const trendColor = data.trend === 'rising' ? 'text-red-600' : data.trend === 'falling' ? 'text-green-600' : 'text-gray-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Emissions Forecast</h3>
        {data.trend !== 'insufficient_data' && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${trendColor} bg-opacity-10`}>
            {trendIcon({ className: 'h-4 w-4' })}
            {data.trend}
          </span>
        )}
      </div>

      {data.trend === 'insufficient_data' ? (
        <div className="flex items-center justify-center h-[280px] text-gray-400">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Need at least 2 months of data for forecasting</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`]} labelFormatter={l => `Month: ${l}`} />
              {data.goalTargetKg != null && (
                <ReferenceLine y={data.goalTargetKg} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#ef4444', fontSize: 11 }} />
              )}
              <Line type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={2} dot={{ r: 2, fill: '#16a34a' }} name="Actual" connectNulls={false} />
              <Line type="monotone" dataKey="projected" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 2, fill: '#f59e0b' }} name="Projected" connectNulls={true} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-600"></span>
              <span className="text-gray-600">Historical actuals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-gray-600">Projected (linear regression)</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="font-medium text-gray-700">Projected year-end total:</span>
              <span className="font-bold text-gray-900">{Number(data.yearEndProjectionKg).toLocaleString()} kg</span>
            </div>
            {data.monthlySlopeKg != null && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Monthly change:</span>
                <span className={data.monthlySlopeKg > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {data.monthlySlopeKg > 0 ? '+' : ''}{data.monthlySlopeKg} kg/month
                </span>
              </div>
            )}
            {data.goalTargetKg != null && (
              <div className={`flex items-center justify-between p-2 rounded-lg ${data.onPaceToMeetGoal ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className={`text-sm font-medium ${data.onPaceToMeetGoal ? 'text-green-700' : 'text-red-700'}`}>
                  {data.onPaceToMeetGoal ? 'On pace to meet goal' : 'Projected to exceed goal'}
                </span>
                <span className={`text-sm font-bold ${data.onPaceToMeetGoal ? 'text-green-700' : 'text-red-700'}`}>
                  Target: {Number(data.goalTargetKg).toLocaleString()} kg
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
