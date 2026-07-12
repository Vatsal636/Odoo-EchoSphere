'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FileDown, Loader2, Flame, Shield, Gauge } from 'lucide-react';

const REPORTS = [
  {
    key: 'carbon-summary',
    title: 'Carbon Emissions Summary',
    description: 'Total emissions, breakdown by department, and full transaction detail.',
    icon: Flame,
    color: 'red',
    hasDateRange: true,
  },
  {
    key: 'esg-overview',
    title: 'ESG Overview',
    description: 'Environmental, Social, and Governance scores plus key operational metrics.',
    icon: Gauge,
    color: 'green',
    hasDateRange: false,
  },
  {
    key: 'compliance-status',
    title: 'Compliance Status',
    description: 'All compliance issues with severity, ownership, due dates, and status.',
    icon: Shield,
    color: 'yellow',
    hasDateRange: false,
  },
];

const colorClasses = {
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  const downloadReport = async (report) => {
    setDownloading(report.key);
    setError('');
    try {
      const params = {};
      if (report.hasDateRange && startDate) params.startDate = startDate;
      if (report.hasDateRange && endDate) params.endDate = endDate;

      const res = await api.get(`/reports/${report.key}`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.key}-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to generate ${report.title}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and download PDF reports for stakeholders</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Date Range (applies to Carbon Summary only)</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.key;
          return (
            <div key={report.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className={`p-2.5 rounded-lg w-fit ${colorClasses[report.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mt-4">{report.title}</h3>
              <p className="text-sm text-gray-500 mt-1 flex-1">{report.description}</p>
              <button
                onClick={() => downloadReport(report)}
                disabled={isDownloading}
                className="mt-4 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
