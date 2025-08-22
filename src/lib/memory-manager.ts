/**
 * Memory Manager for Vector Embeddings
 * Handles RunPod embedding generation and pgvector storage/retrieval
 */

import { User } from '@prisma/client';
import { SecureGrokClient } from './secure-grok-client';
import { ChatMessage } from './unified-chat-engine';

export interface MemoryEntry {
  content: string;
  undertone: string;
  similarity: number;
  timestamp: Date;
}

export interface PrioritizedMemory extends MemoryEntry {
  score: number;
  confidence: number;
}

export class MemoryManager {
  private runpodEndpoint = process.env.RUNPOD_ENDPOINT || 'https://api.runpod.io/v2/your-endpoint-id/runsync';
  private runpodApiKey = process.env.RUNPOD_API_KEY!;
  private grokClient: SecureGrokClient | null = null;

  constructor() {
    // Initialize Grok client for summarization if API key available
    if (process.env.GROK_API_KEY) {
      this.grokClient = new SecureGrokClient(process.env.GROK_API_KEY);
    }
  }

  /**
   * Generate embeddings using RunPod
   */
  async generateEmbedding(text: string | string[]): Promise<number[][]> {
    if (!this.runpodApiKey) {
      console.warn('RUNPOD_API_KEY not configured, skipping embedding');
      return [];
    }

    try {
      const response = await fetch(this.runpodEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.runpodApiKey}`,
        },
        body: JSON.stringify({
          input: { text: Array.isArray(text) ? text : [text] },
        }),
      });

      if (!response.ok) {
        throw new Error(`RunPod API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const embeddings = result.output;

      if (!Array.isArray(embeddings) || embeddings.length === 0) {
        throw new Error('Invalid embedding response from RunPod');
      }

      console.log(`[MEMORY-MANAGER] 🧠 Generated ${embeddings.length} embeddings (${embeddings[0]?.length || 0} dims)`);
      return embeddings;
      
    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Embedding generation failed:', error);
      
      // Return empty arrays as fallback - chat will continue without vectors
      const textArray = Array.isArray(text) ? text : [text];
      return textArray.map(() => []);
    }
  }

  /**
   * Store message with embedding in database
   */
  async storeMemory(
    chatSessionId: string,
    content: string,
    undertone: string,
    prisma: any // Prisma client
  ): Promise<void> {
    try {
      // Generate embedding
      const [embedding] = await this.generateEmbedding(content);
      
      if (embedding && embedding.length > 0) {
        // Store in ChatSession with embedding
        await prisma.chatSession.update({
          where: { id: chatSessionId },
          data: {
            content: content,
            undertone: undertone,
            embedding: embedding,
          },
        });
        
        console.log(`[MEMORY-MANAGER] 💾 Stored memory: "${content.slice(0, 50)}..." (${embedding.length} dims)`);
      } else {
        // Store without embedding as fallback
        await prisma.chatSession.update({
          where: { id: chatSessionId },
          data: {
            content: content,
            undertone: undertone,
          },
        });
        
        console.log(`[MEMORY-MANAGER] 💾 Stored memory without embedding (fallback)`);
      }
      
    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Failed to store memory:', error);
      // Don't throw - let chat continue even if memory storage fails
    }
  }

  /**
   * Retrieve similar memories for a user message
   */
  async retrieveMemories(
    subscriberId: string,
    queryText: string,
    limit: number = 5,
    similarityThreshold: number = 0.7,
    prisma: any
  ): Promise<MemoryEntry[]> {
    try {
      // Generate embedding for query
      const [queryEmbedding] = await this.generateEmbedding(queryText);
      
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.warn('[MEMORY-MANAGER] ⚠️ No query embedding, using fallback memories');
        return this.getFallbackMemories(subscriberId, limit, prisma);
      }

      // Vector similarity search using raw SQL
      const results: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          content, 
          undertone, 
          "startedAt" as timestamp,
          1 - (embedding <=> $1::vector) AS similarity
        FROM "ChatSession"
        WHERE 
          "subscriberId" = $2 
          AND content IS NOT NULL 
          AND array_length(embedding, 1) > 0
          AND (1 - (embedding <=> $1::vector)) > $3
        ORDER BY similarity DESC
        LIMIT $4;
      `, queryEmbedding, subscriberId, similarityThreshold, limit);

      const memories: MemoryEntry[] = results.map(row => ({
        content: row.content,
        undertone: row.undertone || 'UNKNOWN',
        similarity: parseFloat(row.similarity),
        timestamp: row.timestamp
      }));

      console.log(`[MEMORY-MANAGER] 🔍 Retrieved ${memories.length} similar memories (threshold: ${similarityThreshold})`);
      
      // If no vector matches, fall back to recent messages
      if (memories.length === 0) {
        return this.getFallbackMemories(subscriberId, limit, prisma);
      }
      
      return memories;
      
    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Vector search failed:', error);
      // Fallback to chronological retrieval
      return this.getFallbackMemories(subscriberId, limit, prisma);
    }
  }

  /**
   * Fallback: Get recent memories chronologically
   */
  private async getFallbackMemories(
    subscriberId: string,
    limit: number,
    prisma: any
  ): Promise<MemoryEntry[]> {
    try {
      const recentSessions: Array<{
        content: string | null;
        undertone: string | null;
        startedAt: Date;
      }> = await prisma.chatSession.findMany({
        where: {
          subscriberId: subscriberId,
          content: { not: null }
        },
        select: {
          content: true,
          undertone: true,
          startedAt: true,
        },
        orderBy: { startedAt: 'desc' },
        take: limit
      });

      const memories: MemoryEntry[] = recentSessions.map(session => ({
        content: session.content || '',
        undertone: session.undertone || 'UNKNOWN',
        similarity: 0.5, // Default similarity for chronological fallback
        timestamp: session.startedAt
      }));

      console.log(`[MEMORY-MANAGER] 📅 Using ${memories.length} fallback memories (chronological)`);
      return memories;
      
    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Fallback memories failed:', error);
      return [];
    }
  }

  /**
   * Get embedding statistics for debugging
   */
  async getMemoryStats(subscriberId: string, prisma: any) {
    try {
      const stats = await prisma.chatSession.aggregate({
        where: {
          subscriberId: subscriberId,
          content: { not: null }
        },
        _count: {
          embedding: true,
          content: true
        }
      });

      const withEmbeddings = await prisma.chatSession.count({
        where: {
          subscriberId: subscriberId,
          embedding: { not: { equals: [] } }
        }
      });

      return {
        totalMemories: stats._count.content || 0,
        withEmbeddings: withEmbeddings,
        embeddingCoverage: stats._count.content ? (withEmbeddings / stats._count.content * 100).toFixed(1) : '0'
      };
      
    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Stats query failed:', error);
      return { totalMemories: 0, withEmbeddings: 0, embeddingCoverage: '0' };
    }
  }

  /**
   * Summarize a conversation session using Grok-3
   * Compresses raw history to key insights, patterns, and revenue signals
   */
  async summarizeSession(
    history: ChatMessage[], 
    undertone: any,
    sessionId?: string
  ): Promise<string> {
    if (!this.grokClient) {
      console.warn('[MEMORY-MANAGER] ⚠️ Grok client not available, skipping summarization');
      // Fallback: Basic compression
      const keyMessages = history.filter(m => m.role === 'user').slice(-3);
      return `Session summary: ${keyMessages.length} user messages. Detected: ${undertone.userType} (${undertone.confidence * 100}% confidence)`;
    }

    try {
      // Enhanced format with signals as per ultra-plan
      const rawHistory = history
        .slice(-20) // Limit to last 20 messages for summarization
        .map(m => `${m.role.toUpperCase()}: ${m.content} (Time: ${m.timestamp}, Stops: ${(m as any).typingStops || 0})`)
        .join('\n');

      const summarizationPrompt = `Compress this conversation into a dense summary optimized for long-term memory retrieval. Mechanism: Extract chain-of-thought insights (key exchanges, emotional shifts), psychological patterns (undertones, behaviors), and revenue signals (engagement levels, upsell hooks). Be unvarnished: Highlight vulnerabilities, guilt indicators, or arousal without softening.

Structure:
- INSIGHTS: Bullet 3-5 core takeaways.
- PATTERNS: Undertone evolution, hesitations, adaptations.
- SIGNALS: Confidence scores, revenue potential (e.g., whale behaviors).

Current Analysis: ${JSON.stringify(undertone)}

Conversation:
${rawHistory}

Limit <400 tokens. Factual only—no inventions.`;

      console.log(`[MEMORY-MANAGER] 🧠 Summarizing session ${sessionId?.slice(0, 8) || 'unknown'} with ${history.length} messages`);

      const summary = await this.grokClient.generateSecureResponse(
        summarizationPrompt,
        null as any, // Use null personality for summarization
        []
      );

      console.log(`[MEMORY-MANAGER] ✅ Generated summary (${summary.length} chars): "${summary.slice(0, 100)}..."`);
      return summary;

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Session summarization failed:', error);
      
      // Fallback summary
      const userMessages = history.filter(m => m.role === 'user').length;
      const lastUserMessage = history.filter(m => m.role === 'user').pop()?.content || '';
      
      return `Session: ${userMessages} messages. Type: ${undertone.userType} (${(undertone.confidence * 100).toFixed(0)}%). Last: "${lastUserMessage.slice(0, 100)}..."`;
    }
  }

  /**
   * Retrieve and prioritize memories based on similarity and revenue weights
   */
  async retrieveAndPrioritize(
    subscriberId: string,
    queryEmbedding: number[],
    revenueWeights: Record<string, number>,
    limit: number = 5
  ): Promise<PrioritizedMemory[]> {
    try {
      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.warn('[MEMORY-MANAGER] ⚠️ No query embedding for prioritization');
        return [];
      }

      // Retrieve with metadata for prioritization
      const results: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT 
          content, 
          undertone, 
          "startedAt" as timestamp,
          1 - (embedding <=> $1::vector) AS similarity
        FROM "ChatSession"
        WHERE 
          "subscriberId" = $2 
          AND content IS NOT NULL 
          AND array_length(embedding, 1) > 0
          AND (1 - (embedding <=> $1::vector)) > 0.5
        ORDER BY similarity DESC, "startedAt" DESC
        LIMIT 15;
      `, queryEmbedding, subscriberId);

      console.log(`[MEMORY-MANAGER] 🔍 Retrieved ${results.length} candidates for prioritization`);

      // Parse undertone data and calculate priority scores
      const prioritized: PrioritizedMemory[] = results
        .map(row => {
          let undertoneData: any = {};
          let confidence = 0.5;
          
          try {
            // Parse undertone if it's JSON string, or use directly if object
            undertoneData = typeof row.undertone === 'string' 
              ? JSON.parse(row.undertone) 
              : (row.undertone || {});
            confidence = undertoneData.confidence || 0.5;
          } catch {
            undertoneData = { userType: row.undertone || 'UNKNOWN' };
          }

          const userType = undertoneData.userType || 'UNKNOWN';
          const revenueMultiplier = revenueWeights[userType] || 0.1;
          
          // Calculate weighted score: similarity * confidence * revenue_weight
          const score = row.similarity * confidence * revenueMultiplier;

          return {
            content: row.content,
            undertone: userType,
            similarity: parseFloat(row.similarity),
            timestamp: row.timestamp,
            score: score,
            confidence: confidence
          };
        })
        .sort((a, b) => b.score - a.score) // Sort by priority score
        .slice(0, limit); // Take top N

      console.log(`[MEMORY-MANAGER] 🎯 Prioritized to ${prioritized.length} memories:`);
      prioritized.forEach((mem, i) => {
        console.log(`  ${i+1}. [${mem.undertone}] Score: ${mem.score.toFixed(3)} (sim: ${(mem.similarity * 100).toFixed(0)}%, conf: ${(mem.confidence * 100).toFixed(0)}%)`);
      });

      return prioritized;

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Prioritized retrieval failed:', error);
      return [];
    }
  }

  /**
   * Vectorize and store session summary
   */
  async vectorizeAndStore(
    subscriberId: string,
    summary: string,
    undertone: any,
    chatSessionId: string,
    prisma: any
  ): Promise<void> {
    try {
      console.log(`[MEMORY-MANAGER] 💾 Vectorizing summary for session ${chatSessionId.slice(0, 8)}`);
      
      // Generate embedding for the summary
      const [summaryEmbedding] = await this.generateEmbedding(summary);
      
      if (!summaryEmbedding || summaryEmbedding.length === 0) {
        console.warn('[MEMORY-MANAGER] ⚠️ Failed to generate summary embedding, storing without vector');
      }

      // Store summary with embedding in dedicated column
      await prisma.chatSession.update({
        where: { id: chatSessionId },
        data: {
          summary: summary,
          undertone: JSON.stringify(undertone),
          embedding: summaryEmbedding || [],
        }
      });

      console.log(`[MEMORY-MANAGER] ✅ Stored vectorized summary (${summaryEmbedding?.length || 0} dims)`);

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Failed to vectorize and store summary:', error);
      // Non-critical error - don't throw
    }
  }

  /**
   * Memory decay and cleanup mechanisms
   * Remove low-similarity vectors and old memories to maintain performance
   */
  async performMemoryDecay(
    daysToKeep: number = 30,
    minSimilarityThreshold: number = 0.3,
    prisma: any
  ): Promise<{
    cleaned: number;
    kept: number;
    spaceSaved: string;
  }> {
    console.log('[MEMORY-MANAGER] 🧹 Starting memory decay cleanup...');
    
    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Find old sessions to evaluate
      const oldSessions = await prisma.chatSession.findMany({
        where: {
          startedAt: { lt: cutoffDate },
          content: { not: null },
          embedding: { not: { equals: [] } }
        },
        select: {
          id: true,
          content: true,
          undertone: true,
          embedding: true,
          startedAt: true,
          subscriberId: true
        }
      });

      console.log(`📊 Found ${oldSessions.length} old sessions to evaluate`);

      let cleaned = 0;
      let kept = 0;
      let totalCharsRemoved = 0;

      for (const session of oldSessions) {
        // Calculate average similarity to recent memories for this user
        const avgSimilarity = await this.calculateAverageSimilarity(
          session.subscriberId,
          session.embedding as number[],
          prisma
        );

        if (avgSimilarity < minSimilarityThreshold) {
          // Low similarity - remove vector but keep basic record
          await prisma.chatSession.update({
            where: { id: session.id },
            data: {
              embedding: [],
              content: null // Clear vectorized content but keep session record
            }
          });
          
          totalCharsRemoved += session.content?.length || 0;
          cleaned++;
          console.log(`  🗑️ Cleaned session ${session.id.slice(0, 8)} (sim: ${avgSimilarity.toFixed(3)})`);
        } else {
          kept++;
        }
      }

      const spaceSaved = `${(totalCharsRemoved / 1024).toFixed(1)}KB`;
      
      console.log('[MEMORY-MANAGER] ✅ Memory decay complete:');
      console.log(`  Cleaned: ${cleaned} sessions`);
      console.log(`  Kept: ${kept} sessions`);
      console.log(`  Space saved: ${spaceSaved}`);

      return { cleaned, kept, spaceSaved };

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Memory decay failed:', error);
      return { cleaned: 0, kept: 0, spaceSaved: '0KB' };
    }
  }

  /**
   * Calculate average similarity of a memory to recent memories for same user
   */
  private async calculateAverageSimilarity(
    subscriberId: string,
    targetEmbedding: number[],
    prisma: any
  ): Promise<number> {
    if (!targetEmbedding || targetEmbedding.length === 0) {
      return 0;
    }

    try {
      // Get recent memories (last 30 days) for similarity comparison
      const recentCutoff = new Date();
      recentCutoff.setDate(recentCutoff.getDate() - 30);

      const similarities: any[] = await prisma.$queryRawUnsafe(`
        SELECT 1 - (embedding <=> $1::vector) AS similarity
        FROM "ChatSession"
        WHERE 
          "subscriberId" = $2 
          AND "startedAt" > $3
          AND array_length(embedding, 1) > 0
        ORDER BY similarity DESC
        LIMIT 10;
      `, targetEmbedding, subscriberId, recentCutoff);

      if (similarities.length === 0) {
        return 0; // No recent memories to compare against
      }

      const avgSimilarity = similarities.reduce((sum, row) => sum + parseFloat(row.similarity), 0) / similarities.length;
      return avgSimilarity;

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Similarity calculation failed:', error);
      return 0;
    }
  }

  /**
   * Cleanup empty embeddings and optimize database
   */
  async optimizeMemoryStorage(prisma: any): Promise<{
    emptyEmbeddings: number;
    duplicates: number;
    optimized: number;
  }> {
    console.log('[MEMORY-MANAGER] 🔧 Optimizing memory storage...');

    try {
      // Clean up sessions with empty embeddings but no content
      const emptyCleanup = await prisma.chatSession.deleteMany({
        where: {
          embedding: { equals: [] },
          content: null,
          messages: { none: {} } // No actual chat messages
        }
      });

      // Find potential duplicates (same user, similar content)
      const duplicates = await prisma.$queryRaw`
        DELETE FROM "ChatSession" c1
        WHERE EXISTS (
          SELECT 1 FROM "ChatSession" c2 
          WHERE c2."subscriberId" = c1."subscriberId"
            AND c2.content = c1.content
            AND c2.id > c1.id
        );
      `;

      console.log('[MEMORY-MANAGER] ✅ Storage optimization complete:');
      console.log(`  Empty embeddings cleaned: ${emptyCleanup.count}`);
      console.log(`  Duplicates removed: ${duplicates}`);

      return {
        emptyEmbeddings: emptyCleanup.count,
        duplicates: typeof duplicates === 'number' ? duplicates : 0,
        optimized: emptyCleanup.count + (typeof duplicates === 'number' ? duplicates : 0)
      };

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Storage optimization failed:', error);
      return { emptyEmbeddings: 0, duplicates: 0, optimized: 0 };
    }
  }

  /**
   * Get memory health metrics
   */
  async getMemoryHealth(prisma: any): Promise<{
    totalSessions: number;
    withEmbeddings: number;
    avgSimilarity: number;
    oldestMemory: Date | null;
    newestMemory: Date | null;
    storageUsed: string;
    recommendations: string[];
  }> {
    try {
      const stats = await prisma.chatSession.aggregate({
        _count: { id: true },
        _min: { startedAt: true },
        _max: { startedAt: true }
      });

      const withEmbeddings = await prisma.chatSession.count({
        where: { embedding: { not: { equals: [] } } }
      });

      // Estimate storage used (rough calculation)
      const avgCharsPerSession = 200; // Estimated
      const storageUsed = `${((withEmbeddings * avgCharsPerSession) / 1024).toFixed(1)}KB`;

      const recommendations: string[] = [];
      
      if (withEmbeddings > 10000) {
        recommendations.push('Consider running memory decay to clean old vectors');
      }
      
      if (stats._count.id > withEmbeddings * 2) {
        recommendations.push('Many sessions without embeddings - consider cleanup');
      }

      const embeddingRatio = withEmbeddings / Math.max(stats._count.id, 1);
      if (embeddingRatio < 0.5) {
        recommendations.push('Low embedding coverage - check vectorization process');
      }

      return {
        totalSessions: stats._count.id,
        withEmbeddings,
        avgSimilarity: 0, // Would need complex query to calculate
        oldestMemory: stats._min.startedAt,
        newestMemory: stats._max.startedAt,
        storageUsed,
        recommendations
      };

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Health check failed:', error);
      return {
        totalSessions: 0,
        withEmbeddings: 0,
        avgSimilarity: 0,
        oldestMemory: null,
        newestMemory: null,
        storageUsed: '0KB',
        recommendations: ['Health check failed - investigate database connection']
      };
    }
  }
}