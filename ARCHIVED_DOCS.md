# 📚 ARCHIVED DOCUMENTATION
**Consolidated from 26 old .md files - Reference only**

---

## FROM: COMPLETE_SYSTEM_DOCUMENTATION.md

### Probe Strategy Phases
- **Phase 1 (Messages 1-5):** Identity probes
- **Phase 2 (Messages 5-15):** Depth probes  
- **Phase 3 (Messages 15+):** Conversion probes

### VEAL Framework Details
- **V**ulnerability: LONELY, NEGLECTED, INADEQUATE, VULNERABLE
- **E**go: HERO, ALPHA, PROVIDER, EXPLORER  
- **A**ttachment: ANXIOUS, AVOIDANT, SECURE, DISORGANIZED
- **L**everage: FINANCIAL, EMOTIONAL, SOCIAL, SEXUAL

---

## FROM: ANALYTICS_IMPLEMENTATION_STATUS.md

### KPIs Available
- MRR (Monthly Recurring Revenue)
- Active Users Count
- Conversion Rate
- Average Session Duration
- CLV (Customer Lifetime Value)
- CAC (Customer Acquisition Cost)
- Engagement Score (0-100)
- Churn Risk (0-1)
- Personality Revenue Distribution

### Event Tracking Hooks
```javascript
const { trackEvent } = useAnalytics();
trackEvent('chat.message.sent', { wordCount, personality });
```

---

## FROM: DEPLOYMENT_CHECKLIST.md

### Render Deployment Commands
```bash
# Build Command
npm install && npx prisma generate && npx prisma db push && npm run build

# Start Command
npm start
```

---

## FROM: NOTIFICATION_SYSTEM_README.md

### Local Notification Server
- Webhook endpoint: http://localhost:3001/webhook
- Desktop notifications for new requests
- Sound alerts (notification-example.mp3)
- System tray integration

---

## FROM: runpod/README.md

### RunPod Environment Variables
```
NEXTJS_API_URL=https://iq-4ru0.onrender.com
POLL_INTERVAL=5
WORKER_ID=runpod-001
FOOOCUS_PATH=/workspace/Fooocus
```

### RunPod Deployment Steps
1. Build Docker image
2. Push to registry
3. Configure GPU pod
4. Set environment variables
5. Start worker

---

## FROM: CHAT_SYSTEM_ANALYSIS.md

### Personality-Based Pricing Strategy
| Type | Strategy | Price Point | Conversion Time |
|------|----------|-------------|-----------------| 
| MARRIED_GUILTY | Discretion packages | $50-200/interaction | 45 min |
| LONELY_SINGLE | Monthly GFE subscription | $30-100/month | 2 hours |
| HORNY_ADDICT | Premium content tiers | $100-500/content | 15 min |
| CURIOUS_TOURIST | One-time offer | $10-25 | N/A |

---

## FROM: PROBLEM_USERS_PLAYBOOK.md

### User Type Strategies
- **Silent Users:** Start with open questions, be patient
- **Aggressive Users:** Stay calm, redirect to fantasies
- **Needy Users:** Set boundaries, scheduled interactions
- **Suspicious Users:** Be consistent, avoid contradictions

---

## FROM: AUTH_IMPLEMENTATION_LOG.md

### JWT Token Structure
```javascript
{
  userId: string,
  email: string,
  role: UserRole,
  iat: number,
  exp: number // 7 days
}
```

---

## FROM: WINDOWS_DB_SETUP.md

### Local PostgreSQL Setup
```sql
CREATE DATABASE assistant_db;
CREATE USER assistant_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE assistant_db TO assistant_user;
```

---

## FROM: runpod_quick_fix.md

### RunPod Quick Start
```bash
# Docker image
runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel-ubuntu22.04

# Quick command
bash -c "apt update && apt install -y git wget && cd /workspace && git clone https://github.com/jakebg321/ai-content-platform.git && cd ai-content-platform && pip install requests && cd runpod && python runpod_worker.py"
```

---

## FROM: FINAL_STATUS_REPORT.md

### Test Credentials
- Email: test@example.com
- Password: testpass123

### Original Deployment
- URL: https://only-1-e1g3.onrender.com
- Database: Render PostgreSQL
- Status from Aug 17, 2025

---

## FROM: Fooocus Documentation

### Model Configurations
- Base: juggernautXL_v8Rundiffusion.safetensors
- Refiner: None
- LoRAs: remy.safetensors (custom trained)
- Sampler: DPM++ 2M Karras
- Steps: 30
- CFG: 7.0

### Style Presets
- Fooocus V2
- Fooocus Enhance
- Fooocus Sharp

---

## DEPRECATED INFORMATION

### Old Profile System (REMOVED)
- ❌ psychological-analyzer.ts (deleted)
- ❌ psychological-profiler.ts (deleted)
- ❌ advanced-profiler.ts (deleted)
- ❌ client-profiler.ts (deleted)

### Old API Endpoints (UNUSED)
- ❌ /api/chat/authenticated
- ❌ /api/chat/secure
- ❌ /api/profiling/analyze
- ❌ /api/profiling/profile

### Old Gallery System
- Originally "Remy's profile"
- 56 images in /public/Remy
- Blur protection system

---

## MIGRATION NOTES

### From Old to New
- Chat: Use /api/chat/unified only
- Profiling: Built into unified-chat-engine
- Analytics: Real data only, no mocks
- Images: RunPod queue system

### Database Migrations
- All in /prisma/migrations/
- Latest schema in /prisma/schema.prisma
- Run: npx prisma migrate dev

---

## RESEARCH PROMPTS (Historical)

### Grok Optimization Query
"Analyze conversation patterns for adult content creators optimizing for: engagement, monetization, authentic connection, ethical boundaries"

### Conversational AI Framework
"Design personality-driven response system with: trait modeling, adaptive strategies, revenue optimization, ethical guidelines"

---

## CONFIGURATION BACKUPS

### Original .env Structure
```env
DATABASE_URL=postgresql://...
GROK_API_KEY=xai-...
JWT_SECRET=change-in-production
NODE_ENV=production
```

### Prisma Config
```javascript
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}
```

---

## TROUBLESHOOTING ARCHIVE

### Common Issues (FIXED)
1. ✅ TypeScript compilation errors - Fixed
2. ✅ Duplicate session tracking - Fixed
3. ✅ Mock data in dashboards - Removed
4. ✅ SQL column name errors - Fixed
5. ⚠️ Edge Runtime warnings - Ignore

### Build Warnings (SAFE TO IGNORE)
- bcryptjs Edge Runtime warning
- Multiple lockfiles warning
- Prisma config deprecation

---

**END OF ARCHIVED DOCUMENTATION**
*For current information, see CLAUDE.md*