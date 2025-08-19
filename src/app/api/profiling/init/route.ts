import { NextRequest, NextResponse } from 'next/server';
import { initProfile } from '@/lib/database-profiler';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // For now, use the passed userId (will add auth later)
    const profile = await initProfile(userId);
    
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile initialization error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to initialize profile',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    );
  }
}