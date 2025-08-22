import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Calculate MRR (Monthly Recurring Revenue)
    const revenueEvents = await prisma.revenueEvent.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      }
    });
    
    const mrr = revenueEvents.reduce((sum, event) => 
      sum + Number(event.amount), 0
    );
    
    // Calculate previous period MRR for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (now.getDate() - startDate.getDate()));
    
    const prevRevenueEvents = await prisma.revenueEvent.findMany({
      where: {
        timestamp: {
          gte: prevStartDate,
          lt: startDate
        }
      }
    });
    
    const prevMrr = prevRevenueEvents.reduce((sum, event) => 
      sum + Number(event.amount), 0
    );
    
    const mrrChange = mrr > 0 && prevMrr > 0 
      ? ((mrr - prevMrr) / prevMrr * 100).toFixed(1)
      : 0;
    
    // Calculate active users
    const activeUsers = await prisma.userMetrics.count({
      where: {
        lastVisit: {
          gte: startDate
        }
      }
    });
    
    const prevActiveUsers = await prisma.userMetrics.count({
      where: {
        lastVisit: {
          gte: prevStartDate,
          lt: startDate
        }
      }
    });
    
    const userChange = activeUsers > 0 && prevActiveUsers > 0
      ? ((activeUsers - prevActiveUsers) / prevActiveUsers * 100).toFixed(1)
      : 0;
    
    // Calculate conversion rate
    const totalUsers = await prisma.user.count();
    const payingUsers = await prisma.userMetrics.count({
      where: {
        purchaseCount: { gt: 0 }
      }
    });
    const conversionRate = totalUsers > 0 
      ? (payingUsers / totalUsers * 100).toFixed(2)
      : 0;
    
    // Calculate average session duration
    const sessions = await prisma.userSession.findMany({
      where: {
        startTime: {
          gte: startDate
        },
        duration: {
          not: null
        }
      },
      select: {
        duration: true
      }
    });
    
    const avgSessionDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60) // Convert to minutes
      : 0;
    
    // Get personality distribution for revenue
    const personalityRevenue = await prisma.revenueEvent.groupBy({
      by: ['personalityType'],
      where: {
        timestamp: {
          gte: startDate
        },
        personalityType: {
          not: null
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        _all: true
      }
    });
    
    const personalityData = personalityRevenue.map(p => ({
      name: p.personalityType || 'Unknown',
      value: Number(p._sum.amount || 0),
      count: p._count._all
    }));
    
    // Calculate CLV (Customer Lifetime Value)
    const userRevenue = await prisma.userMetrics.findMany({
      where: {
        purchaseCount: { gt: 0 }
      },
      select: {
        totalSpent: true,
        purchaseCount: true
      }
    });
    
    const avgCLV = userRevenue.length > 0
      ? userRevenue.reduce((sum, u) => sum + Number(u.totalSpent), 0) / userRevenue.length
      : 0;
    
    // Calculate CAC (Customer Acquisition Cost) - placeholder
    const cac = 50; // This would be calculated from marketing spend
    const clvCacRatio = cac > 0 ? (avgCLV / cac).toFixed(2) : 0;
    
    // Get engagement metrics
    const engagementMetrics = await prisma.userMetrics.aggregate({
      _avg: {
        engagementScore: true,
        totalMessages: true,
        avgResponseTime: true
      }
    });
    
    // Get revenue trend data for chart
    const revenueTrend = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        SUM(amount::numeric) as revenue,
        COUNT(*) as transactions
      FROM "RevenueEvent"
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date
    ` as any[];
    
    const revenueData = revenueTrend.map(r => ({
      name: new Date(r.date).toLocaleDateString(),
      value: Number(r.revenue)
    }));
    
    // Get user growth data
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as new_users
      FROM "User"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date
    ` as any[];
    
    const userGrowthData = userGrowth.map(u => ({
      name: new Date(u.date).toLocaleDateString(),
      value: Number(u.new_users)
    }));
    
    // Calculate churn rate
    const churnedUsers = await prisma.userMetrics.count({
      where: {
        lastVisit: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Not active in 30 days
        },
        purchaseCount: { gt: 0 }
      }
    });
    
    const churnRate = payingUsers > 0
      ? (churnedUsers / payingUsers * 100).toFixed(2)
      : 0;
    
    // Response
    return NextResponse.json({
      // Primary KPIs
      mrr,
      mrrChange,
      mrrTrend: Number(mrrChange) > 0 ? 'up' : 'down',
      
      activeUsers,
      userChange,
      userTrend: Number(userChange) > 0 ? 'up' : 'down',
      
      conversionRate,
      conversionChange: 0, // Would need historical data
      conversionTrend: 'stable',
      
      avgSession: avgSessionDuration,
      sessionChange: 0,
      sessionTrend: 'stable',
      
      // Secondary KPIs
      avgCLV: avgCLV.toFixed(2),
      cac,
      clvCacRatio,
      churnRate,
      
      // Engagement metrics
      avgEngagementScore: engagementMetrics._avg.engagementScore?.toFixed(1) || 0,
      avgMessages: Math.round(engagementMetrics._avg.totalMessages || 0),
      avgResponseTime: Math.round(engagementMetrics._avg.avgResponseTime || 0),
      
      // Chart data
      revenueData,
      userGrowthData,
      personalityData,
      
      // Funnel data (simplified)
      funnelData: [
        { name: 'Visitors', value: totalUsers },
        { name: 'Active Users', value: activeUsers },
        { name: 'Engaged Users', value: Math.round(activeUsers * 0.6) },
        { name: 'Paying Users', value: payingUsers }
      ],
      
      // Metadata
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    console.error('KPIs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}