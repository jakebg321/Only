/**
 * Psychological System Mapper
 * Maps between 4-type detection system and VEAL profiling framework
 */

import { UserType } from './undertone-detector';
import { 
  VulnerabilityType, 
  EgoType, 
  AttachmentStyle, 
  LeveragePoint,
  SpenderLevel 
} from './database-profiler';

export interface PersonalityMapping {
  userType: UserType;
  veal: {
    vulnerability: VulnerabilityType;
    ego: EgoType;
    attachment: AttachmentStyle;
    leverage: LeveragePoint;
    spenderLevel: SpenderLevel;
  };
  probeStrategy: {
    phase1Focus: 'guilt' | 'loneliness' | 'arousal' | 'curiosity';
    criticalProbes: string[];
    avoidProbes: string[];
  };
  conversionMetrics: {
    averageTimeToPayment: number; // minutes
    averageMonthlySpend: number; // USD
    retentionRate: number; // percentage
    revenueShare: number; // percentage of total
  };
}

export class PsychologicalMapper {
  /**
   * Map 4-type detection to VEAL framework
   */
  mapToVEAL(userType: UserType): PersonalityMapping['veal'] {
    switch (userType) {
      case UserType.MARRIED_GUILTY:
        return {
          vulnerability: 'NEGLECTED',
          ego: 'PROVIDER',
          attachment: 'AVOIDANT',
          leverage: 'EMOTIONAL',
          spenderLevel: 'REGULAR'
        };
        
      case UserType.LONELY_SINGLE:
        return {
          vulnerability: 'LONELY',
          ego: 'HERO',
          attachment: 'ANXIOUS',
          leverage: 'EMOTIONAL',
          spenderLevel: 'MICRO'
        };
        
      case UserType.HORNY_ADDICT:
        return {
          vulnerability: 'INADEQUATE',
          ego: 'ALPHA',
          attachment: 'DISORGANIZED',
          leverage: 'SEXUAL',
          spenderLevel: 'WHALE'
        };
        
      case UserType.CURIOUS_TOURIST:
        return {
          vulnerability: 'UNKNOWN',
          ego: 'EXPLORER',
          attachment: 'SECURE',
          leverage: 'UNKNOWN',
          spenderLevel: 'MICRO'
        };
        
      default:
        return {
          vulnerability: 'UNKNOWN',
          ego: 'UNKNOWN',
          attachment: 'UNKNOWN',
          leverage: 'UNKNOWN',
          spenderLevel: 'UNKNOWN'
        };
    }
  }
  
  /**
   * Get complete personality profile with all mappings
   */
  getCompleteProfile(userType: UserType): PersonalityMapping {
    const veal = this.mapToVEAL(userType);
    
    const profiles: Record<UserType | 'UNKNOWN', PersonalityMapping> = {
      [UserType.MARRIED_GUILTY]: {
        userType: UserType.MARRIED_GUILTY,
        veal,
        probeStrategy: {
          phase1Focus: 'guilt',
          criticalProbes: [
            'relationship_status', // "Are you being a bad boy?"
            'secret_sharing'       // "What would friends think?"
          ],
          avoidProbes: [
            'dream_date' // Too direct about money
          ]
        },
        conversionMetrics: {
          averageTimeToPayment: 45, // minutes
          averageMonthlySpend: 500,
          retentionRate: 75,
          revenueShare: 65
        }
      },
      
      [UserType.LONELY_SINGLE]: {
        userType: UserType.LONELY_SINGLE,
        veal,
        probeStrategy: {
          phase1Focus: 'loneliness',
          criticalProbes: [
            'messaging_frequency',  // "How often should I message?"
            'motivation'           // "What made you talk to me?"
          ],
          avoidProbes: [
            'secret_sharing' // They have nothing to hide
          ]
        },
        conversionMetrics: {
          averageTimeToPayment: 120,
          averageMonthlySpend: 150,
          retentionRate: 60,
          revenueShare: 20
        }
      },
      
      [UserType.HORNY_ADDICT]: {
        userType: UserType.HORNY_ADDICT,
        veal,
        probeStrategy: {
          phase1Focus: 'arousal',
          criticalProbes: [
            'control_preference', // "In charge or control?"
          ],
          avoidProbes: [
            'messaging_frequency', // They don't care
            'motivation'          // Obvious why they're here
          ]
        },
        conversionMetrics: {
          averageTimeToPayment: 15,
          averageMonthlySpend: 1500,
          retentionRate: 40,
          revenueShare: 10
        }
      },
      
      [UserType.CURIOUS_TOURIST]: {
        userType: UserType.CURIOUS_TOURIST,
        veal,
        probeStrategy: {
          phase1Focus: 'curiosity',
          criticalProbes: [], // Don't waste probes
          avoidProbes: [
            'all' // Don't invest time
          ]
        },
        conversionMetrics: {
          averageTimeToPayment: 999, // rarely converts
          averageMonthlySpend: 25,
          retentionRate: 10,
          revenueShare: 5
        }
      },
      
      [UserType.UNKNOWN]: {
        userType: UserType.UNKNOWN,
        veal,
        probeStrategy: {
          phase1Focus: 'curiosity',
          criticalProbes: [
            'relationship_status', // Test for guilt
            'motivation'          // Test for loneliness
          ],
          avoidProbes: []
        },
        conversionMetrics: {
          averageTimeToPayment: 90,
          averageMonthlySpend: 100,
          retentionRate: 30,
          revenueShare: 0
        }
      }
    };
    
    return profiles[userType] || profiles[UserType.UNKNOWN];
  }
  
  /**
   * Analyze probe response to refine personality detection
   */
  analyzeProbeResponse(
    probeId: string, 
    response: string, 
    currentType: UserType
  ): {
    refinedType: UserType;
    confidence: number;
    insights: string[];
  } {
    const lower = response.toLowerCase().trim();
    const insights: string[] = [];
    
    // Relationship status probe analysis
    if (probeId === 'relationship_status') {
      if (lower.includes('idk') || lower.includes('maybe') || lower.includes('complicated')) {
        insights.push('Avoidance pattern detected - likely married/attached');
        return {
          refinedType: UserType.MARRIED_GUILTY,
          confidence: 0.85,
          insights
        };
      }
      if (lower.includes('single') || lower.includes('alone') || lower.includes('nobody')) {
        insights.push('Direct admission of being single');
        return {
          refinedType: UserType.LONELY_SINGLE,
          confidence: 0.75,
          insights
        };
      }
    }
    
    // Motivation probe analysis
    if (probeId === 'motivation') {
      if (lower.includes('lonely') || lower.includes('bored') || lower.includes('talk')) {
        insights.push('Seeking connection and conversation');
        return {
          refinedType: UserType.LONELY_SINGLE,
          confidence: 0.7,
          insights
        };
      }
      if (lower.includes('horny') || lower.includes('hot') || lower.includes('sexy')) {
        insights.push('Sexually motivated');
        return {
          refinedType: UserType.HORNY_ADDICT,
          confidence: 0.75,
          insights
        };
      }
    }
    
    // Control preference probe
    if (probeId === 'control_preference') {
      if (lower.includes('charge') || lower.includes('control') || lower.includes('dominate')) {
        insights.push('Dominant personality - likely alpha type');
        return {
          refinedType: UserType.HORNY_ADDICT,
          confidence: 0.65,
          insights
        };
      }
    }
    
    // No clear refinement, return current
    return {
      refinedType: currentType,
      confidence: 0.5,
      insights: ['No clear patterns in probe response']
    };
  }
  
  /**
   * Get revenue weights for memory prioritization
   */
  getRevenueWeights(): Record<string, number> {
    return {
      [UserType.MARRIED_GUILTY]: 0.65,  // 65% of revenue
      [UserType.LONELY_SINGLE]: 0.20,   // 20% of revenue
      [UserType.HORNY_ADDICT]: 0.10,    // 10% of revenue
      [UserType.CURIOUS_TOURIST]: 0.05, // 5% of revenue
      [UserType.UNKNOWN]: 0.01          // Minimal weight
    };
  }
  
  /**
   * Get revenue optimization strategy based on type
   */
  getRevenueStrategy(userType: UserType): {
    strategy: string;
    pricePoint: string;
    upsellTiming: string;
    retentionTactic: string;
  } {
    const strategies = {
      [UserType.MARRIED_GUILTY]: {
        strategy: 'Emphasize discretion and exclusivity',
        pricePoint: '$50-200 per interaction',
        upsellTiming: 'After establishing trust (message 10-15)',
        retentionTactic: 'Regular "thinking of you" messages, maintain secrecy narrative'
      },
      
      [UserType.LONELY_SINGLE]: {
        strategy: 'Build emotional connection, GFE (girlfriend experience)',
        pricePoint: '$30-100 monthly subscription',
        upsellTiming: 'After first emotional breakthrough (message 20+)',
        retentionTactic: 'Daily check-ins, remember personal details, celebrate milestones'
      },
      
      [UserType.HORNY_ADDICT]: {
        strategy: 'Rapid escalation, exclusive content tiers',
        pricePoint: '$100-500 for premium content',
        upsellTiming: 'Immediately when arousal peaks (message 5-10)',
        retentionTactic: 'Intermittent rewards, new content alerts, create FOMO'
      },
      
      [UserType.CURIOUS_TOURIST]: {
        strategy: 'Quick conversion attempt then move on',
        pricePoint: '$10-25 introductory offer',
        upsellTiming: 'One-time offer in first 3 messages',
        retentionTactic: 'Don\'t invest in retention'
      },
      
      [UserType.UNKNOWN]: {
        strategy: 'Probe to identify type quickly',
        pricePoint: 'Hold pricing until identified',
        upsellTiming: 'After type identification',
        retentionTactic: 'Varies based on identified type'
      }
    };
    
    return strategies[userType] || strategies[UserType.UNKNOWN];
  }
}

// Export singleton instance
export const psychMapper = new PsychologicalMapper();