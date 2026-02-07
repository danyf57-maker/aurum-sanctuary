'use client';

/**
 * Migration Modal
 *
 * Guides existing users through migration from v1 (random key) to v2 (passphrase + BIP39).
 *
 * Flow:
 * 1. Explain the upgrade and benefits
 * 2. User creates new passphrase
 * 3. Migrate all entries (decrypt with old key, re-encrypt with new key)
 * 4. Generate and display BIP39 recovery phrase
 * 5. Clean up old localStorage key
 *
 * This modal cannot be dismissed - user MUST complete migration.
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
import { Progress } from '@/components/ui/progress';
import { validatePassphraseStrength, saltToBase64 } from '@/lib/crypto/passphrase';
import { deriveKeyFromPassphrase, generateSalt, hashPassphrase } from '@/lib/crypto/passphrase';
import {
  generateRecoveryPhrase,
  deriveKeyFromRecoveryPhrase,
  encryptSaltWithRecoveryKey,
} from '@/lib/crypto/bip39';
import {
  hasLegacyEncryption,
  getLegacyKey,
  migrateEntries,
  cleanupLegacyStorage,
  type MigrationProgress,
} from '@/lib/crypto/migration';
import { saveCryptoMetadata } from '@/app/actions/crypto-actions';
import { storeSessionKey } from '@/lib/crypto/session-manager';
import { RecoveryPhraseDisplay } from './RecoveryPhraseDisplay';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';

export type MigrationModalProps = {
  open: boolean;
  onComplete: () => void;
};

type MigrationStep = 'intro' | 'passphrase' | 'migrating' | 'recovery' | 'complete';

export function MigrationModal({ open, onComplete }: MigrationModalProps) {
  const [step, setStep] = useState<MigrationStep>('intro');
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress>({ total: 0, current: 0, percentage: 0 });
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const validation = passphrase.length > 0
    ? validatePassphraseStrength(passphrase)
    : { isValid: false };

  const passphraseMatch = passphrase === passphraseConfirm && passphrase.length > 0;
  const canProceed = validation.isValid && passphraseMatch;

  const handleStartMigration = async () => {
    if (!canProceed || !user) return;

    setIsProcessing(true);
    setStep('migrating');

    try {
      // 1. Get old key
      const oldKey = await getLegacyKey();
      if (!oldKey) {
        throw new Error('Impossible de récupérer l\'ancienne clé.');
      }

      // 2. Generate new salt and derive new key
      const salt = generateSalt();
      const newKey = await deriveKeyFromPassphrase(passphrase, salt);

      // 3. Migrate entries
      const migrationResult = await migrateEntries(
        user.uid,
        oldKey,
        newKey,
        (progress) => setMigrationProgress(progress)
      );

      if (!migrationResult.success) {
        throw new Error(migrationResult.error || 'Échec de la migration des entrées.');
      }

      // 4. Generate recovery phrase
      const phrase = generateRecoveryPhrase();
      const recoveryKey = await deriveKeyFromRecoveryPhrase(phrase);

      // 5. Encrypt salt with recovery key
      const saltBase64 = saltToBase64(salt);
      const encryptedSalt = await encryptSaltWithRecoveryKey(salt, recoveryKey);

      // 6. Hash passphrase
      const passphraseHash = await hashPassphrase(passphrase);

      // 7. Save metadata to Firestore
      const saveResult = await saveCryptoMetadata(saltBase64, encryptedSalt, passphraseHash);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Échec de la sauvegarde des métadonnées.');
      }

      // 8. Store new key in sessionStorage
      await storeSessionKey(newKey);

      // 9. Clean up localStorage
      cleanupLegacyStorage();

      // 10. Show recovery phrase
      setRecoveryPhrase(phrase);
      setStep('recovery');
      setIsProcessing(false);
    } catch (error) {
      toast({
        title: 'Erreur de migration',
        description: error instanceof Error ? error.message : 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
      setStep('passphrase'); // Go back to let user try again
      setIsProcessing(false);
    }
  };

  const handleRecoveryConfirmed = () => {
    setStep('complete');
  };

  const handleComplete = () => {
    toast({
      title: 'Migration réussie !',
      description: `${migrationProgress.total} entrées migrées avec succès.`,
    });
    onComplete();
  };

  return (
    <Dialog open={open} modal>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        {step === 'intro' && (
          <>
            <DialogHeader>
              <DialogTitle>Mise à jour de sécurité requise</DialogTitle>
              <DialogDescription>
                Nous avons amélioré la sécurité de vos données. Cette mise à jour est nécessaire
                pour continuer à utiliser Aurum Sanctuary.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Benefits */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Nouvelles fonctionnalités :
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Récupération cross-device
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Accédez à vos données depuis n'importe quel appareil avec votre phrase de récupération
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Passphrase mémorisable
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Plus besoin de dépendre d'une clé aléatoire stockée localement
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        Sécurité renforcée
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        PBKDF2 avec 210 000 itérations pour protéger contre les attaques brute-force
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900 dark:text-yellow-100">
                    <p className="font-semibold mb-1">Important</p>
                    <p>
                      Cette opération va re-chiffrer toutes vos entrées avec une nouvelle clé.
                      Le processus peut prendre quelques instants selon le nombre d'entrées.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep('passphrase')} className="w-full" size="lg">
                Commencer la migration
              </Button>
            </div>
          </>
        )}

        {step === 'passphrase' && (
          <>
            <DialogHeader>
              <DialogTitle>Créer votre nouvelle passphrase</DialogTitle>
              <DialogDescription>
                Cette passphrase remplacera votre ancienne clé aléatoire.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Passphrase Input */}
              <div className="space-y-2">
                <Label htmlFor="migration-passphrase">Passphrase</Label>
                <div className="relative">
                  <Input
                    id="migration-passphrase"
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

                {passphrase.length > 0 && (
                  <div className="text-sm">
                    {validation.isValid ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Passphrase forte</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>{validation.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Passphrase */}
              <div className="space-y-2">
                <Label htmlFor="migration-passphrase-confirm">Confirmer la passphrase</Label>
                <div className="relative">
                  <Input
                    id="migration-passphrase-confirm"
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

              <Button
                onClick={handleStartMigration}
                disabled={!canProceed || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Démarrage...' : 'Migrer maintenant'}
              </Button>
            </div>
          </>
        )}

        {step === 'migrating' && (
          <>
            <DialogHeader>
              <DialogTitle>Migration en cours...</DialogTitle>
              <DialogDescription>
                Veuillez patienter pendant que nous sécurisons vos données.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>Progression</span>
                  <span>{migrationProgress.current} / {migrationProgress.total} entrées</span>
                </div>
                <Progress value={migrationProgress.percentage} className="h-2" />
              </div>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Ne fermez pas cette fenêtre pendant la migration...
              </p>
            </div>
          </>
        )}

        {step === 'recovery' && (
          <>
            <DialogHeader>
              <DialogTitle>Sauvegardez votre phrase de récupération</DialogTitle>
              <DialogDescription>
                Cette phrase de 12 mots est essentielle pour récupérer vos données.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <RecoveryPhraseDisplay
                recoveryPhrase={recoveryPhrase}
                onConfirmed={handleRecoveryConfirmed}
              />
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Migration terminée !
              </DialogTitle>
              <DialogDescription>
                Vos {migrationProgress.total} entrées ont été migrées avec succès.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-900 dark:text-green-100">
                  Votre sanctuaire utilise maintenant le nouveau système de sécurité avec
                  passphrase et phrase de récupération.
                </p>
              </div>

              <Button onClick={handleComplete} className="w-full" size="lg">
                Accéder au sanctuaire
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
