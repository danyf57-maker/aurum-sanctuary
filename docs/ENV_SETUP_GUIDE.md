# Environment Setup Guide

## 🚀 Quick Start

### 1. Copy Environment Template
```bash
cp .env.local.example .env.local
```

### 2. Get Required API Keys

#### DeepSeek API Key
1. Visit [https://platform.deepseek.com](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate new API key
5. Copy to `.env.local`:
   ```bash
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

#### Firebase Configuration

**Web Client (Public)**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click Settings (⚙️) > Project Settings
4. Scroll to "Your apps" section
5. Copy all `NEXT_PUBLIC_FIREBASE_*` values to `.env.local`

**Admin SDK (Server)**:
1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file (save as `serviceAccountKey.json` in project root)
4. **IMPORTANT**: Never commit this file to git!

### 3. Encode Service Account (Recommended)

**Why base64?** Prevents issues with JSON escaping, quotes, and newlines in production.

```bash
python scripts/encode-service-account.py
```

Copy the output and add to `.env.local`:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY_B64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50...
```

**Alternative (Dev Only)**:
You can use direct JSON, but must escape quotes properly:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'
```

### 4. Optional: Google OAuth

If using Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized origins: `http://localhost:9002`
4. Copy Client ID to `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

---

## 🔒 Security Best Practices

### DO ✅
- Keep `.env.local` in `.gitignore` (already configured)
- Use base64 encoding for service account in production
- Rotate API keys regularly
- Use different keys for dev/staging/prod

### DON'T ❌
- Never commit `.env.local` to git
- Never expose server-only keys with `NEXT_PUBLIC_` prefix
- Never log sensitive environment variables
- Never share API keys in screenshots or documentation

---

## 🧪 Validation

After setup, verify your configuration:

```bash
npm run dev
```

Then test:
1. Navigate to `http://localhost:9002`
2. Try to log in
3. Create a journal entry
4. Check browser console for errors

**Expected behavior**:
- ✅ Login succeeds
- ✅ Journal entry saves
- ✅ Sentiment analysis completes
- ✅ Entry appears in timeline

**Common errors**:
- `DEEPSEEK_API_KEY is missing` → Check `.env.local`
- `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY` → Use base64 encoding
- `Firebase: Error (auth/invalid-api-key)` → Check `NEXT_PUBLIC_FIREBASE_API_KEY`

---

## 🌍 Production Deployment

### Vercel
1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.local`
3. **Important**: Use `FIREBASE_SERVICE_ACCOUNT_KEY_B64` (not direct JSON)
4. Set `NODE_ENV=production`

### Railway / Render
Same process as Vercel. Ensure:
- Base64 encoding for service account
- All `NEXT_PUBLIC_*` variables set
- Server-only keys not exposed

---

## 📋 Environment Variables Reference

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `DEEPSEEK_API_KEY` | ✅ | Server | DeepSeek API for sentiment analysis |
| `FIREBASE_SERVICE_ACCOUNT_KEY_B64` | ✅ | Server | Base64-encoded service account JSON |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Public | Firebase web client API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Public | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Public | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Public | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Public | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Public | Firebase app ID |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ⚠️ | Public | Google OAuth client ID (if using Google Sign-In) |
| `STRIPE_SECRET_KEY` | ⚠️ | Server | Stripe secret key (if using payments) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ | Public | Stripe publishable key (if using payments) |

**Legend**:
- ✅ Required for core functionality
- ⚠️ Optional (feature-specific)
- **Server**: Never exposed to browser
- **Public**: Safe to expose (prefixed with `NEXT_PUBLIC_`)

---

## 🐛 Troubleshooting

### Service Account Issues

**Error**: `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY`

**Solutions**:
1. Use base64 encoding (recommended)
2. If using direct JSON, ensure proper escaping:
   ```bash
   # Wrong
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"}
   
   # Correct
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account"}'
   ```

### DeepSeek API Issues

**Error**: `DEEPSEEK_API_KEY is missing`

**Solutions**:
1. Check `.env.local` exists and contains the key
2. Restart dev server after adding key
3. Verify key starts with `sk-`

### Firebase Client Issues

**Error**: `Firebase: Error (auth/invalid-api-key)`

**Solutions**:
1. Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
2. Check for typos in API key
3. Ensure project ID matches your Firebase project

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review error messages in browser console
3. Check server logs (`npm run dev` output)
4. Verify `.env.local` format matches `.env.local.example`
