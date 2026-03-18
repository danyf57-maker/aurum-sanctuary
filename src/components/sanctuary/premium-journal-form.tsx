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
import { ImagePlus, Loader2, Eye, Lock, UploadCloud, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { saveJournalEntry, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ReflectionResponse } from './reflection-response';
import { ReflectionPulse } from './reflection-pulse';
import { NeuroBreadcrumbs } from './neuro-breadcrumbs';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { app, firestore } from '@/lib/firebase/web-client';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEncryption } from '@/hooks/useEncryption';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/hooks/use-locale';
import { useFreeEntryLimit } from '@/hooks/use-free-entry-limit';
import { FREE_AURUM_REPLY_LIMIT } from '@/lib/billing/config';

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

function stripPreviewMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPreviewTitle(content: string) {
  const words = stripPreviewMarkdown(content).split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
}

function buildPreviewExcerpt(content: string, maxLength = 170) {
  const plain = stripPreviewMarkdown(content);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

export function PremiumJournalForm() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isReady: encryptionReady, encrypt } = useEncryption();
  const { toast } = useToast();
  const locale = useLocale();
  const isFr = locale === 'fr';
  const t = useTranslations('sanctuary.premiumJournalForm');
  const { entriesUsed, entriesLimit, remaining, isPremium, isLimitReached } = useFreeEntryLimit();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedContent, setSavedContent] = useState('');
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [isContinuingConversation, setIsContinuingConversation] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [conversationTurns, setConversationTurns] = useState<ConversationTurn[]>([]);
  const [conversationInput, setConversationInput] = useState('');
  const [aurumRepliesUsed, setAurumRepliesUsed] = useState(0);
  const [reflection, setReflection] = useState<{
    text: string;
    patternsUsed: number;
  } | null>(null);
  const isFocusMode = draftContent.trim().length > 0 && isActivelyTyping;
  const isConversationLocked = !isPremium && aurumRepliesUsed >= FREE_AURUM_REPLY_LIMIT;
  const conversationRepliesRemaining = Math.max(0, FREE_AURUM_REPLY_LIMIT - aurumRepliesUsed);
  const conversationSuggestions = [
    t('conversationStarters.0'),
    t('conversationStarters.1'),
    t('conversationStarters.2'),
    t('conversationStarters.3'),
  ];

  const setTypingActivity = () => {
    setIsActivelyTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsActivelyTyping(false);
    }, 1600);
  };

  // Récupérer le texte de la landing page après connexion
  useEffect(() => {
    const savedDraft = localStorage.getItem('aurum-landing-draft');
    if (savedDraft && !draftContent) {
      setDraftContent(savedDraft);
      // Nettoyer le localStorage après récupération
      localStorage.removeItem('aurum-landing-draft');
      // Afficher une notification
      toast({
        title: t('restoredTitle'),
        description: t('restoredDescription'),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pré-remplir depuis l'URL si "initial" est fourni et non vide.
  useEffect(() => {
    const initial = searchParams.get('initial');
    if (!initial) return;
    if (draftContent.trim().length > 0) return;
    setDraftContent(initial);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    });
  }, [draftContent, searchParams]);

  const uploadImageToStorage = async (file: File): Promise<DraftImage> => {
    if (!user) throw new Error(t('errors.signInToAddImage'));
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
        title: t('toasts.signInRequiredTitle'),
        description: t('toasts.signInRequiredDescription'),
        variant: 'destructive',
      });
      setIsAuthDialogOpen(true);
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast({
        title: t('toasts.unsupportedFormatTitle'),
        description: t('toasts.unsupportedFormatDescription'),
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
        title: t('toasts.imageAddedTitle'),
        description: imageFiles.length > 1
          ? t('toasts.imagesAddedCount', { count: imageFiles.length })
          : t('toasts.imageAddedDescription'),
      });
    } catch (error) {
      const storageCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: string }).code)
          : "";
      let message = error instanceof Error ? error.message : t('errors.uploadFailed');
      if (storageCode.includes("storage/unauthorized")) {
        message = t('errors.storageUnauthorized');
      } else if (storageCode.includes("storage/unauthenticated")) {
        message = t('errors.storageUnauthenticated');
      } else if (storageCode.includes("storage/quota-exceeded")) {
        message = t('errors.storageQuotaExceeded');
      } else if (storageCode.includes("storage/retry-limit-exceeded")) {
        message = t('errors.storageRetryLimitExceeded');
      }
      toast({
        title: t('toasts.imageErrorTitle'),
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
        title: t('toasts.errorTitle'),
        description: t('errors.formErrorReload'),
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: t('toasts.errorTitle'),
        description: t('errors.unableToSaveWithoutAuth'),
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
        title: t('toasts.sessionExpiredTitle'),
        description: t('toasts.sessionExpiredDescription'),
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
        throw new Error(t('errors.contentCannotBeEmpty'));
      }
      if (isUploadingImage) {
        throw new Error(t('errors.waitImageUpload'));
      }

      // Encrypt content before saving (AES-256-GCM client-side)
      if (!encryptionReady) {
        throw new Error(t('errors.encryptionNotReady'));
      }

      const encryptedData = await encrypt(content);
      const previewTitle = buildPreviewTitle(content);
      const previewExcerpt = buildPreviewExcerpt(content);

      let analysis: any = null;
      // Build payload for server action (encrypted mode)
      const payload = new FormData();
      payload.set('encryptedContent', encryptedData.ciphertext);
      payload.set('iv', encryptedData.iv);
      payload.set('version', encryptedData.version.toString());
      if (previewTitle) payload.set('previewTitle', previewTitle);
      if (previewExcerpt) payload.set('previewExcerpt', previewExcerpt);
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
        throw new Error(t('errors.noServerResponse'));
      }

      if (!result.errors && !result.message) {
        // Success
        setSavedContent(content);
        setSavedEntryId(result.entryId || null);
        setIsSaved(true);
        setReflection(null); // Reset reflection
        setIsActivelyTyping(false);

        toast({
          title: t('toasts.entrySavedTitle'),
          description: t('toasts.entrySavedDescription'),
        });
      } else {
        if (result.freeLimitReached) {
          setIsPaywallOpen(true);
          setIsSubmitting(false);
          return;
        }
        // Extract all validation errors
        let errorMsg = result.message || t('errors.generic');
        if (result.errors) {
          const allErrors = Object.values(result.errors).flat().filter(Boolean);
          if (allErrors.length > 0) {
            errorMsg = allErrors[0];
          }
        }
        toast({
          title: t('toasts.validationErrorTitle'),
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
      const message = error instanceof Error ? error.message : t('errors.generic');
      toast({
        title: t('toasts.errorTitle'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Stream a reflection from /api/reflect via SSE.
   * Calls `onToken` for every new token so the UI updates in real-time.
   * Returns the full text once the stream completes.
   */
  const streamReflection = async (
    content: string,
    onToken: (partial: string) => void,
    options?: { entryId?: string | null; userMessage?: string },
  ): Promise<{
    text: string;
    meta: {
      conversationRepliesUsed?: number | null;
      conversationRepliesLimit?: number | null;
    } | null;
  }> => {
    if (!user) throw new Error(t('errors.signInRequired'));

    const callReflect = (idToken: string) =>
      fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          idToken,
          locale,
          entryId: options?.entryId || undefined,
          userMessage: options?.userMessage,
        }),
      });

    let idToken = await user.getIdToken();
    let response = await callReflect(idToken);

    if (response.status === 401) {
      idToken = await user.getIdToken(true);
      response = await callReflect(idToken);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 402 && (error?.freeLimitReached || error?.conversationLimitReached)) {
        if (typeof error?.repliesUsed === 'number') {
          setAurumRepliesUsed(error.repliesUsed);
        }
        setIsPaywallOpen(true);
      }
      if (response.status === 401) {
        throw new Error(t('errors.sessionExpiredReload'));
      }
      throw new Error(error?.error || t('errors.generatingReflection'));
    }

    if (!response.body) throw new Error(t('errors.emptyResponse'));

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let meta: {
      conversationRepliesUsed?: number | null;
      conversationRepliesLimit?: number | null;
    } | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.token) {
            fullText += data.token;
            onToken(fullText);
          } else if (data.replace) {
            // Anti-meta sanitized replacement
            fullText = data.replace;
            onToken(fullText);
          } else if (data.done) {
            meta = {
              conversationRepliesUsed: typeof data.conversationRepliesUsed === 'number'
                ? data.conversationRepliesUsed
                : null,
              conversationRepliesLimit: typeof data.conversationRepliesLimit === 'number'
                ? data.conversationRepliesLimit
                : null,
            };
          }
          // data.done = true → stream ended, metadata available
        } catch {
          // skip malformed
        }
      }
    }

    return { text: fullText, meta };
  };

  const handleRequestReflection = async () => {
    if (!savedContent) return;

    setIsGeneratingReflection(true);
    try {
      const result = await streamReflection(
        savedContent,
        (partial) => {
          setReflection({ text: partial, patternsUsed: 0 });
          setConversationTurns([
            { id: `aurum-${Date.now()}`, role: 'aurum', text: partial },
          ]);
        },
        { entryId: savedEntryId },
      );
      const text = result.text;
      // Final state with complete text
      setReflection({ text, patternsUsed: 0 });
      setConversationTurns([
        { id: `aurum-${Date.now()}`, role: 'aurum', text },
      ]);
      if (typeof result.meta?.conversationRepliesUsed === 'number') {
        setAurumRepliesUsed(result.meta.conversationRepliesUsed);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      toast({ title: t('toasts.errorTitle'), description: message, variant: 'destructive' });
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleContinueConversation = async () => {
    const prompt = conversationInput.trim();
    if (!prompt || !savedContent) return;
    if (isConversationLocked) {
      setIsPaywallOpen(true);
      return;
    }

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
        .map((turn) => `${turn.role === 'user' ? t('conversation.userLabel') : t('conversation.aurumLabel')}: ${turn.text}`)
        .join('\n');

      const conversationalInput = [
        `Texte initial du journal:`,
        savedContent,
        ``,
        `Conversation en cours:`,
        context,
        ``,
        t('conversation.replyInstruction'),
      ].join('\n');

      const aurumTurnId = `aurum-${Date.now()}`;
      const result = await streamReflection(
        conversationalInput,
        (partial) => {
          setConversationTurns((prev) => {
            const existing = prev.find((t) => t.id === aurumTurnId);
            if (existing) {
              return prev.map((t) => t.id === aurumTurnId ? { ...t, text: partial } : t);
            }
            return [...prev, { id: aurumTurnId, role: 'aurum', text: partial }];
          });
        },
        { entryId: savedEntryId, userMessage: prompt },
      );
      const text = result.text;
      // Ensure final text is set
      setConversationTurns((prev) =>
        prev.map((t) => t.id === aurumTurnId ? { ...t, text } : t)
      );
      if (typeof result.meta?.conversationRepliesUsed === 'number') {
        setAurumRepliesUsed(result.meta.conversationRepliesUsed);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      toast({ title: t('toasts.errorTitle'), description: message, variant: 'destructive' });
    } finally {
      setIsContinuingConversation(false);
    }
  };

  const handleNewEntry = () => {
    setIsSaved(false);
    setSavedContent('');
    setSavedEntryId(null);
    setDraftContent('');
    setDraftImages([]);
    setReflection(null);
    setConversationTurns([]);
    setConversationInput('');
    setAurumRepliesUsed(0);
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

  useEffect(() => {
    if (!user || !savedEntryId) {
      setAurumRepliesUsed(0);
      return;
    }

    const entryRef = doc(firestore, 'users', user.uid, 'entries', savedEntryId);
    const unsubscribe = onSnapshot(entryRef, (snapshot) => {
      const data = snapshot.data();
      setAurumRepliesUsed(typeof data?.aurumReplyCount === 'number' ? data.aurumReplyCount : 0);
    });

    return () => unsubscribe();
  }, [savedEntryId, user]);

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
        title: t('toasts.signInRequiredTitle'),
        description: t('toasts.signInRequiredDescription'),
        variant: 'destructive',
      });
      setIsAuthDialogOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSelectConversationStarter = (starter: string) => {
    setConversationInput(starter);
    requestAnimationFrame(() => {
      conversationTextareaRef.current?.focus();
      conversationTextareaRef.current?.setSelectionRange(starter.length, starter.length);
    });
  };

  const progressLabel = isFr
    ? `${entriesUsed} / ${entriesLimit} sujets gratuits utilisés`
    : `${entriesUsed} / ${entriesLimit} free topics used`;
  const remainingLabel = isFr
    ? remaining > 0
      ? `Il te reste ${remaining} sujet${remaining > 1 ? 's' : ''} gratuit${remaining > 1 ? 's' : ''} avant l'expérience complète.`
      : 'Passe au premium avec 7 jours offerts pour ouvrir de nouveaux sujets.'
    : remaining > 0
      ? `${remaining} free topic${remaining > 1 ? 's' : ''} left before the full experience.`
      : 'Go premium with a 7-day free trial to open new topics.';
  const conversationProgressLabel = isFr
    ? `${aurumRepliesUsed} / ${FREE_AURUM_REPLY_LIMIT} réponses d'Aurum utilisées sur ce sujet`
    : `${aurumRepliesUsed} / ${FREE_AURUM_REPLY_LIMIT} Aurum replies used on this topic`;
  const conversationRemainingLabel = isFr
    ? conversationRepliesRemaining > 0
      ? `Il te reste ${conversationRepliesRemaining} réponse${conversationRepliesRemaining > 1 ? 's' : ''} d'Aurum sur ce sujet.`
      : `Tu as utilisé les ${FREE_AURUM_REPLY_LIMIT} réponses gratuites d'Aurum sur ce sujet.`
    : conversationRepliesRemaining > 0
      ? `${conversationRepliesRemaining} Aurum repl${conversationRepliesRemaining > 1 ? 'ies' : 'y'} left on this topic.`
      : `You used the ${FREE_AURUM_REPLY_LIMIT} free Aurum replies on this topic.`;

  return (
    <>
      <div className="w-full max-w-[720px] mx-auto px-6 md:px-10 space-y-8">
        {!isPremium && (
          <div className={`rounded-[24px] border px-5 py-4 ${isLimitReached ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white/70'}`}>
            <p className="text-sm font-medium text-stone-800">{progressLabel}</p>
            <p className="mt-1 text-sm text-stone-600">{remainingLabel}</p>
          </div>
        )}
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
                  placeholder={t('placeholders.write')}
                  value={draftContent}
                  className="bg-transparent border-none shadow-none resize-none overflow-hidden min-h-[48vh] p-0 [font-family:var(--font-cormorant)] text-3xl leading-relaxed text-stone-800 placeholder:text-stone-400 focus:ring-0 focus:outline-none focus-visible:ring-0 caret-amber-400"
                  required
                  onInput={handleInput}
                />
                {isDragActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-amber-50/70 rounded-2xl">
                    <div className="flex items-center gap-2 text-stone-700">
                      <UploadCloud className="h-5 w-5 text-amber-500" />
                      <span className="[font-family:var(--font-cormorant)] text-2xl">
                        {t('dropImageHere')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`space-y-4 transition-opacity duration-400 ${isFocusMode ? 'opacity-10 hover:opacity-100' : 'opacity-80'}`}>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500 flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-amber-500" />
                  {t('dragAndDropHint')}
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
                    {t('addImage')}
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
                              placeholder={t('placeholders.caption')}
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
                              aria-label={t('removeImageAria')}
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
                    {t('tagsLabel')}
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder={t('placeholders.tags')}
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
                      {isUploadingImage ? t('uploadImage') : t('saving')}
                    </>
                  ) : (
                    t('saveThought')
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
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Premium saved confirmation */}
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,234,0.88))] shadow-[0_10px_30px_rgba(43,34,19,0.06)] p-8 md:p-12">
              {/* Decorative golden glow */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#C5A059]/8 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[#D4AF37]/6 blur-3xl" />

              <div className="relative text-center space-y-6">
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C5A059]/20 ring-1 ring-[#C5A059]/20">
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C5A059"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                      />
                    </motion.svg>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="space-y-3"
                >
                  <h2 className="font-headline text-3xl md:text-4xl text-stone-900 tracking-tight">
                    {t('savedThoughtTitle')}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                    <Lock className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>{t('savedThoughtSubtitle')}</span>
                  </div>
                </motion.div>

                {/* Decorative separator */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent"
                />
              </div>
            </div>

            {/* Reflection section */}
            {!reflection ? (
              <AnimatePresence mode="wait">
                {!isGeneratingReflection ? (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,234,0.82))] shadow-[0_10px_30px_rgba(43,34,19,0.06)] p-8 md:p-12 text-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/3 via-transparent to-[#C5A059]/3 pointer-events-none" />
                    <div className="relative space-y-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#C5A059]/10">
                        <Eye className="h-5 w-5 text-[#C5A059]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-headline text-2xl md:text-3xl text-stone-900 tracking-tight">
                          {t('getReflection')}
                        </h3>
                        <p className="text-stone-500 max-w-sm mx-auto leading-relaxed">
                          {t('getReflectionDescription')}
                        </p>
                      </div>
                      <Button
                        onClick={handleRequestReflection}
                        size="lg"
                        className="group h-12 px-8 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 hover:from-[#C5A059] hover:to-[#D4AF37] rounded-2xl shadow-[0_8px_24px_rgba(212,175,55,0.25)] font-semibold transition-all duration-300 hover:shadow-[0_12px_32px_rgba(212,175,55,0.35)] hover:scale-[1.02]"
                      >
                        <Eye className="mr-2 h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                        {t('revealReflection')}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,234,0.82))] shadow-[0_10px_30px_rgba(43,34,19,0.06)] p-8 md:p-12"
                  >
                    <div className="space-y-6 py-4">
                      <ReflectionPulse />
                      <NeuroBreadcrumbs />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <ReflectionResponse
                  reflection={reflection.text}
                  patternsUsed={reflection.patternsUsed}
                />

                {/* Conversation continuation */}
                <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,244,234,0.82))] shadow-[0_10px_30px_rgba(43,34,19,0.06)] p-4 md:rounded-[28px] md:p-8 space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C5A059]/20 flex items-center justify-center">
                        <Eye className="h-3.5 w-3.5 text-[#C5A059]" />
                      </div>
                      <h4 className="truncate font-headline text-base text-stone-900 md:text-lg">
                        {t('continueWithAurum')}
                      </h4>
                    </div>
                    {!isPremium && (
                      <div className="shrink-0 rounded-full border border-stone-200 bg-white/75 px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-stone-500">
                        {aurumRepliesUsed}/{FREE_AURUM_REPLY_LIMIT}
                      </div>
                    )}
                  </div>
                  {!isPremium && (
                    <div className="space-y-1">
                      <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-stone-500 md:block">
                        {conversationProgressLabel}
                      </p>
                      <p className="text-xs text-stone-500 md:text-sm">
                        {conversationRemainingLabel}
                      </p>
                    </div>
                  )}

                  {!isPremium && (
                    <div className="rounded-2xl border border-[#C5A059]/18 bg-[#C5A059]/7 px-3 py-3 md:px-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500 md:text-[11px]">
                        {t('scienceCue.title')}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-700 md:text-sm">
                        {t('scienceCue.body')}
                      </p>
                      <p className="mt-1.5 text-[11px] text-stone-500">
                        {t('scienceCue.source')}
                      </p>
                    </div>
                  )}

                  {conversationTurns.length > 1 && (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {conversationTurns.slice(1).map((turn) => (
                        <motion.div
                          key={turn.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={turn.role === 'user'
                            ? 'ml-auto max-w-[88%] rounded-2xl bg-stone-900 text-stone-50 px-4 py-3 text-sm leading-relaxed'
                            : 'mr-auto max-w-[88%] rounded-2xl bg-[#C5A059]/8 text-stone-800 px-4 py-3 text-sm leading-relaxed border border-[#C5A059]/15'}
                        >
                          {turn.text}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {isConversationLocked ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                      <p className="text-base font-medium text-stone-900">
                        {t('conversationLockedTitle')}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {t('conversationLockedBody')}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setIsPaywallOpen(true)}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 hover:from-[#C5A059] hover:to-[#D4AF37] rounded-xl px-6 font-semibold shadow-[0_6px_18px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(212,175,55,0.3)]"
                        >
                          {t('unlockConversation')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                        {conversationSuggestions.map((starter) => (
                          <button
                            key={starter}
                            type="button"
                            onClick={() => handleSelectConversationStarter(starter)}
                            className="shrink-0 whitespace-nowrap rounded-full border border-stone-200 bg-white/75 px-3 py-1.5 text-[13px] text-stone-700 transition-colors hover:border-[#C5A059]/40 hover:bg-[#C5A059]/8 hover:text-stone-900 md:text-sm"
                          >
                            {starter}
                          </button>
                        ))}
                      </div>
                      <Textarea
                        ref={conversationTextareaRef}
                        value={conversationInput}
                        onChange={(event) => setConversationInput(event.currentTarget.value)}
                        placeholder={t('placeholders.replyToAurum')}
                        className="min-h-[88px] resize-y rounded-2xl border-stone-200 bg-white/60 [font-family:var(--font-cormorant)] text-lg text-stone-800 placeholder:text-stone-400 focus:border-[#C5A059]/30 focus:ring-[#C5A059]/10"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={handleContinueConversation}
                          disabled={isContinuingConversation || !conversationInput.trim()}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 hover:from-[#C5A059] hover:to-[#D4AF37] rounded-xl px-6 font-semibold shadow-[0_6px_18px_rgba(212,175,55,0.2)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(212,175,55,0.3)]"
                        >
                          {isContinuingConversation ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('aurumThinking')}
                            </>
                          ) : (
                            t('send')
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {isContinuingConversation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pt-2"
                          >
                            <NeuroBreadcrumbs className="text-left" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Invitation to write again */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <button
                onClick={handleNewEntry}
                type="button"
                className="group w-full rounded-[28px] border border-dashed border-[#C5A059]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(248,244,234,0.4))] hover:border-[#C5A059]/40 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(248,244,234,0.7))] transition-all duration-500 p-8 md:p-10 text-center cursor-pointer"
              >
                <div className="space-y-3">
                  <p className="font-headline text-xl md:text-2xl text-stone-400 group-hover:text-stone-600 transition-colors duration-500 tracking-tight">
                    {t('anythingElse')}
                  </p>
                  <p className="text-sm text-stone-300 group-hover:text-stone-500 transition-colors duration-500">
                    {t('openNewWritingSpace')}
                  </p>
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      </div>
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </>
  );
}
