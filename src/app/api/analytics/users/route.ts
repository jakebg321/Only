import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get user metrics
    const users = await prisma.userMetrics.findMany({
      orderBy: { lastVisit: 'desc' },
      take: limit,
      skip: offset
    });

    // Calculate statistics
    const totalUsers = await prisma.userMetrics.count();
    
    // Active users (visited in last 7 days)
    const activeUsers = await prisma.userMetrics.count({
      where: {
        lastVisit: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Average engagement score
    const avgEngagementResult = await prisma.userMetrics.aggregate({
      _avg: {
        engagementScore: true
      }
    });

    // Total revenue
    const totalRevenueResult = await prisma.userMetrics.aggregate({
      _sum: {
        totalSpent: true
      }
    });

    // Average session time
    const avgSessionResult = await prisma.userMetrics.aggregate({
      _avg: {
        avgSessionLength: true
      }
    });

    // High churn risk users (churnRisk > 0.7)
    const highChurnUsers = await prisma.userMetrics.count({
      where: {
        churnRisk: {
          gte: 0.7
        }
      }
    });

    const stats = {
      totalUsers,
      activeUsers,
      avgEngagement: avgEngagementResult._avg.engagementScore || 0,
      totalRevenue: parseFloat(totalRevenueResult._sum.totalSpent?.toString() || '0'),
      avgSessionTime: Math.round(avgSessionResult._avg.avgSessionLength || 0),
      churnRate: totalUsers > 0 ? highChurnUsers / totalUsers : 0
    };

    // User segmentation data
    const segmentData = {
      engagement: {
        high: await prisma.userMetrics.count({ where: { engagementScore: { gte: 0.8 } } }),
        medium: await prisma.userMetrics.count({ 
          where: { 
            engagementScore: { 
              gte: 0.5,
              lt: 0.8 
            } 
          } 
        }),
        low: await prisma.userMetrics.count({ where: { engagementScore: { lt: 0.5 } } })
      },
      churnRisk: {
        high: highChurnUsers,
        medium: await prisma.userMetrics.count({ 
          where: { 
            churnRisk: { 
              gte: 0.4,
              lt: 0.7 
            } 
          } 
        }),
        low: await prisma.userMetrics.count({ where: { churnRisk: { lt: 0.4 } } })
      },
      revenue: {
        whale: await prisma.userMetrics.count({ 
          where: { 
            totalSpent: { 
              gte: 100 
            } 
          } 
        }),
        regular: await prisma.userMetrics.count({ 
          where: { 
            totalSpent: { 
              gte: 10,
              lt: 100 
            } 
          } 
        }),
        micro: await prisma.userMetrics.count({ 
          where: { 
            totalSpent: { 
              gt: 0,
              lt: 10 
            } 
          } 
        }),
        free: await prisma.userMetrics.count({ 
          where: { 
            totalSpent: { 
              equals: 0 
            } 
          } 
        })
      }
    };

    return NextResponse.json({
      users,
      stats,
      segmentData,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}