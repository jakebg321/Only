/**
 * AGGREGATION SERVICE - SERVER-SIDE ONLY
 * 
 * ⚠️ WARNING: This file imports Prisma and uses Node.js APIs
 * Only use in:
 * - API routes (/app/api/**/route.ts)
 * - Server components (without 'use client')
 * - Cron jobs
 * 
 * DO NOT import in client components or middleware
 */
import prisma from '@/lib/prisma-singleton';

export class AggregationService {
  /**
   * Aggregate user metrics from sessions and events
   * Should be run hourly or daily via cron job
   */
  static async aggregateUserMetrics() {
    console.log('[Aggregation] Starting user metrics aggregation...');
    
    try {
      // Get all users with recent activity
      const recentSessions = await prisma.userSession.findMany({
        where: {
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          },
          userId: {
            not: null
          }
        }
      });
      
      // Group sessions by user
      const userSessions = recentSessions.reduce((acc, session) => {
        if (session.userId) {
          acc[session.userId] = acc[session.userId] || [];
          acc[session.userId].push(session);
        }
        return acc;
      }, {} as Record<string, typeof recentSessions>);
      
      // Update metrics for each user
      for (const [userId, sessions] of Object.entries(userSessions)) {
        const totalSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgSessionLength = Math.round(totalSessionTime / sessions.length);
        
        // Count messages from events
        const messageCount = await prisma.eventLog.count({
          where: {
            userId,
            eventType: 'message.sent',
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        });
        
        await prisma.userMetrics.upsert({
          where: { userId },
          create: {
            userId,
            totalVisits: sessions.length,
            totalSessionTime,
            avgSessionLength,
            totalMessages: messageCount,
            lastVisit: new Date()
          },
          update: {
            totalVisits: { increment: sessions.length },
            totalSessionTime: { increment: totalSessionTime },
            avgSessionLength,
            totalMessages: { increment: messageCount },
            lastVisit: new Date()
          }
        });
      }
      
      console.log(`[Aggregation] Updated metrics for ${Object.keys(userSessions).length} users`);
    } catch (error) {
      console.error('[Aggregation] Error aggregating user metrics:', error);
    }
  }
  
  /**
   * Calculate engagement scores based on user behavior
   */
  static async calculateEngagementScores() {
    console.log('[Aggregation] Calculating engagement scores...');
    
    try {
      const users = await prisma.userMetrics.findMany();
      
      for (const user of users) {
        // Calculate engagement score (0-100) based on multiple factors
        const factors = {
          messages: Math.min(user.totalMessages / 100, 1) * 30, // 30% weight
          sessions: Math.min(user.totalVisits / 10, 1) * 20, // 20% weight
          duration: Math.min(user.avgSessionLength / 1800, 1) * 25, // 25% weight (30 min = perfect)
          purchases: Math.min(user.purchaseCount / 5, 1) * 25 // 25% weight
        };
        
        const engagementScore = Object.values(factors).reduce((a, b) => a + b, 0);
        
        // Calculate churn risk (inverse of engagement)
        const daysSinceLastVisit = Math.floor(
          (Date.now() - user.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        let churnRisk = 0;
        if (daysSinceLastVisit > 30) churnRisk = 0.9;
        else if (daysSinceLastVisit > 14) churnRisk = 0.6;
        else if (daysSinceLastVisit > 7) churnRisk = 0.3;
        else if (engagementScore < 30) churnRisk = 0.4;
        
        await prisma.userMetrics.update({
          where: { userId: user.userId },
          data: { 
            engagementScore,
            churnRisk
          }
        });
      }
      
      console.log(`[Aggregation] Updated engagement scores for ${users.length} users`);
    } catch (error) {
      console.error('[Aggregation] Error calculating engagement scores:', error);
    }
  }
  
  /**
   * Analyze personality detection accuracy and effectiveness
   */
  static async analyzePersonalityEffectiveness() {
    console.log('[Aggregation] Analyzing personality effectiveness...');
    
    try {
      // Get revenue by personality type
      const personalityRevenue = await prisma.revenueEvent.groupBy({
        by: ['personalityType'],
        where: {
          personalityType: {
            not: null
          }
        },
        _sum: {
          amount: true
        },
        _avg: {
          confidence: true
        },
        _count: {
          _all: true
        }
      });
      
      // Calculate conversion rates by personality
      for (const personality of personalityRevenue) {
        const totalUsersWithPersonality = await prisma.psychologicalProfile.count({
          where: {
            vulnerability: personality.personalityType // This needs adjustment based on your schema
          }
        });
        
        const conversionRate = totalUsersWithPersonality > 0
          ? (personality._count._all / totalUsersWithPersonality * 100)
          : 0;
        
        console.log(`[Aggregation] ${personality.personalityType}: 
          Revenue: $${personality._sum.amount}, 
          Conversions: ${personality._count._all}, 
          Rate: ${conversionRate.toFixed(2)}%,
          Avg Confidence: ${personality._avg.confidence?.toFixed(2) || 0}`
        );
      }
    } catch (error) {
      console.error('[Aggregation] Error analyzing personality effectiveness:', error);
    }
  }
  
  /**
   * Clean up old sessions and events
   */
  static async cleanupOldData(daysToKeep: number = 90) {
    console.log(`[Aggregation] Cleaning up data older than ${daysToKeep} days...`);
    
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      // Delete old event logs
      const deletedEvents = await prisma.eventLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });
      
      // Delete old sessions
      const deletedSessions = await prisma.userSession.deleteMany({
        where: {
          startTime: {
            lt: cutoffDate
          }
        }
      });
      
      console.log(`[Aggregation] Cleaned up ${deletedEvents.count} events and ${deletedSessions.count} sessions`);
    } catch (error) {
      console.error('[Aggregation] Error cleaning up old data:', error);
    }
  }
  
  /**
   * Run all aggregation tasks
   */
  static async runAll() {
    console.log('[Aggregation] Starting full aggregation run...');
    const startTime = Date.now();
    
    await this.aggregateUserMetrics();
    await this.calculateEngagementScores();
    await this.analyzePersonalityEffectiveness();
    
    const duration = Date.now() - startTime;
    console.log(`[Aggregation] Completed in ${duration}ms`);
  }
}