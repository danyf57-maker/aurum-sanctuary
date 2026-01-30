# Epic 7: Settings & Compliance

**Epic ID:** EPIC-07  
**Priority:** P1 (Important - User control & compliance)  
**Estimated Stories:** 5  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication), EPIC-03 (Journaling)

---

## Epic Goal

Implement user settings, privacy controls, account deletion, and compliance features (GDPR, CCPA). This epic ensures users have full control over their data and the app meets legal requirements.

---

## User Value

As a **user (Alma)**, I need to control my settings and delete my account if needed so that I feel in control of my data and privacy.

---

## Success Criteria

- [x] Users can update preferences (notifications, theme, timezone)
- [x] Users can delete their account (nuclear delete)
- [x] Account deletion purges all data within 30 days
- [x] Privacy policy and terms accessible
- [x] Data export functionality (GDPR compliance)
- [x] Settings UI intuitive and non-anxious

---

## Stories

### Story 7.1: Build Settings Page UI

**Story ID:** STORY-7.1  
**Priority:** P1  
**Dependencies:** STORY-2.4 (Route Guards)

**As a** user  
**I want** to update my preferences  
**So that** I can customize my experience

**Acceptance Criteria:**
- [ ] `app/(protected)/settings/page.tsx` created
- [ ] Settings sections: Preferences, Privacy, Account
- [ ] Preferences fields:
  - `notificationsEnabled` (boolean toggle)
  - `theme` (dropdown: light, dark)
  - `timezone` (dropdown: major timezones)
  - `language` (dropdown: en, fr)
- [ ] Settings saved to Firestore `users/{uid}/settings/preferences`
- [ ] Auto-save on change (debounced 1s)
- [ ] Success message: "Settings saved" (non-intrusive)
- [ ] Error handling: Firestore write failures

**UI Design:**
- Clean, minimal layout (Vellum Beige background)
- Toggle switches for booleans (Aurum Gold accent)
- Dropdowns with clear labels
- Save indicator (subtle, non-anxious)

**Architecture Reference:** `architecture.md` Section "FR17: Settings"

---

### Story 7.2: Implement Account Deletion Flow

**Story ID:** STORY-7.2  
**Priority:** P0 (GDPR compliance)  
**Dependencies:** STORY-7.1

**As a** user  
**I want** to delete my account permanently  
**So that** I can exercise my "Right to be Forgotten"

**Acceptance Criteria:**
- [ ] "Delete Account" button in Settings (Account section)
- [ ] Confirmation modal with warning: "This action cannot be undone. All your data will be permanently deleted."
- [ ] User must type "DELETE" to confirm (prevent accidental deletion)
- [ ] Cloud Function `deleteUserAccount` triggered on confirmation
- [ ] Function deletes:
  - All entries (`users/{uid}/entries`)
  - All insights (`users/{uid}/insights`)
  - Derived memory (`users/{uid}/derivedMemory`)
  - Settings (`users/{uid}/settings`)
  - User document (`users/{uid}`)
  - Firebase Auth account
  - Stripe subscription (if exists)
- [ ] Deletion logged for compliance (no PII, just event)
- [ ] User redirected to `/goodbye` page
- [ ] Deletion completes within 30 days (Firestore + backups)

**Implementation:**
```typescript
// functions/src/deleteUserAccount.ts
export const deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  
  const { uid } = context.auth;
  
  // 1. Delete Firestore data
  const batch = firestore.batch();
  const userRef = firestore.doc(`users/${uid}`);
  const entriesSnapshot = await firestore.collection(`users/${uid}/entries`).get();
  entriesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
  // ... delete other subcollections
  batch.delete(userRef);
  await batch.commit();
  
  // 2. Delete Firebase Auth account
  await admin.auth().deleteUser(uid);
  
  // 3. Cancel Stripe subscription
  const user = await userRef.get();
  if (user.data()?.stripeCustomerId) {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.data()!.stripeCustomerId,
    });
    for (const sub of subscriptions.data) {
      await stripe.subscriptions.cancel(sub.id);
    }
  }
  
  // 4. Log deletion event (no PII)
  logger.infoSafe('Account deleted', { timestamp: Date.now() });
  
  return { success: true };
});
```

**Architecture Reference:** `architecture.md` Section "FR18: Account Deletion"

---

### Story 7.3: Implement Data Export (GDPR)

**Story ID:** STORY-7.3  
**Priority:** P1 (GDPR compliance)  
**Dependencies:** STORY-7.1

**As a** user  
**I want** to export all my data  
**So that** I can exercise my "Right to Data Portability"

**Acceptance Criteria:**
- [ ] "Export My Data" button in Settings (Privacy section)
- [ ] Cloud Function `exportUserData` triggered on click
- [ ] Function collects:
  - All entries (decrypted plaintext)
  - All insights (decrypted plaintext)
  - User metadata (email, createdAt, settings)
  - Subscription status
- [ ] Data exported as JSON file
- [ ] File uploaded to Cloud Storage (temporary, 7-day expiry)
- [ ] Download link sent to user email
- [ ] Link expires after 7 days
- [ ] Export logged for compliance

**Export Format:**
```json
{
  "user": {
    "email": "alma@example.com",
    "createdAt": "2026-01-15T10:00:00Z",
    "settings": { ... }
  },
  "entries": [
    { "date": "2026-01-20", "content": "..." },
    ...
  ],
  "insights": [
    { "period": "2026-01-15 to 2026-01-22", "insight": "..." },
    ...
  ]
}
```

**Architecture Reference:** `architecture.md` Section "GDPR Compliance"

---

### Story 7.4: Create Privacy Policy & Terms Pages

**Story ID:** STORY-7.4  
**Priority:** P0 (Legal compliance)  
**Dependencies:** None

**As a** user  
**I want** to read the Privacy Policy and Terms of Service  
**So that** I understand how my data is used

**Acceptance Criteria:**
- [ ] `app/(public)/privacy/page.tsx` created
- [ ] `app/(public)/terms/page.tsx` created
- [ ] Privacy Policy content:
  - Data collection practices
  - Encryption details ("Client-side Encryption + Admin-Blind Processing")
  - Third-party services (Firebase, Stripe, DeepSeek, PostHog)
  - User rights (GDPR, CCPA)
  - Contact information
- [ ] Terms of Service content:
  - Medical disclaimer (not a substitute for therapy)
  - Acceptable use policy
  - Subscription terms
  - Termination policy
- [ ] Version number displayed (e.g., "v2026-01-29")
- [ ] Last updated date displayed
- [ ] Links in footer (all pages)

**Privacy Policy Key Points:**
```markdown
# Privacy Policy

## Data Encryption
Your journal entries are encrypted on your device before being sent to our servers. 
We use client-side encryption (AES-256-GCM) to ensure your content is protected.

## Admin-Blind Processing
While our automated systems can decrypt your entries for analysis (to generate insights), 
no human administrator can access your plaintext content.

## Third-Party Services
- Firebase (Google): Hosting, authentication, database
- Stripe: Payment processing
- DeepSeek: AI-powered insights (receives anonymized patterns only, not raw entries)
- PostHog: Anonymous usage analytics

## Your Rights
- Right to access your data (export)
- Right to delete your data (account deletion)
- Right to data portability (GDPR)
```

**Architecture Reference:** `architecture.md` Section "Privacy Terminology"

---

### Story 7.5: Implement Notification Preferences

**Story ID:** STORY-7.5  
**Priority:** P2  
**Dependencies:** STORY-7.1, STORY-5.5 (Insight Notifications)

**As a** user  
**I want** to control notification preferences  
**So that** I only receive notifications I want

**Acceptance Criteria:**
- [ ] Notification settings in Settings page
- [ ] Toggle: "Insight notifications" (on/off)
- [ ] Toggle: "Email notifications" (on/off, V2 feature)
- [ ] Settings saved to Firestore `users/{uid}/settings/preferences.notificationsEnabled`
- [ ] Cloud Functions respect notification preferences
- [ ] No notifications sent if `notificationsEnabled: false`
- [ ] Default: notifications enabled

**Architecture Reference:** `architecture.md` Section "FR11: Insight Notifications"

---

## Dependencies

**Blocks:**
- None (this is a terminal epic)

**Blocked By:**
- EPIC-01 (Infrastructure) - Cloud Functions, Firestore
- EPIC-02 (Authentication) - User identity
- EPIC-03 (Journaling) - Entry data for export

---

## Technical Notes

- **Account Deletion**: Nuclear delete (all data purged)
- **Data Export**: Decrypted plaintext (user owns their data)
- **Firestore Rules**: Settings writable by user (validated fields)
- **Privacy Policy**: Must be legally reviewed before production
- **GDPR Compliance**: 30-day deletion window, data export, consent tracking

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Accidental account deletion | Require typing "DELETE", show clear warning |
| Data export security | Temporary links (7-day expiry), email verification |
| Privacy policy outdated | Version tracking, regular legal review |
| Notification spam | User control, default to minimal notifications |

---

## Definition of Done

- [ ] All 5 stories completed and acceptance criteria met
- [ ] Users can update settings
- [ ] Account deletion functional and compliant
- [ ] Data export functional (GDPR)
- [ ] Privacy Policy and Terms published
- [ ] Notification preferences functional
- [ ] Unit tests for Cloud Functions (>80% coverage)
- [ ] E2E tests for settings flow
- [ ] Legal review of Privacy Policy and Terms
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
