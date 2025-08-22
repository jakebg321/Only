# 🎯 ANALYTICS IMPLEMENTATION GUIDE - Step-by-Step Instructions

## 📋 PRE-IMPLEMENTATION CHECKLIST

### Required Tools & Knowledge
- [ ] PostgreSQL database access
- [ ] Prisma ORM familiarity
- [ ] Next.js API routes
- [ ] React hooks (useState, useEffect)
- [ ] Recharts library for charts
- [ ] TypeScript

### Current Working Systems to Preserve
- ✅ `/api/chat/unified` - Main chat endpoint
- ✅ Psychological profiling (4-type system)
- ✅ Grok 3 AI integration
- ✅ Authentication system

---

## 🚀 WEEK 1: DATABASE & TRACKING FOUNDATION

### Day 1-2: Database Schema Updates

#### Step 1: Create Migration File
```bash
npx prisma migrate dev --name add_analytics_tables
```

#### Step 2: Add to schema.prisma
```prisma
// Add these models to your existing schema.prisma

model UserSession {
  id              String    @id @default(cuid())
  sessionId       String    @unique
  userId          String?
  ipAddress       String
  userAgent       String    @db.Text
  deviceType      String    // mobile, desktop, tablet
  browser         String
  os              String
  country         String?
  city            String?
  referrerSource  String?   // google, direct, social
  landingPage     String?
  startTime       DateTime  @default(now())
  endTime         DateTime?
  duration        Int?      // seconds
  pageViews       Int       @default(1)
  events          Json      @default("[]")
  
  @@index([userId])
  @@index([ipAddress])
  @@index([sessionId])
  @@index([startTime])
}

model UserMetrics {
  id                String    @id @default(cuid())
  userId            String    @unique
  
  // Lifetime stats
  firstVisit        DateTime  @default(now())
  lastVisit         DateTime  @default(now())
  totalVisits       Int       @default(1)
  totalSessionTime  Int       @default(0) // seconds
  totalMessages     Int       @default(0)
  totalSpent        Decimal   @default(0) @db.Decimal(10, 2)
  
  // Averages
  avgSessionLength  Int       @default(0) // seconds
  avgResponseTime   Int       @default(0) // milliseconds
  engagementScore   Float     @default(0)
  
  // Conversion
  firstPurchaseAt   DateTime?
  lastPurchaseAt    DateTime?
  purchaseCount     Int       @default(0)
  subscriptionTier  String?
  churnRisk         Float     @default(0) // 0-1
  
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
}

model RevenueEvent {
  id              String    @id @default(cuid())
  userId          String
  sessionId       String?
  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("USD")
  type            String    // subscription, tip, content
  personalityType String?   // MARRIED_GUILTY, etc
  strategy        String?   // discretion, urgency, etc
  triggerEvent    String?   // what message/action caused purchase
  confidence      Float?    // personality confidence at purchase
  timestamp       DateTime  @default(now())
  
  @@index([userId, timestamp])
  @@index([personalityType])
}

model EventLog {
  id          String    @id @default(cuid())
  sessionId   String
  userId      String?
  eventType   String    // page_view, message_sent, button_click, etc
  eventData   Json      // flexible data storage
  timestamp   DateTime  @default(now())
  
  @@index([sessionId, timestamp])
  @@index([userId, timestamp])
  @@index([eventType])
}
```

#### Step 3: Run Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

### Day 3-4: Session Tracking Middleware

#### Step 1: Create Session Tracker
Create `/src/lib/analytics/session-tracker.ts`:

```typescript
import { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma-singleton';

export class SessionTracker {
  static async trackSession(request: NextRequest) {
    // Get or create session ID
    const sessionId = request.cookies.get('session_id')?.value || uuidv4();
    
    // Parse user agent
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'unknown';
    const os = parser.getOS().name || 'unknown';
    const device = parser.getDevice().type || 'desktop';
    
    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    // Get referrer
    const referrer = request.headers.get('referer') || 'direct';
    const referrerSource = this.parseReferrerSource(referrer);
    
    // Get current page
    const currentPage = request.nextUrl.pathname;
    
    // Check if session exists
    const existingSession = await prisma.userSession.findUnique({
      where: { sessionId }
    });
    
    if (existingSession) {
      // Update existing session
      await prisma.userSession.update({
        where: { sessionId },
        data: {
          lastVisit: new Date(),
          pageViews: { increment: 1 },
          events: {
            push: {
              type: 'page_view',
              page: currentPage,
              timestamp: new Date()
            }
          }
        }
      });
    } else {
      // Create new session
      await prisma.userSession.create({
        data: {
          sessionId,
          ipAddress,
          userAgent,
          browser,
          os,
          deviceType: device,
          referrerSource,
          landingPage: currentPage,
          startTime: new Date()
        }
      });
    }
    
    return sessionId;
  }
  
  static parseReferrerSource(referrer: string): string {
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('twitter')) return 'twitter';
    if (referrer.includes('instagram')) return 'instagram';
    if (!referrer || referrer === 'direct') return 'direct';
    return 'other';
  }
}
```

#### Step 2: Update Middleware
Update `/src/middleware.ts`:

```typescript
import { SessionTracker } from '@/lib/analytics/session-tracker';

export async function middleware(request: NextRequest) {
  // Track session
  const sessionId = await SessionTracker.trackSession(request);
  
  // Set session cookie if new
  const response = NextResponse.next();
  if (!request.cookies.get('session_id')) {
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
  
  // Continue with existing auth logic...
  return response;
}
```

### Day 5: Event Tracking System

#### Step 1: Create Event Tracker
Create `/src/lib/analytics/event-tracker.ts`:

```typescript
export class EventTracker {
  static async trackEvent(
    sessionId: string,
    userId: string | null,
    eventType: string,
    eventData: any
  ) {
    try {
      // Log to database
      await prisma.eventLog.create({
        data: {
          sessionId,
          userId,
          eventType,
          eventData,
          timestamp: new Date()
        }
      });
      
      // Update user metrics if user is logged in
      if (userId) {
        await this.updateUserMetrics(userId, eventType, eventData);
      }
      
      // Special handling for revenue events
      if (eventType.startsWith('payment.')) {
        await this.trackRevenueEvent(userId, sessionId, eventType, eventData);
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
  
  static async updateUserMetrics(userId: string, eventType: string, data: any) {
    const metrics = await prisma.userMetrics.findUnique({
      where: { userId }
    });
    
    if (!metrics) {
      await prisma.userMetrics.create({
        data: { userId }
      });
    }
    
    // Update based on event type
    switch (eventType) {
      case 'message.sent':
        await prisma.userMetrics.update({
          where: { userId },
          data: {
            totalMessages: { increment: 1 },
            lastVisit: new Date()
          }
        });
        break;
      
      case 'session.start':
        await prisma.userMetrics.update({
          where: { userId },
          data: {
            totalVisits: { increment: 1 },
            lastVisit: new Date()
          }
        });
        break;
    }
  }
  
  static async trackRevenueEvent(
    userId: string,
    sessionId: string,
    eventType: string,
    data: any
  ) {
    if (eventType === 'payment.completed') {
      await prisma.revenueEvent.create({
        data: {
          userId,
          sessionId,
          amount: data.amount,
          type: data.type,
          personalityType: data.personalityType,
          strategy: data.strategy,
          triggerEvent: data.triggerEvent,
          confidence: data.confidence
        }
      });
      
      // Update user metrics
      await prisma.userMetrics.update({
        where: { userId },
        data: {
          totalSpent: { increment: data.amount },
          purchaseCount: { increment: 1 },
          lastPurchaseAt: new Date()
        }
      });
    }
  }
}
```

#### Step 2: Create Tracking API
Create `/src/app/api/analytics/track/route.ts`:

```typescript
import { EventTracker } from '@/lib/analytics/event-tracker';

export async function POST(request: Request) {
  try {
    const { sessionId, userId, eventType, eventData } = await request.json();
    
    await EventTracker.trackEvent(sessionId, userId, eventType, eventData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}
```

---

## 🚀 WEEK 2: DATA COLLECTION & AGGREGATION

### Day 1-2: Frontend Event Tracking

#### Step 1: Create React Hook
Create `/src/hooks/useAnalytics.ts`:

```typescript
import { useEffect, useCallback } from 'react';
import { getCookie } from '@/lib/utils';

export function useAnalytics() {
  const sessionId = getCookie('session_id');
  const userId = getCookie('user_id'); // if authenticated
  
  const trackEvent = useCallback(async (eventType: string, eventData?: any) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          eventType,
          eventData: {
            ...eventData,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          }
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, [sessionId, userId]);
  
  // Auto-track page views
  useEffect(() => {
    trackEvent('page.view', {
      url: window.location.href,
      title: document.title
    });
  }, []);
  
  return { trackEvent };
}
```

#### Step 2: Add to Chat Components
Update `/src/app/chat/page.tsx`:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function ChatComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleSendMessage = async (message: string) => {
    // Track message sent
    await trackEvent('message.sent', {
      messageLength: message.length,
      personalityType: currentPersonality,
      confidence: currentConfidence
    });
    
    // Existing chat logic...
  };
  
  // Track personality detection
  useEffect(() => {
    if (detectedPersonality) {
      trackEvent('personality.detected', {
        type: detectedPersonality,
        confidence: confidence,
        messageCount: messages.length
      });
    }
  }, [detectedPersonality]);
}
```

### Day 3-4: Aggregation Jobs

#### Step 1: Create Aggregation Service
Create `/src/lib/analytics/aggregation.ts`:

```typescript
export class AggregationService {
  static async aggregateUserMetrics() {
    // Get all users with recent activity
    const recentSessions = await prisma.userSession.findMany({
      where: {
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    // Group by user
    const userSessions = recentSessions.reduce((acc, session) => {
      if (session.userId) {
        acc[session.userId] = acc[session.userId] || [];
        acc[session.userId].push(session);
      }
      return acc;
    }, {} as Record<string, any[]>);
    
    // Update metrics for each user
    for (const [userId, sessions] of Object.entries(userSessions)) {
      const totalSessionTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const avgSessionLength = totalSessionTime / sessions.length;
      
      await prisma.userMetrics.upsert({
        where: { userId },
        create: {
          userId,
          totalVisits: sessions.length,
          totalSessionTime,
          avgSessionLength
        },
        update: {
          totalVisits: { increment: sessions.length },
          totalSessionTime: { increment: totalSessionTime },
          avgSessionLength
        }
      });
    }
  }
  
  static async calculateEngagementScores() {
    const users = await prisma.userMetrics.findMany();
    
    for (const user of users) {
      // Calculate engagement score (0-100)
      const factors = {
        messages: Math.min(user.totalMessages / 100, 1) * 30,
        sessions: Math.min(user.totalVisits / 10, 1) * 20,
        duration: Math.min(user.avgSessionLength / 1800, 1) * 25,
        purchases: Math.min(user.purchaseCount / 5, 1) * 25
      };
      
      const engagementScore = Object.values(factors).reduce((a, b) => a + b, 0);
      
      await prisma.userMetrics.update({
        where: { userId: user.userId },
        data: { engagementScore }
      });
    }
  }
}
```

#### Step 2: Create Cron Jobs
Create `/src/app/api/cron/aggregate/route.ts`:

```typescript
import { AggregationService } from '@/lib/analytics/aggregation';

export async function GET() {
  try {
    // Run aggregations
    await AggregationService.aggregateUserMetrics();
    await AggregationService.calculateEngagementScores();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Aggregation failed' }, { status: 500 });
  }
}
```

### Day 5: Revenue Attribution

#### Step 1: Update Chat to Track Revenue
Update `/src/lib/unified-chat-engine.ts`:

```typescript
// Add revenue tracking when personality influences action
async trackRevenueAttribution(
  userId: string,
  sessionId: string,
  amount: number,
  trigger: any
) {
  await EventTracker.trackEvent(sessionId, userId, 'payment.completed', {
    amount,
    personalityType: this.currentPersonality,
    confidence: this.currentConfidence,
    strategy: this.currentStrategy,
    triggerEvent: trigger.message,
    messageCount: this.messageCount,
    sessionDuration: this.sessionDuration
  });
}
```

---

## 🚀 WEEK 3-4: DASHBOARD IMPLEMENTATION

### Day 1-2: Dashboard Layout

#### Step 1: Create Dashboard Layout
Create `/src/app/dashboard/layout.tsx`:

```typescript
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-4">
        <nav className="space-y-2">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/users">Users</Link>
          <Link href="/dashboard/revenue">Revenue</Link>
          <Link href="/dashboard/psychology">Psychology</Link>
          <Link href="/dashboard/reports">Reports</Link>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

#### Step 2: Create Main Dashboard
Create `/src/app/dashboard/page.tsx`:

```typescript
import { KPICard } from '@/components/analytics/KPICard';
import { Chart } from '@/components/analytics/Chart';

export default async function Dashboard() {
  // Fetch KPIs
  const kpis = await fetchKPIs();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          title="MRR"
          value={`$${kpis.mrr.toLocaleString()}`}
          change={kpis.mrrChange}
          trend={kpis.mrrTrend}
        />
        <KPICard
          title="Active Users"
          value={kpis.activeUsers.toLocaleString()}
          change={kpis.userChange}
          trend={kpis.userTrend}
        />
        <KPICard
          title="Conversion Rate"
          value={`${kpis.conversionRate}%`}
          change={kpis.conversionChange}
          trend={kpis.conversionTrend}
        />
        <KPICard
          title="Avg Session"
          value={`${kpis.avgSession} min`}
          change={kpis.sessionChange}
          trend={kpis.sessionTrend}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Chart
          title="Revenue Trend"
          data={kpis.revenueData}
          type="line"
        />
        <Chart
          title="User Growth"
          data={kpis.userGrowthData}
          type="area"
        />
        <Chart
          title="Personality Distribution"
          data={kpis.personalityData}
          type="pie"
        />
        <Chart
          title="Conversion Funnel"
          data={kpis.funnelData}
          type="funnel"
        />
      </div>
    </div>
  );
}
```

### Day 3-4: Analytics API

#### Step 1: Create Analytics API
Create `/src/app/api/analytics/kpis/route.ts`:

```typescript
export async function GET() {
  // Calculate MRR
  const revenueEvents = await prisma.revenueEvent.findMany({
    where: {
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    }
  });
  
  const mrr = revenueEvents.reduce((sum, event) => 
    sum + Number(event.amount), 0
  );
  
  // Calculate active users
  const activeUsers = await prisma.userMetrics.count({
    where: {
      lastVisit: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  // Calculate conversion rate
  const totalUsers = await prisma.user.count();
  const payingUsers = await prisma.userMetrics.count({
    where: {
      purchaseCount: { gt: 0 }
    }
  });
  const conversionRate = (payingUsers / totalUsers * 100).toFixed(2);
  
  // Get personality distribution
  const personalityData = await prisma.revenueEvent.groupBy({
    by: ['personalityType'],
    _sum: {
      amount: true
    }
  });
  
  return NextResponse.json({
    mrr,
    activeUsers,
    conversionRate,
    personalityData,
    // ... more KPIs
  });
}
```

### Day 5: Charts & Visualizations

#### Step 1: Install Recharts
```bash
npm install recharts
```

#### Step 2: Create Chart Component
Create `/src/components/analytics/Chart.tsx`:

```typescript
import { LineChart, Line, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function Chart({ title, data, type }) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart width={500} height={300}>
            <Pie data={data} dataKey="value" nameKey="name" fill="#8884d8" />
            <Tooltip />
          </PieChart>
        );
      
      // Add more chart types...
    }
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
}
```

---

## 🚀 WEEK 5: ADVANCED FEATURES

### Predictive Analytics
```typescript
// Churn prediction based on engagement
function predictChurn(metrics: UserMetrics) {
  const riskFactors = {
    lowEngagement: metrics.engagementScore < 30 ? 0.3 : 0,
    noRecentVisit: daysSinceLastVisit(metrics.lastVisit) > 7 ? 0.2 : 0,
    noPurchases: metrics.purchaseCount === 0 ? 0.3 : 0,
    decliningActivity: metrics.totalMessages < previousMonthMessages ? 0.2 : 0
  };
  
  return Object.values(riskFactors).reduce((a, b) => a + b, 0);
}
```

### A/B Testing
```typescript
// Test different strategies
function getTestVariant(userId: string, testName: string) {
  // Use consistent hashing to ensure user always gets same variant
  const hash = hashCode(userId + testName);
  return hash % 2 === 0 ? 'control' : 'variant';
}
```

### Export Functionality
```typescript
// Export to CSV
async function exportToCSV(data: any[], filename: string) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
```

---

## 🎯 TESTING & VALIDATION

### Test Tracking
1. Open browser console
2. Check for tracking calls in Network tab
3. Verify events in database

### Test Aggregation
```bash
# Manually trigger aggregation
curl http://localhost:3000/api/cron/aggregate
```

### Test Dashboard
1. Generate test data
2. Check all charts render
3. Verify KPIs calculate correctly

---

## 📊 SUCCESS METRICS

After implementation, you should see:
- **Every user action tracked** in EventLog table
- **Session data** for every visit in UserSession table
- **Aggregated metrics** in UserMetrics table
- **Revenue attribution** in RevenueEvent table
- **Real-time dashboards** showing all KPIs
- **Export functionality** for investor reports

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: Events not tracking
**Solution:** Check session cookie, verify API endpoint, check console errors

### Issue: Aggregation slow
**Solution:** Add database indexes, run during off-peak hours, optimize queries

### Issue: Dashboard not updating
**Solution:** Check caching, verify data fetching, inspect API responses

### Issue: Missing revenue attribution
**Solution:** Ensure personality detection occurs before purchase, track trigger events

---

## 📝 FINAL CHECKLIST

### Week 1 Complete
- [ ] Database migrations run
- [ ] Session tracking working
- [ ] Events logging to database
- [ ] Basic metrics calculating

### Week 2 Complete
- [ ] Frontend tracking implemented
- [ ] Aggregation jobs running
- [ ] Revenue attribution working
- [ ] User metrics updating

### Week 3-4 Complete
- [ ] Dashboard UI built
- [ ] Charts displaying data
- [ ] KPIs calculating correctly
- [ ] API endpoints working

### Week 5 Complete
- [ ] Predictive analytics added
- [ ] A/B testing framework ready
- [ ] Export functionality working
- [ ] Investor reports generating

## 🎉 LAUNCH READY!

Once all items are checked, your analytics system is complete and investor-ready!