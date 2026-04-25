"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Send, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateJournalEntry, deleteJournalEntry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore as clientDb } from "@/lib/firebase/web-client";
import { cn } from "@/lib/utils";
import { useLocalizedHref } from "@/hooks/use-localized-href";
import { useLocale } from '@/hooks/use-locale';
import { extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";

type EntryImage = {
  id: string;
  url: string;
  caption?: string;
  name?: string;
};

type ConversationTurn = {
  id: string;
  role: "user" | "aurum";
  text: string;
  createdAt?: Date;
};

type PendingConversationTurn = ConversationTurn & {
  pending?: boolean;
};

const AURUM_CHAT_IDLE_TIMEOUT_MS = 22000;

interface MagazineEntryEditorProps {
  entryId: string;
  initialContent: string;
  initialTags: string[];
  images: EntryImage[];
  readOnly: boolean;
}

function formatTime(date?: Date) {
  if (!date) return null;
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAurumChatError(error: unknown, didTimeout: boolean): string {
  if (didTimeout || (error instanceof Error && error.name === "AbortError")) {
    return "Aurum prend plus de temps que prévu. Réessaie dans quelques instants.";
  }

  if (!(error instanceof Error)) {
    return "Aurum n'a pas pu répondre.";
  }

  if (
    error.message.includes("Aurum's reply was interrupted") ||
    error.message.includes("La réponse d'Aurum a été interrompue")
  ) {
    return "La réponse d'Aurum a été interrompue. Réessaie dans un instant.";
  }

  if (error.message.includes("Aurum could not reply")) {
    return "Aurum n'a pas pu répondre. Réessaie dans un instant.";
  }

  return error.message;
}

export function MagazineEntryEditor({
  entryId,
  initialContent,
  initialTags,
  images,
  readOnly,
}: MagazineEntryEditorProps) {
  const router = useRouter();
  const to = useLocalizedHref();
  const locale = useLocale();
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAskingAurum, setIsAskingAurum] = useState(false);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [pendingUserTurn, setPendingUserTurn] = useState<PendingConversationTurn | null>(null);
  const [pendingAurumTurn, setPendingAurumTurn] = useState<PendingConversationTurn | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const askInFlightRef = useRef(false);

  const hasChanges = useMemo(() => {
    return content !== initialContent || tags !== initialTags.join(", ");
  }, [content, initialContent, initialTags, tags]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    scrollToBottom();
  }, [conversation, pendingUserTurn, pendingAurumTurn, scrollToBottom]);

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuestion(e.currentTarget.value);
      const el = e.currentTarget;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    },
    []
  );

  const onSave = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      const result = await updateJournalEntry(entryId, { content, tags });
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mise à jour réussie",
        description: "Ton entrée a été mise à jour.",
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (readOnly) return;
    const confirmed = window.confirm("Supprimer définitivement cette entrée ?");
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await deleteJournalEntry(entryId);
      if (result.error) {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Entrée supprimée",
        description: "L'entrée a été retirée du journal.",
      });
      router.push(to("/sanctuary"));
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const onAskAurum = async () => {
    if (askInFlightRef.current || isAskingAurum) return;

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Reconnecte-toi pour demander l'avis d'Aurum.",
        variant: "destructive",
      });
      return;
    }
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    askInFlightRef.current = true;
    const now = new Date();
    const optimisticUserTurn: PendingConversationTurn = {
      id: `pending-user-${Date.now()}`,
      role: "user",
      text: cleanQuestion,
      createdAt: now,
      pending: true,
    };
    const optimisticAurumTurn: PendingConversationTurn = {
      id: `pending-aurum-${Date.now()}`,
      role: "aurum",
      text: "",
      createdAt: now,
      pending: true,
    };

    setPendingUserTurn(optimisticUserTurn);
    setPendingAurumTurn(optimisticAurumTurn);
    setQuestion("");
    setIsAskingAurum(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let didTimeout = false;
    let idleTimeout: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();
    const resetIdleTimeout = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, AURUM_CHAT_IDLE_TIMEOUT_MS);
    };
    const clearIdleTimeout = () => {
      if (idleTimeout) {
        clearTimeout(idleTimeout);
        idleTimeout = null;
      }
    };

    try {
      resetIdleTimeout();
      const idToken = await user.getIdToken();
      const payload = [
        "Voici mon entrée de journal:",
        content,
        "",
        "Ma question à Aurum:",
        cleanQuestion,
      ].join("\n");

      const response = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          content: payload,
          idToken,
          locale,
          entryId,
          userMessage: cleanQuestion,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Aurum n'a pas pu répondre.");
      }

      if (!response.body) throw new Error("Réponse vide");

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let sseRemainder = "";

      const handleSseMessage = (message: string) => {
        let evt: { token?: string; replace?: string; error?: string };
        try {
          evt = JSON.parse(message);
        } catch {
          return;
        }

        if (evt.error) {
          throw new Error(evt.error);
        }

        if (evt.token) {
          fullText += evt.token;
          setPendingAurumTurn((current) =>
            current
              ? {
                  ...current,
                  text: fullText,
                }
              : current
          );
        } else if (evt.replace) {
          fullText = evt.replace;
          setPendingAurumTurn((current) =>
            current
              ? {
                  ...current,
                  text: fullText,
                }
              : current
          );
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resetIdleTimeout();
        const chunk = decoder.decode(value, { stream: true });
        const parsed = extractSseDataMessages(sseRemainder, chunk);
        sseRemainder = parsed.remainder;
        parsed.messages.forEach(handleSseMessage);
      }

      flushSseDataMessages(sseRemainder).forEach(handleSseMessage);
    } catch (error) {
      toast({
        title: "Erreur",
        description: normalizeAurumChatError(error, didTimeout),
        variant: "destructive",
      });
      setPendingAurumTurn(null);
    } finally {
      clearIdleTimeout();
      askInFlightRef.current = false;
      setIsAskingAurum(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !isAskingAurum) {
        onAskAurum();
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setConversation([]);
      return;
    }

    const conversationRef = collection(
      clientDb,
      "users",
      user.uid,
      "entries",
      entryId,
      "aurumConversation"
    );
    const q = query(conversationRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turns = snapshot.docs.map((doc) => {
        const data = doc.data() as {
          role?: string;
          text?: string;
          createdAt?: { toDate?: () => Date };
        };
        return {
          id: doc.id,
          role: data.role === "user" ? "user" : "aurum",
          text: String(data.text || ""),
          createdAt: data.createdAt?.toDate?.(),
        } as ConversationTurn;
      });
      setConversation(turns);
    });

    return () => unsubscribe();
  }, [entryId, user]);

  useEffect(() => {
    if (
      pendingUserTurn &&
      conversation.some(
        (turn) => turn.role === "user" && turn.text.trim() === pendingUserTurn.text.trim()
      )
    ) {
      setPendingUserTurn(null);
    }

    if (
      pendingAurumTurn &&
      pendingAurumTurn.text.trim().length > 0 &&
      conversation.some(
        (turn) => turn.role === "aurum" && turn.text.trim() === pendingAurumTurn.text.trim()
      )
    ) {
      setPendingAurumTurn(null);
    }
  }, [conversation, pendingUserTurn, pendingAurumTurn]);

  const displayedConversation = useMemo(() => {
    const turns: PendingConversationTurn[] = [...conversation];

    if (
      pendingUserTurn &&
      !turns.some(
        (turn) => turn.role === "user" && turn.text.trim() === pendingUserTurn.text.trim()
      )
    ) {
      turns.push(pendingUserTurn);
    }

    if (
      pendingAurumTurn &&
      !turns.some(
        (turn) => turn.role === "aurum" && turn.text.trim() === pendingAurumTurn.text.trim()
      )
    ) {
      turns.push(pendingAurumTurn);
    }

    return turns;
  }, [conversation, pendingUserTurn, pendingAurumTurn]);

  const hasConversation =
    displayedConversation.length > 0 || isAskingAurum;

  return (
    <div className="space-y-8">
      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((image) => (
            <figure
              key={image.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption || image.name || "Image"}
                className="h-auto w-full object-cover"
              />
              {(image.caption || image.name) && (
                <figcaption className="px-3 py-2 text-xs text-stone-500 dark:text-stone-300">
                  {image.caption || image.name}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-2">
        <label
          htmlFor="entry-tags"
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Étiquettes
        </label>
        <Input
          id="entry-tags"
          value={tags}
          onChange={(event) => setTags(event.currentTarget.value)}
          placeholder="gratitude, travail, famille..."
          disabled={readOnly || isSaving || isDeleting}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <label
          htmlFor="entry-content"
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Contenu
        </label>
        <Textarea
          id="entry-content"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          className="min-h-[360px] text-lg leading-relaxed dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-400"
          disabled={readOnly || isSaving || isDeleting}
        />
        {readOnly && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Cette entrée est au format chiffré legacy et n&apos;est pas éditable
            ici.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={onSave}
          disabled={readOnly || !hasChanges || isSaving || isDeleting}
          className="bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          disabled={readOnly || isSaving || isDeleting}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suppression...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </>
          )}
        </Button>
      </div>

      {/* Golden separator */}
      <div className="relative py-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 dark:bg-stone-900">
          <Flame className="h-4 w-4 text-amber-400" />
        </div>
      </div>

      {/* Aurum Conversation Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden",
          "rounded-2xl",
          "border border-amber-200/50 dark:border-amber-900/45",
          "bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-950",
          "shadow-lg shadow-amber-100/30 dark:shadow-stone-950/40"
        )}
      >
        {/* Subtle glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200/10 via-transparent to-amber-200/10 rounded-2xl blur-xl -z-10 dark:from-amber-600/10 dark:to-amber-600/10" />

        {/* Header */}
        <div className="px-5 py-4 md:px-7 md:py-5 border-b border-amber-100/60 dark:border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-headline text-lg text-stone-900 tracking-wide dark:text-stone-100">
                Échanges avec Aurum
              </h3>
              <p className="text-xs text-stone-400 dark:text-stone-300">
                Ton compagnon de réflexion
              </p>
            </div>
          </div>
        </div>

        {/* Conversation area */}
        <div
          className={cn(
            "px-5 md:px-7 overflow-y-auto scroll-smooth",
            hasConversation ? "max-h-[420px] py-5" : "py-3"
          )}
        >
          {!hasConversation && (
            <p className="text-sm text-stone-400 italic text-center py-4 dark:text-stone-300">
              Pose une question pour commencer l&apos;échange...
            </p>
          )}

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {displayedConversation.map((turn) => (
                <motion.div
                  key={turn.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "flex flex-col",
                    turn.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] md:max-w-[85%] px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap",
                      turn.role === "user"
                        ? "rounded-2xl rounded-br-md bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950"
                        : "rounded-2xl rounded-bl-md bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/70 text-stone-900 shadow-sm dark:from-amber-950 dark:to-stone-900 dark:border-amber-800/70 dark:text-amber-50"
                    )}
                  >
                    {turn.role === "aurum" && turn.pending && !turn.text ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </span>
                    ) : (
                      turn.text
                    )}
                  </div>
                  {turn.createdAt && (
                    <span className="mt-1 px-1 text-[10px] text-stone-500 dark:text-stone-300">
                      {formatTime(turn.createdAt)}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-amber-100/60 bg-white/80 backdrop-blur-sm px-5 py-3 dark:border-amber-900/40 dark:bg-stone-950/80 md:px-7 md:py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Écris à Aurum..."
              disabled={isAskingAurum}
              rows={1}
              className={cn(
                "flex-1 resize-none rounded-xl border border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-900",
                "px-4 py-2.5 text-sm leading-relaxed dark:text-stone-100",
                "placeholder:text-stone-400 dark:placeholder:text-stone-400",
                "focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            />
            <button
              onClick={onAskAurum}
              disabled={isAskingAurum || !question.trim()}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "transition-all duration-200",
                question.trim() && !isAskingAurum
                  ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-200/50 hover:shadow-lg hover:shadow-amber-200/60 hover:scale-105 active:scale-95"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed dark:bg-stone-800 dark:text-stone-500"
              )}
            >
              {isAskingAurum ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-stone-300 text-center dark:text-stone-400">
            Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </p>
        </div>
      </motion.div>
    </div>
  );
}
