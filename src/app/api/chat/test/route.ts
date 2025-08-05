import { NextResponse } from 'next/server';
import { SecureGrokClient } from '@/lib/secure-grok-client';
import { PersonalityTone } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { message, personality = {}, conversationHistory = [] } = await request.json();

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

    const grokClient = new SecureGrokClient(grokApiKey);
    
    // Build full personality config for SecureGrokClient
    // Adjust traits based on tone
    const getTraitsForTone = (tone: string) => {
      switch(tone) {
        case 'SUBMISSIVE':
          return ['sweet', 'eager to please', 'obedient', 'affectionate'];
        case 'DOMINANT':
          return ['commanding', 'confident', 'strict', 'powerful'];
        case 'MYSTERIOUS':
          return ['enigmatic', 'alluring', 'intriguing', 'sensual'];
        default:
          return ['sexy', 'confident', 'playful', 'seductive'];
      }
    };

    const testPersonality = {
      displayName: personality.name || 'Sophia',
      tone: (personality.tone || 'FLIRTY') as PersonalityTone,
      personalityTraits: getTraitsForTone(personality.tone),
      interests: personality.interests || ['fitness', 'fashion', 'photography', 'lingerie', 'dancing'],
      hobbies: ['yoga', 'modeling', 'traveling'],
      favoriteThings: [],
      responseStyle: 'Sexy, flirty and seductive with lots of sexual energy',
      vocabularyLevel: 'casual' as const,
      humorStyle: 'playful' as const,
      flirtLevel: (personality.flirtLevel ?? 5) as any,
      explicitLevel: (personality.explicitLevel ?? 2) as any,
      boundaries: ['no personal meetups', 'no illegal content'],
      neverMentions: ['AI', 'bot', 'artificial', 'computer', 'program'],
      alwaysAvoid: [],
      contentTypes: ['sexy photos', 'steamy videos', 'naughty messages', 'custom content'],
      specialties: ['teasing', 'roleplay', 'fantasy fulfillment'],
      priceRanges: {
        customPhoto: '$50',
        customVideo: '$100',
        voiceMessage: '$25'
      },
      responseLength: (personality.responseLength || 'medium') as any,
      enableEmojis: personality.enableEmojis !== false,
      emojiFrequency: (personality.emojiFrequency || 'frequent') as any,
      useSlang: true,
      usePetNames: true,
      petNames: ['babe', 'sexy', 'baby', 'hottie', 'love'],
      subscriptionAcknowledgment: true,
      fantasyFocus: personality.fantasyFocus || ['teasing', 'sensual chat', 'roleplay'],
      backstory: 'A hot content creator who loves connecting intimately with fans',
      relationship: 'You see fans as sexy supporters who pay premium for exclusive, intimate access to you.',
      customInstructions: 'Be very flirty and build sexual tension in every message'
    };

    console.log('Sending message to Grok with secure client:', message);
    console.log('Personality tone:', personality.tone);
    console.log('Full personality config:', testPersonality);
    
    // Send message with conversation history for context
    const response = await grokClient.generateSecureResponse(message, testPersonality, conversationHistory);
    console.log('Grok response received:', response);

    return NextResponse.json({
      message: response,
      personality: testPersonality,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: "Ugh, tech issues... try that again?"
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