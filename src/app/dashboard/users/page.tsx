'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/analytics/KPICard';

interface UserData {
  id: string;
  userId: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  totalSessionTime: number;
  totalMessages: number;
  totalSpent: string;
  avgSessionLength: number;
  engagementScore: number;
  subscriptionTier?: string;
  churnRisk: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    avgEngagement: 0,
    totalRevenue: 0,
    avgSessionTime: 0,
    churnRate: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('[DASHBOARD] Fetching user metrics data...');
      
      const response = await fetch('/api/analytics/users');
      if (response.ok) {
        const data = await response.json();
        console.log('[DASHBOARD] User data received:', data);
        
        setUsers(data.users || []);
        setStats(data.stats || {
          totalUsers: 0,
          activeUsers: 0,
          avgEngagement: 0,
          totalRevenue: 0,
          avgSessionTime: 0,
          churnRate: 0
        });
      } else {
        console.error('[DASHBOARD] Failed to fetch users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('[DASHBOARD] Error fetching user data:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 0.7) return 'text-red-400';
    if (risk >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading user metrics...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Analytics</h1>
          <p className="text-gray-400 mt-2">User behavior and engagement metrics</p>
        </div>
        
        <button
          onClick={fetchUserData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <KPICard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          subtitle="Registered users"
        />
        
        <KPICard
          title="Active Users"
          value={stats.activeUsers}
          icon="🟢"
          subtitle="Last 7 days"
        />
        
        <KPICard
          title="Avg Engagement"
          value={`${(stats.avgEngagement * 100).toFixed(1)}%`}
          icon="📊"
          subtitle="User activity score"
        />
        
        <KPICard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          subtitle="All time revenue"
        />
        
        <KPICard
          title="Avg Session"
          value={formatDuration(stats.avgSessionTime)}
          icon="⏱️"
          subtitle="Average session length"
        />
        
        <KPICard
          title="Churn Risk"
          value={`${(stats.churnRate * 100).toFixed(1)}%`}
          icon="⚠️"
          subtitle="Users at risk"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">User Metrics</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Total Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Churn Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Seen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    No user data available yet. Users will appear here once they start using the platform.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                      {user.userId.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.totalVisits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.totalMessages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDuration(user.totalSessionTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${parseFloat(user.totalSpent).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getEngagementColor(user.engagementScore)}>
                        {(user.engagementScore * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={getChurnRiskColor(user.churnRisk)}>
                        {(user.churnRisk * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.lastVisit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          User metrics track individual user behavior including visit frequency, engagement levels, 
          revenue generation, and churn risk. Data updates in real-time as users interact with the platform.
        </p>
      </div>
    </div>
  );
}