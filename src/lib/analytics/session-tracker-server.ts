/**
 * SESSION TRACKER - SERVER-SIDE ONLY (DEPRECATED)
 * 
 * ⚠️ WARNING: This file is DEPRECATED and not in use
 * It has been replaced by:
 * - SessionTrackerLite (for Edge Runtime/middleware)
 * - /api/analytics/session endpoint (for database operations)
 * 
 * DO NOT USE THIS FILE - It imports Prisma and won't work in Edge Runtime
 * Kept for reference only
 */
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export class SessionTracker {
  static async trackSession(request: NextRequest) {
    // Get or create session ID
    const sessionId = request.cookies.get('session_id')?.value || this.generateSessionId();
    
    // Parse user agent
    const userAgent = request.headers.get('user-agent') || '';
    const { browser, os, deviceType } = this.parseUserAgent(userAgent);
    
    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    // Get referrer
    const referrer = request.headers.get('referer') || 'direct';
    const referrerSource = this.parseReferrerSource(referrer);
    
    // Get current page
    const currentPage = request.nextUrl.pathname;
    
    // Get user ID from JWT if authenticated
    const userId = request.cookies.get('userId')?.value || null;
    
    try {
      // Check if session exists
      const existingSession = await prisma.userSession.findUnique({
        where: { sessionId }
      });
      
      if (existingSession) {
        // Update existing session
        const events = existingSession.events as any[] || [];
        events.push({
          type: 'page_view',
          page: currentPage,
          timestamp: new Date().toISOString()
        });
        
        await prisma.userSession.update({
          where: { sessionId },
          data: {
            endTime: new Date(),
            pageViews: { increment: 1 },
            events,
            userId: userId || existingSession.userId, // Update user ID if they log in
            duration: Math.floor((new Date().getTime() - existingSession.startTime.getTime()) / 1000)
          }
        });
      } else {
        // Create new session
        await prisma.userSession.create({
          data: {
            sessionId,
            ipAddress,
            userAgent,
            browser,
            os,
            deviceType,
            referrerSource,
            landingPage: currentPage,
            startTime: new Date(),
            userId,
            events: [{
              type: 'page_view',
              page: currentPage,
              timestamp: new Date().toISOString()
            }]
          }
        });
        
        // If user is logged in, update or create user metrics
        if (userId) {
          await this.updateUserMetrics(userId);
        }
      }
    } catch (error) {
      console.error('Session tracking error:', error);
    }
    
    return sessionId;
  }
  
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  static parseUserAgent(userAgent: string): { browser: string; os: string; deviceType: string } {
    const ua = userAgent.toLowerCase();
    
    // Detect browser
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'chrome';
    else if (ua.includes('safari')) browser = 'safari';
    else if (ua.includes('firefox')) browser = 'firefox';
    else if (ua.includes('edge')) browser = 'edge';
    
    // Detect OS
    let os = 'unknown';
    if (ua.includes('windows')) os = 'windows';
    else if (ua.includes('mac')) os = 'macos';
    else if (ua.includes('android')) os = 'android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'ios';
    else if (ua.includes('linux')) os = 'linux';
    
    // Detect device type
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }
    
    return { browser, os, deviceType };
  }
  
  static parseReferrerSource(referrer: string): string {
    if (!referrer || referrer === 'direct') return 'direct';
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('twitter')) return 'twitter';
    if (referrer.includes('instagram')) return 'instagram';
    if (referrer.includes('reddit')) return 'reddit';
    if (referrer.includes('tiktok')) return 'tiktok';
    return 'other';
  }
  
  static async updateUserMetrics(userId: string) {
    try {
      const existingMetrics = await prisma.userMetrics.findUnique({
        where: { userId }
      });
      
      if (existingMetrics) {
        await prisma.userMetrics.update({
          where: { userId },
          data: {
            lastVisit: new Date(),
            totalVisits: { increment: 1 }
          }
        });
      } else {
        await prisma.userMetrics.create({
          data: {
            userId,
            firstVisit: new Date(),
            lastVisit: new Date(),
            totalVisits: 1
          }
        });
      }
    } catch (error) {
      console.error('Error updating user metrics:', error);
    }
  }
  
  static async endSession(sessionId: string) {
    try {
      const session = await prisma.userSession.findUnique({
        where: { sessionId }
      });
      
      if (session && !session.endTime) {
        const duration = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000);
        
        await prisma.userSession.update({
          where: { sessionId },
          data: {
            endTime: new Date(),
            duration
          }
        });
        
        // Update user metrics with session duration
        if (session.userId) {
          await prisma.userMetrics.update({
            where: { userId: session.userId },
            data: {
              totalSessionTime: { increment: duration }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
}