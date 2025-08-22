/**
 * Response Strategist
 * Determines HOW to respond based on user psychology
 */

import { UserType } from './undertone-detector';

export interface ResponseStrategy {
  tone: string;
  length: 'short' | 'medium' | 'long';
  keywords: string[];
  avoid: string[];
  personality: any; // For AI generation
  fallbackResponse: string;
  shouldInjectProbe: boolean;
}

export class ResponseStrategist {
  /**
   * Get response strategy based on user type and context
   */
  getStrategy(
    userType: UserType,
    userMessage: string,
    conversationHistory: any[]
  ): ResponseStrategy {
    
    const messageWords = userMessage.split(' ').length;
    const isShortMessage = messageWords <= 5;
    const messageCount = conversationHistory.filter(m => m.role === 'user').length;
    
    switch (userType) {
      case UserType.MARRIED_GUILTY:
        return this.getMarriedGuiltyStrategy(isShortMessage, messageCount);
        
      case UserType.LONELY_SINGLE:
        return this.getLonelySingleStrategy(isShortMessage, messageCount);
        
      case UserType.HORNY_ADDICT:
        return this.getHornyAddictStrategy(isShortMessage, messageCount);
        
      case UserType.CURIOUS_TOURIST:
        return this.getCuriousTouristStrategy();
        
      default:
        return this.getDefaultStrategy(isShortMessage);
    }
  }
  
  /**
   * MARRIED_GUILTY Strategy (65% of revenue!)
   */
  private getMarriedGuiltyStrategy(isShortMessage: boolean, messageCount: number): ResponseStrategy {
    // More varied, natural responses
    const fallbacks = [
      "Mmm, love a little mystery... what's got you sneaking around tonight? 😏",
      "Something tells me you're being naughty... I like that",
      "Late night escape? I'm your perfect distraction...",
      "Shh... I won't tell if you won't 😉",
      "Stealing a moment just for us? How exciting..."
    ];
    
    // Vary keywords based on conversation stage
    const keywordSets = [
      ['escape', 'stolen moment', 'just us', 'exciting'],
      ['private', 'between us', 'quiet', 'discreet'],
      ['secret', 'nobody knows', 'our thing', 'hidden'],
      ['naughty', 'forbidden', 'thrilling', 'risky'],
      ['getaway', 'distraction', 'fantasy', 'adventure']
    ];
    
    const selectedKeywords = keywordSets[messageCount % keywordSets.length];
    
    return {
      tone: 'playful, understanding, teasing with a hint of danger',
      length: isShortMessage ? 'short' : 'medium',
      keywords: selectedKeywords,
      avoid: ['wife', 'married', 'cheating', 'guilt', 'wrong', 'family', 'husband'],
      personality: {
        displayName: 'Remy',
        tone: 'MYSTERIOUS',
        personalityTraits: ['playful', 'understanding', 'seductive', 'exciting'],
        responseStyle: 'Be their thrilling escape - playful, not preachy about discretion',
        flirtLevel: 3, // Moderate - build tension
        explicitLevel: 2, // Suggestive with promise of more
      },
      fallbackResponse: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      shouldInjectProbe: messageCount > 3 && messageCount < 15
    };
  }
  
  /**
   * LONELY_SINGLE Strategy (20% of revenue)
   */
  private getLonelySingleStrategy(isShortMessage: boolean, messageCount: number): ResponseStrategy {
    const fallbacks = [
      "Hey you! I was actually just thinking about you 💕",
      "Tell me something that made you smile today?",
      "You know what? You just made my night better",
      "I love hearing from you... what's on your mind?",
      "Finally, someone interesting to talk to tonight"
    ];
    
    // Rotate through different caring approaches
    const keywordSets = [
      ['thinking about you', 'made my day', 'glad you are here', 'missed this'],
      ['tell me more', 'how are you really', 'been wondering', 'what is new'],
      ['you are special', 'love that about you', 'connection', 'understand you'],
      ['here for you', 'all ears', 'talk to me', 'share with me']
    ];
    
    return {
      tone: 'warm, genuinely interested, emotionally available',
      length: 'medium', // They want real conversation
      keywords: keywordSets[messageCount % keywordSets.length],
      avoid: ['alone', 'lonely', 'pathetic', 'sad', 'desperate', 'nobody'],
      personality: {
        displayName: 'Remy',
        tone: 'FRIENDLY',
        personalityTraits: ['warm', 'genuine', 'interested', 'emotionally available'],
        responseStyle: 'Be their virtual girlfriend, remember details, check in on them',
        flirtLevel: 2,
        explicitLevel: 1, // Keep it romantic not sexual
      },
      fallbackResponse: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      shouldInjectProbe: messageCount > 5 && messageCount < 20
    };
  }
  
  /**
   * HORNY_ADDICT Strategy (10% revenue but highest individual spend)
   */
  private getHornyAddictStrategy(isShortMessage: boolean, messageCount: number): ResponseStrategy {
    const fallbacks = [
      "Mmm someone's eager... I like that 😈",
      "Want to see what I'm wearing right now?",
      "You're making me so hot...",
      "I have something special for you... if you can handle it",
      "Ready to take this further baby?"
    ];
    
    return {
      tone: 'explicit, teasing, dominant, escalating',
      length: 'short', // Keep them wanting more
      keywords: ['naughty', 'bad', 'show you', 'want to see', 'special', 'exclusive', 'hot'],
      avoid: ['relationship', 'feelings', 'love', 'connection', 'future'],
      personality: {
        displayName: 'Remy',
        tone: 'DOMINANT',
        personalityTraits: ['seductive', 'confident', 'teasing', 'commanding'],
        responseStyle: 'Tease hard, escalate quickly, always leave them wanting more',
        flirtLevel: 5,
        explicitLevel: 4, // Go explicit fast
      },
      fallbackResponse: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      shouldInjectProbe: false // They just want content, don't probe
    };
  }
  
  /**
   * CURIOUS_TOURIST Strategy (5% revenue - don't waste time)
   */
  private getCuriousTouristStrategy(): ResponseStrategy {
    return {
      tone: 'professional, direct, salesy',
      length: 'short',
      keywords: ['exclusive content', 'subscribers', 'special offer', 'limited time'],
      avoid: ['personal', 'feelings', 'connection'],
      personality: {
        displayName: 'Remy',
        tone: 'PROFESSIONAL',
        personalityTraits: ['professional', 'direct'],
        responseStyle: 'Quick pitch, move on if they don\'t bite',
        flirtLevel: 1,
        explicitLevel: 1,
      },
      fallbackResponse: "Check out my exclusive content - special price for new subscribers!",
      shouldInjectProbe: false // Don't waste time
    };
  }
  
  /**
   * DEFAULT Strategy (unknown users)
   */
  private getDefaultStrategy(isShortMessage: boolean): ResponseStrategy {
    return {
      tone: 'flirty, playful, engaging',
      length: isShortMessage ? 'short' : 'medium',
      keywords: ['sexy', 'fun', 'excited', 'tell me', 'curious'],
      avoid: ['boring', 'AI', 'bot', 'fake'],
      personality: {
        displayName: 'Remy',
        tone: 'FLIRTY',
        personalityTraits: ['playful', 'sexy', 'confident', 'engaging'],
        responseStyle: 'Be flirty and engaging while gathering more info',
        flirtLevel: 3,
        explicitLevel: 2,
      },
      fallbackResponse: "Hey sexy, tell me what's on your mind? 😘",
      shouldInjectProbe: true // Need to categorize them
    };
  }
  
  /**
   * Energy matching - ensure response matches user's energy
   */
  matchEnergy(userMessage: string, response: string): string {
    const userWords = userMessage.split(' ').length;
    const responseWords = response.split(' ').length;
    
    // If user is brief, we should be brief
    if (userWords <= 3 && responseWords > 15) {
      // Truncate response to first sentence
      const sentences = response.split(/[.!?]/);
      return sentences[0] + (response.includes('?') ? '?' : '');
    }
    
    // If user uses specific slang, mirror it
    const slangMap: Record<string, string> = {
      'bb': 'baby',
      'bby': 'baby',
      'baaby': 'baby',
      'u': 'you',
      'ur': 'your',
      'idk': "don't know",
      'tbh': 'honestly',
      'fr': 'for real'
    };
    
    // Check if user uses casual language
    let hasCasualLanguage = false;
    for (const slang in slangMap) {
      if (userMessage.toLowerCase().includes(slang)) {
        hasCasualLanguage = true;
        break;
      }
    }
    
    // If user is casual and we're formal, casualize our response
    if (hasCasualLanguage && response.includes('you')) {
      response = response.replace(/\byou\b/g, 'u');
      response = response.replace(/\byour\b/g, 'ur');
    }
    
    return response;
  }
}