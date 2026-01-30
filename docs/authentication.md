# Firebase Authentication Guide

## Overview

Aurum Sanctuary uses Firebase Authentication with:
- **Google OAuth** (primary method)
- **Email/Password** (alternative method)
- **Auth State Persistence** (survives browser restart)
- **Safe Logging** (no sensitive data leaks)

---

## Authentication Methods

### 1. Google OAuth (Recommended)

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginButton() {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected to Google OAuth
      // After success, redirected back to app
    } catch (error) {
      // Error toast shown automatically
      console.error(error);
    }
  };

  return <button onClick={handleGoogleSignIn}>Sign in with Google</button>;
}
```

### 2. Email/Password Sign Up

```typescript
import { useAuth } from '@/hooks/useAuth';

function SignUpForm() {
  const { signUpWithEmail } = useAuth();

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
      // Success toast shown automatically
      // User document created in Firestore
    } catch (error) {
      // Error toast shown automatically
      console.error(error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSignUp(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### 3. Email/Password Sign In

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { signInWithEmail } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      // Success toast shown automatically
    } catch (error) {
      // Error toast shown automatically
      console.error(error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSignIn(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### 4. Sign Out

```typescript
import { useAuth } from '@/hooks/useAuth';

function SignOutButton() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Success toast shown automatically
      // Redirected to homepage
    } catch (error) {
      // Error toast shown automatically
      console.error(error);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

### 5. Password Reset

```typescript
import { useAuth } from '@/hooks/useAuth';

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      // Success toast shown automatically
      // Email sent to user
    } catch (error) {
      // Error toast shown automatically
      console.error(error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleResetPassword(formData.get('email') as string);
    }}>
      <input name="email" type="email" required />
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

---

## Auth State

### Access Current User

```typescript
import { useAuth } from '@/hooks/useAuth';

function UserProfile() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>UID: {user.uid}</p>
      <p>Display Name: {user.displayName}</p>
      {user.photoURL && <img src={user.photoURL} alt="Profile" />}
    </div>
  );
}
```

### Protected Routes

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <div>Protected content</div>;
}
```

---

## Auth Persistence

Auth state persists across browser restarts using `browserLocalPersistence`.

**Persistence Levels:**
- `browserLocalPersistence` (default): Survives browser restart
- `browserSessionPersistence`: Cleared on tab close
- `inMemoryPersistence`: Cleared on page refresh

**Current Setting:** `browserLocalPersistence`

---

## Safe Logging

All authentication events are logged safely:

```typescript
// ✅ SAFE - Email is logged, password is NOT
logger.infoSafe('Email sign-in successful', { email });

// ✅ SAFE - User ID is hashed
logger.infoSafe('User authenticated', { userId: user.uid });

// ✅ SAFE - Error logged without sensitive data
logger.errorSafe('Sign-in failed', error, { email });
```

**What is logged:**
- ✅ Email addresses (for debugging)
- ✅ User IDs (hashed)
- ✅ Provider type (google, email)
- ✅ Success/failure status

**What is NOT logged:**
- ❌ Passwords
- ❌ Auth tokens
- ❌ ID tokens
- ❌ Refresh tokens

---

## Error Handling

All authentication methods show toast notifications automatically:

**Success:**
- "Connexion réussie" (Sign-in successful)
- "Compte créé" (Account created)
- "Email envoyé" (Email sent)
- "Déconnexion réussie" (Sign-out successful)

**Errors:**
- "Email ou mot de passe incorrect" (Incorrect email/password)
- "Impossible de créer le compte" (Cannot create account)
- "Impossible de se connecter avec Google" (Cannot sign in with Google)
- "Impossible d'envoyer l'email de réinitialisation" (Cannot send reset email)

---

## Firestore User Document

On first sign-in, a user document is created:

```typescript
{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  stripeCustomerId: string | null;
  subscriptionStatus: 'free' | 'premium';
  entryCount: number;
}
```

**Location:** `users/{uid}`

**Created by:** `onAuthStateChanged` in AuthProvider

---

## Next Steps

After authentication integration:
1. ✅ STORY-2.1 complete
2. → STORY-2.2: Build Login & Signup Pages
3. → STORY-2.3: Implement Terms Acceptance Flow
4. → STORY-2.4: Setup Route Guards (Middleware)
5. → STORY-2.5: Implement Forgot Password Flow
