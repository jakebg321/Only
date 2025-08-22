import { NextRequest, NextResponse } from 'next/server';
import { IntelligentSessionTracker } from '@/lib/analytics/intelligent-session-tracker';

/**
 * Real-time Activity Tracking Endpoint
 * Powers the intelligent session detection system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, activityType, intensity, timestamp, page } = body;

    if (!sessionId || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[ACTIVITY-API] 🎯 ${activityType} signal (intensity: ${intensity}) for session ${sessionId.substring(0, 8)}`);

    // Use the intelligent session tracker
    const activitySignal = {
      type: activityType as 'page_view' | 'click' | 'scroll' | 'typing' | 'message' | 'focus' | 'blur',
      timestamp: new Date(timestamp),
      intensity: Number(intensity) || 5,
      metadata: { page }
    };

    const sessionState = await IntelligentSessionTracker.trackActivity(
      sessionId,
      activitySignal,
      userId
    );

    return NextResponse.json({
      success: true,
      sessionState: {
        sessionId: sessionState.sessionId,
        isActive: sessionState.isActive,
        activityScore: sessionState.activityScore,
        sessionQuality: sessionState.sessionQuality,
        totalInteractions: sessionState.totalInteractions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[ACTIVITY-API] Error tracking activity:', error);
    return NextResponse.json(
      { 
        error: 'Activity tracking failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for retrieving activity patterns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      // Return general activity insights
      const activeSessions = await IntelligentSessionTracker.getActiveSessions();
      const realtimeStats = await IntelligentSessionTracker.getRealTimeStats();

      return NextResponse.json({
        activeSessions: activeSessions.length,
        highQualitySessions: activeSessions.filter(s => s.sessionQuality === 'high').length,
        averageActivityScore: activeSessions.reduce((sum, s) => sum + s.activityScore, 0) / activeSessions.length || 0,
        stats: realtimeStats
      });
    }

    // Return specific session activity data
    const sessionState = await IntelligentSessionTracker.getActiveSessions();
    const targetSession = sessionState.find(s => s.sessionId === sessionId);

    if (!targetSession) {
      return NextResponse.json(
        { error: 'Session not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: targetSession.sessionId,
      userId: targetSession.userId,
      isActive: targetSession.isActive,
      activityScore: targetSession.activityScore,
      sessionQuality: targetSession.sessionQuality,
      lastActivity: targetSession.lastActivity,
      totalInteractions: targetSession.totalInteractions,
      deviceFingerprint: targetSession.deviceFingerprint
    });

  } catch (error) {
    console.error('[ACTIVITY-API] Error retrieving activity data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve activity data' },
      { status: 500 }
    );
  }
}