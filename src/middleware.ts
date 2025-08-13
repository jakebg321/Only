import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = [
  '/chat',
  '/gallery',
  '/dashboard',
  '/creator',
  '/api/chat',
  '/api/images/generate',
  '/api/user',
];

// Define public routes (no auth required)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/api/auth/login',
  '/api/auth/signup',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route);
  
  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      // Clear invalid cookies
      response.cookies.delete('authToken');
      response.cookies.delete('refreshToken');
      return response;
    }
    
    // Add user info to headers for API routes
    if (path.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  
  return NextResponse.next();
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