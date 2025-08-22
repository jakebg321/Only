/**
 * EVENT TRACKER - SERVER-SIDE ONLY
 * 
 * ⚠️ WARNING: This file imports Prisma and uses Node.js APIs
 * DO NOT import this file in:
 * - Client components (files with 'use client')
 * - Middleware (runs in Edge Runtime)
 * - Any file that might run in the browser
 * 
 * This should only be used in API routes
 */
import prisma from '@/lib/prisma-singleton';

export class EventTracker {
  static async trackEvent(
    sessionId: string,
    userId: string | null,
    eventType: string,
    eventData: any
  ) {
    try {
      // Log to database
      await prisma.eventLog.create({
        data: {
          sessionId,
          userId,
          eventType,
          eventData: eventData || {},
          timestamp: new Date()
        }
      });
      
      // Update user metrics if user is logged in
      if (userId) {
        await this.updateUserMetrics(userId, eventType, eventData);
      }
      
      // Update session with event
      await this.updateSessionEvent(sessionId, eventType, eventData);
      
      // Special handling for revenue events
      if (eventType.startsWith('payment.')) {
        await this.trackRevenueEvent(userId || '', sessionId, eventType, eventData);
      }
      
      // Special handling for message events
      if (eventType === 'message.sent' && userId) {
        await this.trackMessageEvent(userId, sessionId, eventData);
      }
      
      console.log(`[EventTracker] Tracked: ${eventType} for session ${sessionId}`);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
  
  static async updateUserMetrics(userId: string, eventType: string, data: any) {
    try {
      const metrics = await prisma.userMetrics.findUnique({
        where: { userId }
      });
      
      if (!metrics) {
        await prisma.userMetrics.create({
          data: { userId }
        });
      }
      
      // Update based on event type
      const updates: any = {
        lastVisit: new Date()
      };
      
      switch (eventType) {
        case 'message.sent':
          updates.totalMessages = { increment: 1 };
          break;
        
        case 'session.start':
          updates.totalVisits = { increment: 1 };
          break;
        
        case 'page.view':
          // Track last activity
          break;
        
        case 'personality.detected':
          // Store personality detection confidence
          if (data?.confidence) {
            updates.engagementScore = data.confidence * 100;
          }
          break;
      }
      
      await prisma.userMetrics.update({
        where: { userId },
        data: updates
      });
    } catch (error) {
      console.error('Error updating user metrics:', error);
    }
  }
  
  static async updateSessionEvent(sessionId: string, eventType: string, data: any) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId }
      });
      
      if (session) {
        const events = (session.events as any[]) || [];
        events.push({
          type: eventType,
          data,
          timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events per session
        const trimmedEvents = events.slice(-100);
        
        await prisma.userSession.update({
          where: { sessionId },
          data: {
            events: trimmedEvents,
            endTime: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error updating session event:', error);
    }
  }
  
  static async trackRevenueEvent(
    userId: string,
    sessionId: string,
    eventType: string,
    data: any
  ) {
    if (eventType === 'payment.completed' && data.amount) {
      try {
        await prisma.revenueEvent.create({
          data: {
            userId,
            sessionId,
            amount: data.amount,
            type: data.type || 'subscription',
            personalityType: data.personalityType,
            strategy: data.strategy,
            triggerEvent: data.triggerEvent,
            confidence: data.confidence,
            currency: data.currency || 'USD'
          }
        });
        
        // Update user metrics with revenue
        if (userId) {
          const currentMetrics = await prisma.userMetrics.findUnique({
            where: { userId }
          });
          
          const isFirstPurchase = !currentMetrics?.firstPurchaseAt;
          
          await prisma.userMetrics.update({
            where: { userId },
            data: {
              totalSpent: { increment: data.amount },
              purchaseCount: { increment: 1 },
              lastPurchaseAt: new Date(),
              ...(isFirstPurchase && { firstPurchaseAt: new Date() })
            }
          });
        }
        
        console.log(`[EventTracker] Revenue tracked: $${data.amount} for user ${userId}`);
      } catch (error) {
        console.error('Error tracking revenue event:', error);
      }
    }
  }
  
  static async trackMessageEvent(userId: string, sessionId: string, data: any) {
    try {
      // Update message count in metrics
      await prisma.userMetrics.update({
        where: { userId },
        data: {
          totalMessages: { increment: 1 }
        }
      });
      
      // If response time is provided, update average
      if (data.responseTime) {
        const metrics = await prisma.userMetrics.findUnique({
          where: { userId }
        });
        
        if (metrics) {
          // Calculate new average response time
          const currentAvg = metrics.avgResponseTime;
          const totalMessages = metrics.totalMessages;
          const newAvg = Math.round(
            (currentAvg * (totalMessages - 1) + data.responseTime) / totalMessages
          );
          
          await prisma.userMetrics.update({
            where: { userId },
            data: {
              avgResponseTime: newAvg
            }
          });
        }
      }
    } catch (error) {
      console.error('Error tracking message event:', error);
    }
  }
  
  // Batch tracking for multiple events
  static async trackBatch(events: Array<{
    sessionId: string;
    userId: string | null;
    eventType: string;
    eventData: any;
  }>) {
    try {
      // Create all event logs
      await prisma.eventLog.createMany({
        data: events.map(event => ({
          sessionId: event.sessionId,
          userId: event.userId,
          eventType: event.eventType,
          eventData: event.eventData || {},
          timestamp: new Date()
        }))
      });
      
      // Process each event for metrics updates
      for (const event of events) {
        if (event.userId) {
          await this.updateUserMetrics(event.userId, event.eventType, event.eventData);
        }
      }
      
      console.log(`[EventTracker] Batch tracked: ${events.length} events`);
    } catch (error) {
      console.error('Failed to track batch events:', error);
    }
  }
  
  // Get user's recent events
  static async getUserEvents(userId: string, limit: number = 100) {
    try {
      return await prisma.eventLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }
  
  // Get session events
  static async getSessionEvents(sessionId: string) {
    try {
      return await prisma.eventLog.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching session events:', error);
      return [];
    }
  }
}