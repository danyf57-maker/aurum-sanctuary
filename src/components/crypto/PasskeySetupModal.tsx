'use client';

/**
 * Passkey Setup Modal
 *
 * Guides the user through enabling passkey authentication.
 *
 * Flow:
 * 1. Explain benefits of passkey
 * 2. Trigger biometric registration
 * 3. Show recovery phrase (ONE TIME ONLY)
 * 4. Confirm user has saved phrase
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { usePasskey } from '@/hooks/usePasskey';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Shield, AlertTriangle, Check, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasskeySetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = 'intro' | 'registering' | 'recovery' | 'confirm';

export function PasskeySetupModal({
  open,
  onOpenChange,
  onSuccess,
}: PasskeySetupModalProps) {
  const [step, setStep] = useState<Step>('intro');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const { setupPasskey, isLoading } = usePasskey();
  const { toast } = useToast();

  const handleSetup = async () => {
    setStep('registering');

    const result = await setupPasskey();

    if (result.success && result.recoveryPhrase) {
      setRecoveryPhrase(result.recoveryPhrase);
      setStep('recovery');
    } else {
      toast({
        variant: 'destructive',
        title: 'Échec de la configuration',
        description: result.error || 'Une erreur est survenue.',
      });
      setStep('intro');
    }
  };

  const handleCopyPhrase = async () => {
    if (!recoveryPhrase) return;

    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setHasCopied(true);
      toast({
        title: 'Copié !',
        description: 'Phrase de récupération copiée dans le presse-papiers.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Échec de la copie',
        description: 'Veuillez copier manuellement la phrase.',
      });
    }
  };

  const handleConfirm = () => {
    if (!hasConfirmed) return;

    toast({
      title: 'Passkey activé !',
      description: 'Vous pouvez maintenant déverrouiller avec Face ID / Touch ID.',
    });

    // Reset state
    setStep('intro');
    setRecoveryPhrase(null);
    setHasCopied(false);
    setHasConfirmed(false);

    onOpenChange(false);
    onSuccess?.();
  };

  const handleClose = () => {
    // Prevent closing during critical steps
    if (step === 'registering') return;
    if (step === 'recovery' && !hasConfirmed) {
      toast({
        variant: 'destructive',
        title: 'Action requise',
        description: 'Veuillez sauvegarder votre phrase de récupération avant de fermer.',
      });
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => {
        if (step === 'registering' || step === 'recovery') {
          e.preventDefault();
        }
      }}>
        {step === 'intro' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                Activer l&apos;accès biométrique
              </DialogTitle>
              <DialogDescription>
                Déverrouillez votre sanctuaire avec Face ID ou Touch ID.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Sécurité maximale</p>
                  <p className="text-sm text-muted-foreground">
                    Votre clé de chiffrement ne quitte jamais votre appareil.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Fingerprint className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Déverrouillage instantané</p>
                  <p className="text-sm text-muted-foreground">
                    Un simple regard ou toucher pour accéder à vos entrées.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Phrase de récupération</p>
                  <p className="text-sm text-muted-foreground">
                    Une phrase de 12 mots vous sera donnée en cas de perte d&apos;appareil.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Plus tard
              </Button>
              <Button onClick={handleSetup}>
                <Fingerprint className="h-4 w-4 mr-2" />
                Activer
              </Button>
            </div>
          </>
        )}

        {step === 'registering' && (
          <>
            <DialogHeader>
              <DialogTitle>Enregistrement en cours...</DialogTitle>
              <DialogDescription>
                Suivez les instructions de votre appareil.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">
                Utilisez Face ID ou Touch ID...
              </p>
            </div>
          </>
        )}

        {step === 'recovery' && recoveryPhrase && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Phrase de récupération
              </DialogTitle>
              <DialogDescription>
                <strong className="text-foreground">IMPORTANT :</strong> Notez cette phrase 
                et conservez-la en lieu sûr. Elle est votre seul moyen de récupérer 
                vos données en cas de perte d&apos;appareil.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                <div className="grid grid-cols-3 gap-2">
                  {recoveryPhrase.split(' ').map((word, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-4">{index + 1}.</span>
                      <span className="font-medium">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyPhrase}
              >
                <Copy className="h-4 w-4 mr-2" />
                {hasCopied ? 'Copié !' : 'Copier la phrase'}
              </Button>

              <div className="flex items-start space-x-3 pt-4 border-t">
                <Checkbox
                  id="confirm-saved"
                  checked={hasConfirmed}
                  onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                />
                <label
                  htmlFor="confirm-saved"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J&apos;ai sauvegardé ma phrase de récupération en lieu sûr. 
                  Je comprends qu&apos;elle ne sera plus jamais affichée.
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleConfirm}
                disabled={!hasConfirmed}
                className={cn(!hasConfirmed && 'opacity-50 cursor-not-allowed')}
              >
                <Check className="h-4 w-4 mr-2" />
                Terminer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
