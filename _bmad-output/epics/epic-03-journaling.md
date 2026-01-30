# Epic 3: Core Journaling

**Epic ID:** EPIC-03  
**Priority:** P0 (Critical - Core product value)  
**Estimated Stories:** 6  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication)

---

## Epic Goal

Implement the core journaling experience with client-side encryption, auto-save drafts, Timeline view, and Firestore sync. This epic delivers the fundamental value proposition: a secure, private space for emotional expression.

---

## User Value

As a **user (Alma)**, I need to write journal entries freely and securely so that I can express my emotions without fear of judgment or data loss.

---

## Success Criteria

- [x] Users can create encrypted journal entries (no character limit)
- [x] Entries auto-save locally every 2s (no data loss)
- [x] Entries sync to Firestore when online
- [x] Timeline view displays all past entries
- [x] Client-side encryption (AES-256-GCM) enforced
- [x] No plaintext entry content ever sent to server

---

## Stories

### Story 3.1: Implement Client-Side Encryption Layer

**Story ID:** STORY-3.1  
**Priority:** P0  
**Dependencies:** STORY-1.2 (Firebase Configuration)

**As a** developer  
**I want** to implement AES-256-GCM encryption using WebCrypto  
**So that** journal entries are encrypted client-side before storage

**Acceptance Criteria:**
- [ ] `lib/crypto/client/encrypt.ts` created with `encryptEntry()` function
- [ ] `lib/crypto/client/decrypt.ts` created with `decryptEntry()` function
- [ ] `lib/crypto/client/keys.ts` created with key management logic
- [ ] AES-256-GCM algorithm used (WebCrypto API)
- [ ] **Content key model**: Random AES-256 key generated on signup (not password-derived)
- [ ] Content key wrapped by Google Cloud KMS (server-side)
- [ ] `wrappedContentKey` stored in Firestore `users/{uid}.wrappedContentKey`
- [ ] Client calls Cloud Function `getContentKey()` to retrieve wrapped key
- [ ] IV (Initialization Vector) generated randomly per entry
- [ ] Encrypted data format: `{ iv: string, ciphertext: string }`
- [ ] Keys never stored in localStorage (in-memory + sessionStorage only)
- [ ] Unit tests for encrypt/decrypt (>90% coverage)

**Key Management Flow:**
1. **Signup**: Cloud Function generates random AES-256 key → wraps with KMS → stores `wrappedContentKey`
2. **Login**: Client calls `getContentKey()` (auth + rate limit) → receives wrapped key → unwraps client-side (or receives usable key)
3. **Encryption**: Client encrypts entries with content key before Firestore write
4. **Decryption**: Client decrypts entries after Firestore read

**Implementation:**
```typescript
// lib/crypto/client/encrypt.ts
export async function encryptEntry(plaintext: string, contentKey: CryptoKey): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    contentKey, // From getContentKey() Cloud Function
    data
  );
  
  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
  };
}

// lib/crypto/client/keys.ts
export async function fetchContentKey(userId: string, idToken: string): Promise<CryptoKey> {
  const response = await fetch('/api/getContentKey', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${idToken}` },
    body: JSON.stringify({ userId }),
  });
  
  const { wrappedKey } = await response.json();
  
  // Unwrap key client-side (or receive usable key depending on implementation)
  // V1: Server returns transport-encrypted key, client unwraps
  const contentKey = await unwrapKey(wrappedKey);
  
  // Store in memory + sessionStorage (not localStorage)
  sessionStorage.setItem('contentKey', await exportKey(contentKey));
  
  return contentKey;
}
```

**Architecture Reference:** `architecture.md` Section "Client-Side Encryption"

---

### Story 3.2: Build Journal Editor Component

**Story ID:** STORY-3.2  
**Priority:** P0  
**Dependencies:** STORY-2.4 (Route Guards)

**As a** user  
**I want** a distraction-free journal editor  
**So that** I can write freely without UI clutter

**Acceptance Criteria:**
- [ ] `components/features/JournalEditor.tsx` created
- [ ] Textarea with no character limit
- [ ] Auto-resize textarea as user types
- [ ] Vellum Beige background (#F5F5DC)
- [ ] Inter font for body text (legible, modern)
- [ ] No formatting toolbar (plain text only for V1)
- [ ] Word count displayed (non-intrusive)
- [ ] Timestamp auto-generated on entry creation
- [ ] "Save" button (manual save option)
- [ ] Keyboard shortcuts (Cmd+S to save)

**UI Design:**
- Minimal, calm interface (no red badges, no popups)
- Large textarea (80% viewport height)
- Subtle border (Sienna Earth #8B4513)
- Focus state: subtle glow (Aurum Gold #D4AF37)

**Architecture Reference:** `architecture.md` Section "FR4: Core Journaling"

---

### Story 3.3: Implement Auto-Save Drafts (LocalStorage)

**Story ID:** STORY-3.3  
**Priority:** P0  
**Dependencies:** STORY-3.1, STORY-3.2

**As a** user  
**I want** my journal entries to auto-save locally  
**So that** I never lose my writing due to network issues or crashes

**Acceptance Criteria:**
- [ ] Drafts saved to sessionStorage every 2s while typing (not localStorage)
- [ ] Draft key format: `draft_{userId}_{timestamp}`
- [ ] Drafts encrypted with **session-based draftKey** (generated on page load, in-memory)
- [ ] Draft restored on page reload if unsaved (requires calling `getContentKey()` again)
- [ ] Draft purged after successful Firestore sync
- [ ] "Unsaved changes" indicator shown when draft exists
- [ ] Network drop handled gracefully (no error popup)
- [ ] Draft size limit: 5MB (sessionStorage constraint)

**Draft Encryption Strategy (V1):**
- Generate ephemeral `draftKey` on page load (WebCrypto, stored in memory)
- Encrypt drafts with `draftKey` before sessionStorage
- On page reload: call `getContentKey()` → decrypt persisted drafts
- Trade-off: Drafts lost if user closes tab (acceptable V1)
- V2: Persist drafts encrypted with contentKey (requires `getContentKey()` call on reload)

**Implementation:**
```typescript
// hooks/useAutoSave.ts
export function useAutoSave(content: string, userId: string) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftKey = `draft_${userId}_${Date.now()}`;
      const encrypted = encryptEntry(content, userKey);
      localStorage.setItem(draftKey, JSON.stringify(encrypted));
    }, 2000); // 2s debounce
    
    return () => clearTimeout(timer);
  }, [content, userId]);
}
```

**Architecture Reference:** `architecture.md` Section "FR5: Auto-Save Drafts"

---

### Story 3.4: Implement Firestore Sync for Entries

**Story ID:** STORY-3.4  
**Priority:** P0  
**Dependencies:** STORY-3.1, STORY-3.3

**As a** user  
**I want** my journal entries synced to Firestore  
**So that** I can access them from any device

**Acceptance Criteria:**
- [ ] Entries saved to `users/{uid}/entries/{entryId}`
- [ ] Entry schema: `{ encryptedContent, iv, createdAt, updatedAt }`
- [ ] Firestore write triggered on "Save" button or auto-save (online)
- [ ] Sync confirmation shown to user ("Saved to cloud")
- [ ] LocalStorage draft purged after successful sync
- [ ] Offline writes queued (Firestore offline persistence)
- [ ] Conflict resolution: last-write-wins (V1 simplification)
- [ ] No plaintext content in Firestore (encrypted only)

**Firestore Schema:**
```typescript
// users/{uid}/entries/{entryId}
{
  encryptedContent: string; // Base64 ciphertext
  iv: string; // Base64 IV
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string; // Redundant but useful for queries
}
```

**Architecture Reference:** `architecture.md` Section "Firestore Schema - Entries"

---

### Story 3.5: Build Timeline View

**Story ID:** STORY-3.5  
**Priority:** P1  
**Dependencies:** STORY-3.4

**As a** user  
**I want** to view a timeline of all my past entries  
**So that** I can revisit my emotional journey

**Acceptance Criteria:**
- [ ] `app/(protected)/timeline/page.tsx` created
- [ ] Entries fetched from Firestore (`users/{uid}/entries`, ordered by `createdAt DESC`)
- [ ] Entries decrypted client-side before display
- [ ] Timeline shows: date, first 100 characters (preview), word count
- [ ] Click entry to view full content
- [ ] Infinite scroll or pagination (20 entries per page)
- [ ] Loading skeleton while fetching
- [ ] Empty state: "No entries yet. Start writing."
- [ ] Firestore index used (`entries` collection, `createdAt DESC`)

**UI Design:**
- Card-based layout (each entry = card)
- Vellum Beige cards with Sienna Earth borders
- Hover effect: subtle Aurum Gold glow
- Date displayed in Literata font (serif, elegant)

**Architecture Reference:** `architecture.md` Section "FR6: Timeline View"

---

### Story 3.6: Implement Entry Deletion

**Story ID:** STORY-3.6  
**Priority:** P2  
**Dependencies:** STORY-3.5

**As a** user  
**I want** to delete journal entries permanently  
**So that** I can remove content I no longer want to keep

**Acceptance Criteria:**
- [ ] Delete button on each entry in Timeline
- [ ] Confirmation modal: "Are you sure? This cannot be undone."
- [ ] Entry **hard deleted** from Firestore (`users/{uid}/entries/{entryId}`)
- [ ] sessionStorage draft purged if exists
- [ ] Deletion logged for analytics (event only, no content)
- [ ] No soft delete (GDPR compliance: data must be purged)
- [ ] Deletion reflected immediately in UI (optimistic update)

**GDPR Compliance:**
- Hard delete ensures "Right to be Forgotten"
- No retention of deleted entries (even in backups after 30 days)
- Soft delete not required (and potentially problematic for privacy claims)

**Architecture Reference:** `architecture.md` Section "Right to be Forgotten"

---

## Dependencies

**Blocks:**
- Epic 4 (Mirror Chat) - Requires entry content for context
- Epic 5 (Insight Engine) - Requires entries for analysis
- Epic 8 (Analytics) - Requires entry events (created, deleted)

**Blocked By:**
- EPIC-01 (Infrastructure) - Firestore configuration required
- EPIC-02 (Authentication) - User identity required

---

## Technical Notes

- **WebCrypto API**: Use `crypto.subtle` (browser native, no external libs)
- **Key Derivation**: PBKDF2 with 100k iterations (balance security/performance)
- **IV Storage**: Store IV alongside ciphertext (not secret, required for decryption)
- **Firestore Offline Persistence**: Enable for offline writes
- **LocalStorage Limit**: 5-10MB per domain (monitor usage)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Key loss (user forgets password) | Implement key recovery flow (Epic 7) |
| LocalStorage quota exceeded | Implement size limit, purge old drafts |
| Decryption failure (corrupted data) | Validate ciphertext format, show error gracefully |
| Firestore write failures | Queue writes, retry with exponential backoff |

---

## Definition of Done

- [ ] All 6 stories completed and acceptance criteria met
- [ ] Users can create, view, and delete encrypted entries
- [ ] Auto-save prevents data loss
- [ ] Timeline view functional and performant
- [ ] Unit tests for encryption layer (>90% coverage)
- [ ] Integration tests for Firestore sync
- [ ] E2E tests for journal flow (create, save, view, delete)
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
