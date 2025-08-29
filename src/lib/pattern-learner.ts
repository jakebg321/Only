/**
 * Pattern Learner - Saves and learns from successful response patterns
 * Builds a library of high-scoring responses for reference
 */

import fs from 'fs';
import path from 'path';

export interface SuccessfulPattern {
  id: string;
  userMessage: string;
  response: string;
  score: number;
  context: {
    userType?: string;
    isSexual?: boolean;
    isNervous?: boolean;
    hasPartnerMention?: boolean;
  };
  config: any;
  timestamp: string;
}

export class PatternLearner {
  private patternsPath: string;
  private patterns: SuccessfulPattern[] = [];
  
  constructor() {
    this.patternsPath = path.join(process.cwd(), 'data', 'successful-patterns.json');
    this.loadPatterns();
  }
  
  /**
   * Load patterns from file
   */
  private loadPatterns(): void {
    try {
      if (fs.existsSync(this.patternsPath)) {
        const data = fs.readFileSync(this.patternsPath, 'utf-8');
        const parsed = JSON.parse(data);
        this.patterns = parsed.patterns || [];
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
      this.patterns = [];
    }
  }
  
  /**
   * Save a successful pattern
   */
  savePattern(
    userMessage: string,
    response: string,
    score: number,
    context: any,
    config: any
  ): void {
    // Only save high-scoring patterns
    if (score < 8.5) {
      return;
    }
    
    // Check if similar pattern already exists
    const exists = this.patterns.some(p => 
      p.userMessage.toLowerCase() === userMessage.toLowerCase() &&
      Math.abs(p.score - score) < 0.5
    );
    
    if (exists) {
      return;
    }
    
    const pattern: SuccessfulPattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userMessage,
      response,
      score,
      context,
      config,
      timestamp: new Date().toISOString()
    };
    
    this.patterns.push(pattern);
    
    // Keep only top 100 patterns
    this.patterns.sort((a, b) => b.score - a.score);
    this.patterns = this.patterns.slice(0, 100);
    
    this.savePatterns();
    console.log(`[PATTERN-LEARNING] Saved high-scoring pattern | Score: ${score.toFixed(1)}/10`);
  }
  
  /**
   * Save patterns to file
   */
  private savePatterns(): void {
    try {
      const dir = path.dirname(this.patternsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = {
        patterns: this.patterns,
        metadata: {
          created: this.patterns[0]?.timestamp || new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          totalPatterns: this.patterns.length,
          averageScore: this.patterns.reduce((sum, p) => sum + p.score, 0) / this.patterns.length || 0
        }
      };
      
      fs.writeFileSync(this.patternsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving patterns:', error);
    }
  }
  
  /**
   * Find similar patterns for reference
   */
  findSimilarPatterns(userMessage: string, limit: number = 3): SuccessfulPattern[] {
    const lowerMessage = userMessage.toLowerCase();
    
    // Score patterns by similarity
    const scored = this.patterns.map(pattern => {
      let similarity = 0;
      
      // Exact match
      if (pattern.userMessage.toLowerCase() === lowerMessage) {
        similarity = 1.0;
      }
      // Contains same key words
      else {
        const userWords = new Set(lowerMessage.split(' '));
        const patternWords = new Set(pattern.userMessage.toLowerCase().split(' '));
        const intersection = new Set([...userWords].filter(x => patternWords.has(x)));
        similarity = intersection.size / Math.max(userWords.size, patternWords.size);
      }
      
      return { pattern, similarity };
    });
    
    // Sort by similarity and score
    scored.sort((a, b) => {
      const simDiff = b.similarity - a.similarity;
      if (Math.abs(simDiff) > 0.1) return simDiff;
      return b.pattern.score - a.pattern.score;
    });
    
    return scored
      .filter(s => s.similarity > 0.3)
      .slice(0, limit)
      .map(s => s.pattern);
  }
  
  /**
   * Get patterns by context
   */
  getPatternsByContext(context: {
    userType?: string;
    isSexual?: boolean;
    isNervous?: boolean;
  }): SuccessfulPattern[] {
    return this.patterns.filter(pattern => {
      if (context.userType && pattern.context.userType !== context.userType) {
        return false;
      }
      if (context.isSexual !== undefined && pattern.context.isSexual !== context.isSexual) {
        return false;
      }
      if (context.isNervous !== undefined && pattern.context.isNervous !== context.isNervous) {
        return false;
      }
      return true;
    });
  }
  
  /**
   * Get best config from patterns
   */
  getBestConfig(): any {
    if (this.patterns.length === 0) {
      return null;
    }
    
    // Get config from highest scoring pattern
    const best = this.patterns[0];
    return best.config;
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    totalPatterns: number;
    averageScore: number;
    topScore: number;
    contextBreakdown: Record<string, number>;
  } {
    const contextCounts: Record<string, number> = {};
    
    this.patterns.forEach(pattern => {
      const key = pattern.context.userType || 'UNKNOWN';
      contextCounts[key] = (contextCounts[key] || 0) + 1;
    });
    
    return {
      totalPatterns: this.patterns.length,
      averageScore: this.patterns.reduce((sum, p) => sum + p.score, 0) / this.patterns.length || 0,
      topScore: this.patterns[0]?.score || 0,
      contextBreakdown: contextCounts
    };
  }
  
  /**
   * Clear all patterns
   */
  clearPatterns(): void {
    this.patterns = [];
    this.savePatterns();
  }
}