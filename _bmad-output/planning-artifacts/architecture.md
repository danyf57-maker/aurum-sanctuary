---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/product-brief-aurum-sanctuary-2026-01-29.md', 'docs/blueprint.md']
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-01-29'
project_name: 'aurum-sanctuary'
user_name: 'Danielfioriti'
date: '2026-01-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Aurum Sanctuary is a journaling PWA with 3 core engines:
- **Auth & Onboarding** (FR1-FR3): Google/Email Auth, Terms acceptance, Online-only V1.
- **Journaling** (FR4-FR6, FR19): Unlimited text entries, auto-save local (encrypted session), Timeline view.
- **Mirror Chat** (FR7-FR9, FR22): Always-active background listening, reflective questions, typing indicator <400ms (UI-immediate).
- **Insight Engine** (FR10-FR12, FR17): Weekly async summaries (7-day cycle), notification, paywall-gated.
- **Payment** (FR15-FR16): Stripe subscription, status enforcement.
- **Settings** (FR18): Notifications, Terms, Account Deletion, **Privacy Explained** (transparency page).
- **Admin** (FR13-FR14): Nuclear Delete, Admin-Blind access (no decrypted text).
- **Analytics** (FR20-FR21): Server-side tracking (Next.js API), no PII/text/embeddings.

**Non-Functional Requirements:**
- **Security & Privacy (Critical)**: Admin-Blind Privacy architecture, E2EE for entry text, Right to be Forgotten (30-day purge).
- **Performance**: Typing Indicator <400ms (UI-immediate), full response target <1200ms, TTI <1.5s on 4G.
- **Reliability**: No data loss (local drafts persisted until sync).
- **Accessibility**: WCAG 2.1 AA, strict contrast ratios.

### Scale & Complexity

- **Primary domain**: Web App (PWA) / Healthcare (Light)
- **Complexity level**: **High** (Privacy constraints + Real-time AI + Async Insights + Derived Memory)
- **Estimated architectural components**: 
  - Auth Wrapper (Guard)
  - Journal Editor (Auto-save + E2EE)
  - Mirror Engine (Streaming AI, Edge Functions)
  - Insight Engine (Async Scheduler, Cloud Functions)
  - Derived Memory Service (Synthesis Engine)
  - Admin Panel (Pulse Dashboard, restricted SDK)

### Technical Constraints & Dependencies

**Stack (Imposed by Blueprint):**
- Next.js (App Router) Monorepo
- Firebase (Firestore, Auth, Cloud Functions)
- Stripe (Payments)
- **LLM Integration: DeepSeek** (via Edge/Server Functions depending on latency constraints)
- Analytics (PostHog, Server-Side Proxy)

### Critical Architectural Decision: Derived Memory Architecture

**Problem Statement:**
Tension between Privacy (Zero-Knowledge promise) and AI Quality (requires context). Raw journal access by AI is unacceptable; no context makes AI irrelevant.

**Solution: Hybrid "Derived Memory" Architecture**

**Principle:**
> We protect what is intimate (raw journal text), but give the AI sufficient context (synthetic memory) to be genuinely useful.

**Architecture Components:**

1. **Entry Text Storage (E2EE at Rest + Admin-Blind Server-Side Processing)**
   - User writes entry → encrypted client-side (AES-256) → stored in Firestore as `entry.encryptedText`.
   - **Encryption key**: User-specific symmetric key generated at account creation, stored encrypted server-side (Firebase KMS/master key), never exposed to humans.
   - **Admin-Blind Guarantee**: No human admin can read raw text (automated processes can decrypt temporarily in isolated environments only).

2. **Derived Memory Service (Cloud Function - Weekly)**
   - **Trigger**: Scheduled (weekly) or on-demand (user requests Insight).
   - **Process**:
     1. Retrieves user's encrypted entries from Firestore.
     2. Decrypts entries **temporarily in memory** (isolated environment, no logs, no persistence).
     3. Generates synthetic summary: patterns, emotional markers, recurring themes, temporal rhythms.
     4. Stores derived memory in `users/{uid}/derivedMemory` (**clear text but abstracted, non-verbatim, non-reversible, and non-identifying**).
     5. **Purges decrypted text from memory immediately**.
   - **Output**: Non-semantic metadata (rhythm, timing, length) + semantic abstractions (themes, not quotes).

3. **Mirror Chat (Real-Time AI - Edge Functions)**
   - **Reactive Contextual Presence**: Triggered by pauses and writing signals (not continuous surveillance).
   - **Context Sources**:
     - Current session (decrypted client-side, sent to Edge Function).
     - Derived Memory (read from Firestore, already abstracted).
   - **LLM (DeepSeek) Input**: Session context + derived memory summary (never raw historical entries).
   - **Typing Indicator**: UI-immediate (<400ms), model response target <1200ms.

4. **Insight Engine (Async - Cloud Functions)**
   - **Input**: Derived Memory (already synthesized).
   - **Output**: Weekly narrative insight (pattern revelation, not diagnosis).
   - **Delivery**: Push notification → Paywall gate → Full Insight (subscribers only).

**Privacy Model: "Admin-Blind" (Not Zero-Knowledge)**

- **Admin-Blind**: No human (admin, support, engineer) can read raw journal text.
- **Server-Side Processing**: Automated processes (Cloud Functions) can decrypt temporarily for synthesis, but:
  - No persistence of decrypted text.
  - Isolated execution environment (no logs, no network egress during decryption).
  - Audit trail of function executions (who triggered, when, no content).

**Terminology Correction:**
- ~~"Zero-Knowledge"~~ → **"Admin-Blind Privacy"** or **"Medical-Grade Privacy"** (accurate, legally safe).

### Cross-Cutting Concerns Identified

1. **Privacy vs AI Quality**: Resolved via Derived Memory (synthetic context, no raw access).
2. **Latency vs Security**: Mirror Chat uses Edge Functions + optimistic UI; Insight Engine is async (no latency pressure).
3. **Admin Transparency vs Privacy**: Admin sees aggregated metrics only, no raw text (enforced by E2EE + Admin-Blind architecture).
4. **Offline Support**: Deferred to V2 (V1 is online-only PWA with local draft persistence).
5. **Key Management**: Symmetric keys stored server-side (encrypted by Firebase master key) to enable async Insight Engine.
6. **User Transparency**: "Privacy Explained" page in Settings (visual diagram of data flow: Entry → Encrypted → Derived Memory → AI).

---

## Starter Template Evaluation

### Primary Technology Domain

**Web Application (PWA)** based on project requirements analysis.

### Starter Options Considered

Given that **Next.js (App Router)** is already imposed by the Blueprint, the evaluation focused on optimal configuration rather than framework selection.

### Selected Starter: Next.js 15 App Router

**Rationale for Selection:**
- **Imposed by Blueprint**: Next.js (App Router) is the mandated framework.
- **Server-First Architecture**: Facilitates centralized security controls (audit logs, rate limiting, proxy), though Admin-Blind requires explicit key management + process isolation.
- **Edge Functions Support**: Native support for low-latency Mirror Chat (<400ms typing indicator).
- **PWA Ready**: Native manifest.ts + custom service worker approach (no third-party plugins).
- **React 19 + TypeScript**: Type safety critical for E2EE, Firestore Rules, DeepSeek API integration.

**Initialization Command:**

```bash
npx create-next-app@latest aurum-sanctuary \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --turbopack \
  --import-alias "@/*" \
  --use-npm
```

**Fallback**: `--no-turbopack` if dev server issues (rare but documented).

### Architectural Decisions Provided by Starter

#### Language & Runtime

- **TypeScript**: Strict mode enabled for type safety across E2EE, Firestore, DeepSeek integration.
- **Node.js 20+**: Required for Next.js 15 compatibility.
- **React 19**: Stable version, **pinned strict in package.json** (e.g., `"react": "19.0.0"`, not `^19.0.0`).
- **Next.js 15.x**: **Pinned strict alongside React** to prevent version drift instability.

#### Styling Solution

- **Tailwind CSS**: Utility-first framework aligned with Blueprint (deep gold `#D4AF37`, soft beige `#F5F5DC`, muted brown).
- **CSS Modules**: For complex components (Mirror Chat UI, Timeline animations).
- **Design Tokens**: Centralized in `tailwind.config.ts` for brand consistency.

#### Build Tooling

- **Turbopack**: Default dev server (ultra-fast HMR).
  - **Fallback**: `next dev --no-turbopack` if issues arise.
- **App Router**: Nested layouts, parallel routes, intercepting routes.
- **Edge Runtime**: For Mirror Chat (streaming AI, low latency).
- **Server Components**: Default rendering strategy (reduces client JS bundle).

#### Testing Framework

- **Jest + React Testing Library**: Unit tests (to be configured in Epic: Testing Infrastructure).
- **Playwright**: E2E tests (Auth flow, Paywall, Mirror Chat interactions).
- **Coverage Target**: 80% for critical paths (E2EE, payment, AI).

#### Code Organization (Best Practices 2026)

```
aurum-sanctuary/
├── app/                          # Routing + Server Components
│   ├── (public)/                # Route group: Landing, Login, Terms
│   ├── (protected)/             # Route group: Post-Auth (Dashboard, Journal, Settings)
│   ├── api/                     # API Routes
│   │   ├── analytics/          # PostHog proxy (server-side tracking)
│   │   ├── stripe/             # Webhooks (subscription events)
│   │   └── mirror/             # Edge Function (DeepSeek streaming)
│   ├── manifest.ts              # PWA manifest (native Next.js approach)
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI (framework-agnostic)
│   ├── ui/                      # Primitives (Button, Input, Card)
│   └── features/                # Domain components (MirrorChat, Timeline, InsightCard)
├── lib/                          # Server-side logic
│   ├── firebase/                # Firestore, Auth SDK, Admin SDK
│   ├── deepseek/                # LLM adapter (timeouts, retries, log redaction)
│   ├── crypto/
│   │   ├── client/              # WebCrypto API (SubtleCrypto for client-side E2EE)
│   │   └── server/              # Node crypto (for Cloud Functions decryption)
│   ├── stripe/                  # Payment logic (subscription, webhooks)
│   └── analytics/               # PostHog server-side proxy
├── hooks/                        # Client-side hooks (useAuth, useMirror, useInsight)
├── types/                        # TypeScript definitions (User, Entry, DerivedMemory)
├── utils/                        # Pure helpers (formatters, validators)
└── public/
    └── sw.js                     # Custom service worker (cache strategies)
```

**Route Naming Convention**: `(public)` / `(protected)` (standardized across PRD + Architecture).

#### Development Experience

- **Hot Reload**: Instant via Turbopack (fallback to Webpack if needed).
- **TypeScript**: Strict mode (`"strict": true`, `"noUncheckedIndexedAccess": true`).
- **ESLint**: Next.js config + custom rules (no `any`, enforce `"use client"` directive).
- **Prettier**: Consistent formatting (integrated with ESLint).
- **Absolute Imports**: `@/components`, `@/lib`, `@/hooks` (via `tsconfig.json` paths).

#### LLM Integration: DeepSeek (Pluggable via Adapter Pattern)

**Adapter Responsibilities:**
- **Timeouts**: 5s for Mirror Chat (Edge), 30s for Insight Engine (Cloud Function).
- **Retries**: Max 2 retries with exponential backoff (100ms, 200ms).
- **Log Redaction**: Automatically strip user text from logs (only log metadata: `userId`, `timestamp`, `tokenCount`).
- **Error Handling**: Graceful degradation (Mirror Chat silent fail, Insight Engine retry queue).

**Implementation Location**: `lib/deepseek/adapter.ts`

#### PWA Configuration

**Approach**: Next.js native (no third-party plugins like `next-pwa`).

**Manifest** (`app/manifest.ts`):
```typescript
export default function manifest() {
  return {
    name: 'Aurum Sanctuary',
    short_name: 'Aurum',
    description: 'Your private space for reflection and insight',
    theme_color: '#D4AF37',
    background_color: '#F5F5DC',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
```

**Service Worker** (`public/sw.js`):
- Cache-first for static assets.
- Network-first for API routes.
- Offline fallback page (deferred to V2).

#### Crypto Architecture (Edge Runtime Constraints)

**Client-Side** (`lib/crypto/client/`):
- **WebCrypto API** (SubtleCrypto) for encryption/decryption.
- **Algorithm**: AES-GCM (256-bit).
- **Key Derivation**: PBKDF2 (100k iterations) from user-specific key (stored encrypted server-side).

**Server-Side** (`lib/crypto/server/`):
- **Node crypto** for Cloud Functions (Insight Engine, Derived Memory Service).
- **Mirror Chat (Edge Function)**: Receives **pre-decrypted text** from client (no decryption in Edge Runtime).

**Critical Constraint**: Edge Runtime does not support `node:crypto`. All Edge Functions must use WebCrypto or receive decrypted data.

### Note

Project initialization using the above command should be the **first implementation story** in Epic: Infrastructure Setup.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Firestore schema design (entries, derivedMemory split, insights)
- Security Rules (prevent subscription tampering)
- Key management flow (wrappedContentKey + client unwrapping)
- Derived Memory architecture (lite vs summary)
- Rate limiting strategy (prevent cost explosion)

**Important Decisions (Shape Architecture):**
- State management (Zustand for Mirror Chat, Context for rest)
- CI/CD pipeline (GitHub Actions for Cloud Functions)
- Monitoring tools (Error Reporting, not Crashlytics)
- Insight timing model (fixed day vs rolling)

**Deferred Decisions (Post-MVP):**
- Offline support (Service Worker cache strategies)
- Web Push notifications (VAPID + FCM)
- Multi-language support (i18n)

---

### 1. Data Architecture (Firestore)

**Firestore Schema Design:**

```typescript
// Collection: users (read-only for client, write via Cloud Functions)
users/{uid}
  - email: string
  - displayName: string
  - createdAt: timestamp
  - subscriptionStatus: 'trial' | 'active' | 'expired' (write: Cloud Functions only)
  - subscriptionId: string (Stripe, write: Cloud Functions only)
  - wrappedContentKey: string (encrypted by KMS, unwrapped via secure flow)
  - insightDay: number (0-6, day of week for fixed-day insights)

// Sub-collection: user settings (client can write)
users/{uid}/settings/preferences
  - notificationsEnabled: boolean
  - theme: 'light' | 'dark'

// Collection: entries (encrypted text)
users/{uid}/entries/{entryId}
  - encryptedText: string (AES-GCM, client-side encrypted)
  - createdAt: timestamp
  - updatedAt: timestamp
  - entryLength: number (metadata, non-sensitive)

// Collection: derivedMemory (SPLIT for security + Edge compatibility)
users/{uid}/derivedMemory/lite
  - labels: string[] (non-identifying, non-sensitive: 'stress-work', 'sleep', 'relationships')
  - stats: { avgEntriesPerWeek: number, preferredTime: string }
  - lastUpdated: timestamp
  // Used by: Mirror Chat (Edge Function) - clear text, safe

users/{uid}/derivedMemory/summary
  - encryptedSummary: string (AES-GCM, rich semantic patterns)
  - lastUpdated: timestamp
  // Used by: Insight Engine (Cloud Function) - encrypted, sensitive

// Collection: insights (paywall-gated)
users/{uid}/insights/{insightId}
  - createdAt: timestamp
  - periodStart: timestamp (7-day window start)
  - periodEnd: timestamp (7-day window end)
  - narrative: string (generated by Insight Engine)
  - isRead: boolean
```

**Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Client can READ user doc, but CANNOT WRITE (prevents subscription tampering)
      allow read: if request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions can write
      
      // Client CAN write to settings sub-collection
      match /settings/{doc} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /entries/{entryId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /derivedMemory/{doc} {
        allow read: if request.auth.uid == userId;
        allow write: if false; // Only Cloud Functions
      }
      
      match /insights/{insightId} {
        allow read: if request.auth.uid == userId;
        allow write: if false; // Only Cloud Functions
      }
    }
  }
}
```

**Key Management:**
- **Wrapped Content Key**: User-specific symmetric key, wrapped by Firebase KMS, stored in `users/{uid}.wrappedContentKey`.
- **Client Access Flow**:
  1. User authenticates (Firebase ID token)
  2. Client calls Cloud Function `getContentKey()` (callable)
  3. Function returns unwrapped key (over HTTPS, never logged)
  4. Client stores key in-device memory only (never localStorage, never logs)
  5. Client uses key for encrypt/decrypt via WebCrypto API
- **Admin-Blind Guarantee**: Keys accessible only to automated Cloud Functions; no human access; no plaintext logging; strict IAM (Editor role with restrictions, no Owner).

**Derived Memory Architecture:**
- **Lite** (`derivedMemory/lite`): Clear text, non-sensitive labels + stats, used by Mirror Chat (Edge Function).
- **Summary** (`derivedMemory/summary`): Encrypted, rich semantic patterns, used by Insight Engine (Cloud Function).
- **Vocabulary Constraint**: Lite uses only non-identifying, non-sensitive labels (e.g., "stress-work", "sleep", "relationships"), no phrases, no medical terms.

**Data Validation:**
- **Zod Schemas**: Centralized in `lib/schemas/firestore.ts`, imported by client and server.
- **Client-Side**: Validate before Firestore write.
- **Server-Side**: Validate in Cloud Functions before processing.

---

### 2. Authentication & Security

**Firebase Auth Providers:**
- Google OAuth
- Email/Password

**Session Management:**
- Firebase Auth tokens (auto-refresh)
- Next.js middleware for route guards (`(protected)` route group)

**Rate Limiting:**
- **Mirror Chat (Edge Function)**:
  - **Technical requests** (streaming chunks, typing indicator): 20 req/min/user
  - **User-visible interventions** (Mirror questions): Max 1 every 90 seconds (cooldown)
  - **Daily cap**: 100 Mirror Chat requests/day/user (prevent spam/cost)
- **Insight Engine (Cloud Function)**: 1 req/week/user (fixed day model)

**Admin SDK IAM Restrictions:**
- Cloud Functions use Service Account with `Editor` role (restricted), NOT `Owner`.
- All Admin SDK operations logged (who triggered, when, no content).
- No human access to decrypted data (Admin-Blind enforcement).

---

### 3. Insight Timing Model

**Model**: **Fixed Day of Week** (not rolling 7 days)
- User selects `insightDay` (0-6) during onboarding (default: registration day).
- Insight Engine runs weekly on that day (e.g., every Sunday at 9am UTC).
- `periodStart` / `periodEnd` timestamps define the 7-day window analyzed.

**Rationale**: Better ritual/notification consistency (aligns with PRD Section 5.2).

---

### 4. API & Communication

**API Routes (Next.js):**
- `/api/analytics`: PostHog proxy (server-side tracking)
- `/api/stripe/webhook`: Stripe events (subscription updates)
- `/api/mirror`: Edge Function (DeepSeek streaming)

**Cloud Functions (Firebase):**
- `getContentKey()`: Callable, returns unwrapped encryption key to authenticated client
- `generateInsight()`: Scheduled (weekly), generates Insight from Derived Memory Summary
- `updateDerivedMemory()`: Scheduled (weekly), updates Derived Memory Lite + Summary

**Error Handling:**
- Standard format: `{ error: { code, message, details } }`
- Client-side: Toast notifications (non-blocking)

---

### 5. Frontend Architecture

**Data Fetching:**
- **React Server Components**: Default for data fetching (not "state management")
- **Server Actions**: For mutations where applicable

**Client State Management:**
- **Zustand**: Mirror Chat state only (messages, typing indicator, streaming) - prevents re-render hell
- **React Context + useState**: Auth, user settings, theme

**Form State:**
- React Hook Form + Zod validation

**Component Architecture:**
- Atomic Design (Atoms → Molecules → Organisms)
- Server Components by default, `"use client"` only when necessary

---

### 6. Notifications

**V1 Scope**: **In-app notifications only** (no web push)
- Toast notifications for Insight ready, subscription events
- Badge indicator for unread Insights

**V2 (Deferred)**: Web Push via VAPID + Service Worker
- Requires `pushTokens` / `fcmToken` in schema
- User consent flow + token rotation

---

### 7. Infrastructure & Deployment

**CI/CD Pipeline:**
- **Vercel**: Auto-deploy on push to `main` (Next.js app)
- **Firebase Cloud Functions**: **GitHub Actions** (not manual)

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Cloud Functions
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g firebase-tools
      - run: firebase deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

**Security Note**: `FIREBASE_TOKEN` is temporary for V1; migrate to **Workload Identity Federation (OIDC)** in V2 (service account auth, not personal token).

**Environment Variables:**
- `.env.local` (dev)
- Vercel Environment Variables (prod - Next.js)
- Firebase Config (Cloud Functions)

**Monitoring:**
- **Vercel Analytics**: Performance (TTI, LCP, CLS)
- **Google Cloud Error Reporting + Logging**: Cloud Functions errors (not Crashlytics - that's for mobile)
- **PostHog**: User behavior (server-side tracking)

---

### 8. Decision Impact Analysis

**Implementation Sequence:**
1. **Infrastructure Setup**: Next.js init, Firebase project, Firestore schema
2. **Authentication**: Firebase Auth (Google + Email/Password), route guards
3. **Encryption Layer**: WebCrypto client utils, Key management Cloud Function
4. **Journaling**: Entry CRUD (encrypted), Timeline view
5. **Mirror Chat**: Edge Function (DeepSeek), Zustand state, streaming UI
6. **Derived Memory**: Cloud Function (weekly), Lite + Summary generation
7. **Insight Engine**: Cloud Function (scheduled), Paywall integration
8. **Payments**: Stripe integration, webhook handler, subscription enforcement
9. **Analytics**: PostHog proxy, event tracking (no PII)
10. **Testing**: Jest unit tests, Playwright E2E

**Cross-Component Dependencies:**
- **Encryption** blocks Journaling, Derived Memory, Insights
- **Auth** blocks all protected features
- **Derived Memory** blocks Mirror Chat (needs Lite) and Insights (needs Summary)
- **Payments** blocks Insight access (paywall)

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 15 areas where AI agents could make different choices without explicit patterns.

---

### 1. Naming Patterns

**Firestore Collections/Documents:**
- **Top-level collection**: `users` only
- **Subcollections**: `users/{uid}/entries`, `users/{uid}/insights`, `users/{uid}/derivedMemory`, `users/{uid}/settings`
- **Document IDs**:
  - `uid`: Firebase Auth UID
  - `entryId`: ULID (chronological sort)
  - `insightId`: `${periodStart}_${periodEnd}` or ULID
- **Field naming**: `camelCase` (e.g., `createdAt`, `encryptedText`, `subscriptionStatus`)

**API Endpoints (Next.js):**
- **Pattern**: `/api/<domain>/<action>` in lowercase, kebab-case for multi-word actions
- **Examples**:
  - `/api/stripe/webhook`
  - `/api/mirror/stream`
  - `/api/user/get-content-key`

**Cloud Functions (Firebase):**
- **Pattern**: `camelCase` (e.g., `getContentKey`, `generateInsight`, `updateDerivedMemory`)

**Code Naming:**
- **Components**: `PascalCase` (e.g., `MirrorChat.tsx`, `InsightCard.tsx`)
- **Files**: Match component name (e.g., `MirrorChat.tsx`)
- **Functions**: `camelCase` (e.g., `getUserData`, `encryptEntry`)
- **Variables**: `camelCase` (e.g., `userId`, `encryptedText`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_ENTRY_LENGTH`, `RATE_LIMIT_MIRROR`)

---

### 2. Structure Patterns

**Project Organization:**
```
aurum-sanctuary/
├── app/                    # Next.js App Router
│   ├── (public)/          # Landing, Login, Terms
│   ├── (protected)/       # Dashboard, Journal, Settings
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Primitives (Button, Input, Card)
│   └── features/          # Domain components (MirrorChat, Timeline)
├── lib/
│   ├── crypto/
│   │   ├── client/       # WebCrypto (*.test.ts co-located)
│   │   └── server/       # Node crypto
│   ├── schemas/          # Zod schemas (firestore.ts, derived-memory.ts)
│   ├── rate-limit.ts     # Upstash Redis rate limiting
│   └── logger.ts         # Safe logging utilities
├── hooks/                 # React hooks (*.test.ts co-located)
├── types/                 # TypeScript definitions
└── __tests__/            # Integration/E2E tests (Playwright)
```

**Test Location:**
- **Unit tests**: Co-located with source files (`Button.test.tsx`, `encrypt.test.ts`)
- **Integration tests**: `__tests__/integration/`
- **E2E tests**: `__tests__/e2e/` (Playwright)

**Component Organization:**
- **`components/ui/`**: Framework-agnostic primitives (Button, Input, Card)
- **`components/features/`**: Domain-specific components (MirrorChat, Timeline, InsightCard)
- **No Atomic Design folders** (atoms/molecules/organisms) - pragmatic V1 approach

---

### 3. Format Patterns

**API Response Format:**
```typescript
// Success
{ data: T }

// Error
{ error: { code: string, message: string, details?: any } }
```

**Firestore Date/Time:**
- **Storage**: Firestore `Timestamp`
- **Client**: Convert to `Date` object
- **API**: ISO 8601 strings (`toISOString()`)

**Zod Schema (Date/Timestamp Handling):**
```typescript
// lib/schemas/firestore.ts
import { Timestamp } from 'firebase/firestore';

const FirestoreTimestamp = z.custom<Timestamp>(
  (val) => val instanceof Timestamp
).transform((val) => val.toDate());

export const EntrySchema = z.object({
  encryptedText: z.string(),
  createdAt: z.union([z.date(), FirestoreTimestamp]),
  updatedAt: z.union([z.date(), FirestoreTimestamp]),
  entryLength: z.number().min(0)
});
```

**JSON Field Naming:**
- Firestore: `camelCase` (matches TypeScript)
- API: `camelCase` (consistency)

---

### 4. Communication Patterns

**Event Naming:**
- **Format**: `domain.action` (e.g., `insight.generated`, `entry.created`)
- **Case**: lowercase, dot-separated

**State Management:**

**Zustand (Mirror Chat only):**
```typescript
// store/mirror.ts
import { create } from 'zustand';

interface MirrorState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (msg: Message) => void;
  setTyping: (typing: boolean) => void;
}

export const useMirrorStore = create<MirrorState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setTyping: (typing) => set({ isTyping: typing })
}));
```

**React Context (Auth, Settings):**
```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
```

---

### 5. Process Patterns

**Error Handling:**

**Client-side:**
```typescript
try {
  await encryptEntry(text);
} catch (error) {
  toast.error('Failed to save entry');
  logger.errorSafe('Entry encryption failed', {
    uid: user.uid,
    errorCode: error.code,
    errorMessage: error.message
  });
}
```

**Server-side (Cloud Function):**
```typescript
import * as functions from 'firebase-functions';

export const generateInsight = functions.https.onCall(async (data, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    
    await generateInsightForUser(uid);
    return { data: { success: true } };
  } catch (error) {
    logger.errorSafe('Insight generation failed', {
      uid: context.auth?.uid,
      errorCode: error.code,
      errorMessage: error.message,
      requestId: context.instanceIdToken
    });
    throw new functions.https.HttpsError('internal', 'Failed to generate insight');
  }
});
```

**Safe Logging Pattern:**
```typescript
// lib/logger.ts
export const logger = {
  errorSafe: (message: string, context: {
    uid?: string;
    errorCode?: string;
    errorMessage?: string;
    requestId?: string;
  }) => {
    // NEVER log: error object, payload, decrypted text, encryption keys
    console.error(message, {
      uid: context.uid,
      errorCode: context.errorCode,
      errorMessage: context.errorMessage?.substring(0, 100), // Truncate
      requestId: context.requestId,
      timestamp: new Date().toISOString()
    });
  }
};
```

**Loading States:**
- **Naming**: `isLoading`, `isSubmitting` (boolean, `is` prefix)
- **Global**: Zustand store for Mirror Chat
- **Local**: `useState` for forms

---

### 6. Security Patterns (CRITICAL)

**Encryption Key Handling:**
```typescript
// ❌ NEVER
localStorage.setItem('key', key);        // FORBIDDEN
console.log('Key:', key);                // FORBIDDEN
sessionStorage.setItem('key', key);      // FORBIDDEN

// ✅ ALWAYS
let contentKey: CryptoKey | null = null; // In-memory only
// Use for encrypt/decrypt, then clear
contentKey = null;
```

**Admin-Blind Enforcement (Cloud Functions):**
```typescript
export const generateInsight = functions.https.onCall(async (data, context) => {
  const uid = context.auth!.uid;
  
  // ✅ Decrypt temporarily in isolated environment
  const entries = await decryptEntries(uid);
  const summary = await synthesize(entries);
  
  // ✅ Best-effort memory clearing (no logs, no persistence, no egress)
  entries.splice(0, entries.length); // Clear array
  
  // ✅ Store only abstracted summary (encrypted)
  await storeDerivedMemory(uid, summary);
});
```

**Derived Memory Access Patterns:**
```typescript
// Mirror Chat (Edge Function) - Use ONLY lite (clear, non-sensitive)
const lite = await firestore.doc(`users/${uid}/derivedMemory/lite`).get();
const labels = lite.data()?.labels; // Whitelisted labels only

// Insight Engine (Cloud Function) - Use summary (encrypted, rich)
const summary = await firestore.doc(`users/${uid}/derivedMemory/summary`).get();
const decrypted = await decrypt(summary.data()!.encryptedSummary);
```

**Derived Memory Taxonomy (Strict Whitelist):**
```typescript
// lib/schemas/derived-memory.ts
export const ALLOWED_LABELS = [
  // Emotional (neutral)
  'calm', 'energized', 'tired', 'focused', 'scattered',
  
  // Activities (non-clinical)
  'work', 'exercise', 'social', 'rest', 'creative',
  
  // Themes (abstract)
  'relationships', 'goals', 'challenges', 'growth', 'routine'
] as const;

export type AllowedLabel = typeof ALLOWED_LABELS[number];

export const DerivedMemoryLiteSchema = z.object({
  labels: z.array(z.enum(ALLOWED_LABELS)).max(10),
  stats: z.object({
    avgEntriesPerWeek: z.number(),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/) // HH:mm format
  }),
  lastUpdated: z.union([z.date(), FirestoreTimestamp])
});

// ❌ FORBIDDEN in lite: clinical terms, diagnoses, sensitive topics
// Examples: 'depression', 'anxiety', 'suicide', 'addiction', 'trauma', 'divorce'
```

---

### 7. Rate Limiting Patterns

**Infrastructure Decision:**
- **Rate Limiting Store**: **Upstash Redis** (Vercel-compatible, serverless)
- **Environment Variables**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Implementation:**
```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export async function checkMirrorRateLimit(uid: string): Promise<boolean> {
  const key = `mirror:${uid}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // 1 min window
  return count <= 20; // 20 technical requests/min
}

export async function checkMirrorInterventionLimit(uid: string): Promise<boolean> {
  const key = `mirror:intervention:${uid}`;
  const lastIntervention = await redis.get<number>(key);
  const now = Date.now();
  
  if (!lastIntervention || now - lastIntervention > 90000) { // 90s cooldown
    await redis.set(key, now, { ex: 90 });
    return true;
  }
  return false;
}
```

---

### 8. Validation Patterns

**Zod Schemas (Centralized):**
```typescript
// lib/schemas/firestore.ts
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

const FirestoreTimestamp = z.custom<Timestamp>(
  (val) => val instanceof Timestamp
).transform((val) => val.toDate());

export const EntrySchema = z.object({
  encryptedText: z.string().min(1),
  createdAt: z.union([z.date(), FirestoreTimestamp]),
  updatedAt: z.union([z.date(), FirestoreTimestamp]),
  entryLength: z.number().min(0).max(50000)
});

export const UserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1),
  subscriptionStatus: z.enum(['trial', 'active', 'expired']),
  insightDay: z.number().min(0).max(6)
});
```

**Client-side Validation:**
```typescript
const validated = EntrySchema.parse(entry); // Throws on error
```

**Server-side Validation (Cloud Function):**
```typescript
const result = EntrySchema.safeParse(data);
if (!result.success) {
  throw new functions.https.HttpsError('invalid-argument', 'Invalid entry data', result.error);
}
```

---

### 9. Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly (camelCase, PascalCase, kebab-case as specified)
2. Use Firestore subcollections under `users/{uid}/` (not top-level collections)
3. Co-locate unit tests with source files (`*.test.ts`)
4. Use standard API response format `{ data: T }` or `{ error: { code, message } }`
5. NEVER log encryption keys, decrypted content, or raw error objects
6. Use Zod schemas from `lib/schemas/` for all data validation
7. Access Derived Memory according to role:
   - Mirror Chat (Edge) → `derivedMemory/lite` only
   - Insight Engine (Cloud Function) → `derivedMemory/summary` only
8. Use ONLY whitelisted labels (`ALLOWED_LABELS`) in Derived Memory Lite
9. Implement rate limiting via Upstash Redis before calling DeepSeek API
10. Use TypeScript strict mode (no `any`, enable `noUncheckedIndexedAccess`)
11. Prefer Server Components, use `"use client"` only for interactivity
12. Organize components in `ui/` (primitives) and `features/` (domain)

**Pattern Enforcement:**
- **ESLint**: Custom rules in `.eslintrc.json`
  - `@typescript-eslint/no-explicit-any`: error
  - `react/no-unnecessary-use-client`: warn
- **Pre-commit**: Husky + lint-staged (format + lint)
- **CI**: GitHub Actions (type check, lint, test)

---

### 10. Pattern Examples

**✅ Good Example (Entry Creation):**
```typescript
// components/features/JournalEditor.tsx
'use client';

import { useState } from 'react';
import { encryptEntry } from '@/lib/crypto/client/encrypt';
import { EntrySchema } from '@/lib/schemas/firestore';
import { logger } from '@/lib/logger';
import { toast } from '@/components/ui/toast';

export function JournalEditor() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (text: string) => {
    try {
      setIsSubmitting(true);
      
      const encrypted = await encryptEntry(text);
      const entry = EntrySchema.parse({
        encryptedText: encrypted,
        createdAt: new Date(),
        updatedAt: new Date(),
        entryLength: text.length
      });
      
      await saveEntry(entry);
      toast.success('Entry saved');
    } catch (error) {
      toast.error('Failed to save entry');
      logger.errorSafe('Entry save failed', {
        uid: user.uid,
        errorCode: error.code,
        errorMessage: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

**❌ Anti-Patterns:**
```typescript
// ❌ Wrong collection structure (top-level entries)
firestore.collection('entries').doc(entryId).set(...);
// ✅ Correct: firestore.collection('users').doc(uid).collection('entries').doc(entryId).set(...);

// ❌ Wrong naming (snake_case)
const user_id = getUserId();
// ✅ Correct: const userId = getUserId();

// ❌ Key in localStorage
localStorage.setItem('encryptionKey', key);
// ✅ Correct: let contentKey: CryptoKey | null = null; // In-memory only

// ❌ No validation
await saveEntry({ text: rawText });
// ✅ Correct: const validated = EntrySchema.parse(entry);

// ❌ Logging sensitive data
console.log('Entry text:', decryptedText);
logger.error('Failed', { error }); // Raw error object
// ✅ Correct: logger.errorSafe('Failed', { uid, errorCode, errorMessage });

// ❌ Forbidden label in Derived Memory Lite
labels: ['depression', 'anxiety'] // FORBIDDEN
// ✅ Correct: labels: ['tired', 'challenges'] // Whitelisted

// ❌ Unnecessary 'use client'
'use client'; // In a component with no interactivity
// ✅ Correct: Use Server Component by default
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
aurum-sanctuary/
├── README.md
├── CONTRIBUTING.md                     # Dev setup, testing guide
├── package.json
├── package-lock.json
├── next.config.js                      # NO webpack test ignore hack
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js                      # Unit tests config
├── playwright.config.ts                # E2E tests config (prod mode in CI)
├── .env.local
├── .env.example
├── .gitignore
├── .eslintrc.json                      # + no-restricted-imports for tests
├── .prettierrc
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .husky/
│   └── pre-commit                      # Lint + format + .env check
├── .vscode/
│   └── settings.json
├── .github/
│   └── workflows/
│       ├── deploy-functions.yml
│       └── ci.yml                      # + functions pipeline + schema sync check + grep "Zero-Knowledge"
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── journal/
│   │   │   ├── page.tsx
│   │   │   └── [entryId]/
│   │   │       └── page.tsx
│   │   ├── insights/
│   │   │   ├── page.tsx
│   │   │   └── [insightId]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── analytics/
│       │   └── route.ts
│       ├── stripe/
│       │   └── webhook/
│       │       └── route.ts
│       └── mirror/
│           └── route.ts                # Edge runtime, NO Firestore SDK
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.unit.test.tsx
│   │   ├── Input.tsx
│   │   ├── Input.unit.test.tsx
│   │   ├── Card.tsx
│   │   ├── Toast.tsx
│   │   └── Badge.tsx
│   └── features/
│       ├── MirrorChat/
│       │   ├── MirrorChat.tsx
│       │   ├── MirrorChat.unit.test.tsx
│       │   ├── MessageList.tsx
│       │   └── TypingIndicator.tsx
│       ├── Timeline/
│       │   ├── Timeline.tsx
│       │   ├── Timeline.unit.test.tsx
│       │   └── EntryCard.tsx
│       ├── InsightCard/
│       │   ├── InsightCard.tsx
│       │   └── InsightCard.unit.test.tsx
│       └── JournalEditor/
│           ├── JournalEditor.tsx
│           └── JournalEditor.unit.test.tsx
├── lib/
│   ├── crypto/
│   │   ├── shared/
│   │   │   └── types.ts                # EncryptedPayload, KeyMetadata
│   │   ├── client/
│   │   │   ├── encrypt.ts
│   │   │   ├── encrypt.unit.test.ts
│   │   │   ├── decrypt.ts
│   │   │   └── decrypt.unit.test.ts
│   │   └── server/
│   │       ├── unwrap-key.ts
│   │       └── unwrap-key.unit.test.ts
│   ├── firebase/
│   │   ├── web-client.ts               # 'use client', SDK client ONLY
│   │   ├── server.ts                   # Admin SDK, Server Components + API Routes (Node runtime)
│   │   ├── edge.ts                     # REST API Firestore (Edge runtime, if needed)
│   │   └── auth.ts
│   ├── deepseek/
│   │   ├── adapter.ts
│   │   └── adapter.unit.test.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── schemas/
│   │   ├── firestore.ts                # Synced to functions/src/schemas/
│   │   └── derived-memory.ts
│   ├── rate-limit.ts
│   ├── logger.ts
│   └── utils/
│       ├── date.ts
│       └── validation.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAuth.unit.test.ts
│   ├── useMirror.ts
│   └── useInsight.ts
├── store/
│   └── mirror/
│       ├── index.ts                    # Zustand store
│       ├── messages.ts
│       └── streaming.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── SettingsContext.tsx
├── types/
│   ├── user.ts
│   ├── entry.ts
│   ├── insight.ts
│   └── derived-memory.ts
├── middleware.ts
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── getContentKey.ts            # Policy: auth + rate limit + wrapped key only
│   │   ├── getContentKey.unit.test.ts
│   │   ├── generateInsight.ts
│   │   ├── generateInsight.unit.test.ts
│   │   ├── updateDerivedMemory.ts
│   │   ├── updateDerivedMemory.unit.test.ts
│   │   ├── schemas/
│   │   │   ├── firestore.ts            # SYNCED from lib/schemas/
│   │   │   └── derived-memory.ts       # SYNCED from lib/schemas/
│   │   ├── utils/
│   │   │   ├── decrypt.ts
│   │   │   ├── decrypt.unit.test.ts
│   │   │   ├── synthesize.ts
│   │   │   └── synthesize.unit.test.ts
│   │   └── __mocks__/
│   │       └── deepseek.ts
│   └── .env
├── __tests__/
│   ├── fixtures/
│   │   ├── users.ts
│   │   └── entries.ts
│   ├── firestore-rules/
│   │   ├── users.test.ts               # Firebase Emulator tests
│   │   ├── entries.test.ts
│   │   └── insights.test.ts
│   ├── integration/
│   │   ├── auth.int.test.ts
│   │   ├── journal.int.test.ts
│   │   ├── insights.int.test.ts
│   │   └── middleware.int.test.ts
│   └── e2e/
│       ├── auth-flow.spec.ts
│       ├── journal-flow.spec.ts
│       ├── mirror-chat.spec.ts
│       └── paywall.spec.ts
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── assets/
│       └── logo.svg
└── docs/
    ├── privacy-explained.md            # Mermaid diagram (E2EE + Admin-Blind flow)
    ├── deployment.md
    ├── architecture-diagrams/
    │   ├── firestore-schema.md
    │   └── data-flow.md
    └── api-contracts/
        ├── mirror-api.md               # + security clarifications
        └── stripe-webhook.md
```

---

### Architectural Decisions (Critical Corrections Applied)

#### 1. No Webpack Test Ignore Hack

**Decision**: Remove `ignore-loader` webpack config.

**Rationale**: If Next.js bundles test files, it indicates import leaks (barrel exports, circular imports). The proper fix is ESLint enforcement.

**Implementation**:
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": ["**/*.test", "**/*.spec", "**/__tests__", "**/__mocks__"]
    }]
  }
}
```

#### 2. Firebase Strict Runtime Separation

**Decision**: Split Firebase SDK usage by runtime environment.

**Files**:
- **`lib/firebase/web-client.ts`**: Client SDK, `'use client'` directive, browser-only
- **`lib/firebase/server.ts`**: Admin SDK, Server Components + API Routes (Node runtime)
- **`lib/firebase/edge.ts`**: REST API Firestore (Edge runtime, if needed)

**Rationale**: Prevents runtime errors (e.g., Admin SDK in browser, gRPC in Edge runtime).

**Enforcement**: ESLint module boundaries (prevent cross-imports).

#### 3. Edge Runtime Constraints (`/api/mirror`)

**Decision**: Edge Function does NOT use Firestore SDK. Client sends `derivedMemoryLite` in request payload.

**Security Clarification**:
> **CRITICAL**: `derivedMemoryLite` sent to Edge Function MUST remain strictly non-sensitive:
> - ✅ Allowed: Whitelisted labels (`ALLOWED_LABELS`), aggregated stats (e.g., `avgEntriesPerWeek`)
> - ❌ Forbidden: Phrases, quotes, verbatim text, medical terms, identifying information
> - **Validation**: Server-side Zod schema enforcement (`DerivedMemoryLiteSchema`)

**Implementation**:
```typescript
// app/api/mirror/route.ts
export const runtime = 'edge'; // NO Firestore SDK (gRPC not supported)

export async function POST(req: Request) {
  // 1. Validate Firebase ID token (auth)
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  const decodedToken = await verifyIdToken(idToken); // Edge-compatible JWT verify
  
  // 2. Rate limit (Upstash Redis)
  const allowed = await checkMirrorRateLimit(decodedToken.uid);
  if (!allowed) return new Response('Rate limit exceeded', { status: 429 });
  
  // 3. Parse and validate payload
  const { text, derivedMemoryLite } = await req.json();
  const validated = DerivedMemoryLiteSchema.parse(derivedMemoryLite); // Throws if invalid
  
  // 4. Call DeepSeek adapter
  const response = await deepseekAdapter.stream(text, validated);
  return new Response(response);
}
```

**Auth & Rate Limiting Clarification**:
> **CRITICAL**: Edge route MUST validate Firebase ID token and enforce rate limiting BEFORE calling DeepSeek API, even though client sends `derivedMemoryLite`. This prevents:
> - Unauthorized access (spoofed payloads)
> - Cost abuse (spam requests)
> - Data exfiltration (malicious clients)

#### 4. CI Pipeline for Cloud Functions

**Decision**: Add dedicated CI steps for `functions/` directory.

**Implementation**:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test-next:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test                    # Jest unit tests
      - run: npm run build
      
  test-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd functions && npm ci
      - run: cd functions && npm test
      - run: cd functions && npm run build
      
  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx playwright install
      - run: npm run start &              # Prod mode
      - run: npx playwright test
      
  lint-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run sync-schemas
      - run: git diff --exit-code functions/src/schemas/  # Fail if drift detected
      
  lint-privacy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: grep -r "Zero-Knowledge" docs/ && exit 1 || exit 0  # Fail if found
```

#### 5. Playwright Production Mode (CI)

**Decision**: E2E tests run against production build in CI.

**Implementation**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  use: {
    baseURL: process.env.CI ? 'http://localhost:3000' : 'http://localhost:3000',
  },
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',  // Prod in CI, dev locally
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

#### 6. Schema Sync Script

**Decision**: Automated schema sync from `lib/schemas/` to `functions/src/schemas/` with CI drift detection.

**Implementation**:
```json
// package.json
{
  "scripts": {
    "sync-schemas": "cp -r lib/schemas/* functions/src/schemas/",
    "pretest:functions": "npm run sync-schemas",
    "test:functions": "cd functions && npm test"
  }
}
```

#### 7. Test Naming Conventions

**Decision**: Strict file naming to prevent confusion.

**Conventions**:
- **Unit tests**: `*.unit.test.ts` (co-located with source)
- **Integration tests**: `__tests__/integration/*.int.test.ts`
- **E2E tests**: `__tests__/e2e/*.spec.ts` (Playwright)

**Jest Config**:
```javascript
// jest.config.js
module.exports = {
  testMatch: [
    '**/*.unit.test.ts',
    '**/*.unit.test.tsx',
    '**/__tests__/integration/*.int.test.ts'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/e2e/'],
};
```

#### 8. Privacy Terminology Enforcement

**Decision**: Grep lint to prevent "Zero-Knowledge" terminology (replaced with "E2EE + Admin-Blind").

**CI Check**: See `lint-privacy-docs` job above.

#### 9. `getContentKey()` Security Policy

**Decision**: Explicit security policy documented.

**Policy**:
```typescript
// functions/src/getContentKey.ts
/**
 * Security Policy:
 * 1. Auth: REQUIRED (context.auth.uid)
 * 2. Rate Limit: 10 requests/hour/user (Upstash Redis)
 * 3. Returns: Wrapped key ONLY (KMS-encrypted)
 * 4. Client: Unwraps via WebCrypto (in-device, never logged)
 * 5. Logging: NEVER log key material (wrapped or unwrapped)
 */
export const getContentKey = functions.https.onCall(async (data, context) => {
  // 1. Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }
  
  // 2. Rate limit
  const allowed = await checkKeyRequestRateLimit(context.auth.uid);
  if (!allowed) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
  }
  
  // 3. Fetch wrapped key from Firestore
  const userDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  const wrappedKey = userDoc.data()?.wrappedContentKey;
  
  // 4. Return wrapped key (client unwraps via WebCrypto)
  return { wrappedKey };  // NEVER return plaintext key
});
```

---

### Architectural Boundaries

**API Boundaries**:
- **Next.js API Routes** (`app/api/`): Analytics proxy, Stripe webhooks, Mirror Chat (Edge)
- **Firebase Cloud Functions** (`functions/src/`): Key management, Insight generation, Derived Memory updates

**Component Boundaries**:
- **UI Primitives** (`components/ui/`): Framework-agnostic, no business logic
- **Feature Components** (`components/features/`): Domain-specific, use hooks/contexts/stores

**Service Boundaries**:
- **Client Services** (`lib/`): WebCrypto, Firestore client SDK, DeepSeek adapter
- **Server Services** (`functions/src/`, `lib/server/`): Node crypto, Admin SDK, synthesis

**Data Boundaries**:
- **Firestore**: `users/{uid}` (read-only client), `users/{uid}/entries` (client R/W), `users/{uid}/derivedMemory` (Cloud Function writes)
- **Upstash Redis**: Rate limiting (Mirror Chat, Key requests)

---

### Integration Points

**Client → Edge Function (Mirror Chat)**:
1. Client fetches `derivedMemoryLite` (Firestore, validated via Zod)
2. Client sends `{ text, derivedMemoryLite }` to `/api/mirror` (Edge)
3. Edge validates Firebase ID token + rate limit
4. Edge calls DeepSeek adapter
5. Edge streams response back

**Client → Cloud Function (Insight)**:
1. Scheduled trigger (weekly, `insightDay`)
2. Cloud Function reads `derivedMemory/summary` (encrypted)
3. Decrypts temporarily (Node crypto)
4. Generates insight narrative (DeepSeek)
5. Stores in `users/{uid}/insights/{insightId}`

**External Integrations**:
- **DeepSeek API**: Via `lib/deepseek/adapter.ts` (timeouts, retries, log redaction)
- **Stripe API**: Webhooks (`/api/stripe/webhook`), client SDK (`lib/stripe/client.ts`)
- **PostHog Analytics**: Server-side proxy (`/api/analytics`)

---

### File Organization Patterns

**Configuration Files**:
- Root: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `jest.config.js`, `playwright.config.ts`
- Firebase: `firebase.json`, `firestore.rules`, `firestore.indexes.json`
- CI/CD: `.github/workflows/ci.yml`, `.github/workflows/deploy-functions.yml`
- Environment: `.env.local` (dev), `.env.example` (template), `functions/.env` (Cloud Functions)

**Source Organization**:
- App Router: `app/` (routing, layouts, pages, API routes)
- Components: `components/ui/` (primitives), `components/features/` (domain)
- Libraries: `lib/` (crypto, firebase, deepseek, schemas, utils)
- State: `store/mirror/` (Zustand), `contexts/` (React Context)
- Cloud Functions: `functions/src/` (callable, scheduled)

**Test Organization**:
- Unit: Co-located (`*.unit.test.ts`)
- Integration: `__tests__/integration/*.int.test.ts`
- E2E: `__tests__/e2e/*.spec.ts` (Playwright)
- Firestore Rules: `__tests__/firestore-rules/*.test.ts` (Firebase Emulator)

**Asset Organization**:
- Public: `public/` (PWA icons, static assets)
- Docs: `docs/` (privacy diagrams, deployment guide, API contracts)

---

### Security Clarifications (Senior-Grade)

#### DerivedMemoryLite Strict Definition

**Rule**: `derivedMemoryLite` sent to Edge Function MUST contain ONLY:
- Whitelisted labels from `ALLOWED_LABELS` (no clinical terms, no diagnoses)
- Aggregated stats (e.g., `avgEntriesPerWeek`, `preferredTime`)

**Forbidden**:
- Phrases, quotes, verbatim text
- Medical/clinical terms
- Identifying information
- Derived insights (those belong in encrypted `derivedMemory/summary`)

**Enforcement**:
```typescript
// lib/schemas/derived-memory.ts
export const DerivedMemoryLiteSchema = z.object({
  labels: z.array(z.enum(ALLOWED_LABELS)).max(10),  // Strict whitelist
  stats: z.object({
    avgEntriesPerWeek: z.number(),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  lastUpdated: z.union([z.date(), FirestoreTimestamp])
});

// app/api/mirror/route.ts
const validated = DerivedMemoryLiteSchema.parse(derivedMemoryLite); // Throws if invalid
```

#### Edge Route Auth & Rate Limiting

**Rule**: `/api/mirror` (Edge Function) MUST:
1. Validate Firebase ID token (prevent spoofed requests)
2. Enforce rate limiting (prevent cost abuse)
3. Validate `derivedMemoryLite` schema (prevent data leaks)

**Implementation**:
```typescript
// app/api/mirror/route.ts
export const runtime = 'edge';

export async function POST(req: Request) {
  // 1. Auth validation
  const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) return new Response('Unauthorized', { status: 401 });
  
  const decodedToken = await verifyIdTokenEdge(idToken);  // Edge-compatible JWT verify
  
  // 2. Rate limiting
  const allowed = await checkMirrorRateLimit(decodedToken.uid);
  if (!allowed) return new Response('Rate limit exceeded', { status: 429 });
  
  // 3. Payload validation
  const { text, derivedMemoryLite } = await req.json();
  const validated = DerivedMemoryLiteSchema.parse(derivedMemoryLite);
  
  // 4. DeepSeek call
  const response = await deepseekAdapter.stream(text, validated);
  return new Response(response);
}
```

**Rationale**: Even though client sends `derivedMemoryLite`, the Edge route cannot trust client-provided data. Auth + rate limiting + schema validation prevent abuse and ensure security guarantees.

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
✅ **Excellent**. All technology choices are compatible and form a coherent stack:
- Next.js 15 + React 19 + TypeScript (versions aligned, strict pinning)
- Firebase (Firestore + Auth + Cloud Functions) native integration
- DeepSeek LLM via **Vercel Edge Runtime** (latency-optimized streaming)
- Upstash Redis (Edge-compatible rate limiting)
- Stripe (webhooks via Next.js API Routes)
- Vercel (deployment platform for Next.js + Edge Functions)

**No conflicts detected**. Senior-grade corrections eliminated critical incompatibilities:
- ✅ Edge runtime + Firestore SDK → Client sends `derivedMemoryLite` payload
- ✅ Firebase client vs server → Strict separation (`web-client.ts` / `server.ts` / `edge.ts`)
- ✅ Webpack test bundling → ESLint `no-restricted-imports` enforcement

**Pattern Consistency:**
✅ **Solid**. Implementation patterns support architectural decisions:
- Naming conventions (PascalCase, camelCase, kebab-case) aligned with Next.js + Firebase
- Structure (App Router, co-located tests, feature folders) coherent with React 19
- Security patterns (Admin-Blind, Client-side encryption, rate limiting) uniformly applied
- Communication patterns (Zod validation, safe logging, API format) standardized

**Structure Alignment:**
✅ **Complete**. Project structure supports all architectural decisions:
- `app/` (App Router) → Next.js 15 routing with route groups
- `lib/firebase/` (web-client/server/edge) → Runtime separation enforced
- `functions/` (Cloud Functions) → Backend isolation with schema sync
- `components/features/` → Domain-driven organization
- `__tests__/` (unit/int/e2e/firestore-rules) → Comprehensive test strategy

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR | Requirement | Architectural Support | Status |
|---|---|---|---|
| FR1-FR3 | Auth & Onboarding | `lib/firebase/auth.ts`, `app/(public)/login`, `middleware.ts` (route guards) | ✅ |
| FR4-FR6, FR19 | Core Journaling | `components/features/JournalEditor`, `lib/crypto/client`, Firestore `users/{uid}/entries`, LocalStorage drafts | ✅ |
| FR7-FR9, FR22 | Mirror Chat | `app/api/mirror/route.ts` (Vercel Edge), `store/mirror/`, `lib/deepseek/adapter.ts`, Upstash Redis rate limiting | ✅ |
| FR10-FR12, FR17 | Insight Engine | `functions/src/generateInsight.ts`, `functions/src/updateDerivedMemory.ts`, Firestore `users/{uid}/insights` | ✅ |
| FR15-FR16 | Payments | `lib/stripe/`, `app/api/stripe/webhook`, Firestore `users/{uid}.subscriptionStatus` | ✅ |
| FR18 | Settings & Compliance | `app/(protected)/settings`, Firestore `users/{uid}/settings/preferences`, `docs/privacy-explained.md` | ✅ |
| FR13-FR14 | Admin & Privacy | Firebase Admin SDK (Cloud Functions only), Firestore Rules (client read-only), Admin-Blind enforcement | ✅ |
| FR20-FR21 | Analytics | `app/api/analytics/route.ts` (PostHog proxy), server-side tracking (no PII) | ✅ |

**Non-Functional Requirements Coverage:**

| NFR | Requirement | Architectural Support | Status |
|---|---|---|---|
| Security & Privacy | Client-side encryption, Admin-Blind, GDPR | `lib/crypto/`, Firestore Rules, `getContentKey()` policy, KMS-wrapped keys | ✅ |
| Performance | <1200ms response, <400ms typing indicator | Vercel Edge Functions (streaming), Zustand client state, Server Components | ✅ |
| Reliability | No data loss, auto-save | LocalStorage drafts (2s interval), Firestore sync confirmation, error handling | ✅ |
| Accessibility | WCAG 2.1 AA | Tailwind CSS (contrast ratios), semantic HTML, Vellum theme (#F5F5DC) | ✅ |

**Coverage Summary:** **100% of FR/NFR architecturally supported**.

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
✅ **High**. All critical decisions documented with exact versions:
- Next.js 15.x, React 19.0.0, Node.js 20+ (strict pinning in `package.json`)
- Firebase SDK versions (client vs server vs edge separation)
- DeepSeek adapter (timeouts: 5s Mirror Chat, 30s Insight Engine; retries: max 2)
- Upstash Redis (rate limiting: 20 req/min technical, 1 req/90s user-visible)
- Stripe API (webhook events: `customer.subscription.*`)

**Structure Completeness:**
✅ **Exhaustive**. Complete directory tree with 200+ files/folders defined:
- Configuration files (`jest.config.js`, `playwright.config.ts`, `.eslintrc.json`, `.husky/pre-commit`)
- Source organization (`app/`, `components/`, `lib/`, `hooks/`, `store/`, `contexts/`, `types/`)
- Cloud Functions (`functions/src/`, schema sync from `lib/schemas/`)
- Test organization (`*.unit.test.ts`, `__tests__/integration/*.int.test.ts`, `__tests__/e2e/*.spec.ts`)
- Documentation (`docs/privacy-explained.md`, `docs/deployment.md`, `docs/api-contracts/`)

**Pattern Completeness:**
✅ **Production-Ready**. All conflict points addressed:
- Naming conventions (files, variables, API endpoints, Firestore collections)
- Import restrictions (ESLint `no-restricted-imports` for test files)
- Schema sync (`npm run sync-schemas`, CI drift check via `git diff`)
- Safe logging (`logger.errorSafe`, never log PII or raw errors)
- Rate limiting (Upstash Redis for Mirror Chat + `getContentKey()`)
- Auth validation (Edge route Firebase ID token verification)

---

### Gap Analysis Results

**Critical Gaps:** ❌ **None** (All resolved)

**Important Gaps Identified & Resolved:** ✅ **5 Critical Corrections Applied**

1. **✅ DerivedMemory Split Clarification**
   - **Gap**: Potential confusion between `lite` (clear) and `summary` (encrypted)
   - **Resolution**: Explicit documentation of split:
     - `users/{uid}/derivedMemory/lite` → Clear text, whitelist stricte (`ALLOWED_LABELS`), used by Mirror Chat (Edge)
     - `users/{uid}/derivedMemory/summary` → Encrypted (same key as entries), rich patterns, used by Insight Engine (Cloud Functions)

2. **✅ Privacy Terminology Correction**
   - **Gap**: "E2EE" terminology misleading (server can decrypt via automated processes)
   - **Resolution**: Replaced with **"Client-side Encryption + Admin-Blind Processing"**
   - **Documentation**: `docs/privacy-explained.md` clarifies:
     > "Automated Cloud Functions can temporarily decrypt content to generate Insights; no human administrator has access to plaintext journal entries."

3. **✅ Edge Runtime Clarification**
   - **Gap**: Confusion between Vercel Edge Runtime vs Firebase Cloud Functions
   - **Resolution**: Explicit separation documented:
     - **Vercel Edge Runtime**: `app/api/mirror/route.ts` (DeepSeek streaming, no Node.js APIs)
     - **Firebase Cloud Functions**: `functions/src/*` (Node.js 20+, Admin SDK access)

4. **✅ Service Worker V1 Strategy**
   - **Gap**: PWA SW mentioned but no cache strategy defined
   - **Resolution**: Ultra-conservative SW for V1:
     - Cache: Static assets only (`/icon-*.png`, `/assets/*`)
     - Network-only: `/api/*`, auth pages, Firestore requests
     - Offline Mode: Phase 2 (with IndexedDB, sync queue)

5. **✅ Firestore Indexes Specification**
   - **Gap**: `firestore.indexes.json` structure defined but no content
   - **Resolution**: V1 indexes documented:
     ```json
     {
       "indexes": [
         {
           "collectionGroup": "entries",
           "queryScope": "COLLECTION",
           "fields": [{ "fieldPath": "createdAt", "order": "DESCENDING" }]
         },
         {
           "collectionGroup": "insights",
           "queryScope": "COLLECTION",
           "fields": [{ "fieldPath": "periodStart", "order": "DESCENDING" }]
         }
       ]
     }
     ```

**Nice-to-Have Gaps:** 💡 **3 Identified (Deferred to Phase 2)**

1. **Error Boundary Components** - React Error Boundaries for graceful degradation (Phase 2)
2. **Loading States Patterns** - Standardized Suspense/Loading UI patterns (Phase 2)
3. **Storybook/Component Library** - Visual documentation of UI components (Phase 2)

---

### Validation Issues Addressed

**Issues Found:** ✅ **All 11 Critical Issues Resolved**

1. ✅ Webpack test ignore hack → Removed, ESLint rule added
2. ✅ Firebase client vs server confusion → Strict separation (`web-client.ts` / `server.ts` / `edge.ts`)
3. ✅ Edge runtime + Firestore SDK → Client sends `derivedMemoryLite` payload
4. ✅ CI incomplete (functions) → Dedicated pipeline added
5. ✅ Playwright dev vs prod → Prod mode in CI, dev locally
6. ✅ Schema drift → Sync script + CI check
7. ✅ Test naming ambiguity → Strict convention (`*.unit.test.ts` / `*.int.test.ts` / `*.spec.ts`)
8. ✅ Privacy terminology → "Client-side encryption + Admin-Blind"
9. ✅ `getContentKey()` security → Policy documented (auth, rate limit, wrapped key only)
10. ✅ `derivedMemoryLite` definition → Strict whitelist, Zod validation
11. ✅ Edge route auth → Firebase ID token + rate limit mandatory

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (PRD, Product Brief, Blueprint)
- [x] Scale and complexity assessed (High complexity, Brownfield, Healthcare domain)
- [x] Technical constraints identified (Client-side encryption, Admin-Blind, Edge runtime, PWA)
- [x] Cross-cutting concerns mapped (Security, Privacy, Performance, Accessibility)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (Next.js 15, React 19, Node 20+, Firebase, DeepSeek)
- [x] Technology stack fully specified (Frontend, Backend, Infrastructure, External APIs)
- [x] Integration patterns defined (Client→Edge, Client→Cloud Function, External APIs)
- [x] Performance considerations addressed (Edge Functions, Server Components, rate limiting)

**✅ Implementation Patterns**
- [x] Naming conventions established (PascalCase, camelCase, kebab-case, SCREAMING_SNAKE_CASE)
- [x] Structure patterns defined (App Router, co-located tests, feature folders)
- [x] Communication patterns specified (Zod validation, API format, safe logging)
- [x] Process patterns documented (Error handling, rate limiting, schema sync)

**✅ Project Structure**
- [x] Complete directory structure defined (200+ files/folders)
- [x] Component boundaries established (UI primitives vs features, client vs server)
- [x] Integration points mapped (API Routes, Cloud Functions, External APIs)
- [x] Requirements to structure mapping complete (FR1-FR22 → specific files)

---

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

**Confidence Level:** **HIGH (9/10)**

**Key Strengths:**
1. 🔒 **Security-First Design** - Client-side encryption + Admin-Blind architecture rigorously applied
2. ⚡ **Performance-Optimized** - Vercel Edge Functions, Server Components, streaming responses
3. 🧪 **Test-Ready** - Comprehensive test strategy (unit, integration, e2e, firestore-rules)
4. 🛡️ **Senior-Grade Validated** - All production risks identified and corrected
5. 📐 **AI-Agent Friendly** - Clear patterns, strict boundaries, automated enforcement
6. 🎯 **100% Requirements Coverage** - All FR/NFR architecturally supported
7. 🔧 **Production-Ready Tooling** - CI/CD, schema sync, rate limiting, monitoring

**Areas for Future Enhancement (Phase 2):**
1. PWA Offline Mode (IndexedDB, sync queue, conflict resolution)
2. Error Boundary components (React best practices)
3. Loading states patterns (Suspense standardization)
4. Component library documentation (Storybook)
5. Advanced monitoring (distributed tracing, performance metrics)

---

### Critical Corrections Summary

**5 Production Risks Resolved:**

| # | Risk | Correction | Impact |
|---|---|---|---|
| 1 | DerivedMemory contradiction | Split `lite` (clear) / `summary` (encrypted) clarified | Prevents Edge runtime errors, ensures privacy |
| 2 | E2EE terminology misleading | "Client-side encryption + Admin-Blind" terminology | Prevents legal/trust issues, accurate marketing |
| 3 | Edge runtime confusion | Vercel Edge vs Firebase Cloud Functions clarified | Prevents import errors, wrong SDK usage |
| 4 | SW V1 strategy missing | Ultra-conservative cache strategy documented | Prevents auth bugs, cache inconsistencies |
| 5 | Firestore indexes missing | Indexes for `entries` and `insights` specified | Prevents query failures, performance issues |

---

### Implementation Handoff

**AI Agent Guidelines:**
- ✅ Follow all architectural decisions exactly as documented
- ✅ Use implementation patterns consistently across all components
- ✅ Respect project structure and boundaries (no cross-runtime imports)
- ✅ Refer to this document for all architectural questions
- ✅ Run `npm run sync-schemas` before testing Cloud Functions
- ✅ Never log sensitive data (use `logger.errorSafe`)
- ✅ Validate all payloads with Zod schemas
- ✅ Enforce rate limiting on all LLM calls
- ✅ Use "Client-side encryption + Admin-Blind" terminology (not "E2EE")
- ✅ Separate Vercel Edge Runtime from Firebase Cloud Functions

**First Implementation Priority:**

```bash
# 1. Initialize Next.js 15 project
npx create-next-app@latest aurum-sanctuary \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --turbopack \
  --import-alias "@/*" \
  --use-npm

cd aurum-sanctuary

# 2. Initialize Firebase
firebase init firestore functions hosting

# 3. Setup project structure
mkdir -p lib/crypto/{shared,client,server}
mkdir -p lib/firebase
mkdir -p components/{ui,features}
mkdir -p __tests__/{integration,e2e,firestore-rules}
mkdir -p store/mirror
mkdir -p functions/src/{schemas,utils,__mocks__}
mkdir -p docs/{architecture-diagrams,api-contracts}

# 4. Install dependencies
npm install firebase firebase-admin zod @upstash/redis stripe @stripe/stripe-js

# 5. Setup Firestore indexes
cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "createdAt", "order": "DESCENDING" }]
    },
    {
      "collectionGroup": "insights",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "periodStart", "order": "DESCENDING" }]
    }
  ]
}
EOF

# 6. Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

**Next Steps After Initialization:**
1. Configure Firebase SDK separation (`lib/firebase/web-client.ts`, `server.ts`, `edge.ts`)
2. Implement crypto layer (`lib/crypto/client/encrypt.ts`, `decrypt.ts`)
3. Setup Zod schemas (`lib/schemas/firestore.ts`, `derived-memory.ts`)
4. Configure rate limiting (Upstash Redis)
5. Implement Mirror Chat Edge Function (`app/api/mirror/route.ts`)
6. Setup CI/CD pipelines (`.github/workflows/ci.yml`)

**Architecture Document Status:** ✅ **COMPLETE & VALIDATED**

