import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    // Test basic response first
    console.log('Test endpoint called with userId:', userId);
    
    // Try importing the function
    const { getProfile } = await import('@/lib/database-profiler');
    console.log('getProfile imported:', typeof getProfile);
    
    // Try calling it
    const result = await getProfile(userId);
    console.log('getProfile result:', result);
    
    return NextResponse.json({ 
      success: true, 
      profile: result,
      debug: {
        functionType: typeof getProfile,
        userId
      }
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack,
        type: typeof error
      },
      { status: 500 }
    );
  }
}