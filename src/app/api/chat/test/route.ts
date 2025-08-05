import { NextResponse } from 'next/server';
import { GrokClient } from '@/lib/grok-client';
import GrokRateLimiter from '@/lib/grok-rate-limiter';

export async function POST(request: Request) {
  try {
    const { message, personality = {} } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Skip rate limiting for now since you have a paid account

    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      console.error('GROK_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      );
    }
    
    console.log('Grok API Key found:', grokApiKey.substring(0, 10) + '...');

    const grokClient = new GrokClient(grokApiKey);
    
    // Default test personality
    const testPersonality = {
      tone: 'flirty',
      interests: ['fitness', 'fashion', 'photography'],
      boundaries: ['keep it respectful', 'no personal meetups'],
      customInstructions: 'Be playful and engaging, use emojis',
      responseStyle: 'Flirty and playful with a touch of mystery',
      enableEmojis: true,
      ...personality
    };

    console.log('Sending message to Grok:', message);
    
    const response = await grokClient.generateCreatorResponse(message, testPersonality);
    console.log('Grok response received:', response);

    return NextResponse.json({
      message: response,
      personality: testPersonality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: "Sorry babe, having technical issues. Try again? 💕"
      },
      { status: 500 }
    );
  }
}

// Test endpoint info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/chat/test',
    method: 'POST',
    description: 'Test Grok chatbot integration',
    payload: {
      message: 'Your message here',
      personality: {
        tone: 'flirty | friendly | mysterious | professional',
        enableEmojis: true
      }
    }
  });
}