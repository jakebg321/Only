/**
 * Shared Types - Common interfaces used across the chat system
 * Prevents circular dependencies between modules
 */

import { UserType } from './undertone-detector';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  
  // Psychological data
  undertone?: {
    userType: UserType;
    confidence: number;
    hiddenMeaning: string;
  };
  probeId?: string;
  
  // Behavioral data
  responseTime?: number;
  typingStops?: number;
}

