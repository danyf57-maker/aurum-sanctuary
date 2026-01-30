# Epic 4: Mirror Chat

**Epic ID:** EPIC-04  
**Priority:** P0 (Critical - Core differentiation)  
**Estimated Stories:** 7  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication), EPIC-03 (Journaling)

---

## Epic Goal

Implement the Mirror Chat feature using Vercel Edge Runtime and DeepSeek LLM, with streaming responses, rate limiting, and reflective questioning. This epic delivers the "Mirror AI" that helps users deepen their self-reflection without giving advice.

---

## User Value

As a **user (Alma)**, I need an AI that reflects my patterns back to me through questions so that I can gain clarity without feeling judged or advised.

---

## Success Criteria

- [x] Mirror Chat responds with reflective questions (no advice)
- [x] Typing indicator appears <400ms after user pause
- [x] Responses stream in real-time (DeepSeek streaming)
- [x] Rate limiting enforced (20 req/min/user)
- [x] Mirror Chat uses `derivedMemoryLite` for context
- [x] Chat UI minimized by default, expandable on demand
- [x] No sensitive data sent to DeepSeek API

---

## Stories

### Story 4.1: Setup Upstash Redis for Rate Limiting

**Story ID:** STORY-4.1  
**Priority:** P0  
**Dependencies:** STORY-1.2 (Firebase Configuration)

**As a** developer  
**I want** to configure Upstash Redis for rate limiting  
**So that** I can control DeepSeek API costs and prevent abuse

**Acceptance Criteria:**
- [ ] Upstash Redis account created
- [ ] Redis REST API credentials stored in environment variables
- [ ] `lib/redis/client.ts` created with Upstash client
- [ ] Rate limiting helper function created (`checkRateLimit()`)
- [ ] Rate limits configured:
  - Mirror Chat: 20 req/min/user (technical limit)
  - User-visible limit: 1 req/90s (UX constraint)
- [ ] Rate limit errors return 429 status with retry-after header
- [ ] Redis keys expire automatically (TTL: 60s for Mirror Chat)

**Environment Variables:**
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Implementation:**
```typescript
// lib/redis/client.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(userId: string, limit: number, window: number): Promise<boolean> {
  const key = `ratelimit:mirror:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, window); // Set TTL on first request
  }
  
  return count <= limit;
}
```

**Architecture Reference:** `architecture.md` Section "Rate Limiting (Upstash Redis)"

---

### Story 4.2: Implement DeepSeek Adapter

**Story ID:** STORY-4.2  
**Priority:** P0  
**Dependencies:** STORY-4.1

**As a** developer  
**I want** to create a DeepSeek API adapter with streaming support  
**So that** I can call the LLM with proper error handling and retries

**Acceptance Criteria:**
- [ ] `lib/deepseek/adapter.ts` created
- [ ] DeepSeek API key stored in **Vercel environment variables** (Edge-compatible)
- [ ] Streaming responses supported (Server-Sent Events)
- [ ] Timeout configured: 5s for Mirror Chat
- [ ] Retry logic: max 2 retries with exponential backoff
- [ ] Error handling: network errors, API errors, timeout errors
- [ ] Guardrails: max 500 tokens per response (cost control)
- [ ] System prompt enforced: "You are a reflective listening agent. Never give advice."

**Environment Variables (Vercel):**
```bash
DEEPSEEK_API_KEY=sk-...
```

**Implementation:**
```typescript
// lib/deepseek/adapter.ts
export async function callDeepSeek(
  prompt: string,
  context: DerivedMemoryLite,
  options: { timeout?: number; maxTokens?: number } = {}
): Promise<ReadableStream> {
  const { timeout = 5000, maxTokens = 500 } = options;
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, // Vercel env variable
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: MIRROR_SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(prompt, context) },
      ],
      max_tokens: maxTokens,
      stream: true,
    }),
    signal: AbortSignal.timeout(timeout),
  });
  
  return response.body!;
}
```

**Architecture Reference:** `architecture.md` Section "DeepSeek Adapter"

---

### Story 4.3: Build Vercel Edge Function for Mirror Chat

**Story ID:** STORY-4.3  
**Priority:** P0  
**Dependencies:** STORY-4.1, STORY-4.2

**As a** developer  
**I want** to create a Vercel Edge Function for Mirror Chat  
**So that** responses stream with low latency

**Acceptance Criteria:**
- [ ] `app/api/mirror/route.ts` created with `runtime = 'edge'`
- [ ] Firebase ID token validated via **Firebase Auth REST API** (Edge-compatible)
- [ ] Rate limiting enforced (Upstash Redis)
- [ ] `derivedMemoryLite` validated with Zod schema
- [ ] DeepSeek API called with streaming
- [ ] Response streamed back to client (Server-Sent Events)
- [ ] No Firestore SDK used (Edge runtime constraint)
- [ ] Error handling: auth errors, rate limit errors, DeepSeek errors
- [ ] Safe logging: no PII, no entry content

**Firebase Auth Verification (Edge-Compatible):**
```typescript
// lib/firebase/edge.ts
export async function verifyIdTokenEdge(idToken: string): Promise<string | null> {
  // Use Firebase Auth REST API (no Admin SDK in Edge runtime)
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.users?.[0]?.localId || null; // Returns userId
}
```

**Implementation:**
```typescript
// app/api/mirror/route.ts
export const runtime = 'edge';

export async function POST(req: Request) {
  // 1. Validate Firebase ID token (REST API, Edge-compatible)
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = await verifyIdTokenEdge(token); // Edge-compatible verification
  if (!userId) {
    return new Response('Invalid token', { status: 401 });
  }
  
  // 2. Check rate limit
  const allowed = await checkRateLimit(userId, 20, 60);
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // 3. Validate payload
  const { text, derivedMemoryLite } = await req.json();
  const validated = DerivedMemoryLiteSchema.parse(derivedMemoryLite);
  
  // 4. Call DeepSeek
  const stream = await callDeepSeek(text, validated);
  
  // 5. Stream response
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

**Architecture Reference:** `architecture.md` Section "Edge Runtime Constraints"

---

### Story 4.4: Implement Zustand Store for Mirror Chat State

**Story ID:** STORY-4.4  
**Priority:** P0  
**Dependencies:** STORY-4.3

**As a** developer  
**I want** to manage Mirror Chat state with Zustand  
**So that** chat history and UI state are reactive

**Acceptance Criteria:**
- [ ] `store/mirror/useMirrorStore.ts` created
- [ ] State includes: `messages`, `isTyping`, `isMinimized`, `error`
- [ ] Actions: `addMessage`, `setTyping`, `toggleMinimized`, `clearChat`
- [ ] Messages stored in-memory only (not persisted)
- [ ] Typing indicator state managed
- [ ] Error state managed (network errors, rate limit errors)
- [ ] Store reset on user logout

**Implementation:**
```typescript
// store/mirror/useMirrorStore.ts
import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface MirrorStore {
  messages: Message[];
  isTyping: boolean;
  isMinimized: boolean;
  error: string | null;
  
  addMessage: (message: Message) => void;
  setTyping: (isTyping: boolean) => void;
  toggleMinimized: () => void;
  clearChat: () => void;
}

export const useMirrorStore = create<MirrorStore>((set) => ({
  messages: [],
  isTyping: false,
  isMinimized: true,
  error: null,
  
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
  clearChat: () => set({ messages: [], error: null }),
}));
```

**Architecture Reference:** `architecture.md` Section "State Management (Zustand)"

---

### Story 4.5: Build Mirror Chat UI Component

**Story ID:** STORY-4.5  
**Priority:** P0  
**Dependencies:** STORY-4.4

**As a** user  
**I want** a minimalist Mirror Chat UI  
**So that** I can interact with the AI without distraction

**Acceptance Criteria:**
- [ ] `components/features/MirrorChat.tsx` created
- [ ] Chat minimized by default (small icon in corner)
- [ ] Click icon to expand chat panel
- [ ] Chat panel slides in from right (smooth animation)
- [ ] Messages displayed in chronological order
- [ ] User messages: right-aligned, Aurum Gold background
- [ ] AI messages: left-aligned, Vellum Beige background
- [ ] Typing indicator: animated dots (<400ms latency)
- [ ] Input field: auto-resize, max 500 characters
- [ ] Send button: disabled during typing indicator
- [ ] Error messages: non-anxious, user-friendly

**UI Design:**
- Minimized: Small circle icon (Aurum Gold) in bottom-right corner
- Expanded: Panel 400px wide, full height, Vellum Beige background
- Messages: Card-based, subtle shadows
- Typing indicator: Three animated dots (Sienna Earth)

**Architecture Reference:** `architecture.md` Section "FR7-FR9: Mirror Chat"

---

### Story 4.6: Implement Typing Indicator Logic

**Story ID:** STORY-4.6  
**Priority:** P0  
**Dependencies:** STORY-4.5

**As a** user  
**I want** to see a typing indicator immediately when the AI is processing  
**So that** I feel the AI is present and responsive

**Acceptance Criteria:**
- [ ] Typing indicator appears <400ms after user sends message
- [ ] Indicator shown while DeepSeek API is processing
- [ ] Indicator hidden when first token arrives (streaming)
- [ ] Indicator animated (three dots, smooth fade in/out)
- [ ] Indicator position: bottom of chat panel
- [ ] No indicator if rate limit error or network error

**Implementation:**
```typescript
// components/features/MirrorChat.tsx
const handleSendMessage = async (text: string) => {
  setTyping(true); // Show indicator immediately
  
  try {
    const response = await fetch('/api/mirror', {
      method: 'POST',
      body: JSON.stringify({ text, derivedMemoryLite }),
    });
    
    const reader = response.body!.getReader();
    let aiMessage = '';
    
    // Hide indicator on first token
    const { value } = await reader.read();
    setTyping(false);
    
    // Stream remaining tokens
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiMessage += new TextDecoder().decode(value);
      updateMessage(aiMessage); // Update UI in real-time
    }
  } catch (error) {
    setTyping(false);
    setError('Network error. Please try again.');
  }
};
```

**Architecture Reference:** `architecture.md` Section "FR22: Typing Indicator"

---

### Story 4.7: Implement DerivedMemoryLite Fetching

**Story ID:** STORY-4.7  
**Priority:** P0  
**Dependencies:** STORY-4.3

**As a** developer  
**I want** to fetch `derivedMemoryLite` from Firestore and send it to the Edge Function  
**So that** Mirror Chat has context without accessing sensitive data

**Acceptance Criteria:**
- [ ] Client fetches `users/{uid}/derivedMemory/lite` from Firestore
- [ ] `derivedMemoryLite` validated with Zod schema before sending
- [ ] Only whitelisted labels included (`ALLOWED_LABELS`)
- [ ] No phrases, quotes, or verbatim text included
- [ ] Payload sent to `/api/mirror` in request body
- [ ] Firestore read cached (5min TTL) to reduce costs
- [ ] Error handling: missing `derivedMemoryLite` (send empty placeholder)
- [ ] **Note**: Placeholder created in Epic 1 (STORY-1.6), no dependency on Epic 5

**Placeholder Handling:**
```typescript
// If derivedMemoryLite doesn't exist or is empty, use placeholder
const defaultLite = { labels: [], stats: { totalEntries: 0, avgWordsPerEntry: 0 } };
const derivedMemoryLite = liteDoc.exists() ? liteDoc.data() : defaultLite;
```

**Zod Schema:**
```typescript
// lib/schemas/derived-memory.ts
export const DerivedMemoryLiteSchema = z.object({
  labels: z.array(z.enum(ALLOWED_LABELS)), // Whitelisted only
  stats: z.object({
    totalEntries: z.number(),
    avgWordsPerEntry: z.number(),
    // No sensitive stats
  }),
});
```

**Architecture Reference:** `architecture.md` Section "DerivedMemoryLite Strict Definition"

---

## Dependencies

**Blocks:**
- Epic 5 (Insight Engine) - Shares `derivedMemory` concept
- Epic 8 (Analytics) - Requires Mirror Chat events

**Blocked By:**
- EPIC-01 (Infrastructure) - Upstash Redis, Vercel Edge setup
- EPIC-02 (Authentication) - User identity for rate limiting
- EPIC-03 (Journaling) - Entry content for context

---

## Technical Notes

- **Vercel Edge Runtime**: No Node.js APIs (fs, crypto, gRPC)
- **DeepSeek Streaming**: Use Server-Sent Events (SSE)
- **Rate Limiting**: 20 req/min technical, 1 req/90s user-visible
- **DerivedMemoryLite**: Strict whitelist, Zod validation mandatory
- **Typing Indicator**: <400ms latency critical for UX

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| DeepSeek API downtime | Show user-friendly error, retry with backoff |
| Rate limit abuse | Enforce strict limits, monitor usage |
| Edge runtime errors | Test thoroughly, fallback to API Routes if needed |
| Sensitive data leak via `derivedMemoryLite` | Zod validation, whitelist enforcement, CI checks |

---

## Definition of Done

- [ ] All 7 stories completed and acceptance criteria met
- [ ] Mirror Chat functional with streaming responses
- [ ] Typing indicator appears <400ms
- [ ] Rate limiting enforced and tested
- [ ] `derivedMemoryLite` validated and secure
- [ ] Unit tests for DeepSeek adapter (>80% coverage)
- [ ] Integration tests for Edge Function
- [ ] E2E tests for Mirror Chat flow
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
