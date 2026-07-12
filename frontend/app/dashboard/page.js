'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import KpiCard from '@/components/KpiCard';
import EsgRadarChart from '@/components/EsgRadarChart';
import CarbonTrendChart from '@/components/CarbonTrendChart';
import CarbonByDeptChart from '@/components/CarbonByDeptChart';
import ScopeBreakdownChart from '@/components/ScopeBreakdownChart';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Loader2, Leaf, Target, AlertTriangle, Users, Flame, Calendar, TrendingUp, Shield, Award } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, myParticipationRes, myChallengeRes] = await Promise.all([
          api.get('/dashboard'),
          isEmployee ? api.get('/participations/my').catch(() => null) : Promise.resolve(null),
          isEmployee ? api.get('/challenge-participations/my').catch(() => null) : Promise.resolve(null),
        ]);
        setData(dashRes.data);
        if (myParticipationRes || myChallengeRes) {
          const activities = [
            ...(myParticipationRes?.data || []).map(p => ({
              name: p.activity?.name || 'CSR Activity',
              status: p.approvalStatus,
              date: p.createdAt,
            })),
            ...(myChallengeRes?.data || []).map(c => ({
              name: c.challenge?.name || 'Challenge',
              status: c.approvalStatus || (c.progress >= 100 ? 'completed' : 'in_progress'),
              date: c.createdAt,
            })),
          ].sort((a, b) => new Date(b.date) - new Date(a.date));
          setMyData(activities);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isEmployee]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>;
  }

  if (!data) return null;

  const esgData = [
    { category: 'Environmental', score: data.esgScores.environmental, fullMark: 100 },
    { category: 'Social', score: data.esgScores.social, fullMark: 100 },
    { category: 'Governance', score: data.esgScores.governance, fullMark: 100 },
  ];

  const leaderboardPreview = data.topBadgeHolders?.map((u, i) => ({
    ...u,
    rank: i + 1,
    department: { name: '' },
    totalXp: 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEmployee ? 'My Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEmployee
            ? 'Track your personal ESG contributions and achievements'
            : 'Real-time overview of your ESG performance'
          }
        </p>
      </div>

      {/* KPI Cards Row - role-specific */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(isAdmin || isManager) && (
          <KpiCard title="Total Carbon" value={`${Number(data.totalCarbonKg).toLocaleString()} kg`} icon={Flame} color="red" />
        )}
        <KpiCard title="Active Challenges" value={data.activeChallenges} icon={Target} color="purple" />
        {(isAdmin || isManager) && (
          <KpiCard title="Open Compliance" value={data.complianceIssuesOpen} icon={AlertTriangle} color="yellow" />
        )}
        {isAdmin && (
          <KpiCard title="Total Employees" value={data.totalEmployees} icon={Users} color="blue" />
        )}
        {isEmployee && (
          <KpiCard title="My XP" value={user?.totalXp ?? 0} icon={Award} color="green" />
        )}
      </div>

      {/* ESG Radar + Carbon by Dept + Scope - admin/manager only */}
      {(isAdmin || isManager) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EsgRadarChart data={esgData} />
          <CarbonByDeptChart data={data.carbonByDept || []} />
          <ScopeBreakdownChart data={data.carbonByScope || []} />
        </div>
      )}

      {/* Employee: My activity summary */}
      {isEmployee && myData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">My Recent Activity</h3>
          {myData.length > 0 ? (
            <div className="space-y-2">
              {myData.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'approved' ? 'bg-green-100 text-green-700' :
                    item.status === 'pending' || item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    item.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No recent activity. Join a challenge or participate in CSR!</p>
          )}
        </div>
      )}

      {/* Carbon Trend + Leaderboard Preview */}
      {(isAdmin || isManager) ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CarbonTrendChart data={data.carbonTrend || []} />
          <LeaderboardTable data={leaderboardPreview} limit={5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <LeaderboardTable data={leaderboardPreview} limit={5} />
        </div>
      )}

      {/* Bottom Stats Row - admin/manager only */}
      {(isAdmin || isManager) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Goals On Track</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{data.goalsOnTrack} / {data.activeGoals}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">CSR Activities (Month)</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.csrActivitiesThisMonth}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">Overdue Issues</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{data.complianceIssuesOverdue}</p>
            {data.complianceIssuesOverdue > 0 && (
              <p className="text-xs text-red-500 mt-1">Requires immediate attention</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
