# CI/CD Pipeline Setup Guide

## Overview

Aurum Sanctuary uses GitHub Actions for automated CI/CD pipelines:

1. **CI Pipeline**: Lint, type check, build validation
2. **Privacy Checks**: Prohibited terms, schema sync, safe logging
3. **Deploy Functions**: Cloud Functions deployment
4. **Deploy Firestore**: Rules and indexes deployment

---

## GitHub Actions Workflows

### 1. CI - Lint & Type Check
**File**: `.github/workflows/ci.yml`  
**Triggers**: Push/PR to `main` or `develop`

**Checks:**
- ✅ ESLint (`npm run lint`)
- ✅ TypeScript type check (`npm run typecheck`)
- ✅ Build validation (`npm run build`)

### 2. Privacy & Security Checks
**File**: `.github/workflows/privacy-checks.yml`  
**Triggers**: Push/PR to `main` or `develop`

**Checks:**
- ✅ Prohibited privacy terms (E-2-E-E, Admin-Blind, etc.)
- ✅ Firestore schema sync (rules + indexes modified together)
- ✅ Safe logging patterns (no `console.error(error)`)

**Prohibited Terms:**
- ❌ "E.2.E.E"
- ❌ "end-to-end-en-crypted"
- ❌ "zero-know-ledge"
- ❌ "HI-PAA-certified"
- ❌ "med-ical-grade"

**Approved Terms:**
- ✅ "Client-side Encryption + Admin-Blind Processing"
- ✅ "Privacy-first architecture"

### 3. Deploy Cloud Functions
**File**: `.github/workflows/deploy-functions.yml`  
**Triggers**: Push to `main` (when `functions/**` changes)

**Steps:**
1. Install Firebase CLI
2. Install functions dependencies
3. Build functions
4. Deploy to Firebase

### 4. Deploy Firestore Rules & Indexes
**File**: `.github/workflows/deploy-firestore.yml`  
**Triggers**: Push to `main` (when `firestore.rules` or `firestore.indexes.json` changes)

**Steps:**
1. Validate rules syntax
2. Validate indexes JSON
3. Deploy to Firebase

---

## Setup Instructions

### 1. Configure GitHub Secrets

Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

#### Required Secrets:
```
FIREBASE_TOKEN
  - Firebase CI token for deployments
  - Get via: firebase login:ci
```

#### Optional Secrets (for build checks):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 2. Get Firebase CI Token

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and get CI token
firebase login:ci

# Copy the token and add to GitHub Secrets as FIREBASE_TOKEN
```

### 3. Enable GitHub Actions

1. Go to **GitHub Repository** → **Actions**
2. Enable workflows if disabled
3. Workflows will run automatically on push/PR

---

## Workflow Triggers

### CI Workflow
- ✅ Runs on every push to `main` or `develop`
- ✅ Runs on every pull request to `main` or `develop`

### Privacy Checks
- ✅ Runs on every push to `main` or `develop`
- ✅ Runs on every pull request to `main` or `develop`

### Deploy Functions
- ✅ Runs on push to `main` when `functions/**` changes
- ❌ Does NOT run on pull requests (deploy only)

### Deploy Firestore
- ✅ Runs on push to `main` when `firestore.rules` or `firestore.indexes.json` changes
- ❌ Does NOT run on pull requests (deploy only)

---

## Local Testing

### Test CI Checks Locally

```bash
# Lint
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

### Test Privacy Checks Locally

```bash
# Check for prohibited terms
grep -ri "E-2-E-E\|end-to-end\|zero-know-ledge\|HI-PAA\|med-ical-grade" docs/ README.md _bmad-output/

# Check schema sync
git diff --name-only HEAD~1 HEAD | grep firestore

# Check safe logging
grep -rE "console.error\(error\)|console.error\(err\)" src/ functions/
```

---

## Troubleshooting

### "FIREBASE_TOKEN not found" error
- Add `FIREBASE_TOKEN` secret to GitHub repository
- Get token via `firebase login:ci`

### "Permission denied" on Firebase deploy
- Verify Firebase token is valid
- Check Firebase project permissions

### Privacy check false positives
- Add `// safe-logging-ignore` comment to suppress warnings
- Update `.github/workflows/privacy-checks.yml` to exclude specific files

### Build fails with missing env vars
- Add Firebase config secrets to GitHub repository
- Or use dummy values for build checks (already configured in `ci.yml`)

---

## Next Steps

After CI/CD setup:
1. ✅ STORY-1.4 complete
2. → STORY-1.5: Implement Safe Logging
3. → STORY-1.6: Create DerivedMemoryLite Placeholder
4. → STORY-1.7: Setup Development Environment
