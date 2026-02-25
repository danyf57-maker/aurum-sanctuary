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

type ActionMode = 'verifyEmail' | 'resetPassword' | 'recoverEmail' | null;

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
      setMessage('Code d\'action manquant ou invalide.');
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
      setMessage('Votre email a été vérifié avec succès !');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        const params = new URLSearchParams({ verified: 'true' });
        if (email) params.set('email', email);
        router.push(`/login?${params.toString()}`);
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');

      if (error.code === 'auth/invalid-action-code') {
        setMessage('Ce lien de vérification est invalide ou a déjà été utilisé.');
      } else if (error.code === 'auth/expired-action-code') {
        setMessage('Ce lien de vérification a expiré. Veuillez demander un nouveau lien.');
      } else {
        setMessage('Une erreur est survenue lors de la vérification. Veuillez réessayer.');
      }
    }
  };

  const handleVerifyPasswordResetCode = async (code: string) => {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus('success');
      setMessage('Code vérifié. Veuillez entrer votre nouveau mot de passe.');
    } catch (error: any) {
      console.error('Password reset code verification error:', error);
      setStatus('error');

      if (error.code === 'auth/invalid-action-code') {
        setMessage('Ce lien de réinitialisation est invalide ou a déjà été utilisé.');
      } else if (error.code === 'auth/expired-action-code') {
        setMessage('Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.');
      } else {
        setMessage('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (!actionCode) return;

    setResetting(true);

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStatus('success');
      setMessage('Votre mot de passe a été réinitialisé avec succès !');

      setTimeout(() => {
        router.push('/login?reset=true');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage('Erreur lors de la réinitialisation. Veuillez réessayer.');
    } finally {
      setResetting(false);
    }
  };

  const handleRecoverEmail = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage('Votre adresse email a été restaurée avec succès.');
    } catch (error: any) {
      console.error('Email recovery error:', error);
      setStatus('error');
      setMessage('Une erreur est survenue lors de la restauration de votre email.');
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
            {mode === 'verifyEmail' && 'Vérification d\'email'}
            {mode === 'resetPassword' && 'Réinitialiser le mot de passe'}
            {mode === 'recoverEmail' && 'Restaurer l\'email'}
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
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Confirmer le mot de passe"
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
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
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
                router.push(suffix ? `/login?${suffix}` : '/login');
              }}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="font-headline text-2xl">Chargement...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
