import { NextRequest, NextResponse } from 'next/server';
import { IntelligentSessionTracker } from '@/lib/analytics/intelligent-session-tracker';

/**
 * Session Lifecycle Management API
 * Handles intelligent session timeouts and cleanup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger } = body;

    console.log(`[LIFECYCLE-API] 🔄 Session lifecycle management triggered by: ${trigger}`);

    // Run all lifecycle management tasks
    const results = await Promise.allSettled([
      IntelligentSessionTracker.manageSessionLifecycle(),
      IntelligentSessionTracker.deduplicateSessions()
    ]);

    // Check results
    const lifecycleResult = results[0];
    const deduplicationResult = results[1];

    const response = {
      success: true,
      trigger,
      timestamp: new Date().toISOString(),
      operations: {
        sessionLifecycle: {
          status: lifecycleResult.status,
          error: lifecycleResult.status === 'rejected' ? lifecycleResult.reason?.message : null
        },
        deduplication: {
          status: deduplicationResult.status,
          error: deduplicationResult.status === 'rejected' ? deduplicationResult.reason?.message : null
        }
      }
    };

    console.log('[LIFECYCLE-API] ✅ Lifecycle management completed');

    return NextResponse.json(response);

  } catch (error) {
    console.error('[LIFECYCLE-API] Error during lifecycle management:', error);
    return NextResponse.json(
      { 
        error: 'Lifecycle management failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for lifecycle status and statistics
 */
export async function GET() {
  try {
    // Get current session statistics
    const [activeSessions, realtimeStats] = await Promise.all([
      IntelligentSessionTracker.getActiveSessions(),
      IntelligentSessionTracker.getRealTimeStats()
    ]);

    const now = new Date();
    const sessionsByQuality = {
      high: activeSessions.filter(s => s.sessionQuality === 'high').length,
      medium: activeSessions.filter(s => s.sessionQuality === 'medium').length,
      low: activeSessions.filter(s => s.sessionQuality === 'low').length,
      bounce: activeSessions.filter(s => s.sessionQuality === 'bounce').length
    };

    const averageActivityScore = activeSessions.length > 0 
      ? activeSessions.reduce((sum, s) => sum + s.activityScore, 0) / activeSessions.length 
      : 0;

    return NextResponse.json({
      timestamp: now.toISOString(),
      activeSessions: {
        total: activeSessions.length,
        byQuality: sessionsByQuality,
        averageActivityScore: Math.round(averageActivityScore * 10) / 10
      },
      realtimeStats,
      systemHealth: {
        sessionDetection: 'intelligent',
        timeoutStrategy: 'multi_factor',
        deduplication: 'device_fingerprint',
        qualityScoring: 'engagement_based'
      },
      nextLifecycleCheck: new Date(now.getTime() + 5 * 60 * 1000).toISOString() // 5 minutes
    });

  } catch (error) {
    console.error('[LIFECYCLE-API] Error retrieving lifecycle status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lifecycle status' },
      { status: 500 }
    );
  }
}