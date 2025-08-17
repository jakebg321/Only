import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SecureGrokClient } from '@/lib/secure-grok-client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get user from auth token
    const token = request.cookies.get('authToken')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPayload = verifyToken(token);
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user preferences
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId: userPayload.userId }
    });

    // Get conversation memory
    const userMemories = await prisma.conversationMemory.findMany({
      where: { 
        userId: userPayload.userId,
        confidence: { gte: 0.7 } // Only use high-confidence memories
      },
      orderBy: { lastMentioned: 'desc' },
      take: 10
    });

    // Get subscriber info if user is a subscriber
    let subscriberInfo = null;
    if (userPayload.role === 'SUBSCRIBER') {
      subscriberInfo = await prisma.subscriber.findUnique({
        where: { userId: userPayload.userId },
        include: {
          subscriptions: {
            where: { isActive: true },
            include: {
              creator: {
                include: {
                  personality: true
                }
              }
            }
          }
        }
      });
    }

    // Build context for Grok
    const memoriesContext = userMemories.map(m => 
      `User ${m.category}: ${m.fact}`
    ).join(', ');

    const userName = userPreferences?.preferredName || 
                    subscriberInfo?.displayName || 
                    userPayload.email.split('@')[0];

    // Get creator personality (assuming Remy for now)
    const creator = subscriberInfo?.subscriptions[0]?.creator;
    const creatorPersonality = creator?.personality || {
      tone: 'FLIRTY',
      interests: ['fitness', 'fashion', 'photography', 'lingerie', 'dancing'],
      greetingMessage: 'Hey babe! 😘',
      responseStyle: 'Flirty and engaging',
      flirtLevel: 5,
      explicitLevel: 2,
      petNames: ['babe', 'sexy', 'baby', 'love'],
      fantasyFocus: ['teasing', 'roleplay', 'sensual chat'],
      boundaries: ['no personal meetups', 'no illegal content']
    };
    const creatorDisplayName = creator?.displayName || 'Remy';

    // Initialize Grok client
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      );
    }

    const grokClient = new SecureGrokClient(grokApiKey);

    // Build personality config with user context
    const personalityConfig = {
      displayName: creatorDisplayName,
      tone: creatorPersonality.tone || 'FLIRTY',
      personalityTraits: ['sexy', 'confident', 'playful', 'seductive'],
      interests: creatorPersonality.interests || [],
      hobbies: ['yoga', 'modeling', 'traveling'],
      favoriteThings: [],
      responseStyle: creatorPersonality.responseStyle || 'Flirty and engaging',
      vocabularyLevel: 'casual' as const,
      humorStyle: 'playful' as const,
      flirtLevel: creatorPersonality.flirtLevel || 5,
      explicitLevel: creatorPersonality.explicitLevel || 2,
      boundaries: creatorPersonality.boundaries || ['no personal meetups', 'no illegal content'],
      neverMentions: ['AI', 'bot', 'artificial', 'computer', 'program'],
      alwaysAvoid: [],
      contentTypes: ['sexy photos', 'steamy videos', 'naughty messages', 'custom content'],
      specialties: ['teasing', 'roleplay', 'fantasy fulfillment'],
      priceRanges: {
        customPhoto: '$50',
        customVideo: '$100',
        voiceMessage: '$25'
      },
      responseLength: 'medium' as any,
      enableEmojis: true,
      emojiFrequency: 'frequent' as any,
      useSlang: true,
      usePetNames: true,
      petNames: creatorPersonality.petNames || ['babe', 'sexy'],
      subscriptionAcknowledgment: true,
      fantasyFocus: creatorPersonality.fantasyFocus || [],
      backstory: 'A hot content creator who loves connecting intimately with fans',
      relationship: `You're chatting with ${userName}. ${memoriesContext ? `You remember: ${memoriesContext}` : ''}`,
      customInstructions: `The user's name is ${userName}. ${userPreferences?.chatStyle ? `They prefer a ${userPreferences.chatStyle} conversation style.` : ''}`
    };

    // Generate response
    const response = await grokClient.generateSecureResponse(
      message, 
      personalityConfig, 
      conversationHistory
    );

    // Extract potential memories from the conversation
    await extractAndSaveMemories(userPayload.userId, message);

    // Update user activity
    if (userPreferences) {
      await prisma.userPreferences.update({
        where: { id: userPreferences.id },
        data: { lastActive: new Date() }
      });
    }

    return NextResponse.json({
      message: response,
      personality: {
        name: creatorDisplayName,
        tone: creatorPersonality.tone
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Authenticated chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
        message: "Ugh, tech issues... try that again?"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to extract and save memories from conversation
async function extractAndSaveMemories(userId: string, message: string) {
  try {
    // Simple extraction patterns (could be enhanced with AI)
    const patterns = [
      { regex: /my name is (\w+)/i, category: 'personal' },
      { regex: /i work (?:at|in|for) ([^.,!?]+)/i, category: 'work' },
      { regex: /i (?:like|love|enjoy) ([^.,!?]+)/i, category: 'preferences' },
      { regex: /i have (?:a|an) ([^.,!?]+)/i, category: 'personal' },
      { regex: /i'm (?:a|an) ([^.,!?]+)/i, category: 'personal' },
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern.regex);
      if (match) {
        const fact = match[0];
        
        // Check if this fact already exists
        const existing = await prisma.conversationMemory.findFirst({
          where: {
            userId,
            fact: { contains: fact, mode: 'insensitive' }
          }
        });

        if (existing) {
          // Increase confidence if mentioned again
          await prisma.conversationMemory.update({
            where: { id: existing.id },
            data: {
              confidence: Math.min(1, existing.confidence + 0.1),
              lastMentioned: new Date()
            }
          });
        } else {
          // Create new memory
          await prisma.conversationMemory.create({
            data: {
              userId,
              fact,
              category: pattern.category,
              confidence: 0.5,
              lastMentioned: new Date()
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Memory extraction error:', error);
    // Don't fail the request if memory extraction fails
  }
}