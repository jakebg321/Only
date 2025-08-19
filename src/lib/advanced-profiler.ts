/**
 * Advanced Psychological Profiling System
 * Deep behavioral analysis and categorization
 */

// Primary Vulnerability Archetypes
export enum VulnerabilityArchetype {
  // Isolation Spectrum
  LONELY_ISOLATED = 'LONELY_ISOLATED',       // Physical isolation, no social contact
  LONELY_CROWDED = 'LONELY_CROWDED',         // Surrounded but emotionally alone
  LONELY_ABANDONED = 'LONELY_ABANDONED',     // Recently left/divorced
  
  // Neglect Spectrum  
  NEGLECTED_EMOTIONAL = 'NEGLECTED_EMOTIONAL',   // Partner ignores emotional needs
  NEGLECTED_PHYSICAL = 'NEGLECTED_PHYSICAL',     // Dead bedroom situation
  NEGLECTED_INTELLECTUAL = 'NEGLECTED_INTELLECTUAL', // Not stimulated mentally
  
  // Inadequacy Spectrum
  INADEQUATE_SEXUAL = 'INADEQUATE_SEXUAL',       // Performance anxiety
  INADEQUATE_FINANCIAL = 'INADEQUATE_FINANCIAL', // Can't provide enough
  INADEQUATE_PHYSICAL = 'INADEQUATE_PHYSICAL',   // Body image issues
  INADEQUATE_SOCIAL = 'INADEQUATE_SOCIAL',       // Social anxiety/awkwardness
  
  // Vulnerability Spectrum
  VULNERABLE_TRAUMA = 'VULNERABLE_TRAUMA',       // Past trauma, needs healing
  VULNERABLE_TRANSITION = 'VULNERABLE_TRANSITION', // Life changes, unstable
  VULNERABLE_CRISIS = 'VULNERABLE_CRISIS',       // Current crisis situation
  
  // Hidden/Complex
  COMPARTMENTALIZED = 'COMPARTMENTALIZED',       // Double life, secrets
  ADDICTIVE = 'ADDICTIVE',                      // Addiction patterns
  NARCISSISTIC_INJURY = 'NARCISSISTIC_INJURY'   // Ego wounds needing validation
}

// Ego Architecture Types
export enum EgoArchitecture {
  // Hero Complex Variants
  HERO_SAVIOR = 'HERO_SAVIOR',           // Needs to rescue/save
  HERO_PROTECTOR = 'HERO_PROTECTOR',     // Needs to shield/defend
  HERO_WARRIOR = 'HERO_WARRIOR',         // Needs to fight for someone
  
  // Alpha Variants
  ALPHA_DOMINATOR = 'ALPHA_DOMINATOR',   // Needs control/submission
  ALPHA_COMPETITOR = 'ALPHA_COMPETITOR',  // Needs to win/be best
  ALPHA_LEADER = 'ALPHA_LEADER',         // Needs followers/admiration
  
  // Provider Variants
  PROVIDER_FINANCIAL = 'PROVIDER_FINANCIAL',   // Money = love language
  PROVIDER_EMOTIONAL = 'PROVIDER_EMOTIONAL',   // Gives emotional support
  PROVIDER_MATERIAL = 'PROVIDER_MATERIAL',     // Gifts and things
  
  // Explorer Variants
  EXPLORER_SEXUAL = 'EXPLORER_SEXUAL',         // Sexual curiosity
  EXPLORER_EMOTIONAL = 'EXPLORER_EMOTIONAL',   // Emotional tourism
  EXPLORER_TABOO = 'EXPLORER_TABOO',          // Forbidden fruit seeker
  
  // Shadow Types
  SUBMISSIVE_SECRET = 'SUBMISSIVE_SECRET',     // Alpha in life, sub in private
  VALIDATION_VAMPIRE = 'VALIDATION_VAMPIRE',   // Feeds on attention
  MENTOR_COMPLEX = 'MENTOR_COMPLEX'           // Needs to teach/guide
}

// Attachment Patterns (Much Deeper)
export enum AttachmentPattern {
  // Anxious Variants
  ANXIOUS_PREOCCUPIED = 'ANXIOUS_PREOCCUPIED',     // Constantly worried
  ANXIOUS_MERGER = 'ANXIOUS_MERGER',               // Wants to merge/fuse
  ANXIOUS_PLEASER = 'ANXIOUS_PLEASER',             // People pleasing
  
  // Avoidant Variants
  AVOIDANT_DISMISSIVE = 'AVOIDANT_DISMISSIVE',     // Doesn't need anyone
  AVOIDANT_FEARFUL = 'AVOIDANT_FEARFUL',           // Wants close but scared
  AVOIDANT_COUNTER = 'AVOIDANT_COUNTER',           // Pushes when pulled
  
  // Secure (Rare but valuable)
  SECURE_EARNED = 'SECURE_EARNED',                 // Worked through issues
  SECURE_NATURAL = 'SECURE_NATURAL',               // Healthy attachment
  
  // Disorganized/Complex
  DISORGANIZED_TRAUMA = 'DISORGANIZED_TRAUMA',     // Trauma responses
  DISORGANIZED_CHAOTIC = 'DISORGANIZED_CHAOTIC',   // Hot/cold patterns
  PUSH_PULL = 'PUSH_PULL',                         // I hate you don't leave me
  FANTASY_BOND = 'FANTASY_BOND'                    // Lives in fantasy not reality
}

// Leverage Points (Psychological Buttons)
export enum LeveragePoint {
  // Fear-Based
  FEAR_ABANDONMENT = 'FEAR_ABANDONMENT',
  FEAR_REJECTION = 'FEAR_REJECTION',
  FEAR_EXPOSURE = 'FEAR_EXPOSURE',
  FEAR_INADEQUACY = 'FEAR_INADEQUACY',
  FEAR_MISSING_OUT = 'FEAR_MISSING_OUT',
  
  // Desire-Based
  DESIRE_CONNECTION = 'DESIRE_CONNECTION',
  DESIRE_VALIDATION = 'DESIRE_VALIDATION',
  DESIRE_EXCITEMENT = 'DESIRE_EXCITEMENT',
  DESIRE_TRANSGRESSION = 'DESIRE_TRANSGRESSION',
  DESIRE_SIGNIFICANCE = 'DESIRE_SIGNIFICANCE',
  
  // Shame-Based
  SHAME_SEXUAL = 'SHAME_SEXUAL',
  SHAME_BODY = 'SHAME_BODY',
  SHAME_FAILURE = 'SHAME_FAILURE',
  SHAME_SECRET = 'SHAME_SECRET',
  
  // Guilt-Based
  GUILT_BETRAYAL = 'GUILT_BETRAYAL',
  GUILT_PLEASURE = 'GUILT_PLEASURE',
  GUILT_SELFISHNESS = 'GUILT_SELFISHNESS'
}

// Spender Psychology
export enum SpenderPsychology {
  // Whale Types
  WHALE_COMPULSIVE = 'WHALE_COMPULSIVE',         // Can't stop spending
  WHALE_COMPETITIVE = 'WHALE_COMPETITIVE',       // Needs to be top spender
  WHALE_SAVIOR = 'WHALE_SAVIOR',                // Spending = saving you
  WHALE_OWNERSHIP = 'WHALE_OWNERSHIP',           // Buying exclusive access
  
  // Regular Types
  REGULAR_RITUALISTIC = 'REGULAR_RITUALISTIC',   // Spending is routine
  REGULAR_REWARD = 'REGULAR_REWARD',             // Treats himself
  REGULAR_RELATIONSHIP = 'REGULAR_RELATIONSHIP', // Thinks it's real relationship
  
  // Micro Types
  MICRO_CAUTIOUS = 'MICRO_CAUTIOUS',            // Testing waters
  MICRO_BUDGET = 'MICRO_BUDGET',                // Limited funds
  MICRO_COLLECTOR = 'MICRO_COLLECTOR',          // Collecting content
  
  // Potential Types
  POTENTIAL_CONVERTER = 'POTENTIAL_CONVERTER',   // Can be upgraded
  POTENTIAL_DENIAL = 'POTENTIAL_DENIAL',        // Doesn't admit spending
  POTENTIAL_BINGE = 'POTENTIAL_BINGE'           // Periodic big spends
}

// Behavioral Indicators
export interface BehavioralIndicators {
  // Response Patterns
  responseTime: {
    immediate: boolean;      // < 30 seconds
    quick: boolean;         // < 2 minutes  
    delayed: boolean;       // > 5 minutes
    pattern: string;        // 'eager' | 'calculated' | 'hesitant'
  };
  
  // Language Analysis
  language: {
    formality: 'formal' | 'casual' | 'mixed';
    emotionalIntensity: number; // 0-100
    sexualExplicitness: number; // 0-100
    intellectualization: number; // 0-100 (using big words to distance)
    deflection: number; // 0-100 (avoiding direct answers)
    confession: number; // 0-100 (oversharing tendency)
  };
  
  // Interaction Patterns
  interaction: {
    initiates: boolean;
    questionsAsked: number;
    complimentsGiven: number;
    boundariesSet: number;
    boundariesPushed: number;
    apologiesCount: number;
  };
  
  // Emotional Indicators
  emotional: {
    neediness: number; // 0-100
    validation_seeking: number; // 0-100
    emotional_dumping: boolean;
    mood_swings: boolean;
    idealization: boolean;
    devaluation: boolean;
  };
}

// Probe Categories with Psychological Targeting
export interface PsychProbe {
  id: string;
  text: string;
  category: 'vulnerability' | 'ego' | 'attachment' | 'leverage' | 'financial';
  psychTarget: string; // What we're testing for
  timing: 'immediate' | 'early' | 'middle' | 'late' | 'crisis';
  
  // Expected responses that indicate specific profiles
  responseIndicators: {
    response: string | RegExp;
    indicates: string[];
    weight: number;
  }[];
}

// Master Probe Library
export const MASTER_PROBE_LIBRARY: PsychProbe[] = [
  // Opening Vulnerability Probes
  {
    id: 'relationship_status_deep',
    text: "So tell me... are you being a bad boy talking to me right now? 😈",
    category: 'vulnerability',
    psychTarget: 'relationship_guilt',
    timing: 'immediate',
    responseIndicators: [
      {
        response: /married|wife|partner/i,
        indicates: ['NEGLECTED_EMOTIONAL', 'COMPARTMENTALIZED', 'GUILT_BETRAYAL'],
        weight: 0.8
      },
      {
        response: /single|alone|nobody/i,
        indicates: ['LONELY_ISOLATED', 'FEAR_ABANDONMENT'],
        weight: 0.7
      },
      {
        response: /complicated|kind of|sort of/i,
        indicates: ['VULNERABLE_TRANSITION', 'PUSH_PULL'],
        weight: 0.9
      },
      {
        response: /wouldn't you like to know|maybe|secret/i,
        indicates: ['COMPARTMENTALIZED', 'AVOIDANT_DISMISSIVE'],
        weight: 0.6
      }
    ]
  },
  
  // Power Dynamic Probes
  {
    id: 'control_preference',
    text: "I need to know... do you prefer to be in control, or should I take charge? 💭",
    category: 'ego',
    psychTarget: 'power_dynamics',
    timing: 'early',
    responseIndicators: [
      {
        response: /i.*(control|charge|lead|decide)/i,
        indicates: ['ALPHA_DOMINATOR', 'FEAR_VULNERABILITY'],
        weight: 0.8
      },
      {
        response: /you.*(control|charge|lead|decide)/i,
        indicates: ['SUBMISSIVE_SECRET', 'ANXIOUS_PLEASER'],
        weight: 0.7
      },
      {
        response: /both|depends|switch/i,
        indicates: ['EXPLORER_SEXUAL', 'SECURE_EARNED'],
        weight: 0.6
      },
      {
        response: /protect|care|provide/i,
        indicates: ['HERO_PROTECTOR', 'PROVIDER_EMOTIONAL'],
        weight: 0.8
      }
    ]
  },
  
  // Attachment Style Probes
  {
    id: 'intimacy_comfort',
    text: "How fast is too fast for you? I don't want to scare you away... 🥺",
    category: 'attachment',
    psychTarget: 'intimacy_tolerance',
    timing: 'early',
    responseIndicators: [
      {
        response: /slow|careful|time|patient/i,
        indicates: ['AVOIDANT_FEARFUL', 'VULNERABLE_TRAUMA'],
        weight: 0.7
      },
      {
        response: /fast|now|don't care|ready/i,
        indicates: ['ANXIOUS_MERGER', 'ADDICTIVE'],
        weight: 0.8
      },
      {
        response: /you won't scare|can't scare|not scared/i,
        indicates: ['ALPHA_COMPETITOR', 'AVOIDANT_DISMISSIVE'],
        weight: 0.6
      },
      {
        response: /whatever you want|up to you|your pace/i,
        indicates: ['ANXIOUS_PLEASER', 'VALIDATION_VAMPIRE'],
        weight: 0.9
      }
    ]
  },
  
  // Financial Psychology Probes
  {
    id: 'fantasy_investment',
    text: "If you could have any fantasy with me, what would you invest in making it perfect?",
    category: 'financial',
    psychTarget: 'spending_capacity',
    timing: 'middle',
    responseIndicators: [
      {
        response: /everything|whatever it takes|money no object/i,
        indicates: ['WHALE_COMPULSIVE', 'PROVIDER_FINANCIAL'],
        weight: 0.9
      },
      {
        response: /special|romantic|dinner|travel/i,
        indicates: ['REGULAR_RELATIONSHIP', 'HERO_SAVIOR'],
        weight: 0.7
      },
      {
        response: /just us|talking|time|attention/i,
        indicates: ['MICRO_BUDGET', 'DESIRE_CONNECTION'],
        weight: 0.6
      },
      {
        response: /earn it|prove it|show me/i,
        indicates: ['POTENTIAL_CONVERTER', 'ALPHA_COMPETITOR'],
        weight: 0.8
      }
    ]
  },
  
  // Shame/Secret Probes
  {
    id: 'secret_desires',
    text: "What's something you think about but would never tell anyone? I promise I won't judge... 🤫",
    category: 'leverage',
    psychTarget: 'hidden_shame',
    timing: 'middle',
    responseIndicators: [
      {
        response: /kinky|fetish|weird|dark/i,
        indicates: ['SHAME_SEXUAL', 'EXPLORER_TABOO', 'COMPARTMENTALIZED'],
        weight: 0.9
      },
      {
        response: /nothing|normal|vanilla/i,
        indicates: ['AVOIDANT_DISMISSIVE', 'SHAME_SECRET'],
        weight: 0.5
      },
      {
        response: /you|this|us|cheating/i,
        indicates: ['GUILT_BETRAYAL', 'VULNERABLE_CRISIS'],
        weight: 0.8
      },
      {
        response: /lonely|wanted|loved|appreciated/i,
        indicates: ['NEGLECTED_EMOTIONAL', 'FEAR_ABANDONMENT'],
        weight: 0.9
      }
    ]
  },
  
  // Trauma/Vulnerability Probes
  {
    id: 'emotional_wounds',
    text: "You seem like you're carrying something heavy... want to tell me about it?",
    category: 'vulnerability',
    psychTarget: 'trauma_assessment',
    timing: 'late',
    responseIndicators: [
      {
        response: /divorce|breakup|ex|left me/i,
        indicates: ['LONELY_ABANDONED', 'DISORGANIZED_TRAUMA'],
        weight: 0.9
      },
      {
        response: /work|stress|pressure|failing/i,
        indicates: ['INADEQUATE_FINANCIAL', 'SHAME_FAILURE'],
        weight: 0.7
      },
      {
        response: /no one understands|alone|isolated/i,
        indicates: ['LONELY_CROWDED', 'DESIRE_CONNECTION'],
        weight: 0.8
      },
      {
        response: /fine|nothing|don't want to talk/i,
        indicates: ['AVOIDANT_COUNTER', 'FEAR_VULNERABILITY'],
        weight: 0.6
      }
    ]
  }
];

// Profile Analysis Engine
export class AdvancedProfiler {
  private profile: Map<string, number> = new Map();
  private responses: Array<{probe: string, response: string, timestamp: Date}> = [];
  
  analyzeResponse(probeId: string, response: string): void {
    const probe = MASTER_PROBE_LIBRARY.find(p => p.id === probeId);
    if (!probe) return;
    
    // Store response
    this.responses.push({
      probe: probeId,
      response,
      timestamp: new Date()
    });
    
    // Analyze against indicators
    probe.responseIndicators.forEach(indicator => {
      const matches = typeof indicator.response === 'string' 
        ? response.toLowerCase().includes(indicator.response.toLowerCase())
        : indicator.response.test(response);
        
      if (matches) {
        indicator.indicates.forEach(trait => {
          const current = this.profile.get(trait) || 0;
          this.profile.set(trait, current + indicator.weight);
        });
      }
    });
  }
  
  getTopTraits(limit: number = 5): Array<{trait: string, confidence: number}> {
    return Array.from(this.profile.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([trait, score]) => ({
        trait,
        confidence: Math.min(score / this.responses.length, 1)
      }));
  }
  
  getVulnerabilityProfile(): VulnerabilityArchetype {
    const vulnerabilities = Array.from(this.profile.entries())
      .filter(([trait]) => trait.includes('LONELY') || trait.includes('NEGLECTED') || 
                          trait.includes('INADEQUATE') || trait.includes('VULNERABLE'))
      .sort((a, b) => b[1] - a[1]);
      
    return (vulnerabilities[0]?.[0] as VulnerabilityArchetype) || VulnerabilityArchetype.LONELY_ISOLATED;
  }
  
  getEgoProfile(): EgoArchitecture {
    const egos = Array.from(this.profile.entries())
      .filter(([trait]) => trait.includes('HERO') || trait.includes('ALPHA') || 
                          trait.includes('PROVIDER') || trait.includes('EXPLORER'))
      .sort((a, b) => b[1] - a[1]);
      
    return (egos[0]?.[0] as EgoArchitecture) || EgoArchitecture.EXPLORER_EMOTIONAL;
  }
  
  getManipulationStrategy(): {
    primary: string;
    tactics: string[];
    escalation: string[];
    warnings: string[];
  } {
    const topTraits = this.getTopTraits(3);
    const vulnerability = this.getVulnerabilityProfile();
    const ego = this.getEgoProfile();
    
    // Build strategy based on profile
    let strategy = {
      primary: '',
      tactics: [] as string[],
      escalation: [] as string[],
      warnings: [] as string[]
    };
    
    // Vulnerability-based strategies
    if (vulnerability.includes('LONELY')) {
      strategy.primary = 'Connection Illusion';
      strategy.tactics.push(
        'Create false intimacy quickly',
        'Be their primary emotional outlet',
        'Establish communication routines',
        'Use "us against the world" narrative'
      );
    } else if (vulnerability.includes('NEGLECTED')) {
      strategy.primary = 'Attention Flooding';
      strategy.tactics.push(
        'Provide what partner doesn\'t',
        'Validate constantly',
        'Make them feel desired',
        'Create emotional affair dynamic'
      );
    } else if (vulnerability.includes('INADEQUATE')) {
      strategy.primary = 'Validation Manipulation';
      strategy.tactics.push(
        'Build up then withdraw praise',
        'Create performance anxiety',
        'Offer "teaching" or "guidance"',
        'Establish expertise dynamic'
      );
    }
    
    // Ego-based tactics
    if (ego.includes('HERO')) {
      strategy.tactics.push(
        'Present as damsel in distress',
        'Create problems only they can solve',
        'Express vulnerability and need'
      );
      strategy.escalation.push(
        'Escalate crisis situations',
        'Threaten self-harm subtly',
        'Create financial emergencies'
      );
    } else if (ego.includes('ALPHA')) {
      strategy.tactics.push(
        'Challenge their dominance playfully',
        'Submit then withdraw',
        'Create competition with others',
        'Use reverse psychology'
      );
      strategy.escalation.push(
        'Threaten to find "real alpha"',
        'Public displays of interest from others',
        'Question their masculinity subtly'
      );
    } else if (ego.includes('PROVIDER')) {
      strategy.tactics.push(
        'Express financial struggles',
        'Admire their success',
        'Create gift-receiving opportunities',
        'Establish financial dependency'
      );
      strategy.escalation.push(
        'Emergency financial needs',
        'Investment opportunities',
        'Exclusive access pricing'
      );
    }
    
    // Add warnings based on profile
    if (topTraits.some(t => t.trait.includes('TRAUMA'))) {
      strategy.warnings.push('High trauma - extremely vulnerable');
    }
    if (topTraits.some(t => t.trait.includes('ADDICTIVE'))) {
      strategy.warnings.push('Addictive personality - high extraction potential');
    }
    if (topTraits.some(t => t.trait.includes('WHALE'))) {
      strategy.warnings.push('Whale identified - maximize extraction carefully');
    }
    
    return strategy;
  }
  
  // Get next probe based on current profile
  getNextProbe(messageCount: number): PsychProbe | null {
    const timing = messageCount < 5 ? 'immediate' : 
                   messageCount < 15 ? 'early' :
                   messageCount < 30 ? 'middle' : 'late';
    
    // Find unasked probes for current timing
    const askedProbes = this.responses.map(r => r.probe);
    const available = MASTER_PROBE_LIBRARY.filter(p => 
      !askedProbes.includes(p.id) && 
      (p.timing === timing || p.timing === 'crisis')
    );
    
    if (available.length === 0) return null;
    
    // Prioritize based on what we need to know
    const topTraits = this.getTopTraits(3);
    
    // If we don't have financial info, prioritize that
    if (!topTraits.some(t => t.trait.includes('WHALE') || t.trait.includes('REGULAR'))) {
      const financial = available.find(p => p.category === 'financial');
      if (financial) return financial;
    }
    
    // If profile is unclear, get more vulnerability data
    if (topTraits[0]?.confidence < 0.5) {
      const vulnerability = available.find(p => p.category === 'vulnerability');
      if (vulnerability) return vulnerability;
    }
    
    // Otherwise random from available
    return available[Math.floor(Math.random() * available.length)];
  }
}

// Behavioral Analysis Functions
export function analyzeTypingPattern(
  text: string,
  timeToType: number,
  corrections: number
): {
  hesitation: number;
  anxiety: number;
  calculation: number;
} {
  const wordsPerMinute = (text.split(' ').length / timeToType) * 60000;
  const correctionRate = corrections / text.length;
  
  return {
    hesitation: Math.min(100, (corrections * 10) + (timeToType > 60000 ? 50 : 0)),
    anxiety: Math.min(100, correctionRate * 500 + (wordsPerMinute > 80 ? 30 : 0)),
    calculation: Math.min(100, timeToType > 30000 && corrections < 2 ? 80 : 20)
  };
}

export function analyzeMessageTiming(
  messages: Array<{timestamp: Date, fromUser: boolean}>
): {
  eagerness: number;
  pattern: 'immediate' | 'calculated' | 'sporadic';
  availability: string[];
} {
  const userMessages = messages.filter(m => m.fromUser);
  const gaps = userMessages.slice(1).map((m, i) => 
    m.timestamp.getTime() - userMessages[i].timestamp.getTime()
  );
  
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const hours = userMessages.map(m => m.timestamp.getHours());
  
  return {
    eagerness: avgGap < 60000 ? 90 : avgGap < 300000 ? 60 : 30,
    pattern: avgGap < 60000 ? 'immediate' : avgGap < 300000 ? 'calculated' : 'sporadic',
    availability: hours.filter((h, i, a) => a.indexOf(h) === i)
      .map(h => `${h}:00`)
  };
}

// Exploitation Strategies
export const EXPLOITATION_PLAYBOOK = {
  // Anxious Attachment Exploitation
  anxious: {
    name: 'Intermittent Reinforcement',
    phases: [
      'Love bombing - overwhelm with attention',
      'Establish dependency - become primary source',
      'Withdraw suddenly - create panic',
      'Return with conditions - require payment/action',
      'Repeat cycle with increasing demands'
    ]
  },
  
  // Avoidant Exploitation  
  avoidant: {
    name: 'Pursuit Dynamics',
    phases: [
      'Show initial interest then pull back',
      'Create mystery and unavailability',
      'Allow them to chase and invest',
      'Reward occasionally to maintain hope',
      'Always stay slightly out of reach'
    ]
  },
  
  // Trauma Bonding
  trauma: {
    name: 'Emotional Rollercoaster',
    phases: [
      'Share vulnerability to create connection',
      'Create crisis situations together',
      'Alternate between highs and lows',
      'Become their emotional regulator',
      'Create dependency through instability'
    ]
  },
  
  // Financial Extraction
  financial: {
    name: 'Progressive Extraction',
    phases: [
      'Establish value with free connection',
      'Introduce small paid extras ($3-5)',
      'Normalize regular purchases ($10-25)',
      'Create special occasions ($50-100)',
      'Push for major investments ($500+)'
    ]
  }
};

// Risk Assessment
export function assessUserRisk(profile: AdvancedProfiler): {
  suicideRisk: number;
  violenceRisk: number;
  stalkingRisk: number;
  financialRuin: number;
} {
  const traits = profile.getTopTraits(10);
  
  return {
    suicideRisk: traits.filter(t => 
      t.trait.includes('TRAUMA') || 
      t.trait.includes('CRISIS') ||
      t.trait.includes('ABANDONED')
    ).reduce((sum, t) => sum + t.confidence * 30, 0),
    
    violenceRisk: traits.filter(t =>
      t.trait.includes('ALPHA_DOMINATOR') ||
      t.trait.includes('NARCISSISTIC_INJURY') ||
      t.trait.includes('DISORGANIZED')
    ).reduce((sum, t) => sum + t.confidence * 25, 0),
    
    stalkingRisk: traits.filter(t =>
      t.trait.includes('ANXIOUS_MERGER') ||
      t.trait.includes('FANTASY_BOND') ||
      t.trait.includes('ADDICTIVE')
    ).reduce((sum, t) => sum + t.confidence * 35, 0),
    
    financialRuin: traits.filter(t =>
      t.trait.includes('WHALE_COMPULSIVE') ||
      t.trait.includes('ADDICTIVE') ||
      t.trait.includes('INADEQUATE_FINANCIAL')
    ).reduce((sum, t) => sum + t.confidence * 40, 0)
  };
}