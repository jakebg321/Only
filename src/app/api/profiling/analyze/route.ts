import { NextRequest, NextResponse } from 'next/server';
import { analyzeResponse } from '@/lib/database-profiler';

export async function POST(request: NextRequest) {
  try {
    const { userId, probeId, response } = await request.json();

    if (!userId || !probeId || !response) {
      return NextResponse.json(
        { error: 'User ID, probe ID, and response are required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeResponse(userId, probeId, response);
    
    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Response analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze response' },
      { status: 500 }
    );
  }
}