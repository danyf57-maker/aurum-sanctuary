'use client';

/**
 * Passkey Unlock Modal
 *
 * Prompts the user to authenticate with their passkey (Face ID / Touch ID)
 * to unlock the sanctuary.
 *
 * Features:
 * - One-tap biometric unlock
 * - Fallback to recovery phrase
 * - Fallback to passphrase (for v2 users)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePasskey } from '@/hooks/usePasskey';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Key, Loader2, AlertCircle } from 'lucide-react';
import { validateRecoveryPhrase } from '@/lib/crypto/bip39';

interface PasskeyUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock?: () => void;
  onFallbackToPassphrase?: () => void;
}

type Mode = 'passkey' | 'recovery';

export function PasskeyUnlockModal({
  open,
  onOpenChange,
  onUnlock,
  onFallbackToPassphrase,
}: PasskeyUnlockModalProps) {
  const [mode, setMode] = useState<Mode>('passkey');
  const [recoveryWords, setRecoveryWords] = useState<string[]>(Array(12).fill(''));
  const [error, setError] = useState<string | null>(null);
  const { unlockWithPasskey, recoverWithPhrase, isLoading, isPasskeyAvailable } = usePasskey();
  const { toast } = useToast();

  // Auto-trigger passkey unlock when modal opens
  useEffect(() => {
    if (open && mode === 'passkey' && isPasskeyAvailable && !isLoading) {
      handlePasskeyUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, isPasskeyAvailable]);

  const handlePasskeyUnlock = async () => {
    setError(null);

    const result = await unlockWithPasskey();

    if (result.success) {
      toast({
        title: 'Sanctuaire déverrouillé',
        description: 'Bienvenue dans votre espace personnel.',
      });
      onOpenChange(false);
      onUnlock?.();
    } else {
      setError(result.error || 'Échec du déverrouillage.');
    }
  };

  const handleRecoverySubmit = async () => {
    setError(null);

    const phrase = recoveryWords.map((w) => w.trim().toLowerCase()).join(' ');

    // Validate phrase format
    if (!validateRecoveryPhrase(phrase)) {
      setError('Phrase de récupération invalide. Vérifiez les 12 mots.');
      return;
    }

    const result = await recoverWithPhrase(phrase);

    if (result.success) {
      toast({
        title: 'Récupération réussie',
        description: 'Votre sanctuaire a été déverrouillé.',
      });
      setRecoveryWords(Array(12).fill(''));
      onOpenChange(false);
      onUnlock?.();
    } else {
      setError(result.error || 'Phrase incorrecte ou données corrompues.');
    }
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...recoveryWords];
    newWords[index] = value.toLowerCase().replace(/[^a-z]/g, '');
    setRecoveryWords(newWords);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText.trim().toLowerCase().split(/\s+/);

    if (words.length === 12) {
      e.preventDefault();
      setRecoveryWords(words);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {mode === 'passkey' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                Déverrouiller le Sanctuaire
              </DialogTitle>
              <DialogDescription>
                Utilisez Face ID ou Touch ID pour accéder à vos entrées.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              {isLoading ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Authentification en cours...
                  </p>
                </>
              ) : error ? (
                <>
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                  <Button onClick={handlePasskeyUnlock}>
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <Fingerprint className="h-16 w-16 text-primary relative" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Touchez le capteur biométrique
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setMode('recovery')}
              >
                <Key className="h-4 w-4 mr-2" />
                Utiliser ma phrase de récupération
              </Button>

              {onFallbackToPassphrase && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={onFallbackToPassphrase}
                >
                  Utiliser ma passphrase
                </Button>
              )}
            </div>
          </>
        )}

        {mode === 'recovery' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Récupération
              </DialogTitle>
              <DialogDescription>
                Entrez votre phrase de récupération de 12 mots.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div
                className="grid grid-cols-3 gap-2"
                onPaste={handlePaste}
              >
                {recoveryWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}.
                    </span>
                    <Input
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      className="h-8 text-sm font-mono"
                      placeholder="mot"
                      autoComplete="off"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Astuce : Vous pouvez coller les 12 mots d&apos;un coup.
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setMode('passkey');
                  setError(null);
                }}
              >
                ← Retour
              </Button>
              <Button
                onClick={handleRecoverySubmit}
                disabled={isLoading || recoveryWords.some((w) => !w)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Récupérer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
