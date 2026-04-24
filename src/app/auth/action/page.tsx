'use client';

/**
 * Custom Email Action Handler for Firebase Auth
 *
 * Handles:
 * - Email verification (verifyEmail)
 * - Password reset (resetPassword)
 * - Email change (recoverEmail)
 *
 * This replaces the default Firebase Auth action handler with a branded experience.
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/web-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';
import type { Locale } from '@/lib/locale';

type ActionMode = 'verifyEmail' | 'resetPassword' | 'recoverEmail' | null;

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const langParam = searchParams.get('lang');
  const actionLocale: Locale = langParam === 'fr' || langParam === 'en' ? langParam : locale;
  const to = (href: string) => localizeHref(href, actionLocale);
  const isFr = actionLocale === 'fr';
  const txt = (fr: string, en: string) => (isFr ? fr : en);

  const [mode, setMode] = useState<ActionMode>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  // For password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as ActionMode;
    const code = searchParams.get('oobCode');

    setMode(modeParam);
    setActionCode(code);

    if (!code) {
      setStatus('error');
      setMessage(txt("Code d'action manquant ou invalide.", "Missing or invalid action code."));
      return;
    }

    if (modeParam === 'verifyEmail') {
      handleVerifyEmail(code);
    } else if (modeParam === 'resetPassword') {
      handleVerifyPasswordResetCode(code);
    } else if (modeParam === 'recoverEmail') {
      handleRecoverEmail(code);
    }
  }, [searchParams]);

  const handleVerifyEmail = async (code: string) => {
    try {
      const actionInfo = await checkActionCode(auth, code);
      const email = actionInfo.data.email || '';
      setVerifiedEmail(email);
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage(
        txt(
          "Votre email est vérifié. Connectez-vous pour commencer votre écriture privée et voir ce qui revient dans le temps.",
          "Your email is verified. Sign in to begin your private writing and notice what keeps returning over time."
        )
      );

      // Redirect to login after 3 seconds
      setTimeout(() => {
        const params = new URLSearchParams({ verified: 'true' });
        if (email) params.set('email', email);
        router.push(to(`/login?${params.toString()}`));
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');

      if (error.code === 'auth/invalid-action-code') {
        setMessage(
          txt(
            "Ce lien de vérification est invalide ou a déjà été utilisé.",
            "This verification link is invalid or has already been used."
          )
        );
      } else if (error.code === 'auth/expired-action-code') {
        setMessage(
          txt(
            "Ce lien de vérification a expiré. Veuillez demander un nouveau lien.",
            "This verification link has expired. Please request a new one."
          )
        );
      } else {
        setMessage(
          txt(
            "Une erreur est survenue lors de la vérification. Veuillez réessayer.",
            "Something went wrong during verification. Please try again."
          )
        );
      }
    }
  };

  const handleVerifyPasswordResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus('success');
      setMessage(
        txt(
          "Code vérifié. Vous pouvez maintenant choisir un nouveau mot de passe.",
          "Code verified. You can now choose a new password."
        )
      );
    } catch (error: any) {
      console.error('Password reset code verification error:', error);
      setStatus('error');

      if (error.code === 'auth/invalid-action-code') {
        setMessage(
          txt(
            "Ce lien de réinitialisation est invalide ou a déjà été utilisé.",
            "This reset link is invalid or has already been used."
          )
        );
      } else if (error.code === 'auth/expired-action-code') {
        setMessage(
          txt(
            "Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.",
            "This reset link has expired. Please request a new one."
          )
        );
      } else {
        setMessage(txt("Une erreur est survenue. Veuillez réessayer.", "Something went wrong. Please try again."));
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage(txt("Les mots de passe ne correspondent pas.", "Passwords do not match."));
      return;
    }

    if (newPassword.length < 8) {
      setMessage(txt("Le mot de passe doit contenir au moins 8 caractères.", "Password must contain at least 8 characters."));
      return;
    }

    if (!actionCode) return;

    setResetting(true);

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStatus('success');
      setMessage(
        txt(
          "Votre mot de passe a été réinitialisé avec succès.",
          "Your password has been reset successfully."
        )
      );

      setTimeout(() => {
        router.push(to('/login?reset=true'));
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage(
        txt(
          "Erreur lors de la réinitialisation. Veuillez réessayer.",
          "There was an error while resetting your password. Please try again."
        )
      );
    } finally {
      setResetting(false);
    }
  };

  const handleRecoverEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage(
        txt(
          "Votre adresse email a été restaurée avec succès.",
          "Your email address has been restored successfully."
        )
      );
    } catch (error: any) {
      console.error('Email recovery error:', error);
      setStatus('error');
      setMessage(
        txt(
          "Une erreur est survenue lors de la restauration de votre email.",
          "Something went wrong while restoring your email address."
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {status === 'loading' && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-8 w-8 text-primary" />}
            {status === 'error' && <XCircle className="h-8 w-8 text-destructive" />}
          </div>

          <CardTitle className="font-headline text-2xl">
            {mode === 'verifyEmail' && txt("Vérifier votre email", "Verify your email")}
            {mode === 'resetPassword' && txt("Réinitialiser le mot de passe", "Reset your password")}
            {mode === 'recoverEmail' && txt("Restaurer votre email", "Restore your email")}
          </CardTitle>

          <CardDescription className="mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        {mode === 'resetPassword' && status === 'success' && (
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder={txt("Nouveau mot de passe", "New password")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder={txt("Confirmer le mot de passe", "Confirm password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={resetting}>
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {txt("Réinitialisation...", "Resetting...")}
                  </>
                ) : (
                  txt("Réinitialiser le mot de passe", "Reset password")
                )}
              </Button>
            </form>
          </CardContent>
        )}

        {(status === 'success' || status === 'error') && mode !== 'resetPassword' && (
          <CardContent>
            <Button
              onClick={() => {
                const params = new URLSearchParams();
                if (mode === 'verifyEmail') params.set('verified', 'true');
                if (verifiedEmail) params.set('email', verifiedEmail);
                const suffix = params.toString();
                router.push(suffix ? to(`/login?${suffix}`) : to('/login'));
              }}
              className="w-full"
            >
              {mode === 'verifyEmail'
                ? txt("Se connecter à Aurum", "Sign in to Aurum")
                : txt("Retour à la connexion", "Back to sign in")}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function LoadingFallback() {
  const locale = useLocale();
  const isFr = locale === 'fr';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <CardTitle className="font-headline text-2xl">
            {isFr ? "Vérification en cours..." : "Verifying..."}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={<LoadingFallback />}
    >
      <AuthActionContent />
    </Suspense>
  );
}
