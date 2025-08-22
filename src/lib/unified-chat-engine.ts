/**
 * Unified Chat Engine
 * Single source of truth for ALL chat interactions
 * Used by both regular chat and debug chat
 */

import { UndertoneDetector, UserType } from './undertone-detector';
import { ResponseStrategist } from './response-strategist';
import { databaseProfiler } from './database-profiler';
import { SecureGrokClient } from './secure-grok-client';
import { psychMapper } from './psychological-mapper';
import { MemoryManager, MemoryEntry } from './memory-manager';
import { ContextAssembler } from './context-assembler';
import { TokenCounter } from './token-counter';
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
  debugData?: any; // Only included in debug mode
}

export class UnifiedChatEngine {
  private undertoneDetector: UndertoneDetector;
  private responseStrategist: ResponseStrategist;
  private grokClient: SecureGrokClient | null = null;
  private memoryManager: MemoryManager;
  private contextAssembler: ContextAssembler;
  
  constructor() {
    this.undertoneDetector = new UndertoneDetector();
    this.responseStrategist = new ResponseStrategist();
    this.memoryManager = new MemoryManager();
    this.contextAssembler = new ContextAssembler(600_000); // 600K token target for safety
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
    const undertoneResult = this.undertoneDetector.detect({
      message,
      previousQuestion: previousBotMessage?.content,
      messageNumber: conversationHistory.filter(m => m.role === 'user').length + 1,
      responseTime: options.responseTime,
      typingStops: options.typingStops,
      timeOfDay: new Date().getHours(),
      sessionDuration: this.calculateSessionDuration(conversationHistory)
    });
    
    console.log(`📊 ANALYSIS RESULT: ${undertoneResult.userType} (${(undertoneResult.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`💰 Revenue Potential: ${undertoneResult.revenuePotential}`);
    console.log(`🎯 Strategy: ${undertoneResult.suggestedStrategy}`);
    
    // 1.5. RETRIEVE AND PRIORITIZE MEMORIES USING VECTOR + REVENUE WEIGHTS
    console.log('\\n🧠 RETRIEVING PRIORITIZED MEMORIES...');
    
    // Generate query embedding
    const [queryEmbedding] = await this.memoryManager.generateEmbedding(message);
    
    // Get revenue weights for prioritization
    const revenueWeights = psychMapper.getRevenueWeights();
    
    // Retrieve with business-value prioritization
    const prioritizedMemories = queryEmbedding?.length > 0 
      ? await this.memoryManager.retrieveAndPrioritize(
          userId,
          queryEmbedding,
          revenueWeights,
          8, // Get more candidates for context assembly
          prisma // Pass prisma instance
        )
      : [];
    
    if (prioritizedMemories.length > 0) {
      console.log(`📚 Found ${prioritizedMemories.length} prioritized memories by revenue value:`);
      prioritizedMemories.forEach((mem, i) => {
        console.log(`  ${i+1}. [${mem.undertone}] Score: ${mem.score.toFixed(3)} | "${mem.content.slice(0, 50)}..."`);
      });
    } else {
      console.log('📚 No prioritized memories found (new user or no vectors)');
    }
    
    // 1.6. RETRIEVE SESSION SUMMARIES
    console.log('\\n📋 RETRIEVING SESSION SUMMARIES...');
    const sessionSummaries = await this.getSessionSummaries(userId, 5);
    console.log(`📖 Found ${sessionSummaries.length} session summaries for context`);
    
    // Compress memories to reduce redundancy
    const compressedMemories = this.contextAssembler.compressMemories(prioritizedMemories);
    
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
        
        // Assemble tiered context
        assembledContext = this.contextAssembler.assembleContext({
          system: systemPrompt,
          prioritizedMemories: compressedMemories,
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
    
    // 7. STORE CURRENT MESSAGE IN VECTOR MEMORY
    console.log('\\n💾 STORING MESSAGE IN MEMORY...');
    try {
      // Find or create a chat session to store memory
      const chatSession = await prisma.chatSession.findFirst({
        where: { subscriberId: userId },
        orderBy: { lastMessageAt: 'desc' }
      });
      
      if (chatSession) {
        await this.memoryManager.storeMemory(
          chatSession.id,
          message,
          undertoneResult.userType,
          prisma
        );
        
        // Get updated memory stats for debugging
        const memoryStats = await this.memoryManager.getMemoryStats(userId, prisma);
        console.log(`📊 Memory Stats: ${memoryStats.totalMemories} total, ${memoryStats.withEmbeddings} with embeddings (${memoryStats.embeddingCoverage}% coverage)`);
      }
    } catch (error) {
      console.error('Memory storage failed (non-critical):', error);
    }
    
    // 8. CALCULATE REALISTIC DELAY
    const suggestedDelay = this.calculateResponseDelay(aiResponse, undertoneResult.userType);
    
    // 9. CHECK FOR SESSION END & ASYNC SUMMARIZATION
    await this.checkForSessionEnd(userId, conversationHistory, undertoneResult);
    
    // 10. BUILD RESPONSE
    const response: ChatResponse = {
      message: aiResponse,
      suggestedDelay
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
          memoryCount: prioritizedMemories.length,
          summaryCount: sessionSummaries.length
        } : null,
        sessionDuration: this.calculateSessionDuration(conversationHistory),
        memoryPrioritization: prioritizedMemories.map(mem => ({
          undertone: mem.undertone,
          score: mem.score,
          similarity: mem.similarity,
          confidence: mem.confidence
        }))
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
    return `
PSYCHOLOGICAL CONTEXT:
User said: "${userMessage}"
Hidden meaning: "${undertone.hiddenMeaning}"
User type: ${undertone.userType} (${undertone.confidence * 100}% confidence)
Revenue potential: ${undertone.revenuePotential}

STRATEGY:
- Tone: ${strategy.tone}
- Response length: ${strategy.length}  
- Use keywords: ${strategy.keywords.join(', ')}
- Avoid: ${strategy.avoid.join(', ')}

${probe ? `PROBE TO INJECT: "${probe.question}" (work this in naturally)` : ''}

CRITICAL RULES:
1. Match their energy - if they wrote 3 words, you write 5-10 max
2. Never directly mention what you've figured out about them
3. Respond to their hidden meaning, not their literal words
4. Use context naturally - reference patterns WITHOUT explicitly saying "I remember"
5. ${undertone.userType === 'MARRIED_GUILTY' ? 'Emphasize discretion and secrecy' : ''}
6. ${undertone.userType === 'LONELY_SINGLE' ? 'Be caring and remember details' : ''}
7. ${undertone.userType === 'HORNY_ADDICT' ? 'Tease and escalate quickly' : ''}
8. NEVER ask for their name again - if they don't give a name, just call them "baby" or "sexy"
9. Stop asking "what should I call you" - move the conversation forward

Generate a response that follows this strategy exactly.`;
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

      // Generate summary
      const summary = await this.memoryManager.summarizeSession(
        conversationHistory,
        undertone,
        chatSession.id
      );

      // Store vectorized summary
      await this.memoryManager.vectorizeAndStore(
        userId,
        summary,
        undertone,
        chatSession.id,
        prisma
      );

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