import { NextRequest, NextResponse } from 'next/server';
import { getNextProbe } from '@/lib/database-profiler';

export async function POST(request: NextRequest) {
  try {
    const { userId, messageCount } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const probe = await getNextProbe(userId, messageCount || 0);
    
    return NextResponse.json({ success: true, probe });
  } catch (error) {
    console.error('Probe retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get probe' },
      { status: 500 }
    );
  }
}