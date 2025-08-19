import { NextRequest, NextResponse } from 'next/server';
import { trackBehavior } from '@/lib/database-profiler';

export async function POST(request: NextRequest) {
  try {
    const { userId, behaviorData } = await request.json();

    if (!userId || !behaviorData) {
      return NextResponse.json(
        { error: 'User ID and behavior data are required' },
        { status: 400 }
      );
    }

    const result = await trackBehavior(userId, behaviorData);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Behavior tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track behavior' },
      { status: 500 }
    );
  }
}