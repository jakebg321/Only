/**
 * Unified Chat API
 * Single endpoint for ALL chat interactions
 * Ensures consistency between regular chat and debug chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedChatEngine } from '@/lib/unified-chat-engine';

// Initialize engine once
let chatEngine: UnifiedChatEngine | null = null;

async function initializeEngine() {
  if (!chatEngine) {
    chatEngine = new UnifiedChatEngine();
    const grokApiKey = process.env.GROK_API_KEY;
    if (grokApiKey) {
      await chatEngine.initialize(grokApiKey);
    }
  }
  return chatEngine;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      message,
      debugMode = false,
      responseTime,
      typingStops
    } = body;
    
    // Ensure conversationHistory is always an array
    const conversationHistory = Array.isArray(body.conversationHistory) 
      ? body.conversationHistory 
      : [];
    
    // Validate required fields
    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }
    
    // Initialize engine
    const engine = await initializeEngine();
    
    // Process message through unified engine
    const response = await engine.processMessage(
      userId,
      message,
      conversationHistory,
      {
        debugMode,
        responseTime,
        typingStops
      }
    );
    
    // Return response
    return NextResponse.json({
      success: true,
      ...response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Unified chat error:', error);
    console.error('Stack:', error?.stack);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message',
        details: error?.message || 'Unknown error',
        // Fallback message that maintains character
        message: "Mmm, having some tech issues baby... try that again? 😘"
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/chat/unified',
    method: 'POST',
    description: 'Unified chat endpoint with psychological analysis',
    payload: {
      userId: 'string (required)',
      message: 'string (required)',
      conversationHistory: 'array of messages',
      debugMode: 'boolean (optional) - includes analysis data',
      responseTime: 'number (optional) - milliseconds to type',
      typingStops: 'number (optional) - hesitation count'
    },
    features: [
      'Undertone detection',
      'User type categorization',
      'Response strategy selection',
      'Realistic typing delays',
      'Psychological profiling',
      'Energy matching'
    ]
  });
}