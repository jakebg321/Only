/**
 * Database-backed Psychological Profiler
 * Stores user profiles and behavioral data in PostgreSQL
 */

import prisma from '@/lib/prisma-singleton';

export type VulnerabilityType = 'LONELY' | 'NEGLECTED' | 'INADEQUATE' | 'VULNERABLE' | 'UNKNOWN';
export type EgoType = 'HERO' | 'ALPHA' | 'PROVIDER' | 'EXPLORER' | 'UNKNOWN';
export type AttachmentStyle = 'ANXIOUS' | 'AVOIDANT' | 'SECURE' | 'DISORGANIZED' | 'UNKNOWN';
export type LeveragePoint = 'FINANCIAL' | 'EMOTIONAL' | 'SOCIAL' | 'SEXUAL' | 'UNKNOWN';
export type SpenderLevel = 'WHALE' | 'REGULAR' | 'MICRO' | 'UNKNOWN';

export interface PsychologicalProfile {
  id: string;
  userId: string;
  vulnerability: VulnerabilityType;
  ego: EgoType;
  attachment: AttachmentStyle;
  leverage: LeveragePoint;
  spenderLevel: SpenderLevel;
  
  // Behavioral metrics
  responseTime: number;
  hesitationLevel: number;
  engagementScore: number;
  manipulabilityScore: number;
  
  // Profile confidence
  confidence: number;
  dataPoints: number;
  
  // Strategy
  recommendedStrategy: string;
  conversionProbability: number;
  estimatedValue: number;
  
  // Insights
  insights: any;
  keyStatements: string[];
  triggerWords: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileProbe {
  id: string;
  question: string;
  category: 'vulnerability' | 'ego' | 'attachment' | 'leverage' | 'financial';
  phase: number;
  asked: boolean;
  response?: string;
  timestamp?: Date;
}

class DatabaseProfiler {
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
      }
    ]
  };

  /**
   * Initialize profile for new user
   */
  async initializeProfile(userId: string): Promise<PsychologicalProfile> {
    try {
      // Check if profile already exists
      const existing = await prisma.psychologicalProfile.findUnique({
        where: { userId }
      });

      if (existing) {
        return this.mapDbToProfile(existing);
      }

      // For debug users, create user first if needed
      if (userId.startsWith('debug_user_')) {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          // Create debug user
          await prisma.user.create({
            data: {
              id: userId,
              email: `${userId}@debug.local`,
              passwordHash: 'debug_user_no_auth', // Won't be used for actual auth
              role: 'SUBSCRIBER', // Default role for debug users
              isActive: true
            }
          });
        }
      }

      // Create new profile
      const profile = await prisma.psychologicalProfile.create({
        data: {
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
          triggerWords: []
        }
      });

      return this.mapDbToProfile(profile);
    } catch (error) {
      console.error('Error initializing profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<PsychologicalProfile | null> {
    try {
      const profile = await prisma.psychologicalProfile.findUnique({
        where: { userId }
      });

      return profile ? this.mapDbToProfile(profile) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Get next probe question for user
   */
  async getNextProbe(userId: string, messageCount: number): Promise<ProfileProbe | null> {
    try {
      // Get existing probe responses
      const responses = await prisma.probeResponse.findMany({
        where: {
          profile: {
            userId
          }
        }
      });

      const askedProbeIds = responses.map(r => r.probeId);

      // Determine phase
      let phase = 1;
      if (messageCount > 10) phase = 2;
      if (messageCount > 25) phase = 3;

      // Get all probes for current phase
      const allProbes = [
        ...this.probes.phase1,
        ...this.probes.phase2,
        ...this.probes.phase3
      ];

      // Find available probes
      const availableProbes = allProbes.filter(p => 
        !askedProbeIds.includes(p.id) && p.phase <= phase
      );

      if (availableProbes.length === 0) return null;

      // Return random probe
      const probe = availableProbes[Math.floor(Math.random() * Math.min(3, availableProbes.length))];
      
      return {
        ...probe,
        asked: false
      };
    } catch (error) {
      console.error('Error getting next probe:', error);
      return null;
    }
  }

  /**
   * Analyze response to probe question
   */
  async analyzeProbeResponse(userId: string, probeId: string, response: string): Promise<void> {
    try {
      // Get profile
      const profile = await prisma.psychologicalProfile.findUnique({
        where: { userId }
      });

      if (!profile) return;

      // Find the probe
      const allProbes = [...this.probes.phase1, ...this.probes.phase2, ...this.probes.phase3];
      const probe = allProbes.find(p => p.id === probeId);
      if (!probe) return;

      // Save probe response
      await prisma.probeResponse.create({
        data: {
          profileId: profile.id,
          probeId,
          question: probe.question,
          response,
          category: probe.category,
          phase: probe.phase
        }
      });

      // Analyze response and update profile
      const updates = this.analyzeResponse(probeId, response, profile);
      
      await prisma.psychologicalProfile.update({
        where: { id: profile.id },
        data: {
          ...updates,
          dataPoints: profile.dataPoints + 1,
          confidence: Math.min(1, (profile.dataPoints + 1) / 20),
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error analyzing probe response:', error);
    }
  }

  /**
   * Track behavioral data
   */
  async trackBehavior(userId: string, behavior: {
    responseTime?: number;
    messageLength?: number;
    typingStops?: number;
    timeOfDay?: number;
  }): Promise<void> {
    try {
      const profile = await prisma.psychologicalProfile.findUnique({
        where: { userId }
      });

      if (!profile) return;

      // Log behavior event
      await prisma.behaviorEvent.create({
        data: {
          profileId: profile.id,
          eventType: 'typing_behavior',
          data: behavior
        }
      });

      // Update profile metrics
      const updates: any = {};
      
      if (behavior.responseTime) {
        updates.responseTime = (profile.responseTime * profile.dataPoints + behavior.responseTime) / (profile.dataPoints + 1);
        
        if (behavior.responseTime < 30000) {
          updates.engagementScore = Math.min(100, profile.engagementScore + 2);
        }
      }

      if (behavior.typingStops && behavior.typingStops > 2) {
        updates.hesitationLevel = Math.min(1, profile.hesitationLevel + 0.1);
        updates.manipulabilityScore = Math.min(100, profile.manipulabilityScore + 5);
      }

      if (Object.keys(updates).length > 0) {
        await prisma.psychologicalProfile.update({
          where: { id: profile.id },
          data: {
            ...updates,
            updatedAt: new Date()
          }
        });
      }

    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }

  /**
   * Get strategy recommendation
   */
  async getStrategy(userId: string): Promise<any> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return null;

      return {
        strategy: profile.recommendedStrategy,
        confidence: profile.confidence,
        tactics: this.getSpecificTactics(profile),
        estimatedRevenue: profile.estimatedValue,
        conversionProbability: profile.conversionProbability
      };
    } catch (error) {
      console.error('Error getting strategy:', error);
      return null;
    }
  }

  /**
   * Helper methods
   */
  private mapDbToProfile(dbProfile: any): PsychologicalProfile {
    return {
      id: dbProfile.id,
      userId: dbProfile.userId,
      vulnerability: dbProfile.vulnerability,
      ego: dbProfile.ego,
      attachment: dbProfile.attachment,
      leverage: dbProfile.leverage,
      spenderLevel: dbProfile.spenderLevel,
      responseTime: dbProfile.responseTime,
      hesitationLevel: dbProfile.hesitationLevel,
      engagementScore: dbProfile.engagementScore,
      manipulabilityScore: dbProfile.manipulabilityScore,
      confidence: dbProfile.confidence,
      dataPoints: dbProfile.dataPoints,
      recommendedStrategy: dbProfile.recommendedStrategy,
      conversionProbability: dbProfile.conversionProbability,
      estimatedValue: dbProfile.estimatedValue,
      insights: dbProfile.insights || {},
      keyStatements: dbProfile.keyStatements,
      triggerWords: dbProfile.triggerWords,
      createdAt: dbProfile.createdAt,
      updatedAt: dbProfile.updatedAt
    };
  }

  private analyzeResponse(probeId: string, response: string, profile: any): any {
    const lower = response.toLowerCase();
    const updates: any = {};
    const insights = profile.insights || {};

    switch (probeId) {
      case 'relationship_status':
        if (lower.includes('married') || lower.includes('taken')) {
          updates.vulnerability = 'NEGLECTED';
          insights.relationship_issues = 80;
          updates.leverage = 'SOCIAL';
        } else if (lower.includes('single')) {
          updates.vulnerability = 'LONELY';
          insights.loneliness = 70;
        }
        updates.keyStatements = [...(profile.keyStatements || []), `Relationship: ${response}`];
        break;

      case 'power_dynamic':
        if (lower.includes('charge') || lower.includes('control')) {
          updates.ego = 'ALPHA';
          insights.self_esteem = 70;
        } else if (lower.includes('protect') || lower.includes('care')) {
          updates.ego = 'HERO';
          updates.leverage = 'EMOTIONAL';
        } else if (lower.includes('provide') || lower.includes('spoil')) {
          updates.ego = 'PROVIDER';
          updates.leverage = 'FINANCIAL';
          insights.financial_capacity = 75;
        }
        break;

      case 'dream_date':
        if (lower.includes('expensive') || lower.includes('fancy')) {
          updates.spenderLevel = 'WHALE';
          insights.financial_capacity = 90;
          updates.estimatedValue = 500;
        } else if (lower.includes('dinner') || lower.includes('movie')) {
          updates.spenderLevel = 'REGULAR';
          insights.financial_capacity = 60;
          updates.estimatedValue = 100;
        } else if (lower.includes('talk') || lower.includes('simple')) {
          updates.spenderLevel = 'MICRO';
          insights.financial_capacity = 30;
          updates.estimatedValue = 25;
        }
        break;
    }

    if (Object.keys(insights).length > 0) {
      updates.insights = insights;
    }

    return updates;
  }

  private getSpecificTactics(profile: PsychologicalProfile): string[] {
    const tactics = [];
    
    if (profile.vulnerability === 'LONELY') {
      tactics.push('emphasize_connection', 'create_routine_interactions');
    }
    if (profile.ego === 'HERO') {
      tactics.push('request_help', 'show_vulnerability');
    }
    if (profile.attachment === 'ANXIOUS') {
      tactics.push('intermittent_reinforcement', 'validation_withdrawal');
    }
    
    return tactics;
  }
}

// Export singleton instance
export const databaseProfiler = new DatabaseProfiler();

// Helper functions
export async function initProfile(userId: string) {
  return databaseProfiler.initializeProfile(userId);
}

export async function getNextProbe(userId: string, messageCount: number) {
  return databaseProfiler.getNextProbe(userId, messageCount);
}

export async function analyzeResponse(userId: string, probeId: string, response: string) {
  return databaseProfiler.analyzeProbeResponse(userId, probeId, response);
}

export async function trackBehavior(userId: string, behavior: any) {
  return databaseProfiler.trackBehavior(userId, behavior);
}

export async function getProfile(userId: string) {
  return databaseProfiler.getProfile(userId);
}

export async function getStrategy(userId: string) {
  return databaseProfiler.getStrategy(userId);
}