import { NextResponse } from 'next/server';
import { SecureGrokClient } from '@/lib/secure-grok-client';
import { prisma } from '@/lib/prisma';
import { getOrCreateChatSession, sendMessage, getChatHistory } from '@/lib/db/chat';


export async function POST(request: Request) {
  try {
    const { 
      message, 
      creatorId, 
      subscriberId,
      sessionId 
    } = await request.json();

    // Validate input
    if (!message || !creatorId || !subscriberId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    // Get or create chat session
    const chatSession = sessionId 
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : await getOrCreateChatSession(creatorId, subscriberId);

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Get creator personality
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { personality: true }
    });

    if (!creator || !creator.personality) {
      return NextResponse.json(
        { error: 'Creator personality not configured' },
        { status: 404 }
      );
    }

    // Save subscriber message
    await sendMessage(
      chatSession.id,
      'SUBSCRIBER',
      message,
      false
    );

    // Get chat history for context
    const history = await getChatHistory(chatSession.id, 20);
    const conversationHistory = history.reverse().map(msg => ({
      role: msg.senderType === 'SUBSCRIBER' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    // Initialize Grok client
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      throw new Error('Grok API key not configured');
    }

    const grokClient = new SecureGrokClient(grokApiKey);

    // Build personality config from database with enhanced adult settings
    const personalityConfig = {
      displayName: creator.displayName,
      tone: creator.personality.tone,
      personalityTraits: ['sexy', 'confident', 'playful', 'seductive'],
      interests: creator.personality.interests || ['fitness', 'lingerie', 'roleplay'],
      hobbies: [],
      favoriteThings: [],
      responseStyle: creator.personality.responseStyle || 'Sexy, flirty and seductive with lots of sexual energy',
      vocabularyLevel: 'casual' as const,
      humorStyle: 'playful' as const,
      flirtLevel: 5 as const, // Default to maximum flirtation
      explicitLevel: (creator.personality as any).explicitLevel || 2, // Default to explicit
      boundaries: creator.personality.boundaries || ['no personal meetups', 'no illegal content'],
      neverMentions: ['AI', 'bot', 'artificial', 'computer', 'program'],
      alwaysAvoid: [],
      contentTypes: ['sexy photos', 'steamy videos', 'naughty messages', 'custom content'],
      specialties: ['teasing', 'roleplay', 'fantasy fulfillment'],
      priceRanges: {
        customPhoto: '$50',
        customVideo: '$100',
        voiceMessage: '$25'
      },
      responseLength: 'medium' as const,
      enableEmojis: creator.personality.enableEmojis !== false, // Default true
      emojiFrequency: 'frequent' as const,
      useSlang: true,
      usePetNames: true,
      petNames: ['babe', 'sexy', 'baby', 'hottie', 'love'],
      subscriptionAcknowledgment: true,
      fantasyFocus: ['teasing', 'sensual chat', 'roleplay', 'fantasy scenarios'],
      backstory: creator.bio || 'A hot content creator who loves connecting intimately with fans',
      relationship: 'You see fans as sexy supporters who pay premium for exclusive, intimate access to you. Make them feel desired and special.',
      customInstructions: creator.personality.customInstructions || 'Be very flirty and build sexual tension in every message'
    };

    // Add subscription context to the message
    const enhancedMessage = `${message} (Context: This is a premium subscriber who pays for exclusive adult chat with you. They want flirty, sexy interaction.)`;
    
    // Generate AI response
    const aiResponse = await grokClient.generateSecureResponse(
      enhancedMessage,
      personalityConfig,
      conversationHistory
    );

    // Save AI response
    const aiMessage = await sendMessage(
      chatSession.id,
      'AI',
      aiResponse,
      true,
      0.95
    );

    // Update analytics
    await prisma.analytics.updateMany({
      where: {
        creatorId,
        date: new Date(new Date().setHours(0, 0, 0, 0))
      },
      data: {
        messagesSent: { increment: 1 },
        aiResponses: { increment: 1 }
      }
    });

    return NextResponse.json({
      response: aiResponse,
      sessionId: chatSession.id,
      messageId: aiMessage.id,
      timestamp: aiMessage.createdAt
    });

  } catch (error) {
    console.error('Secure chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        response: "Mmm, technical glitch, sexy... Tell me your fantasy while we wait? 😏💋"
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/chat/secure',
    method: 'POST',
    description: 'Secure AI chat with jailbreak protection',
    requiredFields: {
      message: 'User message',
      creatorId: 'Creator ID from database',
      subscriberId: 'Subscriber ID from database',
      sessionId: '(optional) Existing chat session ID'
    },
    features: [
      'Jailbreak protection',
      'Content moderation',
      'Personality enforcement',
      'Chat history context',
      'Database persistence'
    ]
  });
}