# 🚨 CLAUDE.md - AI ASSISTANT CRITICAL REFERENCE
**ALWAYS READ THIS FIRST BEFORE ANY WORK - Updated: 2025-08-22**

## ⚠️ STOP! CRITICAL WORKING SYSTEMS - DO NOT "FIX"

### 🖼️ IMAGE GENERATION IS FULLY OPERATIONAL
```
ARCHITECTURE: Next.js (Render) → Queue → RunPod GPU (Fooocus)
- RunPod has ENTIRE Fooocus deployment with custom LoRAs
- Worker polls: https://iq-4ru0.onrender.com/api/generate/queue
- DO NOT modify /api/generate/* - IT WORKS!
- Custom models: remy.safetensors, juggernautXL_v8
```

### 💬 CHAT SYSTEM IS UNIFIED
```
ALL chat UIs → /api/chat/unified → UnifiedChatEngine
- /chat, /chat/debug, /chat/test-lab ALL use unified
- DO NOT create new chat endpoints
- Grok 3 with 1M context window
```

### 📊 ANALYTICS IS REAL
```
Session tracking → UserSession table → Dashboard
- NO mock data - all from database
- SessionTracker component handles client-side
- Middleware adds session cookies
```

## 🚫 CRITICAL: ANTI-DUPLICATION RULES

### NEVER CREATE NEW FILES FOR EXISTING FUNCTIONALITY

**Before creating ANY new file, you MUST:**

1. **Search existing codebase** for similar functionality
2. **Fix/extend existing files** instead of creating new ones  
3. **Delete old files** when replacing functionality
4. **Ask user permission** before creating new files

### MAXIMUM FILE LIMITS (ENFORCE STRICTLY)

**Analytics**: MAX 4 files total
- `lib/analytics/session-tracker-lite.ts` (server/middleware)
- `lib/user-analytics.ts` (core functions)
- `hooks/useAnalytics.ts` (React hooks)
- `components/SessionTracker.tsx` (client component)

**Chat**: MAX 3 files total  
- `lib/unified-chat-engine.ts` (main orchestrator)
- `lib/secure-grok-client.ts` (API client)
- API routes only

**Authentication**: MAX 2 files
**Database**: MAX 2 files per domain

### BANNED FILENAME PATTERNS

❌ NEVER create files with these patterns:
- `*-lite.ts`, `*-server.ts`, `*-client.ts`
- `advanced-*.ts`, `intelligent-*.ts`, `enterprise-*.ts`
- `*-v2.ts`, `*-new.ts`, `*-updated.ts`, `*-optimized.ts`
- Any numbered versions (`*-2.ts`, etc.)

### REQUIRED ACTIONS BEFORE NEW FILES

1. **Grep for similar functionality**: `rg "class.*Analytics"`
2. **Check existing imports**: What's already being used?
3. **Propose consolidation**: "Should I extend X instead?"
4. **Get explicit approval**: User must say "yes create new file"

### FILE CREATION CHECKLIST

Before creating any new file, you MUST:
- [ ] Searched for existing similar functionality
- [ ] Confirmed no existing file can be extended  
- [ ] Got explicit user approval
- [ ] Will delete/consolidate old files
- [ ] File serves unique, non-overlapping purpose

**VIOLATION = IMMEDIATE STOP AND ASK FOR GUIDANCE**

---

## 🎯 PROJECT TRUTH MAP

### ✅ WORKING (Don't Touch!)
| System | Status | Location | Notes |
|--------|--------|----------|-------|
| Image Generation | ✅ WORKING | `/api/generate/*` + RunPod | Queue-based GPU processing |
| Chat Unified | ✅ WORKING | `/api/chat/unified` | All UIs use this |
| Session Tracking | ✅ WORKING | `SessionTracker` + middleware | Real data only |
| Psychological | ✅ WORKING | `unified-chat-engine.ts` | 4-type + VEAL |
| Auth System | ✅ WORKING | `/api/auth/*` | JWT + bcrypt |
| Dashboard | ✅ WORKING | `/dashboard/*` | Sessions, users, analytics |

### ⚠️ ISSUES (FIXED!)
| File | Issue | Impact | Status |
|------|-------|--------|--------|
| Analytics Performance | N+1 queries, arbitrary formulas | Slow, inaccurate | ✅ FIXED |
| Active session count | Only counts last 5 min | Shows 0 often | ⚡ OPTIMIZED |
| Engagement scoring | No statistical backing | Meaningless metrics | ✅ REPLACED WITH RFM |

### ❌ DEAD CODE (Don't Use)
- `/api/profiling/*` - Old system, replaced by unified
- `/api/chat/authenticated`, `/api/chat/secure` - Unused
- `/api/test-generation` - Local testing only
- Anything with "mock" or "fake" data generation

---

## 📁 CRITICAL FILE MAP

### 🧠 Core Business Logic (`/src/lib/`)
```
✅ unified-chat-engine.ts    - Main chat orchestrator (ALL CHAT)
✅ undertone-detector.ts      - 4-type personality (65% MARRIED_GUILTY)
✅ response-strategist.ts     - Response strategies per type
✅ psychological-mapper.ts    - Maps 4-type to VEAL framework
✅ database-profiler.ts       - Stores profiles & probes
✅ secure-grok-client.ts      - Grok 3 integration (1M context)
✅ user-analytics.ts          - Core analytics functions
✅ analytics/session-tracker-lite.ts - Server/middleware session tracking
✅ prisma-singleton.ts        - Database connection
```

### 🌐 API Routes (`/src/app/api/`)
```
ACTIVE & CRITICAL:
✅ /chat/unified       - ONLY chat endpoint (all UIs use)
✅ /generate          - Image queue (RunPod polls this)
✅ /generate/queue    - Queue status
✅ /generate/update   - RunPod updates here
✅ /analytics/sessions - OPTIMIZED session data (?optimized=true)
✅ /analytics/track   - Event tracking
🚀 /analytics/benchmark - Performance testing (NEW!)
✅ /auth/*           - All auth endpoints

DEAD/UNUSED:
❌ /profiling/*      - Old system
❌ /chat/secure      - Unused
❌ /test-generation  - Local only
```

### 🎨 UI Pages (`/src/app/`)
```
✅ /chat              - Main chat (uses unified)
✅ /chat/debug        - Debug view (uses unified)
✅ /chat/test-lab     - 4-window test (uses unified)
✅ /dashboard/sessions - Real analytics
✅ /dashboard/users   - User metrics
✅ /analytics-test    - Public test page
```

### 🚀 RunPod Deployment (`/runpod/`)
```
✅ runpod_worker.py   - Polls queue from Next.js
✅ api_runpod.py      - Fooocus API for Linux
✅ Dockerfile         - Container definition
📦 Models deployed:
   - remy.safetensors (custom LoRA)
   - juggernautXL_v8Rundiffusion
   - realisticStockPhoto_v20
```

---

## 🔗 CRITICAL DEPENDENCIES

**DO NOT CHANGE** → **BREAKS**
- `unified-chat-engine.ts` → ALL chat interfaces
- `/api/generate` → RunPod worker polling
- `SessionTracker` component → Analytics data
- `undertone-detector.ts` → Revenue optimization
- Prisma schema → Entire database

---

## ❌ NEVER DO THIS (Common Mistakes)

1. **"Fix" image generation** - RunPod setup WORKS
2. **Create new chat endpoints** - Use unified ONLY
3. **Add mock/fake data** - User wants REAL data
4. **Create duplicate profiling** - It's in unified-chat
5. **Add new session tracking** - Already in middleware
6. **Modify `/api/generate`** - Breaks RunPod worker
7. **Delete "unused" files** - Check this doc first!
8. **Create new auth system** - Current one works

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js 15)           │
│     Deployed: Render (iq-4ru0...)       │
├─────────────────────────────────────────┤
│ • /chat → unified API                   │
│ • Real-time session tracking            │
│ • Dashboard with real analytics         │
└────────────┬────────────────────────────┘
             │
     ┌───────▼────────┬──────────────┐
     │   API LAYER    │   RunPod GPU  │
     ├────────────────┤   (Fooocus)   │
     │ /api/chat/     │   Polls queue │
     │ /api/generate  │   Custom LoRA │
     │ /api/analytics │   GPU compute │
     └───────┬────────┴───────┬───────┘
             │                │
     ┌───────▼────────────────▼───────┐
     │    PostgreSQL (Render)         │
     ├─────────────────────────────────┤
     │ • UserSession (tracking)       │
     │ • PsychologicalProfile (VEAL)  │
     │ • ChatSession (history)        │
     └─────────────────────────────────┘
```

---

## 🎯 ACTIVE PATTERNS (Must Follow)

### Chat Message Flow
```typescript
User Message → /api/chat/unified
  → UnifiedChatEngine.processMessage()
  → UndertoneDetector.detect() [4-type]
  → PsychologicalMapper.mapToVEAL()
  → ResponseStrategist.getStrategy()
  → SecureGrokClient.generateResponse()
  → Response with probe if needed
```

### Image Generation Flow
```typescript
User Request → /api/generate (queue)
  → RunPod polls every 5 seconds
  → Marks as "processing"
  → Fooocus generates on GPU
  → Updates via /api/generate/update
  → Chat UI polls for result
```

### Console Logging Pattern
```javascript
[COMPONENT] emoji message
[ANALYTICS] 🎯 Event tracked
[SESSION-TRACKER] 📍 Session updated
[DASHBOARD] 📊 Data fetched
```

---

## 📊 KEY METRICS & CONFIG

### Personality Distribution (Revenue)
- MARRIED_GUILTY: 65% of revenue
- LONELY_SINGLE: 20% of revenue  
- HORNY_ADDICT: 10% of revenue
- CURIOUS_TOURIST: 5% of revenue

### Environment Variables
```env
DATABASE_URL         # PostgreSQL connection
GROK_API_KEY        # X.AI Grok API key
JWT_SECRET          # Auth token secret
LOCAL_API_URL       # For local testing only
RUNPOD_API_KEY      # RunPod auth (if used)
```

### Tech Stack
- Next.js 15.4.5 + React 19.1.0
- Prisma 6.13.0 + PostgreSQL
- Grok 3 (1M context)
- RunPod GPU (Fooocus)
- TypeScript 5

---

## 🔄 RECENT CHANGES (Last 10)

1. 🚀 **ANALYTICS REVOLUTION** - Replaced amateur-grade with enterprise-grade
2. ✅ **RFM Analysis** - Industry standard customer segmentation
3. ✅ **Churn Prediction** - ML-inspired behavioral analysis
4. ✅ **CLV Prediction** - Customer lifetime value forecasting
5. ✅ **Batch Processing** - Eliminated N+1 query problems
6. ✅ **Performance Benchmarking** - /api/analytics/benchmark
7. ✅ **Optimized Queries** - PostgreSQL window functions & CTEs
8. ✅ **Statistical Models** - Replaced arbitrary formulas
9. ✅ **Database Optimization** - Proper indexing strategies
10. ✅ **Enterprise Architecture** - Production-ready analytics

---

## 🚀 QUICK COMMANDS

```bash
# Check this doc first
cat CLAUDE.md | head -50

# Run locally
npm run dev

# Check TypeScript
npx tsc --noEmit

# View real sessions (optimized)
curl http://localhost:3000/api/analytics/sessions?optimized=true

# Performance benchmark
curl http://localhost:3000/api/analytics/benchmark

# Database console
npx prisma studio
```

---

## ⚡ CRITICAL REMINDERS

1. **RunPod is WORKING** - Don't "fix" image generation
2. **Use unified chat ONLY** - All UIs go through it
3. **Real data ONLY** - No mocks, no fakes
4. **Check dependencies** - One change breaks many things
5. **Read error messages** - TypeScript errors aren't always real problems

---

**LAST UPDATED:** 2025-08-22
**NEXT UPDATE:** When major architecture changes
**MAINTAINED BY:** AI Assistant Reference System

---

# END OF CRITICAL REFERENCE
# ALWAYS CHECK THIS BEFORE MAKING CHANGES