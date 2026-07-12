'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ForecastChart from '@/components/ForecastChart';
import AnomalyList from '@/components/AnomalyList';
import BenchmarkTable from '@/components/BenchmarkTable';
import { Loader2, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const [departments, setDepartments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  const [forecastData, setForecastData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, goalRes] = await Promise.all([
          api.get('/departments').catch(() => ({ data: [] })),
          api.get('/sustainability-goals').catch(() => ({ data: [] })),
        ]);
        setDepartments(deptRes.data || []);
        setGoals(goalRes.data || []);
      } catch {}
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (selectedDept) queryParams.append('department', selectedDept);
        if (selectedGoal) queryParams.append('goalId', selectedGoal);
        const qString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const anomalyParams = new URLSearchParams();
        if (selectedDept) anomalyParams.append('department', selectedDept);
        const aString = anomalyParams.toString() ? `?${anomalyParams.toString()}` : '';

        const [forecastRes, anomalyRes, benchmarkRes] = await Promise.all([
          api.get(`/analytics/forecast${qString}`),
          api.get(`/analytics/anomalies${aString}`),
          api.get('/analytics/benchmark'),
        ]);
        setForecastData(forecastRes.data);
        setAnomalyData(anomalyRes.data);
        setBenchmarkData(benchmarkRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedDept, selectedGoal]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Emissions forecasting, anomaly detection, and department benchmarking</p>
        </div>
        <BarChart3 className="h-8 w-8 text-green-600" />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
          <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Compare Against Goal</label>
          <select value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
          >
            <option value="">No goal comparison</option>
            {goals.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart data={forecastData} loading={loading && !forecastData} />
        <AnomalyList data={anomalyData} loading={loading && !anomalyData} />
      </div>

      <BenchmarkTable data={benchmarkData} loading={loading && !benchmarkData} />
    </div>
  );
}
