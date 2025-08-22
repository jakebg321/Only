'use client';

import { useEffect, useCallback } from 'react';

export function SessionTracker() {
  // Enhanced activity tracking for intelligent session detection
  const trackActivity = useCallback(async (activityType: string, intensity: number = 5) => {
    const sessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('session_id='))
      ?.split('=')[1];
    
    const userId = document.cookie
      .split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];
    
    if (sessionId) {
      try {
        await fetch('/api/analytics/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId: userId || null,
            activityType,
            intensity,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          })
        });
      } catch (error) {
        console.error('[SESSION-TRACKER] Activity tracking failed:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Only track once per page load
    let hasTracked = false;
    
    // Send session tracking data on page load
    const trackSession = async () => {
      if (hasTracked) return;
      
      // Small delay to ensure middleware has set cookies
      await new Promise(resolve => setTimeout(resolve, 200));
      try {
        // Only read session ID - middleware creates it
        const sessionId = document.cookie
          .split('; ')
          .find(row => row.startsWith('session_id='))
          ?.split('=')[1];
        
        if (!sessionId) {
          console.log('[SESSION-TRACKER] ⏳ Waiting for middleware to create session...');
          // Wait a bit and retry
          setTimeout(() => trackSession(), 500);
          return;
        }
        
        console.log('[SESSION-TRACKER] 📍 Using middleware session:', sessionId);
        hasTracked = true; // Mark as tracked to prevent duplicates
        
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
          // Track initial page view with high intensity
          await trackActivity('page_view', 8);
        } else {
          console.error('[SESSION-TRACKER] ❌ Failed to persist session:', response.status);
        }
      } catch (error) {
        console.error('[SESSION-TRACKER] ❌ Session tracking failed:', error);
      }
    };

    // INTELLIGENT ACTIVITY DETECTION
    const setupActivityListeners = () => {
      let scrollTimeout: NodeJS.Timeout;
      let typingTimeout: NodeJS.Timeout;
      let lastScrollTime = 0;
      
      // Click tracking (high engagement signal)
      const handleClick = (e: MouseEvent) => {
        const intensity = e.target instanceof HTMLButtonElement ? 9 : 7;
        trackActivity('click', intensity);
      };
      
      // Scroll tracking (medium engagement signal)
      const handleScroll = () => {
        const now = Date.now();
        if (now - lastScrollTime > 1000) { // Throttle to max 1 per second
          lastScrollTime = now;
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            const intensity = Math.min(8, Math.max(3, scrollPercent * 10));
            trackActivity('scroll', intensity);
          }, 200);
        }
      };
      
      // Typing tracking (very high engagement signal)
      const handleKeyPress = () => {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          trackActivity('typing', 9);
        }, 500); // Batch rapid keystrokes
      };
      
      // Focus/blur tracking
      const handleFocus = () => trackActivity('focus', 6);
      const handleBlur = () => trackActivity('blur', 2);
      
      // Message sending (highest engagement signal)
      const handleMessage = () => trackActivity('message', 10);
      
      // Add all listeners
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('keypress', handleKeyPress);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      
      // Listen for message events (custom event from chat components)
      window.addEventListener('chatMessageSent', handleMessage);
      
      console.log('[SESSION-TRACKER] 🎯 Intelligent activity listeners active');
      
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll);
        document.removeEventListener('keypress', handleKeyPress);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('chatMessageSent', handleMessage);
        clearTimeout(scrollTimeout);
        clearTimeout(typingTimeout);
      };
    };
    
    trackSession();
    const cleanupListeners = setupActivityListeners();
    
    // Enhanced session end tracking
    return () => {
      cleanupListeners();
      
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
  }, [trackActivity]);
  
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