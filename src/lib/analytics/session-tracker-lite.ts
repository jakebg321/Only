import { NextRequest } from 'next/server';

/**
 * SESSION TRACKER LITE - EDGE RUNTIME COMPATIBLE
 * 
 * ✅ SAFE FOR USE IN:
 * - Middleware (Edge Runtime)
 * - Client components
 * - Server components
 * 
 * This lightweight version does NOT use:
 * - Prisma (no database calls)
 * - Node.js specific APIs (process, fs, etc.)
 * - Any server-only dependencies
 * 
 * For database operations, use the /api/analytics/session endpoint
 */
export class SessionTrackerLite {
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
  
  static getSessionData(request: NextRequest) {
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
    
    // Get current page
    const currentPage = request.nextUrl.pathname;
    
    // Get user ID from JWT if authenticated
    const userId = request.cookies.get('userId')?.value || null;
    
    return {
      sessionId,
      userAgent,
      browser,
      os,
      deviceType,
      ipAddress,
      referrer,
      currentPage,
      userId,
      timestamp: new Date().toISOString()
    };
  }
}