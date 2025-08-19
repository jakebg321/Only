import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Import dynamically to avoid module issues
    const { databaseProfiler } = await import('@/lib/database-profiler');
    
    // Call the method directly on the instance
    const profile = await databaseProfiler.getProfile(userId);
    
    // Ensure we always return valid JSON
    if (!profile) {
      return NextResponse.json({ success: false, profile: null });
    }
    
    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile retrieval error:', error);
    console.error('Error stack:', error?.stack);
    
    // Always return valid JSON even on error
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to get profile',
        success: false 
      },
      { status: 500 }
    );
  }
}