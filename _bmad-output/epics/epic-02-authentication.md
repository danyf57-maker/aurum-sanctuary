# Epic 2: Authentication & Onboarding

**Epic ID:** EPIC-02  
**Priority:** P0 (Critical - Required for all user-facing features)  
**Estimated Stories:** 4  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure)

---

## Epic Goal

Implement secure authentication and onboarding flows using Firebase Auth, ensuring users can sign up, log in, accept terms, and access protected routes. This epic establishes the foundation for user identity and session management.

---

## User Value

As a **user (Alma)**, I need to create an account and log in securely so that I can access my private journal and ensure my data is protected.

---

## Success Criteria

- [x] Users can sign up via Google Auth or Email/Password
- [x] Users can log in and maintain sessions
- [x] Terms of Service and Medical Disclaimer acceptance enforced
- [x] Protected routes require authentication (middleware)
- [x] Anonymous users cannot access journal features
- [x] Auth state persisted across page reloads

---

## Stories

### Story 2.1: Implement Firebase Auth Integration

**Story ID:** STORY-2.1  
**Priority:** P0  
**Dependencies:** STORY-1.2 (Firebase Configuration)

**As a** developer  
**I want** to integrate Firebase Auth SDK  
**So that** users can authenticate securely

**Acceptance Criteria:**
- [ ] `lib/firebase/web-client.ts` created with Firebase client SDK
- [ ] `lib/firebase/auth.ts` created with auth helper functions
- [ ] Firebase Auth initialized with correct config
- [ ] Auth state listener implemented
- [ ] `useAuth()` hook created for React components
- [ ] Auth context provider wraps app layout
- [ ] Session persistence configured (localStorage)
- [ ] No Firebase client SDK imported in server components

**Implementation:**
```typescript
// lib/firebase/web-client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
```

**Architecture Reference:** `architecture.md` Section "Firebase Strict Runtime Separation"

---

### Story 2.2: Build Login & Signup Pages

**Story ID:** STORY-2.2  
**Priority:** P0  
**Dependencies:** STORY-2.1

**As a** user  
**I want** to sign up and log in via Google or Email/Password  
**So that** I can access my journal

**Acceptance Criteria:**
- [ ] `app/(public)/login/page.tsx` created
- [ ] `app/(public)/signup/page.tsx` created
- [ ] Google Auth button functional (Firebase popup)
- [ ] Email/Password form functional (validation with Zod)
- [ ] Error handling for auth failures (user-friendly messages)
- [ ] Loading states during auth operations
- [ ] Redirect to `/dashboard` after successful login
- [ ] "Forgot Password" flow implemented
- [ ] Design matches Aurum Sanctuary brand (Aurum Gold, Vellum Beige)

**UI Components:**
- `components/features/AuthForm.tsx` (Email/Password form)
- `components/ui/Button.tsx` (Google Auth button)
- `components/ui/Input.tsx` (Email, Password inputs)

**Validation Schema:**
```typescript
// lib/schemas/auth.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**Architecture Reference:** `architecture.md` Section "FR1: Authentication"

---

### Story 2.3: Implement Terms Acceptance Flow

**Story ID:** STORY-2.3  
**Priority:** P0  
**Dependencies:** STORY-2.2

**As a** user  
**I want** to explicitly accept Terms of Service and Medical Disclaimer  
**So that** I understand the app's limitations and privacy guarantees

**Acceptance Criteria:**
- [ ] `app/(public)/terms/page.tsx` created (Terms of Service)
- [ ] `app/(public)/disclaimer/page.tsx` created (Medical Disclaimer)
- [ ] Terms acceptance modal shown on first login
- [ ] User cannot access app without accepting terms
- [ ] Acceptance stored in Firestore (`users/{uid}.termsAcceptedAt`)
- [ ] Terms version tracked (for future updates)
- [ ] "I have read and accept" checkbox required
- [ ] Link to full terms document

**Firestore Schema:**
```typescript
// users/{uid}
{
  uid: string;
  email: string;
  createdAt: Timestamp;
  termsAcceptedAt: Timestamp | null;
  termsVersion: string; // e.g., "2026-01-29" (matches published terms version)
}
```

**Architecture Reference:** `architecture.md` Section "FR2: Terms Acceptance"

---

### Story 2.4: Setup Route Guards (Middleware)

**Story ID:** STORY-2.4  
**Priority:** P0  
**Dependencies:** STORY-2.1

**As a** developer  
**I want** to protect routes with authentication middleware  
**So that** only authenticated users can access protected pages

**Acceptance Criteria:**
- [ ] `middleware.ts` created at project root
- [ ] Public routes accessible without auth (`/`, `/login`, `/signup`, `/terms`)
- [ ] Protected routes redirect to `/login` if unauthenticated (`/dashboard`, `/journal`, `/settings`)
- [ ] Auth token verified server-side (Firebase Admin SDK)
- [ ] Middleware runs on all routes except static assets
- [ ] Session cookie set after login (httpOnly, secure)
- [ ] Middleware performance optimized (<50ms overhead)

**Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/terms', '/disclaimer'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Lightweight guard: check for auth cookie presence
  const token = request.cookies.get('auth-token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Real security enforced by:
  // 1. Firestore Rules (client-side access)
  // 2. API Routes with Firebase Admin SDK verification
  // 3. Server Actions with auth checks
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Note**: This is a lightweight guard. Real auth verification happens in:
- Firestore Rules (client reads/writes)
- API Routes (server-side Firebase Admin SDK)
- Server Actions (auth context)

**Architecture Reference:** `architecture.md` Section "Route Guards & Middleware"

---

### Story 2.5: Implement Forgot Password Flow

**Story ID:** STORY-2.5  
**Priority:** P1  
**Dependencies:** STORY-2.2 (Login/Signup Pages)

**As a** user  
**I want** to reset my password if I forget it  
**So that** I can regain access to my account

**Acceptance Criteria:**
- [ ] "Forgot Password?" link on login page
- [ ] `app/(public)/forgot-password/page.tsx` created
- [ ] Email input field with validation (Zod)
- [ ] Firebase `sendPasswordResetEmail()` called
- [ ] Success message: "Password reset email sent. Check your inbox."
- [ ] Error handling: invalid email, user not found
- [ ] Rate limiting: max 3 requests per hour per email (Upstash Redis)
- [ ] Email template customized (Firebase Console)

**Implementation:**
```typescript
// app/(public)/forgot-password/page.tsx
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/web-client';

export default function ForgotPasswordPage() {
  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      // Show success message
    } catch (error) {
      // Handle error (user not found, invalid email, etc.)
    }
  };
  
  // ... UI implementation
}
```

**Architecture Reference:** `architecture.md` Section "FR1: Authentication"

---

## Dependencies

**Blocks:**
- Epic 3 (Journaling) - Requires authenticated users
- Epic 4 (Mirror Chat) - Requires user sessions
- Epic 5 (Insight Engine) - Requires user identity
- Epic 6 (Payments) - Requires user accounts
- Epic 7 (Settings) - Requires authenticated routes
- Epic 8 (Analytics) - Requires user tracking

**Blocked By:**
- EPIC-01 (Infrastructure) - Firebase configuration required

---

## Technical Notes

- **Firebase Auth Persistence**: Use `browserLocalPersistence` for web
- **Server-Side Token Verification**: Use Firebase Admin SDK in middleware
- **Session Cookies**: Set `httpOnly`, `secure`, `sameSite: 'lax'`
- **Error Handling**: Never expose Firebase error codes to users (use friendly messages)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Firebase Auth rate limiting | Implement exponential backoff, show user-friendly errors |
| Session hijacking | Use httpOnly cookies, verify tokens server-side |
| Terms not accepted | Enforce modal blocking, store acceptance timestamp |
| Middleware performance | Cache auth checks, optimize token verification |

---

## Definition of Done

- [ ] All 4 stories completed and acceptance criteria met
- [ ] Users can sign up, log in, and accept terms
- [ ] Protected routes enforce authentication
- [ ] Auth state persisted across page reloads
- [ ] Unit tests for auth helpers (>80% coverage)
- [ ] E2E tests for login/signup flows
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
