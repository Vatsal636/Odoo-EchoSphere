'use client';

export default function StatusBadge({ status, size = 'sm' }) {
  const colorMap = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    acknowledged: 'bg-green-100 text-green-700 border-green-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    on_track: 'bg-green-100 text-green-700 border-green-200',
    available: 'bg-green-100 text-green-700 border-green-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',

    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    at_risk: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',

    rejected: 'bg-red-100 text-red-700 border-red-200',
    exceeded: 'bg-red-100 text-red-700 border-red-200',
    overdue: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    out_of_stock: 'bg-red-100 text-red-700 border-red-200',

    ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
    under_review: 'bg-purple-100 text-purple-700 border-purple-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200',
    archived: 'bg-gray-100 text-gray-600 border-gray-200',
    open: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorMap[status] || 'bg-gray-100 text-gray-600 border-gray-200'} ${sizeClasses}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
