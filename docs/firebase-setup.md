# Firebase Configuration Guide

This guide explains how to configure Firebase for Aurum Sanctuary.

## Prerequisites

- Firebase account
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `aurum-sanctuary` (or your preferred name)
4. Disable Google Analytics (optional for V1)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - **Google**: Enable and configure
   - **Email/Password**: Enable

### Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll deploy custom rules)
4. Choose location: `nam5` (North America) or closest to your users
5. Click "Enable"

### Cloud Functions
1. Go to **Functions**
2. Click "Get started"
3. Upgrade to **Blaze plan** (pay-as-you-go, required for Cloud Functions)

## Step 3: Get Firebase Config

### Web App Config (Client-side)
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click "Add app" → Web (</>) icon
4. Register app name: `Aurum Sanctuary Web`
5. Copy the config object

Add to `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aurum-sanctuary.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aurum-sanctuary
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aurum-sanctuary.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Service Account (Server-side)
1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Save the JSON file securely

Add to `.env.local`:
```bash
# Option 1: JSON string (escape quotes)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"aurum-sanctuary",...}'

# Option 2: Base64-encoded (recommended for production)
FIREBASE_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii...
```

To base64-encode:
```bash
cat service-account-key.json | base64
```

## Step 4: Deploy Firestore Rules

```bash
firebase login
firebase init firestore
# Select your project
# Use default files (firestore.rules, firestore.indexes.json)

firebase deploy --only firestore:rules
```

## Step 5: Test Connection

Run the dev server:
```bash
npm run dev
```

Check browser console for Firebase initialization logs.

## Troubleshooting

### "Missing Firebase config" error
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
- Restart dev server after adding env variables

### "Invalid service account key" error
- Check JSON format (valid JSON or base64-encoded)
- Ensure no extra quotes or whitespace

### "Permission denied" in Firestore
- Deploy Firestore Rules: `firebase deploy --only firestore:rules`
- Check rules in Firebase Console

## Next Steps

After Firebase is configured:
1. ✅ STORY-1.2 complete
2. → STORY-1.3: Setup Firestore Rules & Indexes
3. → STORY-1.4: Setup CI/CD Pipelines
