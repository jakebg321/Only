/**
 * Token Counter Utility
 * Precise token counting using tiktoken for Grok-3 context management
 */

import { encoding_for_model } from 'tiktoken';

export interface TokenEstimate {
  tokens: number;
  characters: number;
  words: number;
}

export class TokenCounter {
  // Cache encoder to avoid re-initialization overhead
  private static encoder = encoding_for_model('gpt-4'); // Closest to Grok-3 tokenization
  
  /**
   * Precise token count using tiktoken
   */
  static estimate(text: string): TokenEstimate {
    const characters = text.length;
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    
    try {
      // Use tiktoken for precise counting
      const encoded = this.encoder.encode(text);
      const tokens = encoded.length;
      
      return { tokens, characters, words };
    } catch (error) {
      console.warn('[TOKEN-COUNTER] ⚠️ tiktoken failed, using fallback estimation:', error);
      
      // Fallback to estimation if tiktoken fails
      const estimatedTokens = Math.ceil(characters / 4); // ~4 chars per token
      
      return {
        tokens: estimatedTokens,
        characters,
        words
      };
    }
  }

  /**
   * Estimate tokens for chat message array
   */
  static estimateMessages(messages: Array<{role: string, content: string}>): TokenEstimate {
    const totalText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    const baseEstimate = this.estimate(totalText);
    
    // Add overhead for chat message structure
    const messageOverhead = messages.length * 10; // ~10 tokens per message for structure
    
    return {
      tokens: baseEstimate.tokens + messageOverhead,
      characters: baseEstimate.characters,
      words: baseEstimate.words
    };
  }

  /**
   * Calculate how many tokens to trim to fit within limit
   */
  static calculateTrimAmount(currentTokens: number, maxTokens: number): number {
    if (currentTokens <= maxTokens) return 0;
    return currentTokens - maxTokens;
  }

  /**
   * Truncate text to approximate token limit
   */
  static truncateToTokenLimit(text: string, maxTokens: number): string {
    const estimate = this.estimate(text);
    
    if (estimate.tokens <= maxTokens) {
      return text;
    }
    
    // Calculate approximate character limit
    const targetChars = Math.floor(maxTokens * 4 * 0.9); // 10% buffer, ~4 chars per token fallback
    
    if (text.length <= targetChars) {
      return text;
    }
    
    // Truncate at word boundary
    const truncated = text.substring(0, targetChars);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > targetChars * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  /**
   * Get memory usage summary for debugging
   */
  static getMemoryUsage(components: Record<string, string>): {
    breakdown: Record<string, TokenEstimate>;
    total: TokenEstimate;
    utilization: string;
  } {
    const breakdown: Record<string, TokenEstimate> = {};
    let totalTokens = 0;
    let totalChars = 0;
    let totalWords = 0;
    
    for (const [key, content] of Object.entries(components)) {
      const estimate = this.estimate(content);
      breakdown[key] = estimate;
      totalTokens += estimate.tokens;
      totalChars += estimate.characters;
      totalWords += estimate.words;
    }
    
    const total: TokenEstimate = {
      tokens: totalTokens,
      characters: totalChars,
      words: totalWords
    };
    
    // Calculate utilization of 1M token window
    const maxTokens = 1_000_000;
    const utilization = ((totalTokens / maxTokens) * 100).toFixed(1);
    
    return {
      breakdown,
      total,
      utilization: `${utilization}%`
    };
  }
}

/**
 * Context assembly priorities for token allocation
 */
export const CONTEXT_PRIORITIES = {
  SYSTEM: 0.05,          // 5% - Core system prompt
  RECENT: 0.20,          // 20% - Recent conversation 
  PRIORITIZED: 0.35,     // 35% - High-value memories
  SUMMARIES: 0.30,       // 30% - Session summaries
  BUFFER: 0.10           // 10% - Safety buffer
} as const;

/**
 * Calculate token allocations based on priorities
 */
export function calculateTokenAllocations(maxTokens: number = 600_000) {
  return {
    system: Math.floor(maxTokens * CONTEXT_PRIORITIES.SYSTEM),
    recent: Math.floor(maxTokens * CONTEXT_PRIORITIES.RECENT),
    prioritized: Math.floor(maxTokens * CONTEXT_PRIORITIES.PRIORITIZED),
    summaries: Math.floor(maxTokens * CONTEXT_PRIORITIES.SUMMARIES),
    buffer: Math.floor(maxTokens * CONTEXT_PRIORITIES.BUFFER)
  };
}