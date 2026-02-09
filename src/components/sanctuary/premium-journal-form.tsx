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
import { ImagePlus, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { saveJournalEntry, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ReflectionResponse } from './reflection-response';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { app } from '@/lib/firebase/web-client';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

type DraftImage = {
  id: string;
  url: string;
  path: string;
  caption: string;
  name: string;
};

type ConversationTurn = {
  id: string;
  role: 'user' | 'aurum';
  text: string;
};

export function PremiumJournalForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedContent, setSavedContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [isContinuingConversation, setIsContinuingConversation] = useState(false);
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const [conversationInput, setConversationInput] = useState('');
  const [reflection, setReflection] = useState<{
    text: string;
    patternsUsed: number;
  } | null>(null);
  const isFocusMode = draftContent.trim().length > 0 && isActivelyTyping;

  const setTypingActivity = () => {
    setIsActivelyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsActivelyTyping(false);
    }, 1600);
  };

  const uploadImageToStorage = async (file: File): Promise<DraftImage> => {
    if (!user) throw new Error('Connexion requise pour ajouter une image.');
    const storage = getStorage(app);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `journal_media/${user.uid}/${Date.now()}-${safeName}`;
    const ref = storageRef(storage, path);

    // Non-chiffre pour ce prototype. Metadata pour preparer la future migration.
    await uploadBytes(ref, file, {
      contentType: file.type,
      customMetadata: { storage_mode: 'plain_v1' },
    });
    const url = await getDownloadURL(ref);

    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url,
      path,
      caption: '',
      name: file.name,
    };
  };

  const handleDroppedFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: "Connecte-toi avec Google pour ajouter des images.",
        variant: 'destructive',
      });
      setIsAuthDialogOpen(true);
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({
        title: 'Format non supporte',
        description: 'Depose une image (jpg, png, webp...).',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploaded = await Promise.all(imageFiles.map(uploadImageToStorage));
      setDraftImages((prev) => [...prev, ...uploaded]);
      const textarea = textareaRef.current;
      if (textarea) {
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        });
      }

      setTypingActivity();
      toast({
        title: 'Image ajoutee',
        description: imageFiles.length > 1 ? `${imageFiles.length} images ajoutees.` : 'Image ajoutee a ton entree.',
      });
    } catch (error) {
      const storageCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      let message = error instanceof Error ? error.message : 'Upload image impossible.';
      if (storageCode.includes("storage/unauthorized")) {
        message = "Tu es connecté, mais l'envoi d'image est refusé par les règles Storage (permission).";
      } else if (storageCode.includes("storage/unauthenticated")) {
        message = "Ta session n'est pas active pour l'upload. Reconnecte-toi puis réessaie.";
      } else if (storageCode.includes("storage/quota-exceeded")) {
        message = "Le quota Firebase Storage est dépassé. Réessaie plus tard ou augmente le quota.";
      } else if (storageCode.includes("storage/retry-limit-exceeded")) {
        message = "Le réseau a coupé pendant l'upload. Vérifie ta connexion et réessaie.";
      }
      toast({
        title: 'Erreur image',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
      setIsDragActive(false);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // CRITICAL: Capture form reference BEFORE any async operations
    // React synthetic events are nullified after async calls
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      console.error('[PremiumJournalForm] event.currentTarget is not a form:', form);
      toast({
        title: 'Erreur',
        description: 'Erreur de formulaire. Veuillez recharger la page.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder sans authentification',
        variant: 'destructive',
      });
      return;
    }

    // Verify token is still valid
    let idTokenForServer = '';
    try {
      idTokenForServer = await user.getIdToken();
      if (!idTokenForServer) {
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
      const rawFormData = new FormData(form);
      const content = String(rawFormData.get('content') || '').trim();
      const tags = String(rawFormData.get('tags') || '');

      if (!content) {
        throw new Error('Le contenu ne peut pas être vide.');
      }
      if (isUploadingImage) {
        throw new Error("Attends la fin de l'upload des images.");
      }

      // TABULA RASA: Pas de chiffrement, envoi direct en plaintext
      let analysis: any = null;
      // Build payload for server action (plaintext mode)
      const payload = new FormData();
      payload.set('content', content);
      payload.set('idToken', idTokenForServer);
      payload.set(
        'images',
        JSON.stringify(
          draftImages.map((image) => ({
            id: image.id,
            url: image.url,
            path: image.path,
            caption: image.caption || '',
            name: image.name,
          }))
        )
      );
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
        setIsActivelyTyping(false);

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

  const requestAurumReflection = async (content: string) => {
    if (!user) {
      throw new Error('Connexion requise.');
    }

    const callReflect = async (idToken: string) =>
      fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          idToken,
        }),
      });

    let idToken = await user.getIdToken();
    let response = await callReflect(idToken);

    // If token is stale, retry once with a forced refresh.
    if (response.status === 401) {
      idToken = await user.getIdToken(true);
      response = await callReflect(idToken);
    }

    if (!response.ok) {
      const error = await response.json();
      const rawMessage = error?.error || 'Erreur lors de la génération du reflet';
      if (response.status === 401) {
        throw new Error("Session expirée. Recharge la page puis reconnecte-toi si nécessaire.");
      }
      throw new Error(rawMessage);
    }

    return response.json();
  };

  const handleRequestReflection = async () => {
    if (!savedContent) return;

    setIsGeneratingReflection(true);
    try {
      const data = await requestAurumReflection(savedContent);
      const firstReflection = {
        text: data.reflection,
        patternsUsed: data.patterns_used || 0,
      };
      setReflection(firstReflection);
      setConversationTurns([
        {
          id: `aurum-${Date.now()}`,
          role: 'aurum',
          text: firstReflection.text,
        },
      ]);
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

  const handleContinueConversation = async () => {
    const prompt = conversationInput.trim();
    if (!prompt || !savedContent) return;

    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
    };
    const nextTurns = [...conversationTurns, userTurn];
    setConversationTurns(nextTurns);
    setConversationInput('');

    setIsContinuingConversation(true);
    try {
      const context = nextTurns
        .slice(-8)
        .map((turn) => `${turn.role === 'user' ? 'Utilisateur' : 'Aurum'}: ${turn.text}`)
        .join('\n');

      const conversationalInput = [
        `Texte initial du journal:`,
        savedContent,
        ``,
        `Conversation en cours:`,
        context,
        ``,
        `Réponds à l'utilisateur dans la continuité de l'échange.`,
      ].join('\n');

      const data = await requestAurumReflection(conversationalInput);
      setConversationTurns((prev) => [
        ...prev,
        {
          id: `aurum-${Date.now()}`,
          role: 'aurum',
          text: data.reflection,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsContinuingConversation(false);
    }
  };

  const handleNewEntry = () => {
    setIsSaved(false);
    setSavedContent('');
    setDraftContent('');
    setDraftImages([]);
    setReflection(null);
    setConversationTurns([]);
    setConversationInput('');
    setIsActivelyTyping(false);
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

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('aurum-writing-focus');
    } else {
      document.body.classList.remove('aurum-writing-focus');
    }
    return () => {
      document.body.classList.remove('aurum-writing-focus');
    };
  }, [isFocusMode]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
    setDraftContent(target.value);
    setTypingActivity();
  };

  const handlePickImageClick = () => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: "Connecte-toi avec Google pour ajouter des images.",
        variant: 'destructive',
      });
      setIsAuthDialogOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-[720px] mx-auto px-6 md:px-10 space-y-8">
      {/* Writing form */}
      <AnimatePresence mode="wait">
        {!isSaved ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="space-y-10 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,234,0.82))] shadow-[0_10px_30px_rgba(43,34,19,0.06)] p-6 md:p-10"
            >
              <div
                className={`relative transition-all duration-300 ${isDragActive ? 'ring-2 ring-amber-300 rounded-2xl bg-amber-50/40' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                  void handleDroppedFiles(event.dataTransfer.files);
                }}
              >
                <Textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  placeholder="Écris ce qui demande à être posé..."
                  value={draftContent}
                  className="bg-transparent border-none shadow-none resize-none overflow-hidden min-h-[48vh] p-0 [font-family:var(--font-cormorant)] text-3xl leading-relaxed text-stone-800 placeholder:text-stone-300 focus:ring-0 focus:outline-none focus-visible:ring-0 caret-amber-400"
                  required
                  onInput={handleInput}
                />
                {isDragActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-amber-50/70 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-700">
                      <UploadCloud className="h-5 w-5 text-amber-500" />
                      <span className="[font-family:var(--font-cormorant)] text-2xl">Depose ton image ici</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`space-y-4 transition-opacity duration-400 ${isFocusMode ? 'opacity-10 hover:opacity-100' : 'opacity-80'}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-amber-500" />
                  Glisse-depose des images dans la page pour enrichir ton ecriture
                </p>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      void handleDroppedFiles(event.currentTarget.files);
                      // Reset value to allow selecting the same file twice.
                      event.currentTarget.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePickImageClick}
                    className="h-8 rounded-full px-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Ajouter une image
                  </Button>
                </div>
                {draftImages.length > 0 && (
                  <div className="space-y-6">
                    {draftImages.map((image) => (
                      <figure key={image.id} className="overflow-hidden rounded-2xl bg-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                        <img
                          src={image.url}
                          alt={image.caption || image.name}
                          className="w-full h-auto object-cover"
                        />
                        <figcaption className="px-4 py-3 text-sm text-stone-600 bg-white/70">
                          <div className="flex items-center gap-3">
                            <Input
                              value={image.caption}
                              onChange={(event) => {
                                const caption = event.currentTarget.value;
                                setDraftImages((prev) =>
                                  prev.map((item) => (item.id === image.id ? { ...item, caption } : item))
                                );
                              }}
                              placeholder="Ajoute une legende..."
                              className="h-8 p-0 bg-transparent border-0 shadow-none text-sm text-stone-600 placeholder:text-stone-400 focus-visible:ring-0"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDraftImages((prev) => prev.filter((item) => item.id !== image.id));
                              }}
                              className="h-8 w-8 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                              aria-label="Supprimer l'image"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                <div>
                  <Label htmlFor="tags" className="sr-only">
                    Étiquettes
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="Étiquettes (optionnel)"
                    className="bg-transparent border-0 rounded-none px-0 [font-family:var(--font-cormorant)] text-2xl text-stone-500 placeholder:text-stone-300 shadow-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className={`flex justify-center transition-opacity duration-300 ${isFocusMode ? 'opacity-90' : 'opacity-100'}`}>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  size="lg"
                  className="border-0 bg-stone-900 text-stone-50 hover:bg-stone-800 px-10 rounded-full shadow-[0_12px_28px_rgba(30,20,8,0.24)] text-base font-semibold"
                >
                  {isSubmitting || isUploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploadingImage ? 'Upload image...' : 'Préservation en cours...'}
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
              <div className="space-y-6">
                <ReflectionResponse
                  reflection={reflection.text}
                  patternsUsed={reflection.patternsUsed}
                />
                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white/80 p-4">
                  <h4 className="font-medium text-stone-900">Continuer l'échange avec Aurum</h4>
                  {conversationTurns.length > 1 && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {conversationTurns.slice(1).map((turn) => (
                        <div
                          key={turn.id}
                          className={turn.role === 'user'
                            ? 'ml-auto max-w-[92%] rounded-xl bg-stone-900 text-stone-50 px-3 py-2 text-sm'
                            : 'mr-auto max-w-[92%] rounded-xl bg-amber-50 text-stone-800 px-3 py-2 text-sm border border-amber-100'}
                        >
                          {turn.text}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Textarea
                      value={conversationInput}
                      onChange={(event) => setConversationInput(event.currentTarget.value)}
                      placeholder="Ecris ta reponse a Aurum..."
                      className="min-h-[88px] resize-y"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleContinueConversation}
                        disabled={isContinuingConversation || !conversationInput.trim()}
                        className="bg-amber-700 text-white hover:bg-amber-800"
                      >
                        {isContinuingConversation ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Aurum repond...
                          </>
                        ) : (
                          'Continuer avec Aurum'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </div>
  );
}
