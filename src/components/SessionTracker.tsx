'use client';

import { useEffect } from 'react';

export function SessionTracker() {
  useEffect(() => {
    // Only track once per page load
    let hasTracked = false;
    
    // Send session tracking data on page load
    const trackSession = async () => {
      if (hasTracked) return;
      hasTracked = true;
      
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        // Get or create session ID
        let sessionId = document.cookie
          .split('; ')
          .find(row => row.startsWith('session_id='))
          ?.split('=')[1];
        
        // Create new session ID if none exists
        if (!sessionId) {
          sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          document.cookie = `session_id=${sessionId}; path=/; max-age=${60 * 60 * 24 * 30}`;
          console.log('[SESSION-TRACKER] 🆕 Created new session:', sessionId);
        } else {
          console.log('[SESSION-TRACKER] 📍 Using existing session:', sessionId);
        }
        
        const userId = document.cookie
          .split('; ')
          .find(row => row.startsWith('userId='))
          ?.split('=')[1];
        
        const sessionData = {
          sessionId,
          userAgent: navigator.userAgent,
          browser: getBrowser(),
          os: getOS(),
          deviceType: getDeviceType(),
          ipAddress: 'client', // Will be filled by server
          referrer: document.referrer || 'direct',
          currentPage: window.location.pathname,
          userId: userId || null,
          timestamp: new Date().toISOString()
        };
        
        console.log('[SESSION-TRACKER] 📊 Sending session data:', sessionData);
        
        // Send to API
        const response = await fetch('/api/analytics/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
        
        if (response.ok) {
          console.log('[SESSION-TRACKER] ✅ Session persisted to database');
        } else {
          console.error('[SESSION-TRACKER] ❌ Failed to persist session:', response.status);
        }
      } catch (error) {
        console.error('[SESSION-TRACKER] ❌ Session tracking failed:', error);
      }
    };
    
    trackSession();
    
    // Only track session end when page is unloaded
    return () => {
      const sessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_id='))
        ?.split('=')[1];
      
      if (sessionId) {
        // Send beacon to track session end
        navigator.sendBeacon('/api/analytics/track', JSON.stringify({
          sessionId,
          userId: null,
          eventType: 'session.end',
          eventData: { timestamp: new Date().toISOString() }
        }));
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}

function getBrowser(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('safari')) return 'safari';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('edge')) return 'edge';
  return 'unknown';
}

function getOS(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}