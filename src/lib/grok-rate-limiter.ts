interface RateLimitInfo {
  lastRequest: number;
  requestCount: number;
  resetTime: number;
}

class GrokRateLimiter {
  private static instance: GrokRateLimiter;
  private rateLimitInfo: RateLimitInfo = {
    lastRequest: 0,
    requestCount: 0,
    resetTime: Date.now() + 60000 // Reset every minute
  };

  // Grok rate limits (adjust based on your plan)
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly MIN_REQUEST_INTERVAL = 6000; // 6 seconds between requests

  private constructor() {}

  static getInstance(): GrokRateLimiter {
    if (!GrokRateLimiter.instance) {
      GrokRateLimiter.instance = new GrokRateLimiter();
    }
    return GrokRateLimiter.instance;
  }

  canMakeRequest(): { allowed: boolean; waitTime?: number; message?: string } {
    const now = Date.now();

    // Reset counter if minute has passed
    if (now > this.rateLimitInfo.resetTime) {
      this.rateLimitInfo.requestCount = 0;
      this.rateLimitInfo.resetTime = now + 60000;
    }

    // Check if we've hit the per-minute limit
    if (this.rateLimitInfo.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = Math.ceil((this.rateLimitInfo.resetTime - now) / 1000);
      return {
        allowed: false,
        waitTime,
        message: `Rate limit reached. Please wait ${waitTime} seconds.`
      };
    }

    // Check minimum interval between requests
    const timeSinceLastRequest = now - this.rateLimitInfo.lastRequest;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = Math.ceil((this.MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
      return {
        allowed: false,
        waitTime,
        message: `Please wait ${waitTime} seconds between messages.`
      };
    }

    return { allowed: true };
  }

  recordRequest(): void {
    const now = Date.now();
    this.rateLimitInfo.lastRequest = now;
    this.rateLimitInfo.requestCount++;
  }

  getRateLimitStatus(): {
    requestsRemaining: number;
    resetIn: number;
  } {
    const now = Date.now();
    const resetIn = Math.max(0, Math.ceil((this.rateLimitInfo.resetTime - now) / 1000));
    const requestsRemaining = Math.max(0, this.MAX_REQUESTS_PER_MINUTE - this.rateLimitInfo.requestCount);

    return {
      requestsRemaining,
      resetIn
    };
  }
}

export default GrokRateLimiter;