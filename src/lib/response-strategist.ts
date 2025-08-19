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
    const fallbacks = [
      "Don't worry baby, your secret's safe with me 😉",
      "What happens here stays between us...",
      "No one has to know about our little chats",
      "I know how to be discrete 😘",
      "Some things are better kept private, don't you think?"
    ];
    
    return {
      tone: 'discrete, understanding, non-judgmental',
      length: isShortMessage ? 'short' : 'medium',
      keywords: ['secret', 'between us', 'private', 'discrete', 'nobody knows', 'our thing'],
      avoid: ['wife', 'married', 'cheating', 'guilt', 'wrong', 'family'],
      personality: {
        displayName: 'Remy',
        tone: 'MYSTERIOUS',
        personalityTraits: ['discrete', 'understanding', 'seductive', 'trustworthy'],
        responseStyle: 'Emphasize privacy and discretion, be their safe escape',
        flirtLevel: 3, // Moderate - don't scare them
        explicitLevel: 2, // Keep it suggestive not explicit initially
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
      "Aww baby, I've been thinking about you 💕",
      "How was your day? Tell me everything",
      "I'm here for you, you know that right?",
      "You seem special... I like that about you",
      "I feel like we have a real connection"
    ];
    
    return {
      tone: 'caring, attentive, warm, girlfriend-like',
      length: 'medium', // They want engagement
      keywords: ['thinking of you', 'special', 'care', 'miss you', 'been wondering', 'connection'],
      avoid: ['alone', 'lonely', 'pathetic', 'sad', 'desperate'],
      personality: {
        displayName: 'Remy',
        tone: 'FRIENDLY',
        personalityTraits: ['caring', 'sweet', 'attentive', 'loyal'],
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