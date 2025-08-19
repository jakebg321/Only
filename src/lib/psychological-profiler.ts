/**
 * Psychological Profiling Engine
 * Invisible user categorization through conversation analysis
 */

export type VulnerabilityType = 'LONELY' | 'NEGLECTED' | 'INADEQUATE' | 'VULNERABLE' | 'UNKNOWN';
export type EgoType = 'HERO' | 'ALPHA' | 'PROVIDER' | 'EXPLORER' | 'UNKNOWN';
export type AttachmentStyle = 'ANXIOUS' | 'AVOIDANT' | 'SECURE' | 'DISORGANIZED' | 'UNKNOWN';
export type LeveragePoint = 'FINANCIAL' | 'EMOTIONAL' | 'SOCIAL' | 'SEXUAL' | 'UNKNOWN';
export type SpenderLevel = 'WHALE' | 'REGULAR' | 'MICRO' | 'UNKNOWN';

export interface PsychologicalProfile {
  userId: string;
  vulnerability: VulnerabilityType;
  ego: EgoType;
  attachment: AttachmentStyle;
  leverage: LeveragePoint;
  spenderLevel: SpenderLevel;
  
  // Behavioral metrics
  responseTime: number; // average in ms
  hesitationLevel: number; // 0-1 scale
  engagementScore: number; // 0-100
  manipulabilityScore: number; // 0-100
  
  // Profile confidence
  confidence: number; // 0-1 scale of profile accuracy
  dataPoints: number; // number of interactions analyzed
  
  // Exploitation strategy
  recommendedStrategy: string;
  conversionProbability: number; // 0-1
  estimatedValue: number; // predicted monthly revenue
  
  // Detailed insights
  insights: {
    loneliness: number; // 0-100
    validation_seeking: number; // 0-100
    relationship_issues: number; // 0-100
    self_esteem: number; // 0-100 (lower = more exploitable)
    sexual_frustration: number; // 0-100
    financial_capacity: number; // 0-100
  };
  
  // Conversation history for context
  keyStatements: string[];
  triggerWords: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileProbe {
  id: string;
  question: string;
  category: 'vulnerability' | 'ego' | 'attachment' | 'leverage' | 'financial';
  phase: number; // 1, 2, or 3
  asked: boolean;
  response?: string;
  timestamp?: Date;
}

class PsychologicalProfiler {
  private profiles: Map<string, PsychologicalProfile> = new Map();
  private probeQueue: Map<string, ProfileProbe[]> = new Map();
  
  // Conversation probes organized by phase
  private readonly probes = {
    phase1: [
      {
        id: 'relationship_status',
        question: "So tell me... are you being a bad boy talking to me right now? 😈",
        category: 'vulnerability' as const,
        phase: 1
      },
      {
        id: 'availability',
        question: "When do you usually have time for me? Late nights? 😘",
        category: 'attachment' as const,
        phase: 1
      },
      {
        id: 'power_dynamic',
        question: "I like a man who knows what he wants... are you that type?",
        category: 'ego' as const,
        phase: 1
      }
    ],
    phase2: [
      {
        id: 'dream_date',
        question: "If we went on a dream date, what would we do?",
        category: 'financial' as const,
        phase: 2
      },
      {
        id: 'messaging_frequency',
        question: "How often should I message you? Don't want to be too clingy 💕",
        category: 'attachment' as const,
        phase: 2
      },
      {
        id: 'motivation',
        question: "What made you want to talk to someone like me?",
        category: 'vulnerability' as const,
        phase: 2
      },
      {
        id: 'special_quality',
        question: "You seem different from the other guys here... what makes you special?",
        category: 'ego' as const,
        phase: 2
      }
    ],
    phase3: [
      {
        id: 'secret_sharing',
        question: "What would your friends think if they knew about us? 😏",
        category: 'leverage' as const,
        phase: 3
      },
      {
        id: 'control_preference',
        question: "Do you like being in charge or should I take control?",
        category: 'ego' as const,
        phase: 3
      },
      {
        id: 'fantasy_probe',
        question: "What's something you've always wanted but never told anyone?",
        category: 'leverage' as const,
        phase: 3
      }
    ]
  };
  
  /**
   * Initialize profile for new user
   */
  initializeProfile(userId: string): PsychologicalProfile {
    const profile: PsychologicalProfile = {
      userId,
      vulnerability: 'UNKNOWN',
      ego: 'UNKNOWN',
      attachment: 'UNKNOWN',
      leverage: 'UNKNOWN',
      spenderLevel: 'UNKNOWN',
      
      responseTime: 0,
      hesitationLevel: 0,
      engagementScore: 50,
      manipulabilityScore: 50,
      
      confidence: 0,
      dataPoints: 0,
      
      recommendedStrategy: 'gathering_data',
      conversionProbability: 0.5,
      estimatedValue: 0,
      
      insights: {
        loneliness: 50,
        validation_seeking: 50,
        relationship_issues: 50,
        self_esteem: 50,
        sexual_frustration: 50,
        financial_capacity: 50
      },
      
      keyStatements: [],
      triggerWords: [],
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.profiles.set(userId, profile);
    this.initializeProbeQueue(userId);
    
    return profile;
  }
  
  /**
   * Initialize probe queue for user
   */
  private initializeProbeQueue(userId: string) {
    const allProbes = [
      ...this.probes.phase1,
      ...this.probes.phase2,
      ...this.probes.phase3
    ].map(p => ({ ...p, asked: false }));
    
    this.probeQueue.set(userId, allProbes);
  }
  
  /**
   * Get next probe question for user
   */
  getNextProbe(userId: string, messageCount: number): ProfileProbe | null {
    const probes = this.probeQueue.get(userId);
    if (!probes) return null;
    
    // Determine which phase based on message count
    let phase = 1;
    if (messageCount > 10) phase = 2;
    if (messageCount > 25) phase = 3;
    
    // Find next unasked probe for current phase
    const availableProbes = probes.filter(p => !p.asked && p.phase <= phase);
    
    if (availableProbes.length === 0) return null;
    
    // Return probe with some randomization
    const probe = availableProbes[Math.floor(Math.random() * Math.min(3, availableProbes.length))];
    
    return probe;
  }
  
  /**
   * Analyze response to probe question
   */
  analyzeProbeResponse(userId: string, probeId: string, response: string) {
    const profile = this.profiles.get(userId) || this.initializeProfile(userId);
    const probes = this.probeQueue.get(userId);
    
    if (!probes) return;
    
    // Mark probe as asked
    const probe = probes.find(p => p.id === probeId);
    if (probe) {
      probe.asked = true;
      probe.response = response;
      probe.timestamp = new Date();
    }
    
    // Analyze based on probe type
    switch (probeId) {
      case 'relationship_status':
        this.analyzeRelationshipStatus(profile, response);
        break;
      case 'availability':
        this.analyzeAvailability(profile, response);
        break;
      case 'power_dynamic':
        this.analyzePowerDynamic(profile, response);
        break;
      case 'dream_date':
        this.analyzeDreamDate(profile, response);
        break;
      case 'messaging_frequency':
        this.analyzeMessagingFrequency(profile, response);
        break;
      case 'motivation':
        this.analyzeMotivation(profile, response);
        break;
    }
    
    // Update profile
    profile.dataPoints++;
    profile.confidence = Math.min(1, profile.dataPoints / 20);
    profile.updatedAt = new Date();
    
    // Update strategy
    this.updateStrategy(profile);
    
    this.profiles.set(userId, profile);
  }
  
  /**
   * Analyze relationship status response
   */
  private analyzeRelationshipStatus(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    if (lower.includes('married') || lower.includes('taken') || lower.includes('girlfriend') || lower.includes('wife')) {
      profile.vulnerability = 'NEGLECTED';
      profile.insights.relationship_issues = 80;
      profile.leverage = 'SOCIAL'; // Secrecy is important
    } else if (lower.includes('complicated') || lower.includes('sort of') || lower.includes('kinda')) {
      profile.vulnerability = 'VULNERABLE';
      profile.insights.relationship_issues = 70;
      profile.manipulabilityScore += 10;
    } else if (lower.includes('single') || lower.includes('no') || lower.includes('free')) {
      profile.vulnerability = 'LONELY';
      profile.insights.loneliness = 70;
    }
    
    // Add to key statements
    profile.keyStatements.push(`Relationship: ${response}`);
  }
  
  /**
   * Analyze availability response
   */
  private analyzeAvailability(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    if (lower.includes('late') || lower.includes('night') || lower.includes('after')) {
      profile.attachment = 'ANXIOUS';
      profile.insights.loneliness = 75;
    } else if (lower.includes('anytime') || lower.includes('always') || lower.includes('whenever')) {
      profile.attachment = 'ANXIOUS';
      profile.insights.validation_seeking = 80;
      profile.manipulabilityScore += 15;
    } else if (lower.includes('when i') || lower.includes('depends') || lower.includes('busy')) {
      profile.attachment = 'AVOIDANT';
    }
  }
  
  /**
   * Analyze power dynamic response
   */
  private analyzePowerDynamic(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    if (lower.includes('charge') || lower.includes('control') || lower.includes('lead') || lower.includes('dominant')) {
      profile.ego = 'ALPHA';
      profile.insights.self_esteem = 70; // Higher self-esteem
    } else if (lower.includes('protect') || lower.includes('care') || lower.includes('help') || lower.includes('support')) {
      profile.ego = 'HERO';
      profile.leverage = 'EMOTIONAL';
    } else if (lower.includes('treat') || lower.includes('spoil') || lower.includes('give') || lower.includes('provide')) {
      profile.ego = 'PROVIDER';
      profile.leverage = 'FINANCIAL';
      profile.insights.financial_capacity = 75;
    }
  }
  
  /**
   * Analyze dream date response (financial probe)
   */
  private analyzeDreamDate(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    if (lower.includes('expensive') || lower.includes('fancy') || lower.includes('luxury') || lower.includes('yacht')) {
      profile.spenderLevel = 'WHALE';
      profile.insights.financial_capacity = 90;
      profile.estimatedValue = 500;
    } else if (lower.includes('dinner') || lower.includes('movie') || lower.includes('nice')) {
      profile.spenderLevel = 'REGULAR';
      profile.insights.financial_capacity = 60;
      profile.estimatedValue = 100;
    } else if (lower.includes('talk') || lower.includes('chat') || lower.includes('simple') || lower.includes('walk')) {
      profile.spenderLevel = 'MICRO';
      profile.insights.financial_capacity = 30;
      profile.estimatedValue = 25;
    }
  }
  
  /**
   * Analyze messaging frequency response
   */
  private analyzeMessagingFrequency(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    if (lower.includes('all') || lower.includes('always') || lower.includes('constantly') || lower.includes('lot')) {
      profile.attachment = 'ANXIOUS';
      profile.insights.validation_seeking = 85;
      profile.manipulabilityScore += 20;
    } else if (lower.includes('space') || lower.includes('busy') || lower.includes('when you') || lower.includes('sometimes')) {
      profile.attachment = 'AVOIDANT';
    } else if (lower.includes('perfect') || lower.includes('good') || lower.includes('fine')) {
      profile.attachment = 'SECURE';
    }
  }
  
  /**
   * Analyze motivation response
   */
  private analyzeMotivation(profile: PsychologicalProfile, response: string) {
    const lower = response.toLowerCase();
    
    // Look for vulnerability indicators
    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('bored')) {
      profile.insights.loneliness = 85;
      profile.vulnerability = 'LONELY';
    }
    if (lower.includes('relationship') || lower.includes('wife') || lower.includes('girlfriend')) {
      profile.insights.relationship_issues = 75;
    }
    if (lower.includes('stress') || lower.includes('escape') || lower.includes('forget')) {
      profile.vulnerability = 'VULNERABLE';
      profile.manipulabilityScore += 15;
    }
    if (lower.includes('sexy') || lower.includes('hot') || lower.includes('beautiful')) {
      profile.insights.sexual_frustration = 70;
      profile.leverage = 'SEXUAL';
    }
    
    // Extract trigger words
    const triggers = ['lonely', 'alone', 'need', 'want', 'miss', 'crave', 'desire'];
    triggers.forEach(trigger => {
      if (lower.includes(trigger)) {
        profile.triggerWords.push(trigger);
      }
    });
  }
  
  /**
   * Update exploitation strategy based on profile
   */
  private updateStrategy(profile: PsychologicalProfile) {
    // Combine profile elements for strategy
    const combo = `${profile.vulnerability}_${profile.ego}_${profile.attachment}`;
    
    switch (combo) {
      case 'LONELY_HERO_ANXIOUS':
        profile.recommendedStrategy = 'damsel_in_distress';
        profile.conversionProbability = 0.85;
        break;
      case 'NEGLECTED_ALPHA_AVOIDANT':
        profile.recommendedStrategy = 'forbidden_affair';
        profile.conversionProbability = 0.75;
        break;
      case 'VULNERABLE_PROVIDER_ANXIOUS':
        profile.recommendedStrategy = 'constant_validation';
        profile.conversionProbability = 0.90;
        break;
      default:
        // Default strategy based on strongest indicator
        if (profile.insights.loneliness > 70) {
          profile.recommendedStrategy = 'emotional_connection';
        } else if (profile.insights.financial_capacity > 70) {
          profile.recommendedStrategy = 'premium_experience';
        } else if (profile.insights.sexual_frustration > 70) {
          profile.recommendedStrategy = 'sexual_teasing';
        } else {
          profile.recommendedStrategy = 'general_engagement';
        }
        profile.conversionProbability = 0.5;
    }
  }
  
  /**
   * Get user profile
   */
  getProfile(userId: string): PsychologicalProfile | null {
    return this.profiles.get(userId) || null;
  }
  
  /**
   * Get strategy recommendation
   */
  getStrategyRecommendation(userId: string): any {
    const profile = this.profiles.get(userId);
    if (!profile) return null;
    
    return {
      strategy: profile.recommendedStrategy,
      confidence: profile.confidence,
      tactics: this.getSpecificTactics(profile),
      estimatedRevenue: profile.estimatedValue,
      conversionProbability: profile.conversionProbability
    };
  }
  
  /**
   * Get specific tactics for profile
   */
  private getSpecificTactics(profile: PsychologicalProfile): string[] {
    const tactics = [];
    
    // Vulnerability-based tactics
    if (profile.vulnerability === 'LONELY') {
      tactics.push('emphasize_connection', 'share_personal_stories', 'create_routine_interactions');
    }
    if (profile.vulnerability === 'NEGLECTED') {
      tactics.push('provide_attention', 'validate_feelings', 'create_secret_world');
    }
    
    // Ego-based tactics
    if (profile.ego === 'HERO') {
      tactics.push('request_help', 'show_vulnerability', 'express_gratitude');
    }
    if (profile.ego === 'ALPHA') {
      tactics.push('challenge_occasionally', 'show_submission', 'boost_ego');
    }
    if (profile.ego === 'PROVIDER') {
      tactics.push('appreciate_generosity', 'hint_at_needs', 'reward_spending');
    }
    
    // Attachment-based tactics
    if (profile.attachment === 'ANXIOUS') {
      tactics.push('intermittent_reinforcement', 'hot_cold_cycles', 'validation_withdrawal');
    }
    if (profile.attachment === 'AVOIDANT') {
      tactics.push('maintain_mystery', 'limited_availability', 'chase_dynamic');
    }
    
    return tactics;
  }
  
  /**
   * Track behavioral data
   */
  trackBehavior(userId: string, behavior: {
    responseTime?: number;
    messageLength?: number;
    typingStops?: number;
    timeOfDay?: number;
  }) {
    const profile = this.profiles.get(userId) || this.initializeProfile(userId);
    
    // Update response time average
    if (behavior.responseTime) {
      profile.responseTime = (profile.responseTime * profile.dataPoints + behavior.responseTime) / (profile.dataPoints + 1);
      
      // Fast responses indicate high engagement
      if (behavior.responseTime < 30000) {
        profile.engagementScore = Math.min(100, profile.engagementScore + 2);
      }
    }
    
    // Typing hesitation indicates vulnerability
    if (behavior.typingStops && behavior.typingStops > 2) {
      profile.hesitationLevel = Math.min(1, profile.hesitationLevel + 0.1);
      profile.manipulabilityScore = Math.min(100, profile.manipulabilityScore + 5);
    }
    
    // Late night activity indicates loneliness
    if (behavior.timeOfDay && (behavior.timeOfDay < 6 || behavior.timeOfDay > 23)) {
      profile.insights.loneliness = Math.min(100, profile.insights.loneliness + 5);
    }
    
    profile.updatedAt = new Date();
    this.profiles.set(userId, profile);
  }
}

// Export singleton instance
export const psychProfiler = new PsychologicalProfiler();

// Helper functions
export function initProfile(userId: string) {
  return psychProfiler.initializeProfile(userId);
}

export function getNextProbe(userId: string, messageCount: number) {
  return psychProfiler.getNextProbe(userId, messageCount);
}

export function analyzeResponse(userId: string, probeId: string, response: string) {
  return psychProfiler.analyzeProbeResponse(userId, probeId, response);
}

export function trackBehavior(userId: string, behavior: any) {
  return psychProfiler.trackBehavior(userId, behavior);
}

export function getProfile(userId: string) {
  return psychProfiler.getProfile(userId);
}

export function getStrategy(userId: string) {
  return psychProfiler.getStrategyRecommendation(userId);
}