'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { 'Scope 1': '#16a34a', 'Scope 2': '#f59e0b', 'Scope 3': '#ef4444' };
const DEFAULT = '#9ca3af';

export default function ScopeBreakdownChart({ data = [] }) {
  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.totalKg, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Scope</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="totalKg" nameKey="scope" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ scope, totalKg }) => `${scope}: ${Number(totalKg).toFixed(0)} kg`}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.scope] || DEFAULT} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg (${((value / total) * 100).toFixed(1)}%)`, 'Emissions']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
