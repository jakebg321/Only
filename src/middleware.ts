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

// Lifecycle management removed from middleware to prevent fetch errors in production
// This functionality is now handled client-side through SessionTracker component

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip tracking for static assets and API routes
  const shouldTrack = !path.startsWith('/_next') && 
                     !path.startsWith('/api') && 
                     !path.includes('.');
  
  // Check if we already have a session cookie BEFORE generating new one
  const existingSessionId = request.cookies.get('session_id')?.value;
  
  // Get session data (lightweight, no database calls)
  let sessionData: any = null;
  if (shouldTrack) {
    try {
      sessionData = SessionTrackerLite.getSessionData(request);
      // Only log if it's a new session to reduce noise
      if (!existingSessionId) {
        console.log(`[MIDDLEWARE-SESSION] 📊 New session:`, {
          sessionId: sessionData.sessionId,
          browser: sessionData.browser,
          os: sessionData.os,
          deviceType: sessionData.deviceType,
          page: sessionData.currentPage,
          hasUserId: !!sessionData.userId
        });
      }
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
  if (sessionData && !existingSessionId) {
    console.log(`[MIDDLEWARE-SESSION] 🍪 Setting new session cookie:`, sessionData.sessionId);
    response.cookies.set('session_id', sessionData.sessionId, {
      httpOnly: false, // Allow client-side access for analytics
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/' // Ensure cookie is available site-wide
    });
  }
  
  // Add session data as header for downstream processing
  if (sessionData && shouldTrack) {
    response.headers.set('x-session-data', JSON.stringify(sessionData));
    
    // Lifecycle management removed to prevent fetch errors in production
    // This is now handled client-side through SessionTracker component
    
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