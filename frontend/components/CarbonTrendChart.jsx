'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CarbonTrendChart({ data = [] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Trend (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v?.slice(5)} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Carbon']} labelFormatter={l => `Date: ${l}`} />
          <Line type="monotone" dataKey="totalKg" stroke="#16a34a" strokeWidth={2} dot={{ r: 2, fill: '#16a34a' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
