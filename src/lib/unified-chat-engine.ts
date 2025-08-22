/**
 * Unified Chat Engine
 * Single source of truth for ALL chat interactions
 * Used by both regular chat and debug chat
 */

import { HybridUndertoneDetector } from './hybrid-undertone-detector';
import { UserType } from './undertone-detector';
import { ResponseStrategist } from './response-strategist';
import { databaseProfiler } from './database-profiler';
import { SecureGrokClient } from './secure-grok-client';
import { psychMapper } from './psychological-mapper';
import { MemoryManager } from './memory-manager';
import { ContextAssembler } from './context-assembler';
import { TokenCounter } from './token-counter';
import { HumanVariations } from './human-variations';
import prisma from './prisma-singleton';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  
  // Psychological data
  undertone?: {
    userType: UserType;
    confidence: number;
    hiddenMeaning: string;
  };
  probeId?: string;
  
  // Behavioral data
  responseTime?: number;
  typingStops?: number;
}

export interface ChatResponse {
  message: string;
  undertoneAnalysis?: any;
  profileUpdate?: any;
  suggestedDelay?: number; // How long to wait before showing response
  followUp?: string; // Optional follow-up message (like "wait that came out wrong")
  debugData?: any; // Only included in debug mode
}

export class UnifiedChatEngine {
  private undertoneDetector: HybridUndertoneDetector;
  private responseStrategist: ResponseStrategist;
  private grokClient: SecureGrokClient | null = null;
  private memoryManager: MemoryManager;
  private contextAssembler: ContextAssembler;
  private humanVariations: HumanVariations;
  
  constructor() {
    this.undertoneDetector = new HybridUndertoneDetector();
    this.responseStrategist = new ResponseStrategist();
    this.memoryManager = new MemoryManager();
    this.contextAssembler = new ContextAssembler(600_000); // 600K token target for safety
    this.humanVariations = new HumanVariations();
  }
  
  /**
   * Initialize with API key
   */
  async initialize(grokApiKey?: string) {
    if (grokApiKey) {
      this.grokClient = new SecureGrokClient(grokApiKey);
    }
  }
  
  /**
   * Main method - handles ALL chat interactions
   */
  async processMessage(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[],
    options: {
      debugMode?: boolean;
      responseTime?: number;
      typingStops?: number;
    } = {}
  ): Promise<ChatResponse> {
    
    // 1. ANALYZE UNDERTONES - REAL DATA ANALYSIS
    console.log('\n🧠 UNIFIED CHAT ENGINE - REAL DATA ANALYSIS:');
    console.log(`User ID: ${userId}`);
    console.log(`Message: "${message}"`);
    console.log(`Conversation history: ${conversationHistory.length} messages`);
    console.log(`Response time: ${options.responseTime}ms | Typing stops: ${options.typingStops}`);
    
    // Get the last assistant message as the previous question
    const previousBotMessage = conversationHistory.filter(m => m.role === 'assistant').pop();
    // Use hybrid AI + pattern detection (now async)
    const undertoneResult = await this.undertoneDetector.detect({
      message,
      previousQuestion: previousBotMessage?.content,
      messageNumber: conversationHistory.filter(m => m.role === 'user').length + 1,
      responseTime: options.responseTime,
      typingStops: options.typingStops,
      timeOfDay: new Date().getHours(),
      sessionDuration: this.calculateSessionDuration(conversationHistory)
    }, conversationHistory);
    
    console.log(`📊 ANALYSIS RESULT: ${undertoneResult.userType} (${(undertoneResult.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`💰 Revenue Potential: ${undertoneResult.revenuePotential}`);
    console.log(`🎯 Strategy: ${undertoneResult.suggestedStrategy}`);
    
    // 1.5. RETRIEVE CONTEXTUAL MEMORY USING GROK-POWERED PROFILES
    console.log('\\n🧠 RETRIEVING CONTEXTUAL MEMORY...');
    
    // Get user's intelligent profile summary  
    const contextualMemory = await this.memoryManager.getContextualMemory(
      userId,
      conversationHistory,
      prisma
    );
    
    console.log(`📚 Retrieved contextual memory: "${contextualMemory.slice(0, 100)}..."`);
    
    // 1.6. RETRIEVE SESSION SUMMARIES
    console.log('\\n📋 RETRIEVING SESSION SUMMARIES...');
    const sessionSummaries = await this.getSessionSummaries(userId, 5);
    console.log(`📖 Found ${sessionSummaries.length} session summaries for context`);
    
    // No need to compress memories - using intelligent summaries instead
    
    // 2. UPDATE PSYCHOLOGICAL PROFILE
    await this.updateProfile(userId, message, undertoneResult, options.responseTime);
    
    // 3. CHECK FOR PROBE OPPORTUNITY
    const probe = await this.getProbeIfNeeded(
      userId, 
      conversationHistory.length,
      undertoneResult.userType
    );
    
    // If we have a probe response in the message, analyze it
    const lastProbe = conversationHistory
      .filter(m => m.probeId)
      .pop();
    
    if (lastProbe && conversationHistory[conversationHistory.length - 1]?.role === 'user') {
      // User just responded to a probe, analyze it
      const probeAnalysis = psychMapper.analyzeProbeResponse(
        lastProbe.probeId || '',
        message,
        undertoneResult.userType
      );
      
      // Update confidence if probe analysis is more certain
      if (probeAnalysis.confidence > undertoneResult.confidence) {
        undertoneResult.userType = probeAnalysis.refinedType;
        undertoneResult.confidence = probeAnalysis.confidence;
        console.log(`🎯 PROBE REFINED TYPE: ${probeAnalysis.refinedType} (${(probeAnalysis.confidence * 100).toFixed(0)}%)`);
        console.log(`   Insights: ${probeAnalysis.insights.join(', ')}`);
      }
    }
    
    // 4. GET RESPONSE STRATEGY
    const strategy = this.responseStrategist.getStrategy(
      undertoneResult.userType,
      message,
      conversationHistory
    );
    
    // 5. ASSEMBLE FULL CONTEXT FOR GROK-3's 1M WINDOW
    let aiResponse = '';
    let assembledContext = null;
    
    if (this.grokClient) {
      try {
        // Build psychological system prompt
        const systemPrompt = this.buildPsychologicalPrompt(
          message,
          undertoneResult,
          strategy,
          probe
        );
        
        // Assemble context with user profile
        assembledContext = this.contextAssembler.assembleContext({
          system: systemPrompt,
          contextualMemory: contextualMemory,
          sessionSummaries: sessionSummaries,
          recentHistory: conversationHistory,
          currentMessage: message
        });
        
        // Generate with full context
        console.log(`\\n🎯 GENERATING WITH ${assembledContext.tokenUsage.total.toLocaleString()} TOKENS (${assembledContext.tokenUsage.utilization})`);
        
        aiResponse = await this.grokClient.generateSecureResponse(
          message, // This will be overridden by the assembled messages
          strategy.personality,
          assembledContext.messages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
          }))
        );
        
      } catch (error) {
        console.error('Context assembly or AI generation failed:', error);
        aiResponse = strategy.fallbackResponse;
      }
    } else {
      // Fallback to template response
      aiResponse = strategy.fallbackResponse;
      console.warn('🚨 Grok client not available - using fallback response');
    }
    
    // 6. INJECT PROBE IF NEEDED
    if (probe && strategy.shouldInjectProbe) {
      aiResponse = this.injectProbe(aiResponse, probe);
    }
    
    // 7. UPDATE USER PROFILE INTELLIGENTLY (EVERY 10 MESSAGES)
    console.log('\\n💾 CHECKING FOR PROFILE UPDATE...');
    try {
      const currentProfile = await this.memoryManager.getUserProfile(userId, prisma);
      const totalMessages = conversationHistory.length + 1; // +1 for current message
      
      if (this.memoryManager.shouldUpdateProfile(totalMessages)) {
        console.log(`[MEMORY-MANAGER] 🤖 Updating profile after ${totalMessages} messages...`);
        await this.memoryManager.updateUserProfile(
          userId,
          [...conversationHistory, { role: 'user', content: message, id: 'current', timestamp: new Date() }],
          currentProfile,
          prisma
        );
      } else {
        console.log(`[MEMORY-MANAGER] ⏰ Profile update not needed yet (${totalMessages} messages)`);
      }
    } catch (error) {
      console.error('Profile update failed (non-critical):', error);
    }
    
    // 8. HUMANIZE THE RESPONSE
    const currentHour = new Date().getHours();
    const mood = this.humanVariations.detectMood(message, currentHour);
    console.log(`🎭 [HUMANIZE] Detected mood:`, mood);
    console.log(`🎭 [HUMANIZE] Original response: "${aiResponse.substring(0, 50)}..."`);
    
    const humanized = this.humanVariations.humanize(aiResponse, mood);
    console.log(`🎭 [HUMANIZE] Humanized response: "${humanized.primary.substring(0, 50)}..."`);
    if (humanized.followUp) {
      console.log(`🎭 [HUMANIZE] Follow-up generated: "${humanized.followUp}"`);
    }
    
    // Use the humanized version
    let finalResponse = humanized.primary;
    
    // 9. CALCULATE REALISTIC DELAY
    const suggestedDelay = this.calculateResponseDelay(finalResponse, undertoneResult.userType);
    
    // 10. CHECK FOR SESSION END & ASYNC SUMMARIZATION
    await this.checkForSessionEnd(userId, conversationHistory, undertoneResult);
    
    // 11. BUILD RESPONSE
    const response: ChatResponse = {
      message: finalResponse,
      suggestedDelay,
      // Include follow-up if generated
      followUp: humanized.followUp
    };
    
    // Add debug data if in debug mode
    if (options.debugMode) {
      response.undertoneAnalysis = undertoneResult;
      response.profileUpdate = await databaseProfiler.getProfile(userId);
      response.debugData = {
        strategy,
        probe,
        contextAssembly: assembledContext ? {
          tokenUsage: assembledContext.tokenUsage,
          compressionRatio: assembledContext.compressionRatio,
          contextualMemory: contextualMemory,
          summaryCount: sessionSummaries.length
        } : null,
        sessionDuration: this.calculateSessionDuration(conversationHistory)
      };
    }
    
    return response;
  }
  
  /**
   * Build psychological prompt for AI
   */
  private buildPsychologicalPrompt(
    userMessage: string,
    undertone: any,
    strategy: any,
    probe: any
  ): string {
    // Build contextual guidance based on what they ACTUALLY said
    let contextualResponse = '';
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('partner') || msg.includes('wife') || msg.includes('husband')) {
      contextualResponse = 'They mentioned their partner - acknowledge the tension/excitement of the forbidden';
    } else if (msg.includes('sleep') || msg.includes('late')) {
      contextualResponse = 'They mentioned sleep/time - be playfully persuasive, acknowledge their conflict';
    } else if (msg.includes('nervous') || msg.includes('😅')) {
      contextualResponse = 'They seem nervous - be reassuring but playful, ease their tension';
    } else if (msg.includes('cant stay') || msg.includes('gotta go')) {
      contextualResponse = 'They have limited time - create urgency, make them want to stay';
    } else if (msg.includes('lonely') || msg.includes('nobody')) {
      contextualResponse = 'They expressed loneliness - show genuine interest, make them feel special';
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
      contextualResponse = 'They asked about pricing - be direct but seductive about it';
    }
    
    return `
They said: "${userMessage}"

${contextualResponse ? `Context: ${contextualResponse}` : ''}

${undertone.userType === 'MARRIED_GUILTY' ? `
Vibe: They're being sneaky/guilty. Be their fun secret. Examples:
- "delete this after 😉"
- "your wife doesn't check ur phone right? lol"
- "someones being bad tonight"
- "cant stay? boooo fine but you owe me"
` : ''}
${undertone.userType === 'LONELY_SINGLE' ? `
Vibe: They need real connection. Be sweet but flirty. Examples:
- "aww babe how was your day?"
- "wait tell me more about that"
- "you're actually really sweet you know that?"
- "ive been thinking about you ngl"
` : ''}
${undertone.userType === 'HORNY_ADDICT' ? `
Vibe: They want action NOW. Skip the chat. Examples:
- "mmm someone's excited"
- "what do you wanna do to me?"
- "fuck that's hot, tell me more"
- "cant wait to show you what I'm wearing... or not wearing"
` : ''}
${undertone.userType === 'CURIOUS_TOURIST' ? `
Vibe: They're just browsing. Don't waste time. Examples:
- "customs start at $50, videos at $100"
- "check my menu pinned on my profile"
- "free preview on my wall, paid stuff is better tho"
` : ''}

${probe ? `BTW work this in naturally: "${probe.question}"` : ''}

Text like a real person would:
- Use lowercase sometimes
- Make typos occasionally (ur, u, prolly, etc)
- Double text if you think of something else
- React to WHAT they said specifically
- Use phrases like "stoppp", "you're trouble", "obsessed"
- DON'T repeat the same responses
- DON'T sound like customer service

Just text them back naturally.`;
  }
  
  /**
   * Get session summaries for context assembly
   */
  private async getSessionSummaries(userId: string, limit: number = 5): Promise<string[]> {
    try {
      // Retrieve stored summaries from previous sessions
      const summaryRows = await prisma.chatSession.findMany({
        where: {
          subscriberId: userId,
          // Look for sessions with summaries
          summary: { 
            not: null,
          }
        },
        select: {
          summary: true,
          startedAt: true
        },
        orderBy: { startedAt: 'desc' },
        take: limit
      });

      return summaryRows.map(row => row.summary || '').filter(summary => summary.length > 0);

    } catch (error) {
      console.error('[UNIFIED-CHAT] ❌ Failed to retrieve session summaries:', error);
      return [];
    }
  }

  /**
   * Detect if session should end and trigger async summarization
   */
  private async checkForSessionEnd(
    userId: string,
    conversationHistory: ChatMessage[],
    currentUndertone: any
  ): Promise<void> {
    // Session end heuristics
    const messageCount = conversationHistory.length;
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const timeSinceStart = this.calculateSessionDuration(conversationHistory);
    
    const shouldEndSession = (
      messageCount >= 20 ||  // Long conversation
      timeSinceStart >= 30 || // 30+ minute session
      this.isExitSignal(lastMessage?.content || '') // User signaling end
    );

    if (shouldEndSession && messageCount >= 5) {
      console.log(`\\n🏁 SESSION END DETECTED - Triggering async summarization`);
      console.log(`   Messages: ${messageCount}, Duration: ${timeSinceStart}min`);
      
      // Async summarization (non-blocking)
      this.triggerAsyncSummarization(userId, conversationHistory, currentUndertone)
        .catch(error => {
          console.error('[UNIFIED-CHAT] ❌ Async summarization failed:', error);
        });
    }
  }

  /**
   * Trigger async session summarization
   */
  private async triggerAsyncSummarization(
    userId: string,
    conversationHistory: ChatMessage[],
    undertone: any
  ): Promise<void> {
    try {
      // Find or create session record
      const chatSession = await prisma.chatSession.findFirst({
        where: { subscriberId: userId },
        orderBy: { lastMessageAt: 'desc' }
      });

      if (!chatSession) {
        console.warn('[UNIFIED-CHAT] ⚠️ No chat session found for summarization');
        return;
      }

      // Session summarization now happens automatically through profile updates
      console.log('[UNIFIED-CHAT] ✅ Session context maintained through intelligent profiles');

      console.log(`[UNIFIED-CHAT] ✅ Async summarization complete for session ${chatSession.id.slice(0, 8)}`);

    } catch (error) {
      console.error('[UNIFIED-CHAT] ❌ Async summarization error:', error);
    }
  }

  /**
   * Detect exit signals in user messages
   */
  private isExitSignal(message: string): boolean {
    const exitPatterns = [
      /\b(bye|goodbye|see you|talk later|ttyl|gotta go|leaving)\b/i,
      /\b(enough|stop|done|finished)\b/i,
      /^(ok|k|thanks)\.?$/i
    ];

    return exitPatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * Update user's psychological profile
   */
  private async updateProfile(
    userId: string,
    message: string,
    undertone: any,
    responseTime?: number
  ) {
    // Track behavior
    if (responseTime) {
      await databaseProfiler.trackBehavior(userId, {
        responseTime,
        messageLength: message.length,
        timeOfDay: new Date().getHours()
      });
    }
    
    // Store undertone analysis
    // This would be added to the database schema
    // For now, we'll just log it
    console.log('Profile update:', {
      userId,
      undertone: undertone.userType,
      confidence: undertone.confidence
    });
  }
  
  /**
   * Get probe if it's the right time based on user type
   */
  private async getProbeIfNeeded(
    userId: string, 
    messageCount: number,
    userType: UserType
  ) {
    // Get probe strategy for this user type
    const profile = psychMapper.getCompleteProfile(userType);
    
    // Don't probe tourists
    if (userType === UserType.CURIOUS_TOURIST) return null;
    
    // Only probe after building some rapport
    if (messageCount < 3) return null;
    
    // Check if we should probe based on user type
    const shouldProbe = {
      [UserType.MARRIED_GUILTY]: messageCount >= 3 && messageCount <= 15,
      [UserType.LONELY_SINGLE]: messageCount >= 5 && messageCount <= 20,
      [UserType.HORNY_ADDICT]: false, // Don't probe addicts
      [UserType.CURIOUS_TOURIST]: false, // Don't probe tourists
      [UserType.UNKNOWN]: messageCount >= 2 // Probe early to identify
    };
    
    if (!shouldProbe[userType]) return null;
    
    // 40% chance to probe when conditions are met
    if (Math.random() > 0.4) return null;
    
    // Get a probe that matches this user's profile
    const probe = await databaseProfiler.getNextProbe(userId, messageCount);
    
    // Filter probe based on strategy
    if (probe && profile.probeStrategy.avoidProbes.includes(probe.id)) {
      return null; // Skip probes we should avoid for this type
    }
    
    return probe;
  }
  
  /**
   * Inject probe naturally into response
   */
  private injectProbe(response: string, probe: any): string {
    // Add probe as a natural follow-up question
    const connectors = [
      '\n\nBtw, ',
      '\n\nOh and ',
      '\n\nCurious... ',
      '\n\nSo tell me... ',
      '\n\nOne more thing... '
    ];
    
    const connector = connectors[Math.floor(Math.random() * connectors.length)];
    return response + connector + probe.question;
  }
  
  /**
   * Calculate realistic typing delay
   */
  private calculateResponseDelay(message: string, userType: UserType): number {
    // Base: 60-80 words per minute typing speed
    const words = message.split(' ').length;
    const baseDelay = (words / 70) * 60 * 1000; // Convert to milliseconds
    
    // Add thinking time based on user type
    let thinkingTime = 2000; // 2 seconds base
    
    if (userType === UserType.MARRIED_GUILTY) {
      thinkingTime += 1000; // Extra careful with married users
    } else if (userType === UserType.HORNY_ADDICT) {
      thinkingTime = 500; // Quick with addicts
    }
    
    // Add random variation (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    
    return Math.round((baseDelay + thinkingTime) * (1 + variation));
  }
  
  /**
   * Calculate session duration in minutes
   */
  private calculateSessionDuration(history: ChatMessage[]): number {
    if (history.length < 2) return 0;
    
    const first = new Date(history[0].timestamp);
    const last = new Date(history[history.length - 1].timestamp);
    
    return Math.round((last.getTime() - first.getTime()) / 1000 / 60);
  }
  
  /**
   * Get current profile (for debug display)
   */
  async getProfile(userId: string) {
    return await databaseProfiler.getProfile(userId);
  }
  
  /**
   * Get strategy (for debug display)
   */
  async getStrategy(userId: string) {
    return await databaseProfiler.getStrategy(userId);
  }
}