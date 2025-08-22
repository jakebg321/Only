import { useEffect, useCallback, useRef } from 'react';

export function useAnalytics() {
  const batchQueueRef = useRef<any[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get session and user IDs from cookies
  const getSessionId = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'session_id') return value;
    }
    return null;
  };
  
  const getUserId = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userId') return value;
    }
    return null;
  };
  
  // Send batch of events
  const flushBatch = useCallback(async () => {
    if (batchQueueRef.current.length === 0) {
      console.log('[ANALYTICS] 📦 Batch flush called but queue is empty');
      return;
    }
    
    const events = [...batchQueueRef.current];
    batchQueueRef.current = [];
    
    console.log(`[ANALYTICS] 🚀 Flushing batch: ${events.length} events`, events);
    
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('[ANALYTICS] ✅ Batch sent successfully:', result);
      } else {
        console.error('[ANALYTICS] ❌ Batch sending failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[ANALYTICS] ❌ Failed to send batch events:', error);
    }
  }, []);
  
  // Track single event immediately
  const trackEvent = useCallback(async (
    eventType: string,
    eventData?: any,
    immediate: boolean = false
  ) => {
    const sessionId = getSessionId();
    const userId = getUserId();
    
    console.log(`[ANALYTICS] 🎯 Event: ${eventType}`, {
      sessionId: sessionId || 'NO SESSION',
      userId: userId || 'ANONYMOUS',
      eventData,
      immediate,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    if (!sessionId) {
      console.warn('[ANALYTICS] ⚠️ No session ID found, skipping event tracking');
      return;
    }
    
    const event = {
      sessionId,
      userId,
      eventType,
      eventData: {
        ...eventData,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent
      }
    };
    
    if (immediate) {
      // Send immediately
      console.log('[ANALYTICS] 🚀 Sending immediate event:', event);
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('[ANALYTICS] ✅ Event tracked successfully:', result);
        } else {
          console.error('[ANALYTICS] ❌ Event tracking failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[ANALYTICS] ❌ Failed to track event:', error);
      }
    } else {
      // Add to batch queue
      batchQueueRef.current.push(event);
      console.log(`[ANALYTICS] 📦 Added to batch queue (${batchQueueRef.current.length}/10):`, event);
      
      // Clear existing timer
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
      
      // Set new timer to flush batch after 5 seconds or when queue reaches 10 events
      if (batchQueueRef.current.length >= 10) {
        console.log('[ANALYTICS] 🔄 Batch queue full, flushing immediately');
        flushBatch();
      } else {
        console.log(`[ANALYTICS] ⏰ Batch timer set (5s), queue: ${batchQueueRef.current.length}/10`);
        batchTimerRef.current = setTimeout(flushBatch, 5000);
      }
    }
  }, [flushBatch]);
  
  // Track page view on mount
  useEffect(() => {
    console.log('[ANALYTICS] 🏠 Page loaded, tracking page view');
    
    trackEvent('page.view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    });
    
    // Track page focus/blur for engagement
    const handleFocus = () => {
      console.log('[ANALYTICS] 👁️ Page focused');
      trackEvent('page.focus');
    };
    const handleBlur = () => {
      console.log('[ANALYTICS] 👁️‍🗨️ Page blurred');
      trackEvent('page.blur');
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    console.log('[ANALYTICS] 🎧 Event listeners attached for focus/blur tracking');
    
    // Cleanup
    return () => {
      console.log('[ANALYTICS] 🧹 Cleaning up analytics tracking');
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // Flush any remaining events
      if (batchQueueRef.current.length > 0) {
        console.log('[ANALYTICS] 🚮 Flushing remaining events on cleanup');
        flushBatch();
      }
    };
  }, []);
  
  // Track clicks with delegation
  const trackClick = useCallback((
    elementId: string,
    data?: any
  ) => {
    trackEvent('button.click', {
      elementId,
      ...data
    });
  }, [trackEvent]);
  
  // Track form submissions
  const trackFormSubmit = useCallback((
    formName: string,
    data?: any
  ) => {
    trackEvent('form.submit', {
      formName,
      ...data
    }, true); // Send immediately for form submissions
  }, [trackEvent]);
  
  // Track errors
  const trackError = useCallback((
    error: string,
    context?: any
  ) => {
    trackEvent('error.occurred', {
      error,
      context,
      stack: new Error().stack
    }, true); // Send errors immediately
  }, [trackEvent]);
  
  // Track timing (e.g., how long something took)
  const startTiming = useCallback((label: string) => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      trackEvent('timing.measure', {
        label,
        duration: Math.round(duration)
      });
    };
  }, [trackEvent]);
  
  return {
    trackEvent,
    trackClick,
    trackFormSubmit,
    trackError,
    startTiming,
    flushBatch
  };
}

// Specific tracking hooks for different features
export function useChatAnalytics() {
  const { trackEvent } = useAnalytics();
  
  const trackMessage = useCallback((
    content: string,
    personalityType?: string,
    confidence?: number
  ) => {
    console.log('[CHAT-ANALYTICS] 💬 Message sent:', {
      length: content.length,
      words: content.split(/\s+/).length,
      personalityType,
      confidence
    });
    
    trackEvent('message.sent', {
      messageLength: content.length,
      wordCount: content.split(/\s+/).length,
      personalityType,
      confidence,
      timestamp: Date.now()
    });
  }, [trackEvent]);
  
  const trackTyping = useCallback((
    action: 'start' | 'stop',
    duration?: number
  ) => {
    console.log(`[CHAT-ANALYTICS] ⌨️ Typing ${action}:`, { duration });
    
    trackEvent(`typing.${action}`, {
      duration
    });
  }, [trackEvent]);
  
  const trackPersonalityDetection = useCallback((
    type: string,
    confidence: number,
    messageCount: number
  ) => {
    console.log('[CHAT-ANALYTICS] 🧠 Personality detected:', {
      type,
      confidence: `${(confidence * 100).toFixed(1)}%`,
      messageCount,
      timestamp: new Date().toISOString()
    });
    
    trackEvent('personality.detected', {
      type,
      confidence,
      messageCount,
      detectionTime: Date.now()
    }, true); // Send immediately as it's important
  }, [trackEvent]);
  
  const trackProbeResponse = useCallback((
    probeId: string,
    response: string,
    phase: number
  ) => {
    trackEvent('probe.responded', {
      probeId,
      responseLength: response.length,
      phase,
      timestamp: Date.now()
    });
  }, [trackEvent]);
  
  return {
    trackMessage,
    trackTyping,
    trackPersonalityDetection,
    trackProbeResponse
  };
}

// Revenue tracking hook
export function useRevenueAnalytics() {
  const { trackEvent } = useAnalytics();
  
  const trackPaymentView = useCallback((
    offerId: string,
    amount: number,
    offerType: string
  ) => {
    trackEvent('payment.viewed', {
      offerId,
      amount,
      offerType,
      viewTime: Date.now()
    });
  }, [trackEvent]);
  
  const trackPaymentAttempt = useCallback((
    offerId: string,
    amount: number
  ) => {
    trackEvent('payment.attempted', {
      offerId,
      amount,
      attemptTime: Date.now()
    });
  }, [trackEvent]);
  
  const trackPaymentComplete = useCallback((
    offerId: string,
    amount: number,
    personalityType?: string,
    confidence?: number,
    strategy?: string
  ) => {
    trackEvent('payment.completed', {
      offerId,
      amount,
      personalityType,
      confidence,
      strategy,
      completionTime: Date.now()
    }, true); // Send revenue events immediately
  }, [trackEvent]);
  
  const trackPaymentFailed = useCallback((
    offerId: string,
    amount: number,
    reason: string
  ) => {
    trackEvent('payment.failed', {
      offerId,
      amount,
      reason,
      failTime: Date.now()
    }, true);
  }, [trackEvent]);
  
  return {
    trackPaymentView,
    trackPaymentAttempt,
    trackPaymentComplete,
    trackPaymentFailed
  };
}