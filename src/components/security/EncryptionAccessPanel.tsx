'use client';

import { useState } from 'react';
import { ShieldCheck, LockKeyhole, KeyRound, Loader2 } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EncryptionAccessPanelProps = {
  status: 'loading' | 'setup-required' | 'locked' | 'error';
  error?: string | null;
  onSetup: (passphrase: string) => Promise<void>;
  onUnlock: (passphrase: string) => Promise<void>;
};

export function EncryptionAccessPanel({
  status,
  error,
  onSetup,
  onUnlock,
}: EncryptionAccessPanelProps) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSetup = status === 'setup-required';

  const copy = isFr
    ? {
        loadingTitle: 'Chargement du coffre privé',
        loadingBody: 'Aurum vérifie la configuration de chiffrement de ce compte.',
        setupTitle: 'Crée ta phrase secrète',
        setupBody:
          'Choisis une phrase secrète longue pour chiffrer la clé de contenu de ce compte. Elle n’est jamais stockée en clair. Si tu la perds, les nouvelles pages chiffrées de ce compte ne pourront plus être relues.',
        unlockTitle: 'Déverrouille ton coffre',
        unlockBody:
          'Entre ta phrase secrète pour relire tes pages et sécuriser les prochaines avec la nouvelle architecture de chiffrement.',
        passphrase: 'Phrase secrète',
        confirm: 'Confirmer la phrase secrète',
        helper: 'Utilise au moins 12 caractères. Une phrase longue est préférable à un mot de passe court.',
        setupButton: 'Activer le coffre chiffré',
        unlockButton: 'Déverrouiller',
        mismatch: 'Les deux phrases secrètes ne correspondent pas.',
        tooShort: 'La phrase secrète doit contenir au moins 12 caractères.',
        invalid: 'Impossible de déverrouiller avec cette phrase secrète.',
      }
    : {
        loadingTitle: 'Loading your private vault',
        loadingBody: 'Aurum is checking the encryption setup for this account.',
        setupTitle: 'Create your secret passphrase',
        setupBody:
          'Choose a long passphrase to encrypt this account content key. It is never stored in plain text. If you lose it, newly encrypted pages for this account will not be readable again.',
        unlockTitle: 'Unlock your vault',
        unlockBody:
          'Enter your passphrase to read your pages and secure the next ones with the new encryption architecture.',
        passphrase: 'Secret passphrase',
        confirm: 'Confirm passphrase',
        helper: 'Use at least 12 characters. A long sentence is better than a short password.',
        setupButton: 'Enable encrypted vault',
        unlockButton: 'Unlock',
        mismatch: 'The two passphrases do not match.',
        tooShort: 'The passphrase must be at least 12 characters long.',
        invalid: 'Unable to unlock with this passphrase.',
      };

  const handleSubmit = async () => {
    const trimmed = passphrase.trim();
    setLocalError(null);

    if (trimmed.length < 12) {
      setLocalError(copy.tooShort);
      return;
    }

    if (isSetup && trimmed !== confirmPassphrase.trim()) {
      setLocalError(copy.mismatch);
      return;
    }

    setSubmitting(true);
    try {
      if (isSetup) {
        await onSetup(trimmed);
      } else {
        await onUnlock(trimmed);
      }
      setPassphrase('');
      setConfirmPassphrase('');
    } catch {
      setLocalError(isSetup ? (error || copy.invalid) : copy.invalid);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <Card className="mx-auto max-w-2xl border-stone-200 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-stone-900">
            <Loader2 className="h-5 w-5 animate-spin" />
            {copy.loadingTitle}
          </CardTitle>
          <CardDescription>{copy.loadingBody}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl border-stone-200 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-stone-900">
          {isSetup ? <ShieldCheck className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
          {isSetup ? copy.setupTitle : copy.unlockTitle}
        </CardTitle>
        <CardDescription>{isSetup ? copy.setupBody : copy.unlockBody}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="aurum-passphrase">{copy.passphrase}</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              id="aurum-passphrase"
              type="password"
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isSetup ? (
          <div className="space-y-2">
            <Label htmlFor="aurum-passphrase-confirm">{copy.confirm}</Label>
            <Input
              id="aurum-passphrase-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassphrase}
              onChange={(event) => setConfirmPassphrase(event.target.value)}
            />
          </div>
        ) : null}

        <p className="text-sm leading-relaxed text-stone-500">{copy.helper}</p>

        {localError || error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {localError || error}
          </div>
        ) : null}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSetup ? copy.setupButton : copy.unlockButton}
        </Button>
      </CardContent>
    </Card>
  );
}
