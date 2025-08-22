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
    // Handle empty or missing user agent
    if (!userAgent) {
      return { browser: 'other', os: 'other', deviceType: 'desktop' };
    }
    
    const ua = userAgent.toLowerCase();
    
    // Detect browser (order matters - check more specific first)
    let browser = 'other';
    if (ua.includes('edg/') || ua.includes('edge')) browser = 'edge';
    else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
    else if (ua.includes('firefox')) browser = 'firefox';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'opera';
    else if (ua.includes('bot') || ua.includes('crawler')) browser = 'bot';
    
    // Detect OS
    let os = 'other';
    if (ua.includes('windows nt') || ua.includes('win32') || ua.includes('win64')) os = 'windows';
    else if (ua.includes('mac os x') || ua.includes('macintosh')) os = 'macos';
    else if (ua.includes('android')) os = 'android';
    else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'ios';
    else if (ua.includes('linux')) os = 'linux';
    else if (ua.includes('ubuntu')) os = 'ubuntu';
    else if (ua.includes('x11')) os = 'unix';
    
    // Detect device type
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipod')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else if (ua.includes('bot') || ua.includes('crawler')) {
      deviceType = 'bot';
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
    let userId = null;
    const authToken = request.cookies.get('authToken')?.value;
    if (authToken) {
      try {
        // Decode JWT to get userId (without verification since we're just extracting data)
        const payload = authToken.split('.')[1];
        if (payload) {
          const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
          userId = decoded.userId || decoded.id || null;
        }
      } catch (e) {
        // Silent fail - user just won't be tracked
        userId = null;
      }
    }
    
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