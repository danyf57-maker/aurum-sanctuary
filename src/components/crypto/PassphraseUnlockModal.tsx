'use client';

/**
 * Passphrase Unlock Modal
 *
 * Displayed when an existing user needs to unlock their sanctuary.
 *
 * Features:
 * - Passphrase input
 * - "Forgot passphrase?" link to recovery modal
 * - Auto-lock after 30 minutes
 *
 * This modal cannot be dismissed - user MUST unlock or recover.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePassphrase } from '@/hooks/usePassphrase';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Key } from 'lucide-react';

export type PassphraseUnlockModalProps = {
  open: boolean;
  onUnlocked: () => void;
  onForgotPassphrase?: () => void;
};

export function PassphraseUnlockModal({
  open,
  onUnlocked,
  onForgotPassphrase,
}: PassphraseUnlockModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { unlock } = usePassphrase();
  const { toast } = useToast();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passphrase) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir votre passphrase.',
        variant: 'destructive',
      });
      return;
    }

    setIsUnlocking(true);

    try {
      const result = await unlock(passphrase);

      if (!result.success) {
        toast({
          title: 'Échec du déverrouillage',
          description: result.error || 'Passphrase incorrecte.',
          variant: 'destructive',
        });
        setPassphrase(''); // Clear for security
        setIsUnlocking(false);
        return;
      }

      // Success
      toast({
        title: 'Sanctuaire déverrouillé',
        description: 'Bienvenue dans votre espace privé.',
      });

      onUnlocked();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
      setIsUnlocking(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Déverrouiller le sanctuaire
          </DialogTitle>
          <DialogDescription>
            Entrez votre passphrase pour accéder à vos entrées de journal privées.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUnlock} className="space-y-6 py-4">
          {/* Passphrase Input */}
          <div className="space-y-2">
            <Label htmlFor="unlock-passphrase">Passphrase</Label>
            <div className="relative">
              <Input
                id="unlock-passphrase"
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Entrez votre passphrase"
                className="pr-10"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Unlock Button */}
          <Button
            type="submit"
            disabled={!passphrase || isUnlocking}
            className="w-full"
            size="lg"
          >
            {isUnlocking ? 'Déverrouillage...' : 'Déverrouiller'}
          </Button>

          {/* Forgot Passphrase Link */}
          {onForgotPassphrase && (
            <div className="text-center">
              <button
                type="button"
                onClick={onForgotPassphrase}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                J'ai oublié ma passphrase
              </button>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">🔒 Sécurité</p>
            <p className="text-blue-800 dark:text-blue-200">
              Votre passphrase ne quitte jamais votre appareil. Personne, pas même nous,
              ne peut accéder à vos entrées sans votre passphrase.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
