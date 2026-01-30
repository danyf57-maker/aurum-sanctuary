# Epic 8: Analytics & Monitoring

**Epic ID:** EPIC-08  
**Priority:** P1 (Important - Product insights & reliability)  
**Estimated Stories:** 4  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication)

---

## Epic Goal

Implement PostHog analytics for product insights, error monitoring, and performance tracking. This epic enables data-driven decisions while respecting user privacy (no PII, no entry content).

---

## User Value

As a **product owner**, I need to understand user behavior and system health so that I can improve the product and ensure reliability.

---

## Success Criteria

- [x] PostHog integrated (client + server-side)
- [x] Key events tracked (signup, entry created, insight viewed, subscription)
- [x] No PII or entry content tracked
- [x] Error monitoring functional (Google Cloud Error Reporting)
- [x] Performance metrics tracked (API latency, function duration)
- [x] Analytics dashboard accessible

---

## Stories

### Story 8.1: Setup PostHog Integration

**Story ID:** STORY-8.1  
**Priority:** P1  
**Dependencies:** STORY-1.1 (Next.js Project)

**As a** developer  
**I want** to integrate PostHog analytics  
**So that** I can track user behavior and product metrics

**Acceptance Criteria:**
- [ ] PostHog account created (Cloud or self-hosted)
- [ ] PostHog SDK installed (`posthog-js`, `posthog-node`)
- [ ] `lib/analytics/posthog.ts` created with PostHog client
- [ ] PostHog initialized in `app/layout.tsx` (client-side)
- [ ] PostHog API key stored in environment variables
- [ ] User identity tracked (hashed userId, no email)
- [ ] Session recording disabled (privacy)
- [ ] Autocapture disabled (explicit tracking only)

**Environment Variables:**
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Implementation:**
```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      autocapture: false, // Explicit tracking only
      capture_pageviews: true,
      disable_session_recording: true, // Privacy
      sanitize_properties: (properties) => {
        // Redact sensitive fields
        const sanitized = { ...properties };
        ['email', 'content', 'entryText'].forEach(key => delete sanitized[key]);
        return sanitized;
      },
    });
  }
}

export function identifyUser(userId: string) {
  posthog.identify(hashUserId(userId)); // Hash userId for privacy
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  posthog.capture(eventName, properties);
}
```

**Architecture Reference:** `architecture.md` Section "FR19-FR20: Analytics"

---

### Story 8.2: Implement Event Tracking

**Story ID:** STORY-8.2  
**Priority:** P1  
**Dependencies:** STORY-8.1

**As a** product owner  
**I want** to track key user events  
**So that** I can understand user behavior and conversion funnels

**Acceptance Criteria:**
- [ ] Events tracked:
  - **Auth**: `user_signup`, `user_login`, `user_logout`
  - **Journaling**: `entry_created`, `entry_deleted`, `draft_saved`
  - **Mirror Chat**: `mirror_message_sent`, `mirror_response_received`
  - **Insights**: `insight_generated`, `insight_viewed`, `insight_notification_sent`
  - **Payments**: `checkout_started`, `subscription_created`, `subscription_canceled`
  - **Settings**: `settings_updated`, `account_deleted`, `data_exported`
- [ ] Event properties include:
  - `timestamp` (ISO 8601)
  - `userId` (hashed)
  - `platform` (web, mobile)
  - `environment` (production, staging)
- [ ] No PII or entry content in event properties
- [ ] Events sent server-side for critical actions (subscription, account deletion)

**Event Examples:**
```typescript
// Entry created
trackEvent('entry_created', {
  wordCount: 250,
  hashedUserId: hashUserId(userId),
  platform: 'web',
});

// Insight viewed
trackEvent('insight_viewed', {
  insightId: insightId,
  periodStart: periodStart.toISOString(),
  hashedUserId: hashUserId(userId),
});

// Subscription created
trackEvent('subscription_created', {
  plan: 'pro',
  price: 9.99,
  hashedUserId: hashUserId(userId),
});
```

**Architecture Reference:** `architecture.md` Section "Server-Side Event Tracking"

---

### Story 8.3: Implement Error Monitoring

**Story ID:** STORY-8.3  
**Priority:** P1  
**Dependencies:** STORY-1.5 (Safe Logging)

**As a** developer  
**I want** to monitor errors and exceptions  
**So that** I can identify and fix issues quickly

**Acceptance Criteria:**
- [ ] Google Cloud Error Reporting configured
- [ ] Errors logged via `logger.errorSafe()` (no PII)
- [ ] Error context includes:
  - Error message (sanitized)
  - Stack trace
  - User ID (hashed)
  - Request path
  - Environment
- [ ] Critical errors trigger alerts (email, Slack)
- [ ] Error dashboard accessible in Google Cloud Console
- [ ] Error grouping by type and frequency

**Implementation:**
```typescript
// lib/logger/safe.ts (extended)
import { ErrorReporting } from '@google-cloud/error-reporting';
const errors = new ErrorReporting();

export function errorSafe(message: string, error?: Error, context?: Record<string, any>) {
  const sanitized = context ? redactSensitiveFields(context) : {};
  
  // Log to console
  console.error({
    level: 'ERROR',
    message,
    context: sanitized,
    timestamp: new Date().toISOString(),
  });
  
  // Report to Google Cloud Error Reporting
  if (process.env.NODE_ENV === 'production') {
    errors.report(error || new Error(message), {
      user: sanitized.hashedUserId,
      httpRequest: sanitized.httpRequest,
    });
  }
}
```

**Architecture Reference:** `architecture.md` Section "Safe Logging Patterns"

---

### Story 8.4: Implement Performance Monitoring

**Story ID:** STORY-8.4  
**Priority:** P2  
**Dependencies:** STORY-8.1

**As a** developer  
**I want** to monitor API and function performance  
**So that** I can identify bottlenecks and optimize

**Acceptance Criteria:**
- [ ] API route latency tracked (PostHog or Google Cloud Monitoring)
- [ ] Cloud Function duration tracked
- [ ] Key metrics:
  - `/api/mirror` response time (target: <400ms typing indicator)
  - `generateInsight` function duration (target: <30s)
  - `updateDerivedMemory` function duration (target: <3s)
  - Firestore read/write latency
- [ ] Performance dashboard created (PostHog Insights)
- [ ] Alerts configured for slow endpoints (>1s)
- [ ] Performance data retained for 90 days

**Implementation:**
```typescript
// lib/analytics/performance.ts
export function trackPerformance(metricName: string, duration: number, metadata?: Record<string, any>) {
  posthog.capture('performance_metric', {
    metric: metricName,
    duration_ms: duration,
    ...metadata,
  });
}

// Usage in API route
const startTime = Date.now();
// ... API logic
const duration = Date.now() - startTime;
trackPerformance('api_mirror_response', duration, { userId: hashedUserId });
```

**Architecture Reference:** `architecture.md` Section "Performance Monitoring"

---

## Dependencies

**Blocks:**
- None (this is a terminal epic)

**Blocked By:**
- EPIC-01 (Infrastructure) - Environment variables, Cloud Functions
- EPIC-02 (Authentication) - User identity for tracking

---

## Technical Notes

- **PostHog vs Google Analytics**: PostHog chosen for privacy-first approach, self-hosting option
- **Server-Side Tracking**: Critical events (subscription, account deletion) tracked server-side to prevent client-side blocking
- **Hashed User IDs**: Never track raw user IDs or emails
- **Session Recording**: Disabled for privacy (no screen capture)
- **Data Retention**: 90 days for performance metrics, 1 year for events

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| PII leaked in events | Sanitize all event properties, CI checks |
| Analytics blocking (ad blockers) | Server-side tracking for critical events |
| Performance overhead | Async tracking, batch events, sample high-volume events |
| Data retention compliance | Configure retention policies, auto-delete old data |

---

## Definition of Done

- [ ] All 4 stories completed and acceptance criteria met
- [ ] PostHog integrated and tracking events
- [ ] Error monitoring functional
- [ ] Performance metrics tracked
- [ ] Analytics dashboard accessible
- [ ] No PII or entry content tracked (verified)
- [ ] Unit tests for tracking functions (>80% coverage)
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking

---

## Analytics Events Reference

| Event | Properties | Trigger |
|---|---|---|
| `user_signup` | `hashedUserId`, `method` (google/email) | User creates account |
| `entry_created` | `wordCount`, `hashedUserId` | Entry saved to Firestore |
| `insight_viewed` | `insightId`, `periodStart`, `hashedUserId` | User views insight |
| `subscription_created` | `plan`, `price`, `hashedUserId` | Stripe webhook: subscription created |
| `mirror_message_sent` | `messageLength`, `hashedUserId` | User sends Mirror Chat message |
| `account_deleted` | `hashedUserId`, `reason` (optional) | User deletes account |

---

## Performance Metrics Reference

| Metric | Target | Alert Threshold |
|---|---|---|
| `/api/mirror` typing indicator | <400ms | >500ms |
| `generateInsight` duration | <30s | >45s |
| `updateDerivedMemory` duration | <3s | >5s |
| Firestore write latency | <200ms | >500ms |
| Page load time (dashboard) | <2s | >3s |
