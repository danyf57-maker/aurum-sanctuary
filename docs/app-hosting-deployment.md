# Firebase App Hosting - Deployment Guide

## Architecture

Aurum Sanctuary uses **Firebase App Hosting** for production deployment with auto-deploy from GitHub.

| Setting | Value |
|---------|-------|
| Backend | `aurum-sanctuary` |
| Region | `us-east4` |
| Project | `aurum-diary-prod` |
| URL | `https://aurum-sanctuary--aurum-diary-prod.us-east4.hosted.app` |
| Custom domain | `aurumdiary.com` |
| Branch | `main` (auto-deploy on push) |
| Auth | Application Default Credentials (ADC) |

## Configuration

All environment variables are declared in `apphosting.yaml`.

### Public variables (BUILD + RUNTIME)

These are client-side Firebase config values (not secrets):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

These must have `availability: [BUILD, RUNTIME]` because Next.js needs them during static page generation (prerendering).

### Secrets (RUNTIME only)

Stored in Google Cloud Secret Manager, injected at runtime:

- `DEEPSEEK_API_KEY` (secret name: `deepseek_api_key`)
- `STRIPE_SECRET_KEY` (secret name: `STRIPE_SECRET_KEY`)

Secrets are declared as `RUNTIME` only because they are not needed during `next build`.

### Firebase Admin SDK

The Admin SDK (`src/lib/firebase/admin.ts`) uses **Application Default Credentials (ADC)** automatically provided by App Hosting. No service account key is needed.

Fallback logic (line 90-106):
1. If `FIREBASE_SERVICE_ACCOUNT_KEY_B64` or `FIREBASE_SERVICE_ACCOUNT_KEY` is set, use `cert()`
2. Otherwise, fall back to ADC (production path on App Hosting)

## Deployment Flow

```
git push origin main
    |
    v
GitHub triggers Firebase App Hosting
    |
    v
Cloud Build (us-east4):
  1. Fetch source from GitHub
  2. Install dependencies (npm ci)
  3. Run build (next build) with BUILD env vars
  4. Package and deploy container
    |
    v
App Hosting serves traffic with RUNTIME env vars + secrets
```

## Common Commands

```bash
# Check backend status
firebase apphosting:backends:get aurum-sanctuary

# List backends
firebase apphosting:backends:list

# Add a new secret
firebase apphosting:secrets:set SECRET_NAME --backend aurum-sanctuary

# Grant backend access to existing secret
firebase apphosting:secrets:grantaccess SECRET_NAME --backend aurum-sanctuary
```

## Troubleshooting

### "Misconfigured Secret" at build time

App Hosting validates ALL secrets declared in `apphosting.yaml` before building, even `RUNTIME`-only secrets. If a secret doesn't exist in Secret Manager or has no active version, the build fails.

**Fix:** Create the secret and grant access:
```bash
echo -n "your-value" | gcloud secrets create SECRET_NAME --data-file=- --project=aurum-diary-prod
firebase apphosting:secrets:grantaccess SECRET_NAME --backend aurum-sanctuary
```

### "Missing Firebase config: NEXT_PUBLIC_FIREBASE_*" during build

Next.js prerenders static pages during `next build`. If Firebase client config variables aren't available at BUILD time, prerendering fails.

**Fix:** Ensure all `NEXT_PUBLIC_*` variables have `availability: [BUILD, RUNTIME]` in `apphosting.yaml`.

### Custom domain shows "Backend Not Found"

This happens when no successful rollout has ever completed, or DNS propagation is pending. Wait for the current build to succeed and DNS to propagate (5-30 minutes).

## History

- **2026-02-10:** Removed `FIREBASE_SERVICE_ACCOUNT_KEY_B64` in favor of ADC. Added all `NEXT_PUBLIC_FIREBASE_*` variables. Created `DEEPSEEK_API_KEY` and `STRIPE_SECRET_KEY` in Secret Manager. First successful App Hosting deployment.
