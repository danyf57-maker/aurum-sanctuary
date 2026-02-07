'use client';

/**
 * Passphrase Setup Modal
 *
 * Displayed when a new user needs to set up their passphrase for the first time.
 *
 * Flow:
 * 1. User creates passphrase (with strength validation)
 * 2. User confirms passphrase
 * 3. System generates BIP39 recovery phrase
 * 4. User must save recovery phrase before continuing
 *
 * This modal cannot be dismissed - user MUST complete setup.
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
import { validatePassphraseStrength } from '@/lib/crypto/passphrase';
import { RecoveryPhraseDisplay } from './RecoveryPhraseDisplay';
import { usePassphrase } from '@/hooks/usePassphrase';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export type PassphraseSetupModalProps = {
  open: boolean;
  onComplete: () => void;
};

type SetupStep = 'create' | 'recovery';

export function PassphraseSetupModal({ open, onComplete }: PassphraseSetupModalProps) {
  const [step, setStep] = useState<SetupStep>('create');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { setupPassphrase } = usePassphrase();
  const { toast } = useToast();

  // Validate passphrase strength
  const validation = passphrase.length > 0
    ? validatePassphraseStrength(passphrase)
    : { isValid: false };

  const passphraseMatch = passphrase === passphraseConfirm && passphrase.length > 0;

  const canProceed = validation.isValid && passphraseMatch;

  const handleCreatePassphrase = async () => {
    if (!canProceed) return;

    setIsCreating(true);

    try {
      const result = await setupPassphrase(passphrase);

      if (!result.success) {
        toast({
          title: 'Erreur',
          description: result.error || 'Échec de la configuration de la passphrase.',
          variant: 'destructive',
        });
        setIsCreating(false);
        return;
      }

      // Success - show recovery phrase
      setRecoveryPhrase(result.recoveryPhrase || '');
      setStep('recovery');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRecoveryConfirmed = async () => {
    setIsConfirming(true);
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsConfirming(false);
    onComplete();
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 'create' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Créer votre passphrase de sécurité
              </DialogTitle>
              <DialogDescription>
                Cette passphrase protège vos entrées de journal. Choisissez une passphrase forte
                que vous pourrez mémoriser.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Passphrase Input */}
              <div className="space-y-2">
                <Label htmlFor="passphrase">Passphrase</Label>
                <div className="relative">
                  <Input
                    id="passphrase"
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Créez une passphrase forte"
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Validation Feedback */}
                {passphrase.length > 0 && (
                  <div className="space-y-1 text-sm">
                    {validation.isValid ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Passphrase forte</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{validation.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Passphrase */}
              <div className="space-y-2">
                <Label htmlFor="passphrase-confirm">Confirmer la passphrase</Label>
                <div className="relative">
                  <Input
                    id="passphrase-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={passphraseConfirm}
                    onChange={(e) => setPassphraseConfirm(e.target.value)}
                    placeholder="Saisissez à nouveau votre passphrase"
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {passphraseConfirm.length > 0 && (
                  <div className="text-sm">
                    {passphraseMatch ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Les passphrases correspondent</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>Les passphrases ne correspondent pas</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Exigences de sécurité :
                </p>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${passphrase.length >= 12 ? 'bg-green-500' : 'bg-slate-400'}`} />
                    Au moins 12 caractères
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(passphrase) ? 'bg-green-500' : 'bg-slate-400'}`} />
                    Une lettre majuscule
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(passphrase) ? 'bg-green-500' : 'bg-slate-400'}`} />
                    Une lettre minuscule
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(passphrase) ? 'bg-green-500' : 'bg-slate-400'}`} />
                    Un chiffre
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(passphrase) ? 'bg-green-500' : 'bg-slate-400'}`} />
                    Un caractère spécial
                  </li>
                </ul>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreatePassphrase}
                disabled={!canProceed || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? 'Création en cours...' : 'Créer ma passphrase'}
              </Button>
            </div>
          </>
        )}

        {step === 'recovery' && (
          <>
            <DialogHeader>
              <DialogTitle>Sauvegardez votre phrase de récupération</DialogTitle>
              <DialogDescription>
                Cette phrase de 12 mots est la SEULE façon de récupérer vos données si vous
                perdez votre appareil ou oubliez votre passphrase.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RecoveryPhraseDisplay
                recoveryPhrase={recoveryPhrase}
                onConfirmed={handleRecoveryConfirmed}
                isConfirming={isConfirming}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
