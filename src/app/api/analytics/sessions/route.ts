import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Get recent sessions
    const sessions = await prisma.userSession.findMany({
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        sessionId: true,
        ipAddress: true,
        browser: true,
        os: true,
        deviceType: true,
        country: true,
        referrerSource: true,
        startTime: true,
        endTime: true,
        duration: true,
        pageViews: true,
        userId: true
      }
    });

    // Calculate session statistics
    const totalSessions = await prisma.userSession.count();
    
    // Active sessions (visited in last 5 minutes)
    const activeSessions = await prisma.userSession.count({
      where: {
        OR: [
          {
            // Sessions that haven't ended and were updated recently
            AND: [
              { endTime: null },
              {
                startTime: {
                  gte: new Date(Date.now() - 5 * 60 * 1000) // Started in last 5 minutes
                }
              }
            ]
          },
          {
            // Or sessions that ended very recently
            endTime: {
              gte: new Date(Date.now() - 60 * 1000) // Ended in last minute
            }
          }
        ]
      }
    });

    // Average session duration
    const avgDurationResult = await prisma.userSession.aggregate({
      _avg: {
        duration: true
      },
      where: {
        duration: {
          not: null
        }
      }
    });

    // Browser distribution
    const browserStats = await prisma.userSession.groupBy({
      by: ['browser'],
      _count: {
        browser: true
      },
      orderBy: {
        _count: {
          browser: 'desc'
        }
      }
    });

    // OS distribution
    const osStats = await prisma.userSession.groupBy({
      by: ['os'],
      _count: {
        os: true
      },
      orderBy: {
        _count: {
          os: 'desc'
        }
      }
    });

    // Device type distribution
    const deviceStats = await prisma.userSession.groupBy({
      by: ['deviceType'],
      _count: {
        deviceType: true
      },
      orderBy: {
        _count: {
          deviceType: 'desc'
        }
      }
    });

    // Referrer source distribution
    const referrerStats = await prisma.userSession.groupBy({
      by: ['referrerSource'],
      _count: {
        referrerSource: true
      },
      where: {
        referrerSource: {
          not: null
        }
      },
      orderBy: {
        _count: {
          referrerSource: 'desc'
        }
      }
    });

    // Sessions over time (last 7 days)
    const sessionsOverTime = await prisma.$queryRaw`
      SELECT 
        DATE("startTime") as date,
        COUNT(*) as sessions,
        AVG(duration) as avg_duration
      FROM "UserSession"
      WHERE "startTime" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("startTime")
      ORDER BY date
    ` as any[];

    const sessionTimeData = sessionsOverTime.map(row => ({
      name: new Date(row.date).toLocaleDateString(),
      sessions: Number(row.sessions),
      avgDuration: Math.round(Number(row.avg_duration) / 60) // Convert to minutes
    }));

    // Country distribution (top 10)
    const countryStats = await prisma.userSession.groupBy({
      by: ['country'],
      _count: {
        country: true
      },
      where: {
        country: {
          not: null
        }
      },
      orderBy: {
        _count: {
          country: 'desc'
        }
      },
      take: 10
    });

    // Response data
    const stats = {
      totalSessions,
      activeSessions,
      avgDuration: Math.round(avgDurationResult._avg.duration || 0),
      topBrowser: browserStats[0]?.browser || 'Unknown',
      topOS: osStats[0]?.os || 'Unknown',
      topDevice: deviceStats[0]?.deviceType || 'Unknown'
    };

    const chartData = {
      browserData: browserStats.map(stat => ({
        name: stat.browser,
        value: stat._count.browser
      })),
      osData: osStats.map(stat => ({
        name: stat.os,
        value: stat._count.os
      })),
      deviceData: deviceStats.map(stat => ({
        name: stat.deviceType,
        value: stat._count.deviceType
      })),
      referrerData: referrerStats.map(stat => ({
        name: stat.referrerSource || 'direct',
        value: stat._count.referrerSource
      })),
      sessionTimeData,
      countryData: countryStats.map(stat => ({
        name: stat.country,
        value: stat._count.country
      }))
    };

    return NextResponse.json({
      sessions,
      stats,
      chartData,
      pagination: {
        page,
        limit,
        total: totalSessions,
        pages: Math.ceil(totalSessions / limit)
      }
    });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}