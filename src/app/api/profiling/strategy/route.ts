import { NextRequest, NextResponse } from 'next/server';
import { getStrategy } from '@/lib/database-profiler';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const strategy = await getStrategy(userId);
    
    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('Strategy retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to get strategy' },
      { status: 500 }
    );
  }
}