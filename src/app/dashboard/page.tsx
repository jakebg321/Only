'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/analytics/KPICard';
import { Chart } from '@/components/analytics/Chart';
import { format } from 'date-fns';

interface KPIData {
  mrr: number;
  mrrChange: number;
  mrrTrend: 'up' | 'down' | 'stable';
  activeUsers: number;
  userChange: number;
  userTrend: 'up' | 'down' | 'stable';
  conversionRate: string;
  avgSession: number;
  avgCLV: string;
  churnRate: string;
  revenueData: any[];
  userGrowthData: any[];
  personalityData: any[];
  funnelData: any[];
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchKPIs();
  }, [period]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/kpis?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      const data = await response.json();
      setKpis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const runAggregation = async () => {
    try {
      const response = await fetch('/api/cron/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'all' })
      });
      if (response.ok) {
        await fetchKPIs(); // Refresh data
      }
    } catch (err) {
      console.error('Aggregation failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time metrics and insights</p>
        </div>
        
        <div className="flex gap-4">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={runAggregation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Monthly Recurring Revenue"
          value={`$${kpis.mrr.toLocaleString()}`}
          change={kpis.mrrChange}
          trend={kpis.mrrTrend}
          icon="💰"
          subtitle="Total revenue this period"
        />
        
        <KPICard
          title="Active Users"
          value={kpis.activeUsers.toLocaleString()}
          change={kpis.userChange}
          trend={kpis.userTrend}
          icon="👥"
          subtitle="Users active in period"
        />
        
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          trend="stable"
          icon="📈"
          subtitle="Free to paid conversion"
        />
        
        <KPICard
          title="Avg Session"
          value={`${kpis.avgSession} min`}
          trend="stable"
          icon="⏱️"
          subtitle="Average session duration"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Customer Lifetime Value"
          value={`$${kpis.avgCLV}`}
          icon="💎"
          subtitle="Average CLV"
        />
        
        <KPICard
          title="Churn Rate"
          value={`${kpis.churnRate}%`}
          icon="⚠️"
          subtitle="User churn rate"
        />
        
        <KPICard
          title="Total Sessions"
          value={kpis.funnelData?.[0]?.value || 0}
          icon="📱"
          subtitle="Total visitor sessions"
        />
        
        <KPICard
          title="Paying Users"
          value={kpis.funnelData?.[3]?.value || 0}
          icon="💳"
          subtitle="Users who made purchases"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {kpis.revenueData && kpis.revenueData.length > 0 && (
          <Chart
            title="Revenue Trend"
            data={kpis.revenueData}
            type="area"
            dataKey="value"
          />
        )}
        
        {kpis.userGrowthData && kpis.userGrowthData.length > 0 && (
          <Chart
            title="User Growth"
            data={kpis.userGrowthData}
            type="line"
            dataKey="value"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpis.personalityData && kpis.personalityData.length > 0 && (
          <Chart
            title="Revenue by Personality Type"
            data={kpis.personalityData}
            type="pie"
            dataKey="value"
          />
        )}
        
        {kpis.funnelData && kpis.funnelData.length > 0 && (
          <Chart
            title="Conversion Funnel"
            data={kpis.funnelData}
            type="bar"
            dataKey="value"
          />
        )}
      </div>

      {/* Data Info */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()} | 
          Period: {period} | 
          Data points: {kpis.revenueData?.length || 0} days
        </p>
      </div>
    </div>
  );
}