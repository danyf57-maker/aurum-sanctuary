'use client';

/**
 * Recovery Phrase Display Component
 *
 * Displays the 12-word BIP39 recovery phrase in a secure, user-friendly format.
 *
 * Features:
 * - 3x4 grid layout with numbered words
 * - Copy to clipboard
 * - Print/Download functionality
 * - Mandatory confirmation checkbox
 * - Security warnings
 *
 * Security: ONE-TIME display only. User must save phrase before continuing.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Printer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { splitRecoveryPhrase, formatRecoveryPhraseForPrint } from '@/lib/crypto/bip39';

export type RecoveryPhraseDisplayProps = {
  recoveryPhrase: string;
  onConfirmed: () => void;
  isConfirming?: boolean;
};

export function RecoveryPhraseDisplay({
  recoveryPhrase,
  onConfirmed,
  isConfirming = false,
}: RecoveryPhraseDisplayProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const words = splitRecoveryPhrase(recoveryPhrase);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      toast({
        title: 'Copié !',
        description: 'Phrase de récupération copiée dans le presse-papiers.',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier la phrase.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir la fenêtre d\'impression.',
        variant: 'destructive',
      });
      return;
    }

    const formattedPhrase = formatRecoveryPhraseForPrint(recoveryPhrase);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aurum Sanctuary - Phrase de Récupération</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .warning {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .words {
              background: #f3f4f6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
              white-space: pre-line;
              font-size: 14px;
              line-height: 1.8;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>🔐 Aurum Sanctuary</h1>
          <h2>Phrase de Récupération</h2>

          <div class="warning">
            <strong>⚠️ GARDEZ CETTE PHRASE EN LIEU SÛR</strong><br>
            Cette phrase est la SEULE façon de récupérer vos données si vous perdez votre appareil.<br>
            Ne la partagez JAMAIS avec personne.
          </div>

          <div class="words">
${formattedPhrase}
          </div>

          <div class="footer">
            Imprimé le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}<br>
            Conservez ce document dans un endroit sûr (coffre-fort, coffre-fort numérique sécurisé, etc.)
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
              Cette phrase est affichée UNE SEULE FOIS
            </p>
            <p className="text-yellow-800 dark:text-yellow-200">
              Sauvegardez-la dans un endroit sûr avant de continuer. Sans cette phrase,
              vous ne pourrez PAS récupérer vos données si vous perdez votre appareil.
            </p>
          </div>
        </div>
      </div>

      {/* Recovery Phrase Grid */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Votre phrase de récupération (12 mots)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {words.map((word, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-md p-3 border border-slate-200 dark:border-slate-700"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {index + 1}
              </div>
              <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {word}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1"
          disabled={copied}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </>
          )}
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Security Instructions */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <p className="font-semibold">💡 Comment sauvegarder cette phrase ?</p>
        <ul className="space-y-2 list-disc list-inside">
          <li>Écrivez-la sur papier et conservez-la dans un coffre-fort</li>
          <li>Utilisez un gestionnaire de mots de passe sécurisé (1Password, Bitwarden, etc.)</li>
          <li>Ne la stockez JAMAIS en clair sur votre ordinateur ou dans le cloud</li>
          <li>Ne la photographiez JAMAIS avec votre téléphone</li>
          <li>Ne la partagez JAMAIS avec personne</li>
        </ul>
      </div>

      {/* Confirmation Checkbox */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            checked={hasConfirmed}
            onCheckedChange={(checked) => setHasConfirmed(checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
            J'ai sauvegardé ma phrase de récupération dans un endroit sûr et je comprends
            que je ne pourrai plus la consulter après cette étape.
          </span>
        </label>
      </div>

      {/* Continue Button */}
      <Button
        onClick={onConfirmed}
        disabled={!hasConfirmed || isConfirming}
        className="w-full"
        size="lg"
      >
        {isConfirming ? 'Configuration en cours...' : 'Continuer'}
      </Button>
    </div>
  );
}
