import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

/**
 * Cleanup endpoint to fix problematic session data
 * This is a one-time fix for the test session with unrealistic duration
 */
export async function POST() {
  try {
    console.log('[CLEANUP] Starting session data cleanup...');
    
    // Delete or fix sessions with unrealistic durations (over 2 hours)
    const result = await prisma.userSession.deleteMany({
      where: {
        OR: [
          // Delete the problematic test session
          { sessionId: 'test-session-manual-123' },
          // Delete sessions with unrealistic durations (over 24 hours)
          { duration: { gt: 86400 } }
        ]
      }
    });
    
    console.log(`[CLEANUP] Removed ${result.count} problematic sessions`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.count} problematic sessions`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CLEANUP] Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}