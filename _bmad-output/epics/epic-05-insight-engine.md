# Epic 5: Insight Engine & Derived Memory

**Epic ID:** EPIC-05  
**Priority:** P0 (Critical - Core value proposition)  
**Estimated Stories:** 5  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication), EPIC-03 (Journaling)

---

## Epic Goal

Implement the Insight Engine that generates weekly insights from journal entries using Cloud Functions, Derived Memory synthesis, and DeepSeek LLM. This epic delivers the "Aha! Moment" that drives conversion and retention.

---

## User Value

As a **user (Alma)**, I need weekly insights that reveal emotional patterns so that I can gain clarity and understand my emotional journey without feeling judged.

---

## Success Criteria

- [x] Weekly insights generated automatically (Day 7 after signup)
- [x] Derived Memory updated on each entry (lite + summary split)
- [x] Insights encrypted and stored in Firestore
- [x] Push/in-app notifications when insight ready
- [x] Paywall enforced for full insight access (teaser for free users)
- [x] No sensitive verbatim text in derived memory

---

## Stories

### Story 5.1: Implement updateDerivedMemory Cloud Function

**Story ID:** STORY-5.1  
**Priority:** P0  
**Dependencies:** STORY-1.6 (DerivedMemoryLite Placeholder), STORY-3.4 (Firestore Sync)

**As a** developer  
**I want** to update Derived Memory on each entry creation  
**So that** Mirror Chat and Insight Engine have current context

**Acceptance Criteria:**
- [ ] Cloud Function `updateDerivedMemory` created (Firestore trigger: `onCreate` on `users/{uid}/entries/{entryId}`)
- [ ] Function decrypts entry using `getContentKey()` (KMS unwrap)
- [ ] Extracts non-sensitive patterns (labels, stats, themes)
- [ ] Updates `derivedMemory/lite` (clear text, whitelisted labels only)
- [ ] Updates `derivedMemory/summary` (encrypted, rich patterns)
- [ ] No verbatim text, phrases, or quotes stored
- [ ] Function runs in <3s (timeout: 60s)
- [ ] Error handling: decryption failures, missing keys

**Implementation:**
```typescript
// functions/src/updateDerivedMemory.ts
export const updateDerivedMemory = functions.firestore
  .document('users/{uid}/entries/{entryId}')
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    const entry = snap.data();
    
    // 1. Decrypt entry
    const contentKey = await unwrapContentKey(uid); // KMS unwrap
    const plaintext = await decrypt(entry.encryptedContent, entry.iv, contentKey);
    
    // 2. Extract patterns (DeepSeek API call)
    const patterns = await extractPatterns(plaintext);
    
    // 3. Update derivedMemory/lite (clear text, whitelisted only)
    await firestore.doc(`users/${uid}/derivedMemory/lite`).update({
      labels: patterns.labels.filter(l => ALLOWED_LABELS.includes(l)),
      stats: {
        totalEntries: admin.firestore.FieldValue.increment(1),
        avgWordsPerEntry: calculateAvg(plaintext.split(' ').length),
        lastEntryAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });
    
    // 4. Update derivedMemory/summary (encrypted)
    const summaryPlaintext = JSON.stringify(patterns.richSummary);
    const encryptedSummary = await encrypt(summaryPlaintext, contentKey);
    await firestore.doc(`users/${uid}/derivedMemory/summary`).set({
      encryptedSummary: encryptedSummary.ciphertext,
      iv: encryptedSummary.iv,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

**Architecture Reference:** `architecture.md` Section "Derived Memory Taxonomy"

---

### Story 5.2: Implement generateInsight Cloud Function

**Story ID:** STORY-5.2  
**Priority:** P0  
**Dependencies:** STORY-5.1

**As a** developer  
**I want** to generate weekly insights from Derived Memory  
**So that** users receive their "Aha! Moment"

**Acceptance Criteria:**
- [ ] Cloud Function `generateInsight` created (scheduled: weekly, per user)
- [ ] Function reads `derivedMemory/summary` (encrypted)
- [ ] Decrypts summary using `getContentKey()` (KMS unwrap)
- [ ] Calls DeepSeek API with summary (not raw entries)
- [ ] Generates insight text (descriptive, non-causal, no advice)
- [ ] Encrypts insight before storing in Firestore
- [ ] Stores in `users/{uid}/insights/{insightId}`
- [ ] Triggers notification (in-app + push if enabled)
- [ ] Timeout: 30s (DeepSeek call)

**Firestore Schema:**
```typescript
// users/{uid}/insights/{insightId}
{
  encryptedInsight: string; // Base64 ciphertext
  iv: string; // Base64 IV
  periodStart: Timestamp; // Week start date
  periodEnd: Timestamp; // Week end date
  createdAt: Timestamp;
  status: 'ready' | 'viewed'; // Track user engagement
}
```

**DeepSeek Prompt:**
```typescript
const INSIGHT_SYSTEM_PROMPT = `
You are an emotional pattern analyst. Generate a weekly insight based on the user's emotional patterns.
Rules:
- Be descriptive, not causal ("We observe..." not "This is because...")
- No advice or recommendations
- Focus on patterns and recurring themes
- Use calm, non-judgmental language
- Max 200 words
`;
```

**Architecture Reference:** `architecture.md` Section "FR10-FR12: Insight Engine"

---

### Story 5.3: Implement Insight Scheduling (Cloud Scheduler)

**Story ID:** STORY-5.3  
**Priority:** P0  
**Dependencies:** STORY-5.2

**As a** developer  
**I want** to schedule weekly insight generation for all users  
**So that** insights are generated automatically

**Acceptance Criteria:**
- [ ] Cloud Scheduler job created (runs daily at 2am UTC)
- [ ] Job triggers `scheduleInsights` Cloud Function
- [ ] Function queries users where `daysSinceSignup % 7 == 0`
- [ ] Enqueues `generateInsight` task for each eligible user
- [ ] Uses Cloud Tasks for queue (max concurrency: 10)
- [ ] Handles failures gracefully (retry 3x with exponential backoff)
- [ ] Logs success/failure metrics

**Implementation:**
```typescript
// functions/src/scheduleInsights.ts
export const scheduleInsights = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2am UTC
  .onRun(async (context) => {
    const today = new Date();
    const usersSnapshot = await firestore.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const daysSinceSignup = Math.floor(
        (today.getTime() - user.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceSignup % 7 === 0 && daysSinceSignup > 0) {
        // Enqueue generateInsight task
        await cloudTasks.createTask({
          functionName: 'generateInsight',
          payload: { userId: userDoc.id },
        });
      }
    }
  });
```

**Architecture Reference:** `architecture.md` Section "Insight Timing (Weekly)"

---

### Story 5.4: Build Insight Display UI

**Story ID:** STORY-5.4  
**Priority:** P0  
**Dependencies:** STORY-5.2

**As a** user  
**I want** to view my weekly insights  
**So that** I can gain clarity on my emotional patterns

**Acceptance Criteria:**
- [ ] `app/(protected)/insights/page.tsx` created
- [ ] Insights fetched from Firestore (`users/{uid}/insights`, ordered by `periodStart DESC`)
- [ ] Insights decrypted client-side before display
- [ ] Insight card shows: period dates, insight text, "viewed" status
- [ ] Click insight to expand full text
- [ ] Empty state: "Your first insight will arrive in X days"
- [ ] Loading skeleton while fetching
- [ ] Mark insight as "viewed" on first read

**UI Design:**
- Card-based layout (Vellum Beige cards)
- Literata font for insight text (elegant, literary)
- Period dates in small text (Sienna Earth)
- Subtle Aurum Gold accent on unread insights

**Architecture Reference:** `architecture.md` Section "FR10: Weekly Insight"

---

### Story 5.5: Implement Insight Notifications

**Story ID:** STORY-5.5  
**Priority:** P1  
**Dependencies:** STORY-5.2

**As a** user  
**I want** to be notified when my weekly insight is ready  
**So that** I don't miss my "Aha! Moment"

**Acceptance Criteria:**
- [ ] In-app notification created when insight ready
- [ ] Notification stored in `users/{uid}/notifications/{notificationId}`
- [ ] Notification text: "Your weekly insight is ready"
- [ ] Notification links to `/insights` page
- [ ] Notification badge shown in UI (non-intrusive)
- [ ] User can dismiss notification
- [ ] Push notifications (V1: in-app only, push in V2)

**Firestore Schema:**
```typescript
// users/{uid}/notifications/{notificationId}
{
  type: 'insight_ready';
  insightId: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}
```

**Architecture Reference:** `architecture.md` Section "FR11: Insight Notifications"

---

## Dependencies

**Blocks:**
- Epic 6 (Payments) - Insight access gated by subscription
- Epic 8 (Analytics) - Insight events tracked

**Blocked By:**
- EPIC-01 (Infrastructure) - Cloud Functions setup
- EPIC-02 (Authentication) - User identity
- EPIC-03 (Journaling) - Entry data required

---

## Technical Notes

- **DeepSeek Timeout**: 30s for Insight generation (longer than Mirror Chat)
- **KMS Unwrap**: Required for decrypting entries and Derived Memory
- **Cloud Scheduler**: Runs daily, checks all users for weekly eligibility
- **Cloud Tasks**: Queue for async insight generation (prevents timeout)
- **ALLOWED_LABELS**: Whitelisted non-sensitive labels only (defined in Epic 1)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| DeepSeek API cost explosion | Limit to 1 insight/week/user, max 200 tokens |
| Insight generation timeout | Use Cloud Tasks queue, 30s timeout |
| Sensitive data in Derived Memory | Strict whitelist, Zod validation, CI checks |
| Scheduler missing users | Query all users daily, idempotent task creation |

---

## Definition of Done

- [ ] All 5 stories completed and acceptance criteria met
- [ ] Weekly insights generated automatically
- [ ] Derived Memory updated on each entry
- [ ] Insights encrypted and displayed correctly
- [ ] Notifications functional (in-app)
- [ ] Unit tests for Cloud Functions (>80% coverage)
- [ ] Integration tests for insight flow
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
