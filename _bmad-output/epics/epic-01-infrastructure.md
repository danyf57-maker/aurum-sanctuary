# Epic 1: Infrastructure & Project Setup

**Epic ID:** EPIC-01  
**Priority:** P0 (Critical - Blocker for all other epics)  
**Estimated Stories:** 5  
**Status:** Not Started

---

## Epic Goal

Establish the foundational infrastructure for Aurum Sanctuary, including Next.js 15 project initialization, Firebase configuration, CI/CD pipelines, and development environment setup. This epic ensures all subsequent development can proceed on a solid, production-ready foundation.

---

## User Value

As a **developer**, I need a properly configured development environment so that I can implement features consistently and deploy safely to production.

---

## Success Criteria

- [x] Next.js 15 project initialized with all required dependencies
- [x] Firebase project configured (Firestore, Auth, Cloud Functions, Hosting)
- [x] CI/CD pipelines operational (GitHub Actions)
- [x] Development environment reproducible (`.env.example`, `CONTRIBUTING.md`)
- [x] Firestore Rules and Indexes deployed
- [x] All configuration files validated and documented

---

## Stories

### Story 1.1: Initialize Next.js 15 Project

**Story ID:** STORY-1.1  
**Priority:** P0  
**Dependencies:** None

**As a** developer  
**I want** to initialize a Next.js 15 project with TypeScript, Tailwind CSS, and App Router  
**So that** I have a modern, type-safe foundation for the application

**Acceptance Criteria:**
- [ ] Project created using `create-next-app@latest` with exact flags from architecture
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Tailwind CSS configured with Aurum Sanctuary design tokens (`#D4AF37`, `#F5F5DC`, `#8B4513`)
- [ ] App Router structure created (`app/(public)`, `app/(protected)`, `app/api`)
- [ ] Import alias `@/*` configured and working
- [ ] Turbopack enabled for dev server
- [ ] React 19 and Next.js 15.x strictly pinned in `package.json`
- [ ] Project builds successfully (`npm run build`)

**Technical Notes:**
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

**Architecture Reference:** `architecture.md` Section "Starter Template Evaluation"

---

### Story 1.2: Configure Firebase Project

**Story ID:** STORY-1.2  
**Priority:** P0  
**Dependencies:** STORY-1.1

**As a** developer  
**I want** to configure Firebase services (Firestore, Auth, Cloud Functions, Hosting)  
**So that** I can use Firebase as the backend infrastructure

**Acceptance Criteria:**
- [ ] Firebase project created in Firebase Console
- [ ] `firebase init` executed for Firestore, Functions, Hosting
- [ ] `firebase.json` configured with correct settings
- [ ] `.firebaserc` contains project aliases (dev, prod)
- [ ] Firebase Admin SDK service account downloaded and stored securely
- [ ] Environment variables configured (`.env.local`, `.env.example`)
- [ ] Firebase CLI authenticated (`firebase login`)
- [ ] Test deployment successful (`firebase deploy --only hosting`)

**Environment Variables Required:**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Cloud Functions)
FIREBASE_SERVICE_ACCOUNT_KEY=
```

**Architecture Reference:** `architecture.md` Section "Core Architectural Decisions - Data Architecture"

---

### Story 1.3: Setup Firestore Rules & Indexes

**Story ID:** STORY-1.3  
**Priority:** P0  
**Dependencies:** STORY-1.2

**As a** developer  
**I want** to deploy Firestore Security Rules and Indexes  
**So that** data access is secured and queries are optimized

**Acceptance Criteria:**
- [ ] `firestore.rules` created with Admin-Blind enforcement
- [ ] Client can read `users/{uid}` (read-only)
- [ ] Client can write to `users/{uid}/settings/preferences`
- [ ] Client can read/write `users/{uid}/entries/{entryId}`
- [ ] Cloud Functions can write via Admin SDK (no client writes to `users/{uid}`)
- [ ] `firestore.indexes.json` created with required indexes:
  - `entries`: `createdAt DESC`
  - `insights`: `periodStart DESC`
- [ ] Rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Rules tested with Firebase Emulator

**Firestore Rules (Admin-Blind):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Only Cloud Functions via Admin SDK
      
      match /settings/{doc} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
        // Field validation: only allow specific fields
        allow write: if request.resource.data.keys().hasOnly(['notificationsEnabled', 'theme', 'language']);
      }
      
      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      
      match /derivedMemory/{doc} {
        allow read: if request.auth != null && request.auth.uid == uid;
        allow write: if false; // Only Cloud Functions
      }
      
      match /insights/{insightId} {
        allow read: if request.auth != null && request.auth.uid == uid;
        allow write: if false; // Only Cloud Functions
      }
    }
  }
}
```

**Architecture Reference:** `architecture.md` Section "Firestore Security Rules"

---

### Story 1.4: Setup CI/CD Pipelines

**Story ID:** STORY-1.4  
**Priority:** P0  
**Dependencies:** STORY-1.1, STORY-1.2

**As a** developer  
**I want** automated CI/CD pipelines for testing and deployment  
**So that** code quality is enforced and deployments are safe

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml` created with all jobs:
  - `test-next`: Type check, lint, unit tests, build
  - `test-functions`: Cloud Functions tests
  - `test-e2e`: Playwright E2E tests (prod mode)
  - `lint-schemas`: Schema sync drift check
  - `lint-privacy-docs`: Grep "Zero-Knowledge" check
- [ ] `.github/workflows/deploy-functions.yml` created
- [ ] GitHub Actions secrets configured (Firebase token, etc.)
- [ ] All CI jobs passing on main branch
- [ ] Pull request checks enforced

**CI Workflow (`.github/workflows/ci.yml`):**
```yaml
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
      - run: npm test
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
      - run: npm run start &
      - run: npx playwright test
      
  lint-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run sync-schemas
      - run: git diff --exit-code functions/src/schemas/
      
  lint-privacy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for prohibited privacy terms
        run: |
          grep -rE "(Zero-Knowledge|E2EE|end-to-end encrypted|HIPAA certified|medical grade)" docs/ && exit 1 || exit 0
```

**Architecture Reference:** `architecture.md` Section "CI Pipeline for Cloud Functions"

---

### Story 1.5: Implement Safe Logging & Error Handling

**Story ID:** STORY-1.5  
**Priority:** P0  
**Dependencies:** STORY-1.1

**As a** developer  
**I want** to implement safe logging patterns that never log sensitive data  
**So that** PII and entry content are never exposed in logs or error reports

**Acceptance Criteria:**
- [ ] `lib/logger/safe.ts` created with `logger.errorSafe()` function
- [ ] Never log raw error objects (may contain sensitive data)
- [ ] Never log entry content, encryption keys, or PII
- [ ] Redact sensitive fields from logged objects
- [ ] Error messages sanitized before logging
- [ ] Google Cloud Error Reporting configured (production only)
- [ ] Log levels: ERROR, WARN, INFO, DEBUG
- [ ] Structured logging format (JSON)

**Implementation:**
```typescript
// lib/logger/safe.ts
const SENSITIVE_FIELDS = ['password', 'encryptedContent', 'iv', 'key', 'email'];

export function errorSafe(message: string, context?: Record<string, any>) {
  const sanitized = context ? redactSensitiveFields(context) : {};
  console.error({
    level: 'ERROR',
    message,
    context: sanitized,
    timestamp: new Date().toISOString(),
  });
}

function redactSensitiveFields(obj: Record<string, any>): Record<string, any> {
  const redacted = { ...obj };
  SENSITIVE_FIELDS.forEach(field => {
    if (redacted[field]) redacted[field] = '[REDACTED]';
  });
  return redacted;
}
```

**Architecture Reference:** `architecture.md` Section "Safe Logging Patterns"

---

### Story 1.6: Create DerivedMemoryLite Placeholder

**Story ID:** STORY-1.6  
**Priority:** P0  
**Dependencies:** STORY-1.3 (Firestore Rules)

**As a** developer  
**I want** to create a placeholder `derivedMemory/lite` document  
**So that** Mirror Chat can function without blocking on Epic 5 (Insight Engine)

**Acceptance Criteria:**
- [ ] Firestore document `users/{uid}/derivedMemory/lite` created on user signup
- [ ] Initial shape: `{ labels: [], stats: { totalEntries: 0, avgWordsPerEntry: 0 } }`
- [ ] Zod schema `DerivedMemoryLiteSchema` created in `lib/schemas/derived-memory.ts`
- [ ] Schema validates whitelisted labels only (`ALLOWED_LABELS`)
- [ ] Cloud Function `initializeUser` creates placeholder on signup
- [ ] Firestore Rules allow client read (read-only)
- [ ] No sensitive data in placeholder

**Zod Schema:**
```typescript
// lib/schemas/derived-memory.ts
import { z } from 'zod';

const ALLOWED_LABELS = [
  'reflective', 'anxious', 'hopeful', 'frustrated', 'grateful',
  // ... whitelisted non-sensitive labels only
] as const;

export const DerivedMemoryLiteSchema = z.object({
  labels: z.array(z.enum(ALLOWED_LABELS)),
  stats: z.object({
    totalEntries: z.number().int().nonnegative(),
    avgWordsPerEntry: z.number().nonnegative(),
  }),
});
```

**Architecture Reference:** `architecture.md` Section "DerivedMemoryLite Strict Definition"

---

### Story 1.7: Setup Development Environment

**Story ID:** STORY-1.7  
**Priority:** P1  
**Dependencies:** STORY-1.1, STORY-1.2

**As a** developer  
**I want** a documented and reproducible development environment  
**So that** new team members can onboard quickly

**Acceptance Criteria:**
- [ ] `CONTRIBUTING.md` created with setup instructions
- [ ] `.env.example` created with all required variables
- [ ] `.vscode/settings.json` created with recommended extensions
- [ ] `.eslintrc.json` configured with `no-restricted-imports` for tests
- [ ] `.prettierrc` configured for code formatting
- [ ] `.husky/pre-commit` hook configured (lint + format)
- [ ] `README.md` updated with project overview and quick start
- [ ] All scripts documented in `package.json`

**Required Scripts (`package.json`):**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "sync-schemas": "cp -r lib/schemas/* functions/src/schemas/",
    "pretest:functions": "npm run sync-schemas",
    "test:functions": "cd functions && npm test"
  }
}
```

**Architecture Reference:** `architecture.md` Section "Project Structure & Boundaries"

---

## Dependencies

**Blocks:**
- Epic 2 (Authentication) - Requires Firebase Auth configuration
- Epic 3 (Journaling) - Requires Firestore Rules
- Epic 4 (Mirror Chat) - Requires Edge runtime setup
- Epic 5 (Insight Engine) - Requires Cloud Functions setup
- Epic 6 (Payments) - Requires environment variables
- Epic 7 (Settings) - Requires project structure
- Epic 8 (Analytics) - Requires CI/CD

**Blocked By:** None (First epic)

---

## Technical Notes

- **Strict Pinning**: React 19.0.0 and Next.js 15.x must be strictly pinned (no `^` or `~`)
- **Turbopack**: Use `--no-turbopack` fallback if dev server issues
- **Firebase Emulator**: Use for local Firestore Rules testing
- **Schema Sync**: Run `npm run sync-schemas` before testing Cloud Functions

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Next.js 15 + React 19 version drift | Strict pinning in package.json, CI checks |
| Firebase project misconfiguration | Use `.firebaserc` aliases, test deployment early |
| CI/CD pipeline failures | Test locally first, use Firebase Emulator |
| Missing environment variables | `.env.example` template, validation script |

---

## Definition of Done

- [ ] All 5 stories completed and acceptance criteria met
- [ ] CI/CD pipelines passing on main branch
- [ ] Development environment documented and reproducible
- [ ] Firestore Rules and Indexes deployed to dev environment
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
