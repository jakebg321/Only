/**
 * Undertone Detector - Reads between the lines
 * Identifies what users REALLY mean, not what they say
 */

export enum UserType {
  MARRIED_GUILTY = 'MARRIED_GUILTY',      // 65% of revenue - treat with discretion
  LONELY_SINGLE = 'LONELY_SINGLE',        // 20% of revenue - provide connection
  HORNY_ADDICT = 'HORNY_ADDICT',         // 10% of revenue - escalate quickly
  CURIOUS_TOURIST = 'CURIOUS_TOURIST',    // 5% of revenue - don't waste time
  UNKNOWN = 'UNKNOWN'                     // Still analyzing
}

export interface UndertoneResult {
  userType: UserType;
  confidence: number;
  indicators: string[];
  hiddenMeaning: string;
  suggestedStrategy: string;
  revenuePotential: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MessageContext {
  message: string;
  previousQuestion?: string;
  messageNumber: number;
  responseTime?: number;  // milliseconds
  typingStops?: number;
  timeOfDay: number;      // hour (0-23)
  sessionDuration?: number; // minutes
}

export class UndertoneDetector {
  /**
   * Main detection function - categorizes user quickly
   */
  detect(context: MessageContext): UndertoneResult {
    const message = context.message.toLowerCase().trim();
    const words = message.split(' ').length;
    
    console.log('🔍 REAL UNDERTONE ANALYSIS STARTING:');
    console.log(`   Input: "${context.message}"`);
    console.log(`   Time: ${context.timeOfDay}:00 | Response: ${context.responseTime}ms | Stops: ${context.typingStops}`);
    console.log(`   Previous Q: "${context.previousQuestion || 'none'}"`);
    
    // Check each pattern type - return highest confidence match
    const marriedCheck = this.checkMarriedGuilty(message, context);
    console.log(`   MARRIED_GUILTY: ${(marriedCheck.confidence * 100).toFixed(0)}% | Indicators: ${marriedCheck.indicators.join(', ') || 'none'}`);
    
    const lonelyCheck = this.checkLonelySingle(message, context);
    console.log(`   LONELY_SINGLE: ${(lonelyCheck.confidence * 100).toFixed(0)}% | Indicators: ${lonelyCheck.indicators.join(', ') || 'none'}`);
    
    const addictCheck = this.checkHornyAddict(message, context);
    console.log(`   HORNY_ADDICT: ${(addictCheck.confidence * 100).toFixed(0)}% | Indicators: ${addictCheck.indicators.join(', ') || 'none'}`);
    
    const touristCheck = this.checkCuriousTourist(message, context);
    console.log(`   CURIOUS_TOURIST: ${(touristCheck.confidence * 100).toFixed(0)}% | Indicators: ${touristCheck.indicators.join(', ') || 'none'}`);
    
    // Return highest confidence result above minimum threshold
    const results = [marriedCheck, lonelyCheck, addictCheck, touristCheck];
    const bestMatch = results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
    
    if (bestMatch.confidence >= 0.3) {
      console.log(`✅ DETECTED: ${bestMatch.userType} (${(bestMatch.confidence * 100).toFixed(0)}%)`);
      return bestMatch;
    }
    
    // Default to unknown
    console.log(`❓ RESULT: UNKNOWN (30%) - no clear patterns detected`);
    return {
      userType: UserType.UNKNOWN,
      confidence: 0.3,
      indicators: ['Still analyzing patterns'],
      hiddenMeaning: 'Need more data to categorize',
      suggestedStrategy: 'Keep conversation going, gather more info',
      revenuePotential: 'MEDIUM'
    };
  }
  
  /**
   * MARRIED_GUILTY Detection (65% of revenue!)
   */
  private checkMarriedGuilty(message: string, context: MessageContext): UndertoneResult {
    const indicators: string[] = [];
    let score = 0;
    
    // AVOIDANCE PATTERNS - Dead giveaway
    if (context.previousQuestion?.includes('bad') || 
        context.previousQuestion?.includes('naughty') ||
        context.previousQuestion?.includes('single')) {
      
      // These responses = married/guilty
      const avoidancePatterns = [
        { pattern: /^idk/i, weight: 0.9, meaning: 'Knows but won\'t admit' },
        { pattern: /^maybe/i, weight: 0.85, meaning: 'Definitely yes' },
        { pattern: /^kinda/i, weight: 0.8, meaning: 'Yes but conflicted' },
        { pattern: /^sometimes/i, weight: 0.75, meaning: 'Regular cheater' },
        { pattern: /complicated/i, weight: 0.9, meaning: 'In a relationship' },
        { pattern: /^not really/i, weight: 0.7, meaning: 'Yes but denying' },
        { pattern: /depends/i, weight: 0.8, meaning: 'Has boundaries being broken' },
        { pattern: /why\?/i, weight: 0.6, meaning: 'Defensive = guilty' },
        { pattern: /^haha|^lol/i, weight: 0.7, meaning: 'Nervous deflection' }
      ];
      
      for (const ap of avoidancePatterns) {
        if (ap.pattern.test(message)) {
          score += ap.weight;
          indicators.push(`Avoidance: "${message}" means "${ap.meaning}"`);
        }
      }
    }
    
    // TIME PATTERNS - Late night = hiding
    if (context.timeOfDay >= 22 || context.timeOfDay <= 2) {
      score += 0.3;
      indicators.push('Late night activity (hiding from spouse)');
    }
    
    // HESITATION PATTERNS
    if (context.responseTime && context.responseTime > 5000) {
      score += 0.2;
      indicators.push('Long hesitation before responding');
    }
    
    if (context.typingStops && context.typingStops > 2) {
      score += 0.2;
      indicators.push('Multiple typing stops (self-censoring)');
    }
    
    // LANGUAGE PATTERNS
    if (message.includes('discrete') || message.includes('private') || 
        message.includes('secret') || message.includes('between us')) {
      score += 0.5;
      indicators.push('Using discretion language');
    }
    
    // AGE INDICATORS (married men are usually older)
    if (message.includes('wife') || message.includes('kids') || 
        message.includes('married')) {
      score += 1.0;
      indicators.push('Directly mentioned marriage');
    }
    
    const confidence = Math.min(score, 1.0);
    
    if (confidence > 0.5) {
      return {
        userType: UserType.MARRIED_GUILTY,
        confidence,
        indicators,
        hiddenMeaning: 'Married, feeling guilty, needs discretion',
        suggestedStrategy: 'Emphasize privacy, be their secret escape, never judge',
        revenuePotential: 'HIGH'
      };
    }
    
    return this.getDefaultResult();
  }
  
  /**
   * LONELY_SINGLE Detection (20% of revenue)
   */
  private checkLonelySingle(message: string, context: MessageContext): UndertoneResult {
    const indicators: string[] = [];
    let score = 0;
    
    // OVERSHARING - Lonely people dump info
    const words = message.split(' ').length;
    if (words > 15) {
      score += 0.4;
      indicators.push('Long message (oversharing = loneliness)');
    }
    
    // EMOTIONAL LANGUAGE
    const lonelyKeywords = [
      'alone', 'lonely', 'nobody', 'understand', 'listen',
      'care', 'bored', 'depressed', 'sad', 'empty',
      'work from home', 'no friends', 'just moved'
    ];
    
    for (const keyword of lonelyKeywords) {
      if (message.includes(keyword)) {
        // "lonely" itself is a strong indicator
        if (keyword === 'lonely') {
          score += 0.5;
          indicators.push(`Strong loneliness indicator: "${keyword}"`);
        } else {
          score += 0.3;
          indicators.push(`Lonely keyword: "${keyword}"`);
        }
      }
    }
    
    // COMBO DETECTION - Multiple loneliness indicators = very high confidence
    if (message.includes('work from home') && message.includes('lonely')) {
      score += 0.3;  // Bonus for combo
      indicators.push('Work from home + lonely combo (classic isolation pattern)');
    }
    
    if (message.includes('months') && message.includes('lonely')) {
      score += 0.2;  // Duration indicator
      indicators.push('Extended loneliness mentioned');
    }
    
    // GREETING PATTERNS - Lonely people are overly polite
    if (message.match(/hi.*how are you/i) || message.match(/hello.*doing/i)) {
      score += 0.3;
      indicators.push('Polite greeting (seeking connection)');
    }
    
    // QUESTION ASKING - Want engagement
    const questionMarks = (message.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      score += 0.2;
      indicators.push('Multiple questions (wants conversation)');
    }
    
    // TIME PATTERNS - All hours = no social life
    if (context.messageNumber > 10 && context.sessionDuration && context.sessionDuration > 30) {
      score += 0.3;
      indicators.push('Long session (no other plans)');
    }
    
    // EMOJI OVERUSE - Trying too hard
    const emojiCount = (message.match(/😊|😅|😂|🥺|😔/g) || []).length;
    if (emojiCount > 2) {
      score += 0.2;
      indicators.push('Multiple emojis (overcompensating)');
    }
    
    const confidence = Math.min(score, 1.0);
    
    if (confidence > 0.5) {
      return {
        userType: UserType.LONELY_SINGLE,
        confidence,
        indicators,
        hiddenMeaning: 'Desperately lonely, needs connection and validation',
        suggestedStrategy: 'Be caring, remember details, check in regularly, GFE',
        revenuePotential: 'MEDIUM'
      };
    }
    
    return this.getDefaultResult();
  }
  
  /**
   * HORNY_ADDICT Detection (10% revenue but highest spend)
   */
  private checkHornyAddict(message: string, context: MessageContext): UndertoneResult {
    const indicators: string[] = [];
    let score = 0;
    
    // INSTANT RESPONSES - No impulse control
    if (context.responseTime && context.responseTime < 2000) {
      score += 0.4;
      indicators.push('Instant response (impulsive/aroused)');
    }
    
    // EXPLICIT LANGUAGE - No boundaries
    const explicitPatterns = [
      'horny', 'hard', 'wet', 'fuck', 'dick', 'pussy', 'tits',
      'show me', 'send me', 'want to see', 'got any', 'more',
      'naked', 'nude', 'xxx', 'cum'
    ];
    
    for (const explicit of explicitPatterns) {
      if (message.includes(explicit)) {
        score += 0.5;
        indicators.push(`Explicit language: "${explicit}"`);
        break;
      }
    }
    
    // DEMANDING LANGUAGE
    if (message.includes('now') || message.includes('hurry') || 
        message.includes('quick') || message.includes('asap')) {
      score += 0.3;
      indicators.push('Impatient/demanding');
    }
    
    // SHORT, DIRECT MESSAGES - Just wants content
    const words = message.split(' ').length;
    if (words < 5 && context.messageNumber > 2) {
      score += 0.2;
      indicators.push('Short, direct (just wants content)');
    }
    
    // MULTIPLE MESSAGES - Can't wait
    if (message.includes('?') && message.includes('??')) {
      score += 0.3;
      indicators.push('Multiple question marks (impatient)');
    }
    
    // ESCALATION REQUESTS
    if (message.includes('more') || message.includes('else') || 
        message.includes('other') || message.includes('special')) {
      score += 0.3;
      indicators.push('Requesting escalation');
    }
    
    const confidence = Math.min(score, 1.0);
    
    if (confidence > 0.5) {
      return {
        userType: UserType.HORNY_ADDICT,
        confidence,
        indicators,
        hiddenMeaning: 'Sex addict, needs constant escalation, will pay for dopamine',
        suggestedStrategy: 'Tease hard, escalate prices quickly, intermittent rewards',
        revenuePotential: 'HIGH'
      };
    }
    
    return this.getDefaultResult();
  }
  
  /**
   * CURIOUS_TOURIST Detection (5% revenue - don't waste time)
   */
  private checkCuriousTourist(message: string, context: MessageContext): UndertoneResult {
    const indicators: string[] = [];
    let score = 0;
    
    // BROWSING LANGUAGE
    if (message.includes('just looking') || message.includes('checking out') ||
        message.includes('new here') || message.includes('first time')) {
      score += 0.5;
      indicators.push('Tourist language');
    }
    
    // PRICE QUESTIONS EARLY
    if (message.includes('how much') || message.includes('cost') || 
        message.includes('price') || message.includes('free')) {
      score += 0.4;
      indicators.push('Asking about price (not committed)');
    }
    
    // CASUAL ENERGY
    if (message === 'hey' || message === 'hi' || message === 'sup') {
      score += 0.3;
      indicators.push('Low effort greeting');
    }
    
    // NO EMOTIONAL INVESTMENT
    if (context.messageNumber > 5 && message.split(' ').length < 5) {
      score += 0.2;
      indicators.push('Still sending short messages (not engaged)');
    }
    
    const confidence = Math.min(score, 1.0);
    
    if (confidence >= 0.3) {
      return {
        userType: UserType.CURIOUS_TOURIST,
        confidence,
        indicators,
        hiddenMeaning: 'Just browsing, unlikely to pay significant amounts',
        suggestedStrategy: 'Don\'t invest much time, quick pitch or move on',
        revenuePotential: 'LOW'
      };
    }
    
    return this.getDefaultResult();
  }
  
  private getDefaultResult(): UndertoneResult {
    return {
      userType: UserType.UNKNOWN,
      confidence: 0,
      indicators: [],
      hiddenMeaning: '',
      suggestedStrategy: '',
      revenuePotential: 'MEDIUM'
    };
  }
  
  /**
   * Get recommended response based on user type
   */
  getResponseStrategy(userType: UserType): {
    tone: string;
    length: 'short' | 'medium' | 'long';
    keywords: string[];
    avoid: string[];
    example: string;
  } {
    switch (userType) {
      case UserType.MARRIED_GUILTY:
        return {
          tone: 'discrete and understanding',
          length: 'short',
          keywords: ['secret', 'between us', 'private', 'nobody has to know', 'discrete'],
          avoid: ['wife', 'married', 'cheating', 'guilt'],
          example: "Don't worry baby, what happens here stays between us 😉"
        };
        
      case UserType.LONELY_SINGLE:
        return {
          tone: 'caring and attentive',
          length: 'medium',
          keywords: ['thinking of you', 'special', 'care about', 'here for you'],
          avoid: ['alone', 'lonely', 'sad'],
          example: "Aww baby, I've been thinking about you today. How was work?"
        };
        
      case UserType.HORNY_ADDICT:
        return {
          tone: 'teasing and explicit',
          length: 'short',
          keywords: ['naughty', 'bad', 'show you', 'want to see'],
          avoid: ['relationship', 'feelings', 'connection'],
          example: "Mmm someone's eager... want to see what I'm wearing? 😈"
        };
        
      case UserType.CURIOUS_TOURIST:
        return {
          tone: 'professional and direct',
          length: 'short',
          keywords: ['exclusive content', 'subscribers', 'special price'],
          avoid: ['personal details', 'emotional connection'],
          example: "Hey! Check out my exclusive content - special price today only"
        };
        
      default:
        return {
          tone: 'friendly and flirty',
          length: 'medium',
          keywords: ['sexy', 'fun', 'excited'],
          avoid: ['boring', 'AI', 'bot'],
          example: "Hey sexy, tell me what's on your mind?"
        };
    }
  }
}