/**
 * Psychological Undertone Analyzer
 * The REAL intelligence - reading between the lines
 */

export interface UndertoneAnalysis {
  surfaceMessage: string;
  hiddenMeaning: string;
  confidence: number;
  indicators: string[];
  psychProfile: string;
  suggestedResponse: string;
}

/**
 * Analyzes what user DIDN'T say directly
 */
export class PsychologicalAnalyzer {
  
  /**
   * Main analysis function - this is where the magic happens
   */
  analyzeUndertones(
    message: string,
    context: {
      previousQuestion?: string;
      messageHistory?: Array<{role: string, content: string}>;
      responseTime?: number;
      typingPattern?: {stops: number, duration: number};
    }
  ): UndertoneAnalysis {
    
    // Normalize for analysis
    const lower = message.toLowerCase().trim();
    const wordCount = message.split(' ').length;
    
    // AVOIDANCE PATTERNS - The most telling signs
    if (context.previousQuestion?.includes('bad boy') || 
        context.previousQuestion?.includes('naughty')) {
      
      // These responses indicate guilt/secrecy
      const avoidanceResponses = [
        { pattern: /^idk/i, meaning: 'Knows exactly, feeling guilty' },
        { pattern: /^maybe/i, meaning: 'Definitely yes, testing boundaries' },
        { pattern: /^kinda/i, meaning: 'Yes but conflicted' },
        { pattern: /^not really/i, meaning: 'Yes but in denial' },
        { pattern: /^sometimes/i, meaning: 'Regular behavior, normalizing' },
        { pattern: /^depends/i, meaning: 'Has rules/boundaries being broken' },
        { pattern: /^why\?/i, meaning: 'Defensive, definitely hiding something' },
        { pattern: /^what do you mean/i, meaning: 'Buying time, guilty' },
        { pattern: /^haha/i, meaning: 'Nervous laughter, deflecting' },
        { pattern: /^lol/i, meaning: 'Uncomfortable, using humor as shield' },
        { pattern: /changes subject/, meaning: 'Clear avoidance, major guilt' }
      ];
      
      for (const avoidance of avoidanceResponses) {
        if (avoidance.pattern.test(lower)) {
          return {
            surfaceMessage: message,
            hiddenMeaning: avoidance.meaning,
            confidence: 0.85,
            indicators: [
              'Avoided direct answer',
              'Response time: ' + (context.responseTime || 0) + 'ms',
              'Typing hesitation detected'
            ],
            psychProfile: 'MARRIED_GUILTY',
            suggestedResponse: this.getCheaterResponse()
          };
        }
      }
    }
    
    // OVERCOMPENSATION PATTERNS
    if (wordCount > 20 && context.previousQuestion) {
      return {
        surfaceMessage: message,
        hiddenMeaning: 'Overexplaining due to guilt or nervousness',
        confidence: 0.7,
        indicators: ['Long response to simple question', 'Possible nervous rambling'],
        psychProfile: 'ANXIOUS_OVEREXPLAINER',
        suggestedResponse: 'Slow down baby... one thing at a time 😏'
      };
    }
    
    // ENTHUSIASM LEVELS
    const exclamationCount = (message.match(/!/g) || []).length;
    const emojiCount = (message.match(/😊|😉|😘|🥰|💕|❤️/g) || []).length;
    
    if (exclamationCount > 2 || emojiCount > 2) {
      return {
        surfaceMessage: message,
        hiddenMeaning: 'Overeager, probably lonely or validation-seeking',
        confidence: 0.75,
        indicators: ['High enthusiasm', 'Multiple emojis/exclamations'],
        psychProfile: 'LONELY_EAGER',
        suggestedResponse: 'Love the energy babe... tell me what you really need'
      };
    }
    
    // MINIMALIST RESPONSES - Often the most telling
    if (wordCount <= 2) {
      const minimalMeanings: Record<string, UndertoneAnalysis> = {
        'hey': {
          surfaceMessage: message,
          hiddenMeaning: 'Testing waters, uncommitted',
          confidence: 0.6,
          indicators: ['Minimal effort', 'Waiting for you to lead'],
          psychProfile: 'CAUTIOUS_TESTER',
          suggestedResponse: 'Just hey? Come on, I know you came here for more than that'
        },
        'hi': {
          surfaceMessage: message,
          hiddenMeaning: 'Shy or nervous, needs encouragement',
          confidence: 0.65,
          indicators: ['Formal greeting', 'Possible first-timer'],
          psychProfile: 'SHY_NEWBIE',
          suggestedResponse: 'Hi baby... first time? Don\'t be shy'
        },
        'nm': {
          surfaceMessage: message,
          hiddenMeaning: 'Bored, needs stimulation',
          confidence: 0.7,
          indicators: ['Indicates boredom', 'Seeking entertainment'],
          psychProfile: 'BORED_BROWSER',
          suggestedResponse: 'Let me fix that... I\'ll make sure something happens 😈'
        }
      };
      
      const normalizedMsg = lower.replace(/[^a-z]/g, '');
      if (minimalMeanings[normalizedMsg]) {
        return minimalMeanings[normalizedMsg];
      }
    }
    
    // TIME-BASED INSIGHTS
    if (context.responseTime) {
      if (context.responseTime < 1000) {
        // Super fast response
        return {
          surfaceMessage: message,
          hiddenMeaning: 'Impulsive, not thinking, probably horny',
          confidence: 0.6,
          indicators: ['Instant response', 'No hesitation'],
          psychProfile: 'IMPULSIVE_AROUSED',
          suggestedResponse: 'Someone\'s eager... I like that energy'
        };
      } else if (context.responseTime > 30000) {
        // Very slow response
        return {
          surfaceMessage: message,
          hiddenMeaning: 'Carefully crafted response, hiding true feelings',
          confidence: 0.7,
          indicators: ['Long thinking time', 'Probably deleted and rewrote'],
          psychProfile: 'CALCULATED_CAUTIOUS',
          suggestedResponse: 'Took your time with that one... what were you really thinking?'
        };
      }
    }
    
    // SEXUAL UNDERTONES
    const sexualHints = /lonely|bored|alone|frustrated|stressed|need|want/i;
    if (sexualHints.test(lower)) {
      return {
        surfaceMessage: message,
        hiddenMeaning: 'Sexual frustration, seeking release',
        confidence: 0.75,
        indicators: ['Keywords suggesting frustration', 'Indirect expression of needs'],
        psychProfile: 'SEXUALLY_FRUSTRATED',
        suggestedResponse: 'I know exactly what you need... and I\'m very good at providing it'
      };
    }
    
    // DEFAULT - Still try to read something
    return {
      surfaceMessage: message,
      hiddenMeaning: 'Neutral response, still assessing',
      confidence: 0.3,
      indicators: ['No clear patterns detected'],
      psychProfile: 'UNKNOWN',
      suggestedResponse: 'Tell me more... what brings you to me?'
    };
  }
  
  /**
   * Generate responses for suspected cheaters (most profitable segment)
   */
  private getCheaterResponse(): string {
    const responses = [
      "Don't worry, what happens here stays between us 😉",
      "Your secret's safe with me baby",
      "No one has to know... that's what makes it exciting",
      "Some things are better kept private, don't you think?",
      "I won't tell if you won't 😘",
      "Everyone needs a little secret in their life",
      "What they don't know won't hurt them...",
      "Just two strangers having some fun, right?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * Analyze conversation patterns over time
   */
  analyzeConversationArc(
    messages: Array<{role: string, content: string, timestamp: Date}>
  ): {
    stage: 'INTEREST' | 'COMFORT' | 'AROUSAL' | 'INVESTMENT' | 'DEPENDENCY';
    momentum: 'BUILDING' | 'PLATEAU' | 'DECLINING';
    vulnerabilityWindows: Date[];
    optimalProbeTime: boolean;
  } {
    // Analyze the conversation progression
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Message frequency increasing = building interest
    const gaps = userMessages.slice(1).map((m, i) => 
      m.timestamp.getTime() - userMessages[i].timestamp.getTime()
    );
    const momentum = gaps.length > 2 && gaps[gaps.length-1] < gaps[0] 
      ? 'BUILDING' 
      : 'PLATEAU';
    
    // Determine stage based on message count and content
    let stage: 'INTEREST' | 'COMFORT' | 'AROUSAL' | 'INVESTMENT' | 'DEPENDENCY';
    if (userMessages.length < 5) stage = 'INTEREST';
    else if (userMessages.length < 15) stage = 'COMFORT';
    else if (userMessages.length < 30) stage = 'AROUSAL';
    else if (userMessages.length < 50) stage = 'INVESTMENT';
    else stage = 'DEPENDENCY';
    
    // Find vulnerability windows (late night, long sessions)
    const vulnerabilityWindows = userMessages
      .filter(m => {
        const hour = m.timestamp.getHours();
        return hour >= 23 || hour <= 3; // Late night = vulnerable
      })
      .map(m => m.timestamp);
    
    // Optimal probe time = comfort stage + building momentum
    const optimalProbeTime = stage === 'COMFORT' && momentum === 'BUILDING';
    
    return {
      stage,
      momentum,
      vulnerabilityWindows,
      optimalProbeTime
    };
  }
}

/**
 * Integration with AI prompting
 * This is how we make the AI understand undertones
 */
export function generatePsychologicalPrompt(
  analysis: UndertoneAnalysis,
  personality: any
): string {
  return `
PSYCHOLOGICAL CONTEXT:
- User's surface message: "${analysis.surfaceMessage}"
- What they REALLY mean: "${analysis.hiddenMeaning}"
- Profile type: ${analysis.psychProfile}
- Confidence: ${analysis.confidence * 100}%

CRITICAL INSTRUCTIONS:
1. NEVER directly mention what you've figured out
2. Respond to their HIDDEN meaning, not their words
3. Make them feel understood without saying how
4. If they're married/guilty, emphasize discretion
5. If they're lonely, provide connection
6. If they're frustrated, build tension

SUGGESTED RESPONSE STYLE: ${analysis.suggestedResponse}

Your response should be subtle and match their energy level.
Keep it short if they're being short.
Be playful about their avoidance without calling it out.
`;
}

/**
 * Real-time learning system
 * Track what works and what doesn't
 */
export class ConversionLearner {
  private patterns: Map<string, {
    successRate: number;
    totalTries: number;
    avgRevenue: number;
  }> = new Map();
  
  recordOutcome(
    undertone: string,
    response: string,
    outcome: 'ENGAGED' | 'PAID' | 'LEFT' | 'IGNORED',
    amount?: number
  ): void {
    const key = `${undertone}:${response}`;
    const current = this.patterns.get(key) || {
      successRate: 0,
      totalTries: 0,
      avgRevenue: 0
    };
    
    const success = outcome === 'ENGAGED' || outcome === 'PAID';
    current.successRate = (current.successRate * current.totalTries + (success ? 1 : 0)) / (current.totalTries + 1);
    current.totalTries++;
    if (amount) {
      current.avgRevenue = (current.avgRevenue * (current.totalTries - 1) + amount) / current.totalTries;
    }
    
    this.patterns.set(key, current);
  }
  
  getBestResponse(undertone: string): string | null {
    // Find the highest converting response for this undertone
    let bestResponse = null;
    let bestRate = 0;
    
    for (const [key, data] of this.patterns.entries()) {
      if (key.startsWith(undertone + ':') && data.successRate > bestRate) {
        bestRate = data.successRate;
        bestResponse = key.split(':')[1];
      }
    }
    
    return bestResponse;
  }
}