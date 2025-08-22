import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SessionTrackerLite } from '@/lib/analytics/session-tracker-lite';

// Define protected routes
const protectedRoutes = [
  '/chat',
  '/gallery', 
  '/dashboard',
  '/creator',
];

// Define public routes (no auth required)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify',
  '/chat/test-lab',
  '/chat/debug',
];

// Helper function to trigger intelligent session lifecycle management
async function triggerSessionLifecycleManagement(request: NextRequest) {
  try {
    // Only run lifecycle management periodically to avoid overhead
    const lastManagement = request.cookies.get('last_lifecycle_check')?.value;
    const now = Date.now();
    
    if (!lastManagement || (now - parseInt(lastManagement)) > 5 * 60 * 1000) { // Every 5 minutes
      const baseUrl = request.nextUrl.origin;
      
      // Trigger background lifecycle management via API
      fetch(`${baseUrl}/api/analytics/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'middleware' })
      }).catch(error => {
        console.error('[MIDDLEWARE] Lifecycle management trigger failed:', error);
      });
      
      console.log('[MIDDLEWARE] 🔄 Triggered intelligent session lifecycle management');
      return now.toString();
    }
    
    return lastManagement;
  } catch (error) {
    console.error('[MIDDLEWARE] Session lifecycle trigger error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip tracking for static assets and API routes
  const shouldTrack = !path.startsWith('/_next') && 
                     !path.startsWith('/api') && 
                     !path.includes('.');
  
  // Get session data (lightweight, no database calls)
  let sessionData: any = null;
  if (shouldTrack) {
    try {
      sessionData = SessionTrackerLite.getSessionData(request);
      console.log(`[MIDDLEWARE-SESSION] 📊 Session data:`, {
        sessionId: sessionData.sessionId,
        browser: sessionData.browser,
        os: sessionData.os,
        deviceType: sessionData.deviceType,
        page: sessionData.currentPage,
        hasUserId: !!sessionData.userId
      });
    } catch (error) {
      console.error('[MIDDLEWARE-SESSION] ❌ Session data extraction failed:', error);
    }
  }
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route);
  
  // Debug logging
  console.log(`[MIDDLEWARE] Path: ${path}, Protected: ${isProtectedRoute}, Public: ${isPublicRoute}`);
  
  // Create response
  let response: NextResponse;
  
  // For protected routes, check if auth token exists
  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      // Redirect to login if no token
      response = NextResponse.redirect(new URL('/auth/login', request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }
  
  // Set session cookie if new and add session data header for API
  if (sessionData && !request.cookies.get('session_id')) {
    console.log(`[MIDDLEWARE-SESSION] 🍪 Setting new session cookie:`, sessionData.sessionId);
    response.cookies.set('session_id', sessionData.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  } else if (sessionData) {
    console.log(`[MIDDLEWARE-SESSION] 🔄 Using existing session:`, sessionData.sessionId);
  }
  
  // Add session data as header for downstream processing
  if (sessionData && shouldTrack) {
    response.headers.set('x-session-data', JSON.stringify(sessionData));
    
    // Trigger intelligent session lifecycle management periodically
    const lifecycleTimestamp = await triggerSessionLifecycleManagement(request);
    if (lifecycleTimestamp) {
      response.cookies.set('last_lifecycle_check', lifecycleTimestamp, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      });
    }
    
    // NOTE: Session persistence is handled by the SessionTracker component
    // to avoid duplicate tracking and Edge Runtime limitations
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|Remy|.*\\.png$).*)',
  ],
};