import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export async function GET() {
  try {
    // Test database connections
    const tests = {
      sessions: 0,
      events: 0,
      metrics: 0,
      revenue: 0
    };
    
    // Count records in each table
    tests.sessions = await prisma.userSession.count();
    tests.events = await prisma.eventLog.count();
    tests.metrics = await prisma.userMetrics.count();
    tests.revenue = await prisma.revenueEvent.count();
    
    // Get recent sessions
    const recentSessions = await prisma.userSession.findMany({
      take: 5,
      orderBy: { startTime: 'desc' },
      select: {
        sessionId: true,
        ipAddress: true,
        browser: true,
        deviceType: true,
        pageViews: true,
        startTime: true
      }
    });
    
    // Get recent events
    const recentEvents = await prisma.eventLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      select: {
        eventType: true,
        userId: true,
        timestamp: true
      }
    });
    
    return NextResponse.json({
      status: 'Analytics system is operational',
      counts: tests,
      recentSessions,
      recentEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics test error:', error);
    return NextResponse.json(
      { 
        error: 'Analytics test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}