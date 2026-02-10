# Auth Email + Verification (Aurum)

## Summary
Email/password authentication is enabled alongside Google sign-in, with **mandatory email verification**.  
Unverified users are prevented from logging in and are prompted to verify their email.

## What Was Added
- **Email verification flow** after signup.
- **Login block** for unverified email accounts (auto-resend verification).
- **Verification landing page** at `/verify-email`.
- **Auth dialog** now links to email login.

## User Flow
1. User signs up with email/password.
2. Verification email is sent.
3. User clicks the link in the email.
4. `/verify-email` validates the code.
5. User is redirected to login.

## Files Changed
- `src/providers/auth-provider.tsx`
  - Sends verification email after signup.
  - Blocks login for unverified accounts and re-sends verification email.
- `src/lib/firebase/auth.ts`
  - Mirrors verification behavior in helper layer.
- `src/app/verify-email/page.tsx`
  - Suspense wrapper for the verification UI.
- `src/app/verify-email/verify-email-client.tsx`
  - Client logic that applies the `oobCode`.
- `src/app/signup/page.tsx`
  - Redirects to `/login?check_email=1`.
  - Shows a short note about verification.
- `src/app/login/page.tsx`
  - Shows confirmation banners (verified / check_email).
- `src/components/auth/auth-dialog.tsx`
  - Adds “Continuer avec email”.

## Email Template (Firebase Console)
Recommended **basic** verification email:

**Subject**
`Votre entrée dans Aurum`

**Body**
```
Bonjour,

Bienvenue dans Aurum.
Aurum est un espace d’introspection simple : vous écrivez, et Aurum vous renvoie un reflet clair et apaisé.

Pour activer votre compte, cliquez sur le bouton ci‑dessous.

Merci,
Aurum
```

## Required Firebase Settings
- **Authentication → Sign-in method**
  - Enable **Email/Password**.
- **Authentication → Templates**
  - Update **Email verification** with the text above.

## Notes
- `NEXT_PUBLIC_APP_URL` should be set in production to the public domain for correct verification links.
  - Example: `https://aurumdiary.com`
