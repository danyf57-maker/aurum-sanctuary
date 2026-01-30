# Firestore Rules & Indexes Deployment Guide

## Files Created

- ✅ `firestore.rules` - Security rules with Admin-Blind enforcement
- ✅ `firestore.indexes.json` - Query optimization indexes

## Deployment Steps

### Option 1: Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Initialize Firestore** (if not already done):
```bash
firebase init firestore
# Select your project
# Use existing firestore.rules and firestore.indexes.json
```

4. **Deploy Rules & Indexes**:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Option 2: Firebase Console (Manual)

#### Deploy Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Paste into the editor
6. Click **Publish**

#### Deploy Indexes:
1. Navigate to **Firestore Database** → **Indexes**
2. Click **Add Index** for each index in `firestore.indexes.json`:

**Index 1: Entries (Timeline)**
- Collection: `entries`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 2: Insights (List)**
- Collection: `insights`
- Fields:
  - `userId` (Ascending)
  - `periodStart` (Descending)

**Index 3: Notifications (List)**
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 4: Notifications (Unread)**
- Collection: `notifications`
- Fields:
  - `userId` (Ascending)
  - `read` (Ascending)
  - `createdAt` (Descending)

## Validation

### Test Rules with Firebase Emulator:

```bash
# Install emulator
firebase init emulators
# Select Firestore emulator

# Start emulator
firebase emulators:start --only firestore

# Run tests (if you have test files)
npm run test:firestore
```

### Manual Testing:

1. **Test User Read Access**:
   - Sign in as a user
   - Try to read `users/{uid}` (should succeed)
   - Try to read `users/{otherUid}` (should fail)

2. **Test Admin-Blind Enforcement**:
   - Try to write to `users/{uid}` from client (should fail)
   - Verify Cloud Functions can write (Admin SDK)

3. **Test Settings Validation**:
   - Try to write invalid field to `settings/preferences` (should fail)
   - Try to write valid fields (should succeed)

4. **Test Entry Access**:
   - Create entry (should succeed)
   - Read own entries (should succeed)
   - Try to read other user's entries (should fail)

## Firestore Rules Summary

### Admin-Blind Enforcement:
- ✅ Users **cannot** write to root `users/{uid}` document
- ✅ Only Cloud Functions (Admin SDK) can write
- ✅ Users **can** read their own profile

### Settings Validation:
- ✅ Field whitelist: `notificationsEnabled`, `theme`, `timezone`, `language`
- ✅ Type validation: `bool`, `string`, enum values
- ✅ Users can only write to their own settings

### Entries:
- ✅ Users can create, read, update, delete their own entries
- ✅ Structure validation: `encryptedContent`, `iv`, `createdAt`, `updatedAt`, `userId`

### Derived Memory & Insights:
- ✅ **READ-ONLY** for clients
- ✅ Only Cloud Functions can write

### Notifications:
- ✅ Users can read and delete their own notifications
- ✅ Users can update `read` field only
- ✅ Only Cloud Functions can create notifications

## Troubleshooting

### "Permission denied" errors:
- Check that user is authenticated
- Verify `userId` matches `request.auth.uid`
- Check Firestore Rules in Firebase Console

### "Missing index" errors:
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait 1-2 minutes for indexes to build
- Check index status in Firebase Console

### Rules not updating:
- Clear browser cache
- Wait 1-2 minutes for propagation
- Verify deployment succeeded in Firebase Console

## Next Steps

After deploying rules and indexes:
1. ✅ STORY-1.3 complete
2. → STORY-1.4: Setup CI/CD Pipelines
3. → STORY-1.5: Implement Safe Logging
