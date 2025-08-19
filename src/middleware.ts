import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path === route);
  
  // Allow public routes and API routes (they handle auth internally)
  if (isPublicRoute || path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // For protected routes, just check if auth token exists
  // Let individual components verify the token with /api/auth/verify
  if (isProtectedRoute) {
    const token = request.cookies.get('authToken')?.value;
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
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