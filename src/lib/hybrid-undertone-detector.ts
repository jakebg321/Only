/**
 * Hybrid Undertone Detector - AI-Powered with Pattern Fallback
 * Primary: Grok AI analysis for deep understanding
 * Fallback: Quick patterns for speed and reliability
 */

import { UserType, UndertoneResult, MessageContext } from './undertone-detector';
import { GrokUndertoneAnalyzer } from './grok-undertone-analyzer';
import { ChatMessage } from './unified-chat-engine';

export class HybridUndertoneDetector {
  private grokAnalyzer: GrokUndertoneAnalyzer | null = null;
  private useAI: boolean = true;
  
  constructor() {
    // Initialize Grok analyzer if API key is available
    if (process.env.GROK_API_KEY) {
      this.grokAnalyzer = new GrokUndertoneAnalyzer(process.env.GROK_API_KEY);
      console.log('🤖 [HYBRID-DETECTOR] AI-powered detection enabled');
    } else {
      console.log('⚠️ [HYBRID-DETECTOR] No Grok API key, using pattern-only detection');
      this.useAI = false;
    }
  }
  
  /**
   * Main detection function - AI first, patterns as fallback
   */
  async detect(
    context: MessageContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<UndertoneResult> {
    const message = context.message.toLowerCase().trim();
    
    console.log('🔍 HYBRID UNDERTONE ANALYSIS:');
    console.log(`   Input: "${context.message}"`);
    console.log(`   Method: ${this.useAI ? 'AI-Powered' : 'Pattern-Based'}`);
    
    // Try AI analysis first if available
    if (this.useAI && this.grokAnalyzer) {
      try {
        // Quick pattern check for obvious cases (super fast path)
        const quickResult = this.quickPatternCheck(message, context);
        if (quickResult && quickResult.confidence > 0.8) {
          console.log('⚡ Quick pattern match - skipping AI');
          return quickResult;
        }
        
        // Use AI for nuanced analysis
        const aiResult = await this.grokAnalyzer.analyzeUndertone(context, conversationHistory);
        
        // Validate AI result
        if (aiResult.userType !== UserType.UNKNOWN || aiResult.confidence > 0.4) {
          return aiResult;
        }
        
      } catch (error) {
        console.error('❌ AI analysis failed, falling back to patterns:', error);
      }
    }
    
    // Fallback to pattern-based detection
    return this.patternBasedDetection(message, context);
  }
  
  /**
   * Quick pattern check for obvious cases
   * Only returns result for very high confidence matches
   */
  private quickPatternCheck(message: string, context: MessageContext): UndertoneResult | null {
    // Direct admission patterns (very high confidence)
    if (message.includes('married') || message.includes('wife') || message.includes('husband')) {
      return {
        userType: UserType.MARRIED_GUILTY,
        confidence: 0.85,
        indicators: ['Direct mention of marriage'],
        hiddenMeaning: 'Explicitly married, seeking discretion',
        suggestedStrategy: 'Maximum discretion, be their secret escape',
        revenuePotential: 'HIGH'
      };
    }
    
    // Extreme loneliness patterns
    if (message.includes('no one talks to me') || message.includes('so lonely') || 
        message.includes('nobody cares')) {
      return {
        userType: UserType.LONELY_SINGLE,
        confidence: 0.8,
        indicators: ['Direct expression of loneliness'],
        hiddenMeaning: 'Desperately seeking connection',
        suggestedStrategy: 'Provide emotional connection and understanding',
        revenuePotential: 'MEDIUM'
      };
    }
    
    // Immediate sexual escalation
    if (message.length < 20 && /^(fuck|sex|nude|naked|horny)/i.test(message)) {
      return {
        userType: UserType.HORNY_ADDICT,
        confidence: 0.85,
        indicators: ['Immediate sexual content'],
        hiddenMeaning: 'Only interested in sexual content',
        suggestedStrategy: 'Escalate quickly or they\'ll leave',
        revenuePotential: 'LOW'
      };
    }
    
    // Clear price shopping
    if (/^(how much|price|cost|rate|free)/i.test(message)) {
      return {
        userType: UserType.CURIOUS_TOURIST,
        confidence: 0.8,
        indicators: ['Immediate price inquiry'],
        hiddenMeaning: 'Just browsing, unlikely to spend',
        suggestedStrategy: 'Don\'t waste time unless they commit',
        revenuePotential: 'LOW'
      };
    }
    
    return null;
  }
  
  /**
   * Fallback pattern-based detection
   * Simplified version focusing on most common patterns
   */
  private patternBasedDetection(message: string, context: MessageContext): UndertoneResult {
    const indicators: string[] = [];
    let userType = UserType.UNKNOWN;
    let confidence = 0.3;
    
    // Check for avoidance patterns if asked about relationship/being bad
    if (context.previousQuestion?.includes('bad') || 
        context.previousQuestion?.includes('single') ||
        context.previousQuestion?.includes('relationship')) {
      
      if (/^(idk|maybe|kinda|complicated|depends)/i.test(message)) {
        indicators.push('Avoidance pattern detected');
        userType = UserType.MARRIED_GUILTY;
        confidence = 0.5;
      }
    }
    
    // Hesitation patterns
    if (context.responseTime && context.responseTime > 5000) {
      indicators.push('Long hesitation');
      confidence += 0.1;
    }
    
    if (context.typingStops && context.typingStops > 3) {
      indicators.push('Multiple typing stops');
      confidence += 0.1;
    }
    
    // Message length patterns
    const wordCount = message.split(' ').length;
    if (wordCount > 20) {
      indicators.push('Long message (oversharing)');
      if (userType === UserType.UNKNOWN) {
        userType = UserType.LONELY_SINGLE;
        confidence = 0.4;
      }
    }
    
    // Time patterns
    if (context.timeOfDay >= 22 || context.timeOfDay <= 2) {
      indicators.push('Late night activity');
      confidence += 0.05;
    }
    
    // Cap confidence for pattern-only detection
    confidence = Math.min(confidence, 0.65);
    
    // Determine revenue potential
    const revenuePotential = userType === UserType.MARRIED_GUILTY ? 'HIGH' :
                           userType === UserType.LONELY_SINGLE ? 'MEDIUM' : 'LOW';
    
    return {
      userType,
      confidence,
      indicators,
      hiddenMeaning: this.getHiddenMeaning(userType, confidence),
      suggestedStrategy: this.getStrategy(userType, confidence),
      revenuePotential
    };
  }
  
  /**
   * Get hidden meaning based on type and confidence
   */
  private getHiddenMeaning(userType: UserType, confidence: number): string {
    if (confidence < 0.4) {
      return 'Still analyzing behavioral patterns';
    }
    
    switch (userType) {
      case UserType.MARRIED_GUILTY:
        return confidence > 0.6 
          ? 'Likely married, showing guilt and discretion needs'
          : 'Possibly attached, showing avoidance patterns';
      
      case UserType.LONELY_SINGLE:
        return 'Seeking emotional connection and validation';
      
      case UserType.HORNY_ADDICT:
        return 'Focused solely on sexual content';
      
      case UserType.CURIOUS_TOURIST:
        return 'Window shopping, unlikely to commit';
      
      default:
        return 'Behavioral patterns unclear, gathering more data';
    }
  }
  
  /**
   * Get strategy based on type and confidence
   */
  private getStrategy(userType: UserType, confidence: number): string {
    if (confidence < 0.4) {
      return 'Continue conversation naturally, gather more information';
    }
    
    switch (userType) {
      case UserType.MARRIED_GUILTY:
        return confidence > 0.6
          ? 'Emphasize complete discretion, be their secret escape'
          : 'Test boundaries carefully, emphasize privacy';
      
      case UserType.LONELY_SINGLE:
        return 'Build emotional connection, show genuine interest';
      
      case UserType.HORNY_ADDICT:
        return 'Escalate quickly or they will leave';
      
      case UserType.CURIOUS_TOURIST:
        return 'Don\'t invest time unless they show commitment';
      
      default:
        return 'Keep conversation engaging, identify their needs';
    }
  }
  
  /**
   * Toggle between AI and pattern-only mode
   */
  setAIMode(enabled: boolean): void {
    this.useAI = enabled && this.grokAnalyzer !== null;
    console.log(`🔄 [HYBRID-DETECTOR] AI mode: ${this.useAI ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get current mode status
   */
  getStatus(): { aiEnabled: boolean; cacheSize?: number } {
    return {
      aiEnabled: this.useAI,
      cacheSize: this.grokAnalyzer?.getCacheStats().size
    };
  }
}