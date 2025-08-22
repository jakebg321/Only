import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-singleton';

export async function POST(request: Request) {
  try {
    const sessionData = await request.json();
    const { 
      sessionId, 
      userAgent, 
      browser, 
      os, 
      deviceType, 
      ipAddress, 
      referrer, 
      currentPage, 
      userId,
      timestamp 
    } = sessionData;
    
    // Check if session exists
    const existingSession = await prisma.userSession.findUnique({
      where: { sessionId }
    });
    
    if (existingSession) {
      // Update existing session
      const events = (existingSession.events as any[]) || [];
      events.push({
        type: 'page_view',
        page: currentPage,
        timestamp
      });
      
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          endTime: new Date(timestamp),
          pageViews: { increment: 1 },
          events,
          userId: userId || existingSession.userId,
          duration: Math.floor((new Date(timestamp).getTime() - existingSession.startTime.getTime()) / 1000)
        }
      });
    } else {
      // Parse referrer source
      const referrerSource = parseReferrerSource(referrer);
      
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
          startTime: new Date(timestamp),
          userId,
          events: [{
            type: 'page_view',
            page: currentPage,
            timestamp
          }]
        }
      });
      
      // If user is logged in, update or create user metrics
      if (userId) {
        await updateUserMetrics(userId);
      }
    }
    
    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Session tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track session' },
      { status: 500 }
    );
  }
}

function parseReferrerSource(referrer: string): string {
  if (!referrer || referrer === 'direct') return 'direct';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('facebook')) return 'facebook';
  if (referrer.includes('twitter')) return 'twitter';
  if (referrer.includes('instagram')) return 'instagram';
  if (referrer.includes('reddit')) return 'reddit';
  if (referrer.includes('tiktok')) return 'tiktok';
  return 'other';
}

async function updateUserMetrics(userId: string) {
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