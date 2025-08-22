'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { Chart } from '@/components/analytics/Chart';

interface SessionData {
  id: string;
  sessionId: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  country?: string;
  referrerSource?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  userId?: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    avgDuration: 0,
    topBrowser: '',
    topOS: '',
    topDevice: ''
  });

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      console.log('[DASHBOARD] Fetching real session data...');
      
      const response = await fetch('/api/analytics/sessions');
      if (response.ok) {
        const data = await response.json();
        console.log('[DASHBOARD] Real session data received:', {
          totalSessions: data.stats?.totalSessions || 0,
          sessions: data.sessions?.length || 0,
          firstSession: data.sessions?.[0]
        });
        
        setSessions(data.sessions || []);
        setStats(data.stats || {
          totalSessions: 0,
          activeSessions: 0,
          avgDuration: 0,
          topBrowser: 'No data',
          topOS: 'No data',
          topDevice: 'No data'
        });
      } else {
        console.error('[DASHBOARD] Failed to fetch sessions, response not ok:', response.status);
        setSessions([]);
        setStats({
          totalSessions: 0,
          activeSessions: 0,
          avgDuration: 0,
          topBrowser: 'No data',
          topOS: 'No data',
          topDevice: 'No data'
        });
      }
    } catch (error) {
      console.error('[DASHBOARD] Error fetching session data:', error);
      setSessions([]);
      setStats({
        totalSessions: 0,
        activeSessions: 0,
        avgDuration: 0,
        topBrowser: 'Error',
        topOS: 'Error',
        topDevice: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Active';
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  // Chart data for device types
  const deviceData = sessions.reduce((acc, session) => {
    const existing = acc.find(item => item.name === session.deviceType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: session.deviceType, value: 1 });
    }
    return acc;
  }, [] as Array<{name: string, value: number}>);

  // Chart data for browsers
  const browserData = sessions.reduce((acc, session) => {
    const existing = acc.find(item => item.name === session.browser);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: session.browser, value: 1 });
    }
    return acc;
  }, [] as Array<{name: string, value: number}>);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Session Analytics</h1>
          <p className="text-gray-400 mt-2">Real-time user session monitoring and analysis</p>
        </div>
        
        <button
          onClick={fetchSessionData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Sessions"
          value={stats.totalSessions}
          icon="📊"
          subtitle="All time sessions"
        />
        
        <KPICard
          title="Active Sessions"
          value={stats.activeSessions}
          icon="🟢"
          subtitle="Currently active"
        />
        
        <KPICard
          title="Avg Duration"
          value={`${stats.avgDuration} min`}
          icon="⏱️"
          subtitle="Average session time"
        />
        
        <KPICard
          title="Top Browser"
          value={stats.topBrowser}
          icon="🌐"
          subtitle="Most used browser"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Chart
          title="Device Types"
          data={deviceData}
          type="pie"
          dataKey="value"
        />
        
        <Chart
          title="Browser Distribution"
          data={browserData}
          type="bar"
          dataKey="value"
        />
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User/IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Started
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                    {session.sessionId.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {session.userId ? (
                      <div>
                        <div className="text-green-400">👤 {session.userId.substring(0, 8)}</div>
                        <div className="text-gray-500 text-xs">{session.ipAddress}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400">🔒 {session.ipAddress}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div>
                      <div>{session.deviceType} • {session.browser}</div>
                      <div className="text-gray-500 text-xs">{session.os}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={session.endTime ? 'text-gray-400' : 'text-green-400'}>
                      {formatDuration(session.duration)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {session.pageViews} views
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="px-2 py-1 text-xs rounded bg-gray-700">
                      {session.referrerSource || 'direct'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatTime(session.startTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          Session tracking includes: IP address, device information, browser details, page views, duration, and referrer source. 
          Active sessions update in real-time. Data refreshes every 30 seconds.
        </p>
      </div>
    </div>
  );
}