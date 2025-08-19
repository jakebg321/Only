// Type definitions for psychological profiling system

export interface BehaviorData {
  responseTime?: number; // in milliseconds
  messageLength?: number;
  typingStops?: number;
  timeOfDay?: number; // hour of day (0-23)
  hesitationLevel?: number; // 0-1 scale
  engagementLevel?: number; // 0-100 scale
  emotionalTone?: 'positive' | 'negative' | 'neutral';
  urgency?: 'low' | 'medium' | 'high';
  sessionDuration?: number; // in minutes
  messageFrequency?: number; // messages per minute
}

export interface ProfileInsights {
  loneliness?: number; // 0-100
  validation_seeking?: number; // 0-100
  relationship_issues?: number; // 0-100
  self_esteem?: number; // 0-100
  sexual_frustration?: number; // 0-100
  financial_capacity?: number; // 0-100
  impulsivity?: number; // 0-100
  emotional_stability?: number; // 0-100
}

export interface ProbeQuestion {
  id: string;
  question: string;
  category: 'vulnerability' | 'ego' | 'attachment' | 'leverage' | 'financial';
  phase: 1 | 2 | 3;
  triggerWords?: string[];
  expectedResponses?: string[];
}

export interface ProfileAnalysis {
  confidence: number; // 0-1
  dataPoints: number;
  recommendedStrategy: string;
  conversionProbability: number; // 0-1
  estimatedValue: number; // predicted monthly revenue
  keyInsights: string[];
  recommendations: string[];
}

export interface TypingMetrics {
  startTime: Date | null;
  currentLength: number;
  stops: number;
  totalTime: number; // milliseconds
  averageSpeed: number; // characters per minute
}

export interface UserEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
  userId: string;
  sessionId?: string;
}

export interface ConversionStrategy {
  approach: 'soft' | 'medium' | 'aggressive';
  timing: 'immediate' | 'delayed' | 'gradual';
  offers: string[];
  pricePoints: number[];
  psychologicalTriggers: string[];
  conversionProbability: number;
}

// API Request/Response types
export interface InitProfileRequest {
  userId: string;
}

export interface InitProfileResponse {
  success: boolean;
  profile: any; // TODO: Replace with proper Prisma generated type
  error?: string;
}

export interface AnalyzeResponseRequest {
  userId: string;
  probeId: string;
  response: string;
}

export interface AnalyzeResponseResponse {
  success: boolean;
  analysis: ProfileAnalysis;
  error?: string;
}

export interface TrackBehaviorRequest {
  userId: string;
  behaviorData: BehaviorData;
}

export interface TrackBehaviorResponse {
  success: boolean;
  result: any; // TODO: Replace with proper result type
  error?: string;
}