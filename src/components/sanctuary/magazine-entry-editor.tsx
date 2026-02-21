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

export function MagazineEntryEditor({
  entryId,
  initialContent,
  initialTags,
  images,
  readOnly,
}: MagazineEntryEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAskingAurum, setIsAskingAurum] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasChanges = useMemo(() => {
    return content !== initialContent || tags !== initialTags.join(", ");
  }, [content, initialContent, initialTags, tags]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    scrollToBottom();
  }, [conversation, streamingReply, scrollToBottom]);

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
      router.push("/sanctuary/magazine");
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const onAskAurum = async () => {
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

    setQuestion("");
    setIsAskingAurum(true);
    setStreamingReply("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
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
        body: JSON.stringify({
          content: payload,
          idToken,
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.token) {
              fullText += evt.token;
              setStreamingReply(fullText);
            } else if (evt.replace) {
              fullText = evt.replace;
              setStreamingReply(fullText);
            }
          } catch {
            // skip malformed
          }
        }
      }

      setStreamingReply(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Aurum n'a pas pu répondre.",
        variant: "destructive",
      });
      setStreamingReply(null);
    } finally {
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

  const hasConversation =
    conversation.length > 0 || streamingReply !== null || isAskingAurum;

  return (
    <div className="space-y-8">
      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((image) => (
            <figure
              key={image.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption || image.name || "Image"}
                className="h-auto w-full object-cover"
              />
              {(image.caption || image.name) && (
                <figcaption className="px-3 py-2 text-xs text-stone-500">
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
          className="text-sm font-medium text-stone-700"
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
          className="text-sm font-medium text-stone-700"
        >
          Contenu
        </label>
        <Textarea
          id="entry-content"
          value={content}
          onChange={(event) => setContent(event.currentTarget.value)}
          className="min-h-[360px] text-lg leading-relaxed"
          disabled={readOnly || isSaving || isDeleting}
        />
        {readOnly && (
          <p className="text-xs text-amber-700">
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
          className="bg-stone-900 text-stone-50 hover:bg-stone-800"
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
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3">
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
          "border border-amber-200/50",
          "bg-gradient-to-b from-amber-50/40 via-white to-white",
          "shadow-lg shadow-amber-100/30"
        )}
      >
        {/* Subtle glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200/10 via-transparent to-amber-200/10 rounded-2xl blur-xl -z-10" />

        {/* Header */}
        <div className="px-5 py-4 md:px-7 md:py-5 border-b border-amber-100/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-headline text-lg text-stone-900 tracking-wide">
                Échanges avec Aurum
              </h3>
              <p className="text-xs text-stone-400">
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
            <p className="text-sm text-stone-400 italic text-center py-4">
              Pose une question pour commencer l&apos;échange...
            </p>
          )}

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {conversation.map((turn) => (
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
                        ? "rounded-2xl rounded-br-md bg-stone-900 text-stone-50"
                        : "rounded-2xl rounded-bl-md bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/70 text-stone-900 shadow-sm"
                    )}
                  >
                    {turn.text}
                  </div>
                  {turn.createdAt && (
                    <span className="mt-1 px-1 text-[10px] text-stone-500">
                      {formatTime(turn.createdAt)}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming reply */}
            {streamingReply !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-start"
              >
                <div className="max-w-[92%] md:max-w-[85%] px-4 py-3 text-[15px] leading-7 whitespace-pre-wrap rounded-2xl rounded-bl-md bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300/70 text-stone-900 shadow-sm">
                  {streamingReply || (
                    <span className="inline-flex items-center gap-1.5 text-amber-600">
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
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-amber-100/60 bg-white/80 backdrop-blur-sm px-5 py-3 md:px-7 md:py-4">
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
                "flex-1 resize-none rounded-xl border border-stone-200 bg-stone-50/50",
                "px-4 py-2.5 text-sm leading-relaxed",
                "placeholder:text-stone-400",
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
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
            >
              {isAskingAurum ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-stone-300 text-center">
            Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </p>
        </div>
      </motion.div>
    </div>
  );
}
