'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AnalyticsTestPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('[ANALYTICS-TEST] Fetching session data...');
      const response = await fetch('/api/analytics/sessions');
      const data = await response.json();
      
      console.log('[ANALYTICS-TEST] Sessions data:', {
        total: data.stats?.totalSessions || 0,
        active: data.stats?.activeSessions || 0,
        sessions: data.sessions?.length || 0
      });
      
      setSessions(data.sessions || []);
      setStats(data.stats || {});
      setLoading(false);
    } catch (error) {
      console.error('[ANALYTICS-TEST] Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics data...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">📊 Live Analytics Dashboard (Public Test)</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-white">{stats.totalSessions || 0}</div>
            <div className="text-sm text-gray-400">Total Sessions</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{stats.activeSessions || 0}</div>
            <div className="text-sm text-gray-400">Active Now</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{stats.avgDuration || 0}s</div>
            <div className="text-sm text-gray-400">Avg Duration</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400">{stats.topBrowser || "N/A"}</div>
            <div className="text-sm text-gray-400">Top Browser</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-pink-400">{stats.topOS || "N/A"}</div>
            <div className="text-sm text-gray-400">Top OS</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400">{stats.topDevice || "N/A"}</div>
            <div className="text-sm text-gray-400">Top Device</div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Session ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Browser</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">OS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Device</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Page Views</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No sessions found. Visit any page to create a session.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm font-mono text-gray-300">
                        {session.sessionId.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <span className={session.browser === "chrome" ? "text-green-400" : ""}>
                          {session.browser}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <span className={session.os === "windows" ? "text-blue-400" : ""}>
                          {session.os}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{session.deviceType}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <span className="font-bold text-white">{session.pageViews}</span> views
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {session.duration ? `${session.duration}s` : 
                         <span className="text-green-400">Active</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(session.startTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Console Instructions */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">🔍 Check Console Logs</h3>
          <p className="text-gray-300">
            Open Chrome DevTools (F12) and check the Console tab to see:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-400">
            <li>• [SESSION-TRACKER] - Client-side session tracking</li>
            <li>• [ANALYTICS-TEST] - Data fetching logs</li>
            <li>• [MIDDLEWARE-SESSION] - Server-side session tracking</li>
          </ul>
        </div>

        {/* Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/test-tracking" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            🎯 Test Tracking Page
          </a>
          <a href="/api/analytics/sessions" target="_blank" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            🔗 Raw API Data
          </a>
          <Link href="/" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            🏠 Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}