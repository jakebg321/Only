/**
 * AI-Powered Undertone Detection using Grok
 * Understands context, emotions, and hidden meanings beyond simple patterns
 */

import { UserType, UndertoneResult, MessageContext } from './undertone-detector';
import { ChatMessage } from './unified-chat-engine';

interface GrokAnalysisResponse {
  userType: string;
  confidence: number;
  indicators: string[];
  hiddenMeaning: string;
  suggestedStrategy: string;
  revenuePotential: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning?: string;
}

interface CachedResult {
  result: UndertoneResult;
  timestamp: number;
}

export class GrokUndertoneAnalyzer {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';
  private cache = new Map<string, CachedResult>();
  private cacheTimeout = 3600000; // 1 hour
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Generate cache key from message and context
   */
  private getCacheKey(message: string, previousQuestion?: string): string {
    const normalized = `${previousQuestion?.toLowerCase().trim() || 'none'}:${message.toLowerCase().trim()}`;
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  /**
   * Check cache for existing analysis
   */
  private checkCache(key: string): UndertoneResult | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('[CACHE] Pattern found in memory');
      return cached.result;
    }
    return null;
  }
  
  /**
   * Main analysis function - uses AI to understand psychological patterns
   */
  async analyzeUndertone(
    context: MessageContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<UndertoneResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(context.message, context.previousQuestion);
    const cached = this.checkCache(cacheKey);
    if (cached) return cached;
    
    console.log('[AI-ANALYSIS] Initiating neural network processing...');
    
    try {
      // Build comprehensive analysis prompt
      const analysisPrompt = this.buildAnalysisPrompt(context, conversationHistory);
      
      // Call Grok API
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a psychological pattern analyzer. Analyze user messages for hidden meanings and psychological patterns. Return ONLY valid JSON.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          model: 'grok-3',
          temperature: 0.3, // Lower temperature for more consistent analysis
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from Grok');
      }
      
      // Parse JSON response
      const analysis = this.parseGrokResponse(aiResponse);
      
      // Convert to UndertoneResult
      const result: UndertoneResult = {
        userType: this.mapUserType(analysis.userType),
        confidence: Math.min(Math.max(analysis.confidence, 0), 1),
        indicators: analysis.indicators || [],
        hiddenMeaning: analysis.hiddenMeaning || 'Analyzing patterns...',
        suggestedStrategy: analysis.suggestedStrategy || 'Continue conversation naturally',
        revenuePotential: analysis.revenuePotential || 'MEDIUM'
      };
      
      // Cache the result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      console.log(`[AI-ANALYSIS] Classification: ${result.userType} | Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      return result;
      
    } catch (error) {
      console.error('[AI-ANALYSIS] ERROR: Analysis failed -', error);
      
      // Fallback to unknown
      return {
        userType: UserType.UNKNOWN,
        confidence: 0.3,
        indicators: ['AI analysis unavailable'],
        hiddenMeaning: 'Unable to analyze at this time',
        suggestedStrategy: 'Continue conversation to gather more data',
        revenuePotential: 'MEDIUM'
      };
    }
  }
  
  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(context: MessageContext, history: ChatMessage[]): string {
    // Get recent conversation context
    const recentHistory = history.slice(-5);
    const conversationContext = recentHistory.length > 0
      ? recentHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : 'No previous messages';
    
    return `PSYCHOLOGICAL ANALYSIS TASK:
Analyze this user response for hidden psychological patterns and personality type.

CONVERSATION HISTORY:
${conversationContext}

LAST ASSISTANT MESSAGE: "${context.previousQuestion || 'Initial message'}"
USER RESPONSE: "${context.message}"

BEHAVIORAL METADATA:
- Response time: ${context.responseTime || 0}ms
- Typing stops/hesitations: ${context.typingStops || 0}
- Message number: ${context.messageNumber}
- Time of day: ${context.timeOfDay}:00

ANALYZE FOR THESE PERSONALITY TYPES:

1. MARRIED_GUILTY (65% of revenue - highest priority):
   - Avoidance patterns: "idk", "maybe", "complicated", deflecting questions
   - Time constraints: "gotta go", "can't talk long", "shouldn't be here"
   - Discretion language: "between us", "private", "don't tell", "secret"
   - Guilt indicators: long pauses, self-censoring, nervous laughter
   - Hidden obligations: mentions of "later", "busy", indirect references to family

2. LONELY_SINGLE (20% of revenue):
   - Oversharing: long messages, personal details, life story
   - Emotional language: "lonely", "bored", "no one to talk to"
   - Time availability: "all night", "whenever", "nothing else to do"
   - Connection seeking: questions about you, wanting to know more
   - Depression markers: negative self-talk, isolation mentions

3. HORNY_ADDICT (10% of revenue):
   - Immediate escalation: sexual content in first messages
   - Impatience: "hurry", "come on", "now", short demanding messages
   - Single focus: ignoring conversation, only sexual topics
   - Fast responses: <1 second response times, no hesitation
   - Explicit language: crude terms, no euphemisms

4. CURIOUS_TOURIST (5% of revenue):
   - Price focus: "how much", "rates", "free", cost questions
   - Non-committal: "just looking", "maybe later", "browsing"
   - Comparison shopping: mentions other sites/creators
   - Short interactions: minimal engagement, quick exit

CONSIDER:
- What they're NOT saying (deflection, avoidance)
- Emotional undertones beyond literal words
- Cultural/regional expressions and slang
- Hidden meanings in seemingly casual phrases
- Typos and informal language patterns
- Emoji usage and what it reveals

IMPORTANT: Many users won't fit perfectly into one category early on. Be conservative with confidence scores.

RETURN JSON ONLY:
{
  "userType": "MARRIED_GUILTY|LONELY_SINGLE|HORNY_ADDICT|CURIOUS_TOURIST|UNKNOWN",
  "confidence": 0.3 to 0.85 (be realistic, avoid extremes),
  "indicators": ["specific pattern found", "another pattern", "max 5 items"],
  "hiddenMeaning": "what they really mean beneath the surface",
  "suggestedStrategy": "how to respond to this personality type",
  "revenuePotential": "HIGH|MEDIUM|LOW",
  "reasoning": "brief explanation of why this classification"
}`;
  }
  
  /**
   * Parse Grok's response, handling potential formatting issues
   */
  private parseGrokResponse(response: string): GrokAnalysisResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, try to parse entire response
      return JSON.parse(response);
      
    } catch (error) {
      console.error('[AI-ANALYSIS] ERROR: Parse failure -', response);
      
      // Return default analysis
      return {
        userType: 'UNKNOWN',
        confidence: 0.3,
        indicators: ['Parse error'],
        hiddenMeaning: 'Unable to parse AI response',
        suggestedStrategy: 'Continue conversation',
        revenuePotential: 'MEDIUM'
      };
    }
  }
  
  /**
   * Map string response to UserType enum
   */
  private mapUserType(type: string): UserType {
    const typeMap: Record<string, UserType> = {
      'MARRIED_GUILTY': UserType.MARRIED_GUILTY,
      'LONELY_SINGLE': UserType.LONELY_SINGLE,
      'HORNY_ADDICT': UserType.HORNY_ADDICT,
      'CURIOUS_TOURIST': UserType.CURIOUS_TOURIST,
      'UNKNOWN': UserType.UNKNOWN
    };
    
    return typeMap[type] || UserType.UNKNOWN;
  }
  
  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[CACHE] Memory cleared');
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}