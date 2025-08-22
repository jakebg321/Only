/**
 * Context Assembler for Grok-3's 1M Token Window
 * Assembles tiered prompts with prioritized memories and summaries
 */

import { TokenCounter, calculateTokenAllocations } from './token-counter';
// Removed PrioritizedMemory import as we're using contextual summaries now
import { ChatMessage } from './unified-chat-engine';
import { DeduplicationUtils } from './deduplication-utils';

export interface ContextComponents {
  system: string;
  contextualMemory: string;
  sessionSummaries: string[];
  recentHistory: ChatMessage[];
  currentMessage: string;
}

export interface AssembledContext {
  messages: Array<{role: string, content: string}>;
  tokenUsage: {
    total: number;
    system: number;
    context: number;
    summaries: number;
    recent: number;
    utilization: string;
  };
  compressionRatio: number;
}

export class ContextAssembler {
  private maxTokens: number;
  private allocations: ReturnType<typeof calculateTokenAllocations>;

  constructor(maxTokens: number = 600_000) {
    this.maxTokens = maxTokens;
    this.allocations = calculateTokenAllocations(maxTokens);
  }

  /**
   * Assemble full context with tiered structure
   */
  assembleContext(components: ContextComponents): AssembledContext {
    console.log('\\n🏗️ ASSEMBLING GROK-3 CONTEXT...');
    console.log(`📊 Target: ${this.maxTokens.toLocaleString()} tokens across tiers`);

    // Step 1: Prepare system prompt (always include, highest priority)
    const systemContent = this.prepareSystemPrompt(components.system);
    const systemTokens = TokenCounter.estimate(systemContent).tokens;

    console.log(`🎯 System prompt: ${systemTokens} tokens (${this.allocations.system} allocated)`);

    // Step 2: Fit contextual memory within allocation
    const contextContent = components.contextualMemory || '';
    const contextTokens = Math.min(
      TokenCounter.estimate(contextContent).tokens,
      this.allocations.prioritized // Reuse prioritized allocation for context
    );

    // Step 3: Fit session summaries within allocation
    const { content: summariesContent, tokens: summariesTokens } = this.fitContent(
      components.sessionSummaries,
      this.allocations.summaries,
      'SESSION SUMMARIES'
    );

    // Step 4: Fit recent history within allocation
    const recentMessages = this.fitRecentHistory(
      components.recentHistory,
      this.allocations.recent
    );
    const recentTokens = TokenCounter.estimateMessages(recentMessages).tokens;

    // Step 5: Assemble final message array
    const messages: Array<{role: string, content: string}> = [];

    // System tier
    messages.push({
      role: 'system',
      content: systemContent
    });

    // Contextual memory tier (if any)
    if (contextContent.length > 0) {
      messages.push({
        role: 'system',
        content: `USER CONTEXT & PREFERENCES:\\n${contextContent}`
      });
    }

    // Session summaries tier (if any)
    if (summariesContent.length > 0) {
      messages.push({
        role: 'system',
        content: `PAST SESSION INSIGHTS:\\n${summariesContent.join('\\n\\n')}`
      });
    }

    // Recent conversation tier
    messages.push(...recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));

    // Current message
    messages.push({
      role: 'user',
      content: components.currentMessage
    });

    // Calculate final metrics
    const totalTokens = systemTokens + contextTokens + summariesTokens + recentTokens;
    const utilization = ((totalTokens / this.maxTokens) * 100).toFixed(1);

    // Calculate compression ratio (how much we compressed from raw history)  
    const mockCurrentMessage = {
      id: 'current',
      role: 'user' as const,
      content: components.currentMessage,
      timestamp: new Date()
    };
    const originalHistoryTokens = TokenCounter.estimateMessages(
      components.recentHistory.concat([mockCurrentMessage])
    ).tokens;
    const compressionRatio = totalTokens / Math.max(originalHistoryTokens, 1);

    console.log(`\\n📋 CONTEXT ASSEMBLY COMPLETE:`);
    console.log(`  System: ${systemTokens.toLocaleString()} tokens`);
    console.log(`  Context: ${contextTokens.toLocaleString()} tokens`);
    console.log(`  Summaries: ${summariesTokens.toLocaleString()} tokens`);
    console.log(`  Recent: ${recentTokens.toLocaleString()} tokens`);
    console.log(`  Total: ${totalTokens.toLocaleString()} tokens (${utilization}% of 1M window)`);
    console.log(`  Context expansion: ${compressionRatio.toFixed(1)}x vs raw history`);

    return {
      messages,
      tokenUsage: {
        total: totalTokens,
        system: systemTokens,
        context: contextTokens,
        summaries: summariesTokens,
        recent: recentTokens,
        utilization: `${utilization}%`
      },
      compressionRatio
    };
  }

  /**
   * Prepare enhanced system prompt with memory context
   */
  private prepareSystemPrompt(baseSystem: string): string {
    const memoryInstructions = `

CONTEXT AWARENESS:
- You have access to long-term memories and session summaries
- Use this context naturally without explicitly mentioning "I remember"
- Prioritize recent conversation but leverage historical patterns
- Respond to undertones and hidden meanings from accumulated insights

MEMORY INTEGRATION:
- Reference past patterns subtly and naturally
- Build on emotional threads from previous sessions
- Maintain personality consistency based on historical analysis
- Use revenue signals to guide conversation depth and direction`;

    return baseSystem + memoryInstructions;
  }

  /**
   * Fit content array within token allocation
   */
  private fitContent(
    contentArray: string[],
    tokenAllocation: number,
    tierName: string
  ): { content: string[], tokens: number } {
    const fitted: string[] = [];
    let usedTokens = 0;

    for (const item of contentArray) {
      const itemTokens = TokenCounter.estimate(item).tokens;
      
      if (usedTokens + itemTokens <= tokenAllocation) {
        fitted.push(item);
        usedTokens += itemTokens;
      } else {
        // Try to fit a truncated version
        const remaining = tokenAllocation - usedTokens;
        if (remaining > 100) { // Only worth truncating if we have meaningful space
          const truncated = TokenCounter.truncateToTokenLimit(item, remaining);
          fitted.push(truncated);
          usedTokens += TokenCounter.estimate(truncated).tokens;
        }
        break; // Stop adding more items
      }
    }

    console.log(`  ${tierName}: ${fitted.length}/${contentArray.length} items, ${usedTokens.toLocaleString()} tokens`);

    return { content: fitted, tokens: usedTokens };
  }

  /**
   * Fit recent history within allocation
   */
  private fitRecentHistory(
    history: ChatMessage[],
    tokenAllocation: number
  ): Array<{role: string, content: string}> {
    // Start from most recent and work backwards
    const messages: Array<{role: string, content: string}> = [];
    let usedTokens = 0;

    for (let i = history.length - 1; i >= 0; i--) {
      const message = history[i];
      const messageTokens = TokenCounter.estimate(message.content).tokens + 10; // +10 for role overhead

      if (usedTokens + messageTokens <= tokenAllocation) {
        messages.unshift({ // Add to beginning to maintain order
          role: message.role,
          content: message.content
        });
        usedTokens += messageTokens;
      } else {
        break; // Stop when we can't fit more
      }
    }

    console.log(`  RECENT HISTORY: ${messages.length}/${history.length} messages, ${usedTokens.toLocaleString()} tokens`);

    return messages;
  }

  /**
   * Compress and merge similar memories using advanced deduplication
   */
  compressMemories(memories: any[]): string[] {
    if (memories.length === 0) return [];

    // Convert to format expected by deduplication utils
    const memoryData = memories.map(mem => ({
      content: `[${mem.undertone}] ${mem.content}`,
      score: mem.score
    }));

    // Apply advanced deduplication
    const deduplicated = DeduplicationUtils.mergeDuplicateMemories(memoryData, 0.8);
    
    // Extract just the content strings
    const deduplicatedContent = deduplicated.map(mem => mem.content);
    
    // Apply smart compression if still too many
    if (deduplicatedContent.length > 10) {
      return DeduplicationUtils.compressContent(deduplicatedContent, 2000);
    }
    
    return deduplicatedContent;
  }

  /**
   * Get optimal allocation for current context size
   */
  getOptimalAllocation(contextSize: 'small' | 'medium' | 'large'): number {
    const allocations = {
      small: 200_000,   // 20% of window for new users
      medium: 400_000,  // 40% of window for regular users
      large: 600_000    // 60% of window for power users
    };

    return allocations[contextSize];
  }
}