'use client';

/**
 * Premium Journal Form
 *
 * Enhanced writing experience for premium users with:
 * - More spacious design
 * - "Recevoir un reflet" button instead of mirror questions
 * - Pattern-aware AI reflection
 */

import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { saveJournalEntry, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/hooks/useEncryption';
import { encryptEntry } from '@/lib/crypto/encryption';
import { ReflectionResponse } from './reflection-response';
import { motion, AnimatePresence } from 'framer-motion';

export function PremiumJournalForm() {
  const { user } = useAuth();
  const { key, loading: keyLoading } = useEncryption();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedContent, setSavedContent] = useState('');
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [reflection, setReflection] = useState<{
    text: string;
    patternsUsed: number;
  } | null>(null);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !key) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder sans authentification',
        variant: 'destructive',
      });
      return;
    }

    // Verify token is still valid
    try {
      const token = await user.getIdToken();
      if (!token) {
        throw new Error('No token available');
      }
    } catch (error) {
      console.error('[PremiumJournalForm] Token invalid or expired', error);
      toast({
        title: 'Session expirée',
        description: 'Veuillez vous reconnecter.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const rawFormData = new FormData(event.currentTarget);
      const content = String(rawFormData.get('content') || '').trim();
      const tags = String(rawFormData.get('tags') || '');

      if (!content) {
        throw new Error('Le contenu ne peut pas être vide.');
      }

      // Encrypt content client-side
      const encrypted = await encryptEntry(content, key);

      // Validate encryption result
      if (!encrypted || !encrypted.ciphertext || !encrypted.iv) {
        throw new Error('Échec du chiffrement. Veuillez réessayer.');
      }

      // Analyze content via API (for basic sentiment - not the full reflection)
      let analysis: any = null;
      try {
        const analysisRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (analysisRes.ok) {
          analysis = await analysisRes.json();
        }
      } catch (e) {
        // Soft-fail
      }

      // Build payload for server action
      const payload = new FormData();
      payload.set('encryptedContent', encrypted.ciphertext);
      payload.set('iv', encrypted.iv);
      if (tags) payload.set('tags', tags);
      // Premium users don't publish to public blog
      if (analysis?.sentiment) payload.set('sentiment', analysis.sentiment);
      if (analysis?.mood) payload.set('mood', analysis.mood);
      if (analysis?.insight) payload.set('insight', analysis.insight);

      // Save to Firestore
      const result: FormState = await saveJournalEntry({} as FormState, payload);

      // Debug logging
      console.log('[PremiumJournalForm] saveJournalEntry result:', {
        result,
        hasResult: !!result,
        resultType: typeof result,
        errors: result?.errors,
        message: result?.message,
      });

      // Check if result exists and has no errors
      if (!result) {
        console.error('[PremiumJournalForm] Result is undefined or null');
        throw new Error('Aucune réponse du serveur. Veuillez réessayer.');
      }

      if (!result.errors && !result.message) {
        // Success
        setSavedContent(content);
        setIsSaved(true);
        setReflection(null); // Reset reflection

        toast({
          title: 'Entrée préservée',
          description: 'Ton écriture est en sécurité.',
        });
      } else {
        // Extract all validation errors
        let errorMsg = result.message || 'Une erreur est survenue.';
        if (result.errors) {
          const allErrors = Object.values(result.errors).flat().filter(Boolean);
          if (allErrors.length > 0) {
            errorMsg = allErrors[0];
          }
        }
        toast({
          title: 'Erreur de validation',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[PremiumJournalForm] Error in handleFormSubmit:', {
        error,
        errorType: typeof error,
        isError: error instanceof Error,
        errorMessage: error instanceof Error ? error.message : undefined,
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReflection = async () => {
    if (!user || !savedContent) return;

    setIsGeneratingReflection(true);
    try {
      const idToken = await user.getIdToken();

      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: savedContent,
          idToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération du reflet');
      }

      const data = await response.json();

      setReflection({
        text: data.reflection,
        patternsUsed: data.patterns_used || 0,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleNewEntry = () => {
    setIsSaved(false);
    setSavedContent('');
    setReflection(null);
    if (formRef.current) formRef.current.reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Writing form */}
      <AnimatePresence mode="wait">
        {!isSaved ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-8">
              <div>
                <Textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  placeholder="Écris ce qui demande à être posé..."
                  className="bg-transparent border-none shadow-none resize-none overflow-hidden min-h-[40vh] p-0 font-body text-2xl leading-relaxed text-stone-800 placeholder:text-stone-300 focus:ring-0 focus:outline-none focus-visible:ring-0"
                  required
                  onInput={handleInput}
                />
              </div>
              <div className="space-y-4 opacity-60 focus-within:opacity-100 transition-opacity">
                <div>
                  <Label htmlFor="tags" className="sr-only">
                    Étiquettes
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Étiquettes (optionnel)"
                    className="bg-transparent border-0 border-b border-stone-200 rounded-none px-0 text-stone-600 placeholder:text-stone-300 focus:ring-0 focus-visible:ring-0 focus:border-stone-400"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting || keyLoading}
                  size="lg"
                  className="bg-stone-800 text-white hover:bg-stone-900 px-8 rounded-xl shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Préservation en cours...
                    </>
                  ) : (
                    'Préserver cette pensée'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Saved confirmation */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200/50">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-amber-800 font-medium">Pensée préservée</span>
              </div>
              <p className="text-stone-600 text-sm">
                Ton écriture est chiffrée et en sécurité.
              </p>
            </div>

            {/* Reflection section */}
            {!reflection ? (
              <div className="text-center space-y-6 py-8">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl text-stone-900">
                    Souhaites-tu recevoir un reflet ?
                  </h3>
                  <p className="text-stone-600 max-w-md mx-auto">
                    Aurum peut te renvoyer ce qu'il perçoit, sans juger ni diriger.
                  </p>
                </div>
                <Button
                  onClick={handleRequestReflection}
                  disabled={isGeneratingReflection}
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 px-8 rounded-xl shadow-lg"
                >
                  {isGeneratingReflection ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Aurum réfléchit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Recevoir un reflet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <ReflectionResponse
                reflection={reflection.text}
                patternsUsed={reflection.patternsUsed}
              />
            )}

            {/* New entry button */}
            <div className="text-center pt-6">
              <Button
                onClick={handleNewEntry}
                variant="ghost"
                className="text-stone-600 hover:text-stone-900"
              >
                Nouvelle entrée
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
