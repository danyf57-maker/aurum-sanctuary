'use client';

/**
 * Recovery Phrase Modal
 *
 * Allows users to recover their account using the 12-word BIP39 recovery phrase.
 *
 * Flow:
 * 1. User enters 12-word recovery phrase
 * 2. System validates phrase (BIP39 format)
 * 3. System decrypts salt from Firestore
 * 4. User creates NEW passphrase
 * 5. System derives new key and stores it
 *
 * This allows account recovery on a new device or after forgetting passphrase.
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
import { useToast } from '@/hooks/use-toast';
import {
  validateRecoveryPhrase,
  decryptSaltWithRecoveryPhrase,
  joinRecoveryPhrase,
} from '@/lib/crypto/bip39';
import {
  deriveKeyFromPassphrase,
  hashPassphrase,
  validatePassphraseStrength,
  saltToBase64,
} from '@/lib/crypto/passphrase';
import { getCryptoMetadata, saveCryptoMetadata } from '@/app/actions/crypto-actions';
import { storeSessionKey } from '@/lib/crypto/session-manager';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Key, Loader2 } from 'lucide-react';

export type RecoveryPhraseModalProps = {
  open: boolean;
  onRecovered: () => void;
  onCancel: () => void;
};

type RecoveryStep = 'phrase' | 'newPassphrase' | 'complete';

export function RecoveryPhraseModal({ open, onRecovered, onCancel }: RecoveryPhraseModalProps) {
  const [step, setStep] = useState<RecoveryStep>('phrase');
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [newPassphrase, setNewPassphrase] = useState('');
  const [newPassphraseConfirm, setNewPassphraseConfirm] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveredSalt, setRecoveredSalt] = useState<Uint8Array | null>(null);

  const { toast } = useToast();

  const recoveryPhrase = joinRecoveryPhrase(words);
  const isPhraseValid = validateRecoveryPhrase(recoveryPhrase);
  const allWordsFilled = words.every(word => word.trim().length > 0);

  const passphraseValidation = newPassphrase.length > 0
    ? validatePassphraseStrength(newPassphrase)
    : { isValid: false };

  const passphraseMatch = newPassphrase === newPassphraseConfirm && newPassphrase.length > 0;
  const canCreatePassphrase = passphraseValidation.isValid && passphraseMatch;

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.toLowerCase().trim();
    setWords(newWords);
  };

  const handlePastePhrase = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedWords = pastedText.trim().split(/\s+/);

    if (pastedWords.length === 12) {
      setWords(pastedWords.map(w => w.toLowerCase().trim()));
      toast({
        title: 'Phrase collée',
        description: '12 mots détectés.',
      });
    }
  };

  const handleVerifyPhrase = async () => {
    if (!isPhraseValid || !allWordsFilled) {
      toast({
        title: 'Phrase invalide',
        description: 'Vérifiez que les 12 mots sont corrects.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Fetch crypto metadata from Firestore
      const metadataResult = await getCryptoMetadata();
      if (!metadataResult.success || !metadataResult.data) {
        throw new Error('Impossible de récupérer les métadonnées.');
      }

      const { encryptedSalt } = metadataResult.data;
      if (!encryptedSalt) {
        throw new Error('Aucune sauvegarde de récupération trouvée.');
      }

      // Decrypt salt with recovery phrase
      const salt = await decryptSaltWithRecoveryPhrase(encryptedSalt, recoveryPhrase);

      setRecoveredSalt(salt);
      setStep('newPassphrase');
      toast({
        title: 'Phrase vérifiée',
        description: 'Créez maintenant une nouvelle passphrase.',
      });
    } catch (error) {
      toast({
        title: 'Échec de la récupération',
        description: error instanceof Error ? error.message : 'Phrase de récupération incorrecte.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewPassphrase = async () => {
    if (!canCreatePassphrase || !recoveredSalt) return;

    setIsProcessing(true);

    try {
      // Derive new key from new passphrase + recovered salt
      const newKey = await deriveKeyFromPassphrase(newPassphrase, recoveredSalt);

      // Hash new passphrase
      const passphraseHash = await hashPassphrase(newPassphrase);

      // We keep the same encryptedSalt (no need to re-encrypt)
      const metadataResult = await getCryptoMetadata();
      const encryptedSalt = metadataResult.data?.encryptedSalt || '';
      const saltBase64 = saltToBase64(recoveredSalt);

      // Update Firestore with new passphrase hash
      const saveResult = await saveCryptoMetadata(saltBase64, encryptedSalt, passphraseHash);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Échec de la sauvegarde.');
      }

      // Store new key in sessionStorage
      await storeSessionKey(newKey);

      setStep('complete');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la nouvelle passphrase.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'phrase' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Récupération avec phrase de 12 mots
              </DialogTitle>
              <DialogDescription>
                Entrez votre phrase de récupération BIP39 pour restaurer l'accès à vos données.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Paste Helper */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">💡 Astuce</p>
                <p>
                  Vous pouvez coller votre phrase complète (12 mots séparés par des espaces)
                  dans le premier champ.
                </p>
              </div>

              {/* 12 Word Grid */}
              <div className="grid grid-cols-3 gap-3">
                {words.map((word, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`word-${index}`} className="text-xs text-slate-500">
                      {index + 1}
                    </Label>
                    <Input
                      id={`word-${index}`}
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      onPaste={index === 0 ? handlePastePhrase : undefined}
                      placeholder={`mot ${index + 1}`}
                      className="font-mono text-sm"
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>

              {/* Validation */}
              {allWordsFilled && (
                <div className="text-sm">
                  {isPhraseValid ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Phrase BIP39 valide</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Phrase BIP39 invalide - vérifiez les mots</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleVerifyPhrase}
                  disabled={!isPhraseValid || !allWordsFilled || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier la phrase'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'newPassphrase' && (
          <>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle passphrase</DialogTitle>
              <DialogDescription>
                Votre phrase de récupération a été vérifiée. Créez maintenant une nouvelle
                passphrase pour déverrouiller votre sanctuaire.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* New Passphrase */}
              <div className="space-y-2">
                <Label htmlFor="new-passphrase">Nouvelle passphrase</Label>
                <div className="relative">
                  <Input
                    id="new-passphrase"
                    type={showPassphrase ? 'text' : 'password'}
                    value={newPassphrase}
                    onChange={(e) => setNewPassphrase(e.target.value)}
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

                {newPassphrase.length > 0 && (
                  <div className="text-sm">
                    {passphraseValidation.isValid ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Passphrase forte</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>{passphraseValidation.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Passphrase */}
              <div className="space-y-2">
                <Label htmlFor="new-passphrase-confirm">Confirmer la passphrase</Label>
                <div className="relative">
                  <Input
                    id="new-passphrase-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={newPassphraseConfirm}
                    onChange={(e) => setNewPassphraseConfirm(e.target.value)}
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

                {newPassphraseConfirm.length > 0 && (
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
                onClick={handleCreateNewPassphrase}
                disabled={!canCreatePassphrase || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Création...' : 'Créer la nouvelle passphrase'}
              </Button>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Récupération réussie !
              </DialogTitle>
              <DialogDescription>
                Votre accès a été restauré avec succès.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-900 dark:text-green-100">
                <p>
                  Vous pouvez maintenant accéder à vos entrées de journal avec votre nouvelle
                  passphrase.
                </p>
              </div>

              <Button onClick={onRecovered} className="w-full" size="lg">
                Accéder au sanctuaire
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
