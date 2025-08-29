/**
 * Response Scorer - Analyzes responses for human-likeness
 * Provides detailed scoring and improvement suggestions
 */

export interface ScoreBreakdown {
  overall: number;
  typos: number;
  personality: number;
  context: number;
  flow: number;
  punctuation: number;
  issues: string[];
  suggestions: string[];
  details: {
    hasTypos: boolean;
    hasPersonality: boolean;
    isLowercase: boolean;
    hasEmojis: boolean;
    hasFillers: boolean;
    appropriateEnding: boolean;
    matchesPunctuation: boolean;
    naturalLength: boolean;
  };
}

export class ResponseScorer {
  /**
   * Score a response for human-likeness
   */
  scoreResponse(
    response: string,
    userMessage: string,
    context?: {
      userType?: string;
      isSexual?: boolean;
      isNervous?: boolean;
    }
  ): ScoreBreakdown {
    const scores = {
      typos: this.scoreTypos(response),
      personality: this.scorePersonality(response),
      context: this.scoreContext(response, userMessage, context),
      flow: this.scoreFlow(response),
      punctuation: this.scorePunctuation(response, userMessage)
    };
    
    // Calculate overall score (weighted average)
    const overall = (
      scores.typos * 0.25 +
      scores.personality * 0.20 +
      scores.context * 0.30 +
      scores.flow * 0.15 +
      scores.punctuation * 0.10
    );
    
    // Analyze issues and suggestions
    const analysis = this.analyzeIssues(scores, response, userMessage, context);
    
    return {
      overall,
      ...scores,
      ...analysis
    };
  }
  
  /**
   * Score typo usage (should have some but not too many)
   */
  private scoreTypos(response: string): number {
    const typoPatterns = /\b(u|ur|yu|yourr|youre|tho|bc|cuz|prolly|rlly|rly|gonna|wanna|omg|wat|wut|ok|kk|tn|tmrw|acc|def|smth|nthn)\b/gi;
    const words = response.split(' ');
    const typoCount = (response.match(typoPatterns) || []).length;
    const typoRatio = typoCount / words.length;
    
    // Ideal ratio is 0.15-0.35 (15-35% typos)
    if (typoRatio >= 0.15 && typoRatio <= 0.35) {
      return 10;
    } else if (typoRatio >= 0.10 && typoRatio <= 0.40) {
      return 8;
    } else if (typoRatio < 0.10) {
      return 5; // Too few typos
    } else {
      return 4; // Too many typos
    }
  }
  
  /**
   * Score personality phrases and natural language
   */
  private scorePersonality(response: string): number {
    let score = 5; // Base score
    
    // Check for personality phrases
    const personalityPhrases = /(stoppp|obsessed|dying|cant even|literally|lowkey|ngl|fr|wait|omg|fuck|lol|haha)/gi;
    if (personalityPhrases.test(response)) {
      score += 2;
    }
    
    // Check for natural fillers
    const fillers = /(like|literally|lowkey|honestly|ngl|fr|tho)/gi;
    if (fillers.test(response)) {
      score += 1;
    }
    
    // Check for lowercase (casual texting)
    if (response[0] === response[0].toLowerCase()) {
      score += 1;
    }
    
    // Check for emojis (but not too many)
    const emojiCount = (response.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount === 1 || emojiCount === 2) {
      score += 1;
    } else if (emojiCount > 3) {
      score -= 1; // Too many emojis
    }
    
    return Math.min(10, score);
  }
  
  /**
   * Score context appropriateness
   */
  private scoreContext(
    response: string,
    userMessage: string,
    context?: { userType?: string; isSexual?: boolean; isNervous?: boolean; }
  ): number {
    let score = 7; // Base score
    
    const lowerResponse = response.toLowerCase();
    const lowerUser = userMessage.toLowerCase();
    
    // Check if response addresses user's message
    if (lowerUser.includes('partner') || lowerUser.includes('wife') || lowerUser.includes('husband')) {
      if (lowerResponse.includes('sneak') || lowerResponse.includes('secret') || lowerResponse.includes('naughty')) {
        score += 2;
      }
    }
    
    if (lowerUser.includes('sleep') || lowerUser.includes('go') || lowerUser.includes('leave')) {
      if (lowerResponse.includes('stay') || lowerResponse.includes('wait') || lowerResponse.includes('already')) {
        score += 2;
      }
    }
    
    // Check for inappropriate lmao usage
    if (context?.isSexual && lowerResponse.includes('lmao')) {
      score -= 3; // Very inappropriate
    }
    
    // Check for appropriate endings
    if (context?.isSexual && /🥵|😈|\.\.\./.test(response)) {
      score += 1;
    }
    
    if (context?.isNervous && /lmao|haha|😅/.test(response)) {
      score += 1;
    }
    
    return Math.min(10, Math.max(0, score));
  }
  
  /**
   * Score natural flow and readability
   */
  private scoreFlow(response: string): number {
    let score = 7;
    
    // Check for natural length (not too short, not too long)
    const wordCount = response.split(' ').length;
    if (wordCount >= 8 && wordCount <= 30) {
      score += 1;
    } else if (wordCount < 5 || wordCount > 40) {
      score -= 2;
    }
    
    // Check for no dashes/hyphens
    if (/-|—|--/.test(response)) {
      score -= 3;
    }
    
    // Check for natural sentence structure (not all one sentence)
    const sentences = response.split(/[.!?]/).filter(s => s.trim());
    if (sentences.length >= 2 && sentences.length <= 4) {
      score += 1;
    }
    
    // Check for variety (not repetitive)
    const words = response.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    const uniqueRatio = uniqueWords.size / words.length;
    if (uniqueRatio > 0.7) {
      score += 1;
    }
    
    return Math.min(10, Math.max(0, score));
  }
  
  /**
   * Score punctuation matching
   */
  private scorePunctuation(response: string, userMessage: string): number {
    const userHasPunctuation = /[.!?]$/.test(userMessage.trim());
    const responseHasPunctuation = /[.!?]$/.test(response.trim());
    
    // They should match
    if (userHasPunctuation === responseHasPunctuation) {
      return 10;
    } else {
      return 5;
    }
  }
  
  /**
   * Analyze issues and generate suggestions
   */
  private analyzeIssues(
    scores: Record<string, number>,
    response: string,
    userMessage: string,
    context?: any
  ): {
    issues: string[];
    suggestions: string[];
    details: Record<string, boolean>;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check each score category
    if (scores.typos < 7) {
      const typoCount = (response.match(/\b(u|ur|prolly|gonna|wanna)\b/gi) || []).length;
      if (typoCount < 2) {
        issues.push('Too few typos - feels too formal');
        suggestions.push('Add more casual typos like "ur", "prolly", "gonna"');
      } else {
        issues.push('Too many typos - hard to read');
        suggestions.push('Reduce typo frequency to 20-30% of words');
      }
    }
    
    if (scores.personality < 7) {
      issues.push('Lacks personality phrases');
      suggestions.push('Add phrases like "stoppp", "obsessed", "ngl", "literally"');
    }
    
    if (scores.context < 7) {
      issues.push('Doesn\'t address user\'s actual message');
      suggestions.push('Respond more directly to what they said');
    }
    
    if (scores.flow < 7) {
      if (/-|—/.test(response)) {
        issues.push('Contains dashes/hyphens');
        suggestions.push('Remove all dashes and hyphens');
      }
      if (response.split(' ').length < 8) {
        issues.push('Response too short');
        suggestions.push('Add more substance to the response');
      }
    }
    
    if (scores.punctuation < 7) {
      issues.push('Punctuation doesn\'t match user style');
      suggestions.push('Match user\'s punctuation usage');
    }
    
    // Generate details
    const details = {
      hasTypos: /\b(u|ur|prolly|gonna)\b/i.test(response),
      hasPersonality: /(stoppp|obsessed|dying|literally)/i.test(response),
      isLowercase: response[0] === response[0].toLowerCase(),
      hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(response),
      hasFillers: /(like|literally|lowkey|ngl)/i.test(response),
      appropriateEnding: this.checkAppropriateEnding(response, context),
      matchesPunctuation: scores.punctuation === 10,
      naturalLength: response.split(' ').length >= 8 && response.split(' ').length <= 30
    };
    
    return { issues, suggestions, details };
  }
  
  private checkAppropriateEnding(response: string, context?: any): boolean {
    if (context?.isSexual) {
      return /🥵|😈|\.\.\.|fuck$/.test(response) && !response.includes('lmao');
    }
    if (context?.isNervous) {
      return /lmao|haha|😅|lol/.test(response);
    }
    return /lol|haha|tho|\.\.\.|[?!]|😭|💀/.test(response);
  }
}