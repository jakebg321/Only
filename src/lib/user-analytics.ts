/**
 * User Analytics Engine - Track Psychological Behavior
 * Collects data for advanced psychological profiling
 */

export interface UserBehaviorEvent {
  userId: string;
  eventType: 'message_sent' | 'payment_viewed' | 'payment_attempted' | 'payment_completed' | 'content_viewed' | 'typing_started' | 'typing_stopped' | 'page_focus' | 'page_blur';
  timestamp: Date;
  sessionId: string;
  data?: any;
}

export interface TypingBehavior {
  startTime: Date;
  endTime?: Date;
  messageLength: number;
  hesitationCount: number; // how many times they started/stopped typing
  finalMessage?: string;
  timeToSend: number; // total time from start typing to send
}

export interface PaymentBehavior {
  userId: string;
  offerShown: Date;
  offerType: string;
  amount: number;
  timeViewed: number; // how long they looked at the offer
  clickedPayment: boolean;
  completedPayment: boolean;
  timeToDecision: number;
  hesitationClicks: number; // clicked away and back
  finalDecision: 'purchased' | 'abandoned' | 'postponed';
}

export interface ConversationPsychology {
  userId: string;
  sessionId: string;
  totalMessages: number;
  averageResponseTime: number;
  emotionalTone: 'excited' | 'hesitant' | 'eager' | 'resistant' | 'confused';
  spendingSignals: {
    priceQuestions: number;
    valueQuestions: number;
    urgencyResponse: boolean;
    scarcityResponse: boolean;
  };
  vulnerabilityIndicators: {
    lonelinessSignals: number;
    validationSeeking: number;
    relationshipMentions: number;
    selfEsteemIndicators: number;
  };
}

class UserAnalyticsEngine {
  private events: UserBehaviorEvent[] = [];
  private typingSessions: Map<string, TypingBehavior> = new Map();
  private paymentSessions: Map<string, PaymentBehavior> = new Map();

  // Track user events
  trackEvent(event: UserBehaviorEvent) {
    this.events.push(event);
    
    // Process specific event types
    switch (event.eventType) {
      case 'typing_started':
        this.handleTypingStart(event);
        break;
      case 'typing_stopped':
        this.handleTypingStop(event);
        break;
      case 'payment_viewed':
        this.handlePaymentView(event);
        break;
      case 'payment_attempted':
        this.handlePaymentAttempt(event);
        break;
      case 'payment_completed':
        this.handlePaymentComplete(event);
        break;
    }
    
    // Send to analytics service (dummy for now)
    this.sendToAnalytics(event);
  }

  // Analyze typing patterns for hesitation/psychology
  private handleTypingStart(event: UserBehaviorEvent) {
    const sessionKey = `${event.userId}_${event.sessionId}`;
    
    if (this.typingSessions.has(sessionKey)) {
      // User started typing again - increment hesitation
      const session = this.typingSessions.get(sessionKey)!;
      session.hesitationCount++;
    } else {
      // New typing session
      this.typingSessions.set(sessionKey, {
        startTime: event.timestamp,
        messageLength: 0,
        hesitationCount: 0,
        timeToSend: 0
      });
    }
  }

  private handleTypingStop(event: UserBehaviorEvent) {
    const sessionKey = `${event.userId}_${event.sessionId}`;
    const session = this.typingSessions.get(sessionKey);
    
    if (session) {
      session.endTime = event.timestamp;
      
      // Calculate hesitation level
      const hesitationLevel = this.calculateHesitationLevel(session);
      
      // Track psychological indicators
      this.trackPsychologicalIndicators(event.userId, {
        hesitationLevel,
        typingDuration: session.endTime.getTime() - session.startTime.getTime(),
        hesitationCount: session.hesitationCount
      });
    }
  }

  // Track payment behavior for conversion optimization
  private handlePaymentView(event: UserBehaviorEvent) {
    const paymentKey = `${event.userId}_${event.data.offerId}`;
    
    this.paymentSessions.set(paymentKey, {
      userId: event.userId,
      offerShown: event.timestamp,
      offerType: event.data.offerType,
      amount: event.data.amount,
      timeViewed: 0,
      clickedPayment: false,
      completedPayment: false,
      timeToDecision: 0,
      hesitationClicks: 0,
      finalDecision: 'abandoned'
    });
  }

  private handlePaymentAttempt(event: UserBehaviorEvent) {
    const paymentKey = `${event.userId}_${event.data.offerId}`;
    const session = this.paymentSessions.get(paymentKey);
    
    if (session) {
      session.clickedPayment = true;
      session.timeToDecision = event.timestamp.getTime() - session.offerShown.getTime();
      session.hesitationClicks++;
    }
  }

  private handlePaymentComplete(event: UserBehaviorEvent) {
    const paymentKey = `${event.userId}_${event.data.offerId}`;
    const session = this.paymentSessions.get(paymentKey);
    
    if (session) {
      session.completedPayment = true;
      session.finalDecision = 'purchased';
      
      // Analyze successful conversion factors
      this.analyzeSuccessfulConversion(session, event.data);
    }
  }

  // Calculate psychological hesitation level
  private calculateHesitationLevel(session: TypingBehavior): number {
    const baseTime = session.endTime!.getTime() - session.startTime.getTime();
    const hesitationScore = session.hesitationCount * 0.2;
    const timeScore = Math.min(baseTime / 30000, 1); // normalize to 30 seconds max
    
    return Math.min(hesitationScore + timeScore, 1);
  }

  // Track psychological indicators for profiling
  private trackPsychologicalIndicators(userId: string, data: any) {
    console.log('Psychological Indicators:', {
      userId,
      timestamp: new Date(),
      indicators: data
    });
  }

  // Analyze what made a conversion successful
  private analyzeSuccessfulConversion(session: PaymentBehavior, data: any) {
    const conversionFactors = {
      timeToDecision: session.timeToDecision,
      hesitationLevel: session.hesitationClicks,
      offerType: session.offerType,
      amount: session.amount,
      psychologicalTriggers: data.triggers || {}
    };
    
    console.log('Successful Conversion Analysis:', conversionFactors);
  }

  // Get user psychological profile
  getUserPsychProfile(userId: string): ConversationPsychology {
    const userEvents = this.events.filter(e => e.userId === userId);
    
    // Analyze patterns
    const avgResponseTime = this.calculateAverageResponseTime(userEvents);
    const emotionalTone = this.detectEmotionalTone(userEvents);
    const spendingSignals = this.analyzeSpendingSignals(userEvents);
    const vulnerabilityIndicators = this.detectVulnerabilityIndicators(userEvents);
    
    return {
      userId,
      sessionId: 'current',
      totalMessages: userEvents.filter(e => e.eventType === 'message_sent').length,
      averageResponseTime: avgResponseTime,
      emotionalTone,
      spendingSignals,
      vulnerabilityIndicators
    };
  }

  // Analyze user response time patterns
  private calculateAverageResponseTime(events: UserBehaviorEvent[]): number {
    const messagePairs = [];
    const messageEvents = events.filter(e => e.eventType === 'message_sent').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    for (let i = 1; i < messageEvents.length; i++) {
      const timeDiff = messageEvents[i].timestamp.getTime() - messageEvents[i-1].timestamp.getTime();
      messagePairs.push(timeDiff);
    }
    
    return messagePairs.length > 0 ? messagePairs.reduce((a, b) => a + b, 0) / messagePairs.length : 0;
  }

  // Detect emotional tone from behavior patterns
  private detectEmotionalTone(events: UserBehaviorEvent[]): ConversationPsychology['emotionalTone'] {
    // Analyze typing patterns, response times, etc.
    const avgResponseTime = this.calculateAverageResponseTime(events);
    
    if (avgResponseTime < 5000) return 'excited';
    if (avgResponseTime > 30000) return 'hesitant';
    return 'eager';
  }

  // Analyze spending behavior signals
  private analyzeSpendingSignals(events: UserBehaviorEvent[]): ConversationPsychology['spendingSignals'] {
    return {
      priceQuestions: 0, // Would analyze message content
      valueQuestions: 0,
      urgencyResponse: false,
      scarcityResponse: false
    };
  }

  // Detect psychological vulnerability indicators
  private detectVulnerabilityIndicators(events: UserBehaviorEvent[]): ConversationPsychology['vulnerabilityIndicators'] {
    return {
      lonelinessSignals: 0, // Would analyze message content/patterns
      validationSeeking: 0,
      relationshipMentions: 0,
      selfEsteemIndicators: 0
    };
  }

  // Send to analytics service
  private sendToAnalytics(event: UserBehaviorEvent) {
    // This would send to real analytics DB
    console.log('Analytics Event:', event);
  }

  // Get conversion optimization suggestions
  getOptimizationSuggestions(userId: string): any {
    const profile = this.getUserPsychProfile(userId);
    
    const suggestions = {
      recommendedOffers: [],
      psychologicalTriggers: [],
      timing: '',
      pricing: '',
      messaging: ''
    };
    
    // Base suggestions on psychological profile
    if (profile.emotionalTone === 'hesitant') {
      suggestions.psychologicalTriggers.push('social_proof', 'scarcity');
      suggestions.pricing = 'lower_price_point';
    }
    
    if (profile.emotionalTone === 'excited') {
      suggestions.psychologicalTriggers.push('urgency', 'exclusivity');
      suggestions.pricing = 'premium_positioning';
    }
    
    return suggestions;
  }
}

// Global analytics instance
export const userAnalytics = new UserAnalyticsEngine();

// Helper functions for easy tracking
export function trackUserEvent(userId: string, eventType: UserBehaviorEvent['eventType'], data?: any) {
  userAnalytics.trackEvent({
    userId,
    eventType,
    timestamp: new Date(),
    sessionId: 'current', // Would be actual session ID
    data
  });
}

export function trackPaymentOffer(userId: string, offer: any) {
  trackUserEvent(userId, 'payment_viewed', {
    offerId: offer.id,
    offerType: offer.type,
    amount: offer.amount,
    triggers: offer.psychologicalTriggers
  });
}

export function trackPaymentAttempt(userId: string, offerId: string) {
  trackUserEvent(userId, 'payment_attempted', { offerId });
}

export function trackPaymentSuccess(userId: string, offerId: string, triggers: any) {
  trackUserEvent(userId, 'payment_completed', { offerId, triggers });
}