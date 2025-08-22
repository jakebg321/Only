/**
 * Memory Manager - Grok-Powered User Profiles
 * Intelligently maintains user context through conversation summaries
 */

import { SecureGrokClient } from './secure-grok-client';
import { ChatMessage } from './unified-chat-engine';

export interface UserProfile {
  userId: string;
  personalSituation?: string;
  personalityType?: string;
  preferences: string[];
  boundaries: string[];
  communicationStyle?: string;
  recentContext?: string;
  lastUpdated: Date;
  messageCount: number;
}

export class MemoryManager {
  private grokClient: SecureGrokClient | null = null;

  constructor() {
    console.log('[MEMORY-MANAGER] 🧠 Using Grok-powered intelligent memory');
    
    // Initialize Grok client for profile management
    if (process.env.GROK_API_KEY) {
      this.grokClient = new SecureGrokClient(process.env.GROK_API_KEY);
    }
  }

  /**
   * Get user profile from database
   */
  async getUserProfile(userId: string, prisma: any): Promise<UserProfile | null> {
    try {
      // Try to find existing user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          profile: true,
          createdAt: true
        }
      });

      if (user && user.profile) {
        return user.profile as UserProfile;
      }

      // Return default profile if none exists
      return {
        userId,
        preferences: [],
        boundaries: [],
        lastUpdated: new Date(),
        messageCount: 0
      };

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile using Grok's intelligence
   * Called every 10 messages to maintain context
   */
  async updateUserProfile(
    userId: string, 
    conversationHistory: ChatMessage[],
    currentProfile: UserProfile | null,
    prisma: any
  ): Promise<UserProfile | null> {
    if (!this.grokClient) {
      console.warn('[MEMORY-MANAGER] ⚠️ No Grok client available for profile updates');
      return currentProfile;
    }

    try {
      // Get last 10 messages for analysis
      const recentMessages = conversationHistory.slice(-10);
      const messageText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

      // Build prompt for Grok to analyze conversation
      const analysisPrompt = `
Analyze this conversation and update the user profile with important information.

Current Profile: ${JSON.stringify(currentProfile || {}, null, 2)}

Recent Conversation:
${messageText}

Please identify and update:
1. Personal situation (married, job, lifestyle)
2. Personality type (MARRIED_GUILTY, LONELY_SINGLE, HORNY_ADDICT, CURIOUS_TOURIST)
3. Content preferences 
4. Boundaries or concerns mentioned
5. Communication style that works
6. Recent context or mood

Return ONLY a JSON object with the updated profile, or "no changes" if no significant updates needed.

Focus on information that will help personalize future conversations and improve user experience.
      `.trim();

      console.log('[MEMORY-MANAGER] 🤖 Asking Grok to analyze user profile...');

      // For now, skip Grok analysis and return a simple updated profile
      // TODO: Implement proper Grok analysis once we have the correct method
      const updatedProfile: UserProfile = {
        userId,
        personalSituation: currentProfile?.personalSituation,
        personalityType: currentProfile?.personalityType,
        preferences: currentProfile?.preferences || [],
        boundaries: currentProfile?.boundaries || [],
        communicationStyle: currentProfile?.communicationStyle,
        recentContext: `Recent conversation with ${recentMessages.length} messages`,
        lastUpdated: new Date(),
        messageCount: (currentProfile?.messageCount || 0) + recentMessages.length
      };
      
      console.log('[MEMORY-MANAGER] ⚠️ Using simplified profile update (Grok analysis disabled for now)');

      // Save updated profile to database
      await prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: `temp_${userId}@temp.com`, // Temporary email for chat-only users
          passwordHash: 'temp',
          role: 'SUBSCRIBER',
          profile: updatedProfile
        },
        update: {
          profile: updatedProfile
        }
      });

      console.log('[MEMORY-MANAGER] ✅ Updated user profile:', {
        personalityType: updatedProfile.personalityType,
        preferences: updatedProfile.preferences.length,
        boundaries: updatedProfile.boundaries.length
      });

      return updatedProfile;

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Failed to update user profile:', error);
      return currentProfile;
    }
  }

  /**
   * Get contextual memory for chat response
   * Returns user profile + recent context
   */
  async getContextualMemory(
    userId: string, 
    conversationHistory: ChatMessage[],
    prisma: any
  ): Promise<string> {
    try {
      const profile = await this.getUserProfile(userId, prisma);
      
      if (!profile) {
        return 'New user - no previous context available.';
      }

      // Build contextual summary
      const contextParts = [];
      
      if (profile.personalSituation) {
        contextParts.push(`Personal situation: ${profile.personalSituation}`);
      }
      
      if (profile.personalityType) {
        contextParts.push(`Personality type: ${profile.personalityType}`);
      }
      
      if (profile.preferences.length > 0) {
        contextParts.push(`Preferences: ${profile.preferences.join(', ')}`);
      }
      
      if (profile.boundaries.length > 0) {
        contextParts.push(`Boundaries: ${profile.boundaries.join(', ')}`);
      }
      
      if (profile.communicationStyle) {
        contextParts.push(`Communication style: ${profile.communicationStyle}`);
      }
      
      if (profile.recentContext) {
        contextParts.push(`Recent context: ${profile.recentContext}`);
      }

      const contextSummary = contextParts.length > 0 
        ? contextParts.join(' | ')
        : 'No specific context available yet.';

      console.log('[MEMORY-MANAGER] 📋 Retrieved contextual memory for user');
      return contextSummary;

    } catch (error) {
      console.error('[MEMORY-MANAGER] ❌ Failed to get contextual memory:', error);
      return 'Error retrieving user context.';
    }
  }

  /**
   * Check if profile needs updating (every 10 messages)
   */
  shouldUpdateProfile(messageCount: number): boolean {
    return messageCount > 0 && messageCount % 10 === 0;
  }
}