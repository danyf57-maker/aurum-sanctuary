# Aurum Sanctuary - Epic Summary & Implementation Plan

**Project:** Aurum Sanctuary  
**Date:** 2026-01-29  
**Total Epics:** 8  
**Total Stories:** 30  
**Estimated Timeline:** 8-12 weeks (1 developer, full-time)

---

## Epic Overview

| Epic | Priority | Stories | Status | Dependencies |
|---|---|---|---|---|
| **Epic 1**: Infrastructure & Project Setup | P0 | 7 | Not Started | None |
| **Epic 2**: Authentication & Onboarding | P0 | 5 | Not Started | Epic 1 |
| **Epic 3**: Core Journaling | P0 | 6 | Not Started | Epic 1, 2 |
| **Epic 4**: Mirror Chat | P0 | 7 | Not Started | Epic 1, 2, 3 |
| **Epic 5**: Insight Engine & Derived Memory | P0 | 5 | Not Started | Epic 1, 2, 3 |
| **Epic 6**: Payments & Subscription | P0 | 4 | Not Started | Epic 1, 2, 5 |
| **Epic 7**: Settings & Compliance | P1 | 5 | Not Started | Epic 1, 2, 3 |
| **Epic 8**: Analytics & Monitoring | P1 | 4 | Not Started | Epic 1, 2 |

**Total Stories:** 43 (7+5+6+7+5+4+5+4)

---

## Critical V1 Decisions Applied

### 1. **Key Management (wrappedContentKey)**
- ✅ Random AES-256 key generated on signup
- ✅ Wrapped by Google Cloud KMS (server-side)
- ✅ Client calls `getContentKey()` Cloud Function (60 req/h + burst 10/5min)
- ✅ Server unwraps KMS → returns contentKey (base64 TLS, in-memory client)
- ✅ Keys stored in sessionStorage (not localStorage)

### 2. **Draft Encryption**
- ✅ Drafts encrypted with contentKey (not ephemeral draftKey)
- ✅ Stored in sessionStorage (lost on tab close, acceptable V1)
- ✅ `beforeunload` warning if unsaved changes
- ✅ Reload requires `getContentKey()` call to decrypt drafts

### 3. **Edge Runtime Auth**
- ✅ Firebase ID token verification via REST API (not Admin SDK)
- ✅ Token verify result cached in Upstash Redis (5min TTL)
- ✅ Reduces Google API calls, improves performance

### 4. **DerivedMemoryLite**
- ✅ Placeholder created in Epic 1 (no Epic 5 dependency)
- ✅ Updated via `onEntryCreate` Firestore trigger
- ✅ Minimal stats: `totalEntries`, `avgWordsPerEntry`, `lastEntryAt`
- ✅ Whitelisted labels only (soft whitelist, Zod validation)

### 5. **Safe Logging**
- ✅ Extended SENSITIVE_FIELDS list (tokens, keys, content, PII)
- ✅ Helpers: `logger.errorSafe()`, `logger.warnSafe()`, `logger.infoSafe()`
- ✅ Google Cloud Error Reporting integration

### 6. **Firestore Rules**
- ✅ Settings: `request.auth.uid == uid` + field validation
- ✅ Type validation: `notificationsEnabled is bool`, `theme in ['light','dark']`
- ✅ Timezone field added

### 7. **Forgot Password**
- ✅ Rate limiting: email (3/h) + IP (20/h)
- ✅ Upstash Redis enforcement

### 8. **Privacy Terminology**
- ✅ "Client-side Encryption + Admin-Blind Processing" (not "E2EE" or "Zero-Knowledge")
- ✅ CI check for prohibited terms (E2EE, HIPAA, medical grade)

---

## Implementation Sequence

### **Phase 1: Foundation (Weeks 1-2)**
**Goal:** Project setup, auth, basic infrastructure

**Epics:**
- Epic 1: Infrastructure & Project Setup (7 stories)
- Epic 2: Authentication & Onboarding (5 stories)

**Deliverables:**
- Next.js 15 project initialized
- Firebase configured (Auth, Firestore, Cloud Functions)
- CI/CD pipelines functional
- Users can sign up, log in, accept terms
- Route guards protect app

**Validation:**
- [ ] User can create account via Google or Email/Password
- [ ] User can log in and access protected routes
- [ ] CI pipeline runs on every commit
- [ ] Firestore Rules enforce security

---

### **Phase 2: Core Value (Weeks 3-5)**
**Goal:** Journaling + encryption, first "Aha! Moment"

**Epics:**
- Epic 3: Core Journaling (6 stories)
- Epic 5: Insight Engine (5 stories, partial)

**Deliverables:**
- Users can write encrypted journal entries
- Entries auto-save and sync to Firestore
- Timeline view displays past entries
- Derived Memory updates on each entry
- First weekly insight generated (manual trigger for testing)

**Validation:**
- [ ] User can write entry, see it encrypted in Firestore
- [ ] Entry decrypts correctly on Timeline view
- [ ] Derived Memory Lite updates after entry creation
- [ ] Weekly insight generated (test user with 7+ days)

---

### **Phase 3: AI Features (Weeks 6-7)**
**Goal:** Mirror Chat + automated insights

**Epics:**
- Epic 4: Mirror Chat (7 stories)
- Epic 5: Insight Engine (complete remaining stories)

**Deliverables:**
- Mirror Chat functional with streaming responses
- Typing indicator <400ms
- Rate limiting enforced
- Weekly insights generated automatically (Cloud Scheduler)
- Insight notifications sent

**Validation:**
- [ ] User can chat with Mirror AI, see streaming responses
- [ ] Typing indicator appears immediately
- [ ] Rate limit enforced (20 req/min technical, 1 req/90s UX)
- [ ] Weekly insight generated on Day 7 after signup
- [ ] Notification sent when insight ready

---

### **Phase 4: Monetization (Week 8)**
**Goal:** Stripe integration, paywall, conversion

**Epics:**
- Epic 6: Payments & Subscription (4 stories)

**Deliverables:**
- Stripe Checkout functional
- Webhooks sync subscription status
- Paywall enforced for full insights
- Free users see teaser (value-first)

**Validation:**
- [ ] User can subscribe via Stripe Checkout
- [ ] Subscription status synced to Firestore
- [ ] Free user sees insight teaser + paywall
- [ ] Paid user sees full insight (no paywall)

---

### **Phase 5: Polish & Compliance (Weeks 9-10)**
**Goal:** Settings, compliance, analytics

**Epics:**
- Epic 7: Settings & Compliance (5 stories)
- Epic 8: Analytics & Monitoring (4 stories)

**Deliverables:**
- Settings page functional
- Account deletion compliant (GDPR)
- Data export functional
- Privacy Policy and Terms published
- PostHog analytics tracking key events
- Error monitoring functional

**Validation:**
- [ ] User can update settings (theme, timezone, notifications)
- [ ] User can delete account (all data purged)
- [ ] User can export data (JSON file)
- [ ] Privacy Policy and Terms accessible
- [ ] PostHog tracking events (no PII)

---

### **Phase 6: Testing & Launch Prep (Weeks 11-12)**
**Goal:** QA, performance optimization, launch readiness

**Tasks:**
- [ ] E2E tests for all critical flows
- [ ] Performance optimization (API latency, function duration)
- [ ] Security audit (Firestore Rules, encryption, logging)
- [ ] Legal review (Privacy Policy, Terms)
- [ ] Load testing (Stripe webhooks, Cloud Functions)
- [ ] Production deployment (Vercel, Firebase)
- [ ] Monitoring dashboards configured (PostHog, Google Cloud)

**Validation:**
- [ ] All E2E tests passing
- [ ] Performance targets met (Mirror Chat <400ms, Insight <30s)
- [ ] Security audit passed (no PII leaks, encryption verified)
- [ ] Legal review approved
- [ ] Production deployment successful

---

## Story Breakdown by Epic

### Epic 1: Infrastructure & Project Setup (7 stories)
1. STORY-1.1: Initialize Next.js 15 Project
2. STORY-1.2: Configure Firebase Project
3. STORY-1.3: Setup Firestore Rules & Indexes
4. STORY-1.4: Setup CI/CD Pipelines
5. STORY-1.5: Implement Safe Logging & Error Handling
6. STORY-1.6: Create DerivedMemoryLite Placeholder
7. STORY-1.7: Setup Development Environment

### Epic 2: Authentication & Onboarding (5 stories)
1. STORY-2.1: Implement Firebase Auth Integration
2. STORY-2.2: Build Login & Signup Pages
3. STORY-2.3: Implement Terms Acceptance Flow
4. STORY-2.4: Setup Route Guards (Middleware)
5. STORY-2.5: Implement Forgot Password Flow

### Epic 3: Core Journaling (6 stories)
1. STORY-3.1: Implement Client-Side Encryption Layer
2. STORY-3.2: Build Journal Editor Component
3. STORY-3.3: Implement Auto-Save Drafts (sessionStorage)
4. STORY-3.4: Implement Firestore Sync for Entries
5. STORY-3.5: Build Timeline View
6. STORY-3.6: Implement Entry Deletion

### Epic 4: Mirror Chat (7 stories)
1. STORY-4.1: Setup Upstash Redis for Rate Limiting
2. STORY-4.2: Implement DeepSeek Adapter
3. STORY-4.3: Build Vercel Edge Function for Mirror Chat
4. STORY-4.4: Implement Zustand Store for Mirror Chat State
5. STORY-4.5: Build Mirror Chat UI Component
6. STORY-4.6: Implement Typing Indicator Logic
7. STORY-4.7: Implement DerivedMemoryLite Fetching

### Epic 5: Insight Engine & Derived Memory (5 stories)
1. STORY-5.1: Implement updateDerivedMemory Cloud Function
2. STORY-5.2: Implement generateInsight Cloud Function
3. STORY-5.3: Implement Insight Scheduling (Cloud Scheduler)
4. STORY-5.4: Build Insight Display UI
5. STORY-5.5: Implement Insight Notifications

### Epic 6: Payments & Subscription (4 stories)
1. STORY-6.1: Setup Stripe Integration
2. STORY-6.2: Implement Stripe Checkout Flow
3. STORY-6.3: Implement Stripe Webhook Handler
4. STORY-6.4: Implement Paywall UI & Subscription Gates

### Epic 7: Settings & Compliance (5 stories)
1. STORY-7.1: Build Settings Page UI
2. STORY-7.2: Implement Account Deletion Flow
3. STORY-7.3: Implement Data Export (GDPR)
4. STORY-7.4: Create Privacy Policy & Terms Pages
5. STORY-7.5: Implement Notification Preferences

### Epic 8: Analytics & Monitoring (4 stories)
1. STORY-8.1: Setup PostHog Integration
2. STORY-8.2: Implement Event Tracking
3. STORY-8.3: Implement Error Monitoring
4. STORY-8.4: Implement Performance Monitoring

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **DeepSeek API cost explosion** | High | Rate limiting (20 req/min), max tokens (500), weekly insights only |
| **Key loss (user forgets password)** | High | Key recovery flow (Epic 7), clear UX warnings |
| **Firestore Rules misconfiguration** | Critical | CI checks, security audit, test coverage |
| **Sensitive data leak in logs** | Critical | Safe logging patterns, CI grep checks, redaction |
| **Stripe webhook failures** | Medium | Retry logic, monitoring, periodic sync job |
| **Performance degradation (Mirror Chat)** | Medium | Edge runtime, caching, performance monitoring |
| **GDPR non-compliance** | High | Account deletion, data export, legal review |

---

## Success Metrics (Post-Launch)

### Product Metrics
- **Signup → First Entry**: <5 minutes (onboarding friction)
- **Day 7 Retention**: >40% (insight "Aha! Moment")
- **Free → Paid Conversion**: >10% (value-first paywall)
- **Weekly Active Users (WAU)**: Track growth
- **Insight View Rate**: >80% (notification effectiveness)

### Technical Metrics
- **Mirror Chat Latency**: <400ms typing indicator
- **Insight Generation**: <30s per user
- **API Uptime**: >99.5%
- **Error Rate**: <0.1% of requests
- **Firestore Read/Write Latency**: <200ms

### Compliance Metrics
- **Account Deletion Requests**: Track volume
- **Data Export Requests**: Track volume
- **Privacy Policy Updates**: Version tracking
- **Security Audits**: Quarterly

---

## Next Steps

1. **Review & Approve Epics**: Validate all 8 epics and 43 stories
2. **Prioritize Stories**: Confirm implementation sequence
3. **Start Epic 1**: Initialize Next.js project, configure Firebase
4. **Setup Project Tracking**: Create GitHub Project or Jira board
5. **Begin Implementation**: Follow Phase 1 → Phase 6 sequence

---

## Files Created

- `/epics/epic-01-infrastructure.md`
- `/epics/epic-02-authentication.md`
- `/epics/epic-03-journaling.md`
- `/epics/epic-04-mirror-chat.md`
- `/epics/epic-05-insight-engine.md`
- `/epics/epic-06-payments.md`
- `/epics/epic-07-settings.md`
- `/epics/epic-08-analytics.md`
- `/epics/epic-summary.md` (this file)

---

**Ready to build Aurum Sanctuary. 🏛️✨**
