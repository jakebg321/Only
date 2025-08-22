import { NextResponse } from 'next/server';
import { EventTracker } from '@/lib/analytics/event-tracker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, userId, eventType, eventData } = body;
    
    // Validate required fields
    if (!sessionId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and eventType' },
        { status: 400 }
      );
    }
    
    // Track the event
    await EventTracker.trackEvent(
      sessionId,
      userId || null,
      eventType,
      eventData || {}
    );
    
    return NextResponse.json({ 
      success: true,
      message: `Event ${eventType} tracked successfully`
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// Batch tracking endpoint
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { events } = body;
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events array' },
        { status: 400 }
      );
    }
    
    // Validate all events have required fields
    for (const event of events) {
      if (!event.sessionId || !event.eventType) {
        return NextResponse.json(
          { error: 'Each event must have sessionId and eventType' },
          { status: 400 }
        );
      }
    }
    
    // Track batch
    await EventTracker.trackBatch(events);
    
    return NextResponse.json({
      success: true,
      message: `${events.length} events tracked successfully`
    });
  } catch (error) {
    console.error('Batch tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track batch events' },
      { status: 500 }
    );
  }
}