# Cloud Functions Development Guide

## Overview

Cloud Functions for Aurum Sanctuary handle server-side operations:
- User lifecycle (onUserCreate)
- Entry processing (onEntryCreate)
- Derived memory updates (Epic 5)
- Insight generation (Epic 5)
- Account deletion (Epic 7)

---

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Build Functions

```bash
npm run build
```

### 3. Run Locally (Emulator)

```bash
npm run serve
# Or from root:
firebase emulators:start --only functions
```

### 4. Deploy to Firebase

```bash
npm run deploy
# Or from root:
firebase deploy --only functions
```

---

## Current Functions

### 1. onUserCreate
**File**: `functions/src/onUserCreate.ts`  
**Trigger**: Firestore onCreate `users/{uid}`

**Purpose**: Initialize DerivedMemoryLite placeholder on user signup

**Actions:**
- Creates `users/{uid}/derivedMemory/lite` document
- Sets initial values:
  - `totalEntries: 0`
  - `avgWordsPerEntry: 0`
  - `lastEntryAt: null`
  - `labels: []`

**Why**: Ensures Mirror Chat can function immediately (even with no entries)

### 2. onEntryCreate
**File**: `functions/src/onEntryCreate.ts`  
**Trigger**: Firestore onCreate `users/{uid}/entries/{entryId}`

**Purpose**: Update DerivedMemoryLite stats when entry is created

**Actions:**
- Increments `totalEntries`
- Updates `lastEntryAt` timestamp
- Updates `updatedAt` timestamp

**Note**: `avgWordsPerEntry` and `labels` are updated in Epic 5 (requires decryption)

---

## DerivedMemoryLite Schema

**File**: `src/lib/schemas/derivedMemory.ts`

```typescript
{
  totalEntries: number;        // Count of journal entries
  avgWordsPerEntry: number;    // Average word count
  lastEntryAt: string | null;  // ISO 8601 timestamp
  labels: string[];            // Emotion labels (whitelisted)
  updatedAt: string;           // ISO 8601 timestamp
}
```

**Whitelisted Labels** (soft whitelist):
- Positive: joy, gratitude, hope, calm, excited, proud, content
- Neutral: curious, reflective, thoughtful, uncertain
- Challenging: anxious, sad, frustrated, overwhelmed, lonely, angry, confused
- Growth: learning, growing, processing

---

## Testing

### Local Testing (Emulator)

```bash
# Start emulator
firebase emulators:start --only functions,firestore

# Trigger onUserCreate
# Create a user document in Firestore UI
# Check derivedMemory/lite is created

# Trigger onEntryCreate
# Create an entry document
# Check derivedMemory/lite.totalEntries incremented
```

### Unit Testing

```bash
# TODO: Add Jest tests
npm run test
```

---

## Deployment

### Manual Deployment

```bash
cd functions
npm run build
firebase deploy --only functions
```

### CI/CD Deployment

Automatic deployment via GitHub Actions when `functions/**` changes on `main` branch.

See: `.github/workflows/deploy-functions.yml`

---

## Troubleshooting

### "Firebase Admin not initialized" error
- Check `admin.initializeApp()` is called
- Verify service account key is configured

### "Permission denied" on Firestore write
- Cloud Functions use Admin SDK (bypass Firestore Rules)
- Check IAM roles in Firebase Console

### Function not triggering
- Check function is deployed: `firebase functions:list`
- Check logs: `firebase functions:log`
- Verify trigger path matches Firestore document path

---

## Next Steps

After STORY-1.6:
1. ✅ DerivedMemoryLite placeholder created
2. → STORY-1.7: Setup Development Environment
3. → Epic 2: Authentication & Onboarding
