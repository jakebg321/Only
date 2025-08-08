import { NextResponse } from 'next/server';

// In-memory storage for now (replace with database later)
const savedPersonalities: any[] = [];

export async function POST(request: Request) {
  try {
    const personality = await request.json();

    // Generate a unique ID
    const id = `custom_${Date.now()}`;
    const personalityWithId = {
      ...personality,
      id,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    // Save to memory (replace with database save)
    savedPersonalities.push(personalityWithId);
    console.log('Saved personality:', personalityWithId);

    return NextResponse.json({
      success: true,
      message: 'Personality saved successfully',
      data: personalityWithId
    });
  } catch (error) {
    console.error('Error saving personality:', error);
    return NextResponse.json(
      { error: 'Failed to save personality' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return all saved personalities
    return NextResponse.json({
      personalities: savedPersonalities,
      count: savedPersonalities.length
    });
  } catch (error) {
    console.error('Error fetching personalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalities' },
      { status: 500 }
    );
  }
}