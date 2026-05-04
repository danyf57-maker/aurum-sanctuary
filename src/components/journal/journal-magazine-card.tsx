"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookImage, Calendar, Clock } from "lucide-react";
import { JournalEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedHref } from "@/hooks/use-localized-href";

interface JournalMagazineCardProps {
  entry: JournalEntry;
  index?: number;
  exchangePreview?: React.ReactNode;
}

const LEGACY_ENCRYPTED_TITLES = new Set([
  "Entrée chiffrée",
  "Encrypted entry",
  "Extrait privé",
  "Private excerpt",
]);

const LEGACY_ENCRYPTED_EXCERPTS = new Set([
  "Contenu chiffré",
  "Encrypted content",
  "Un aperçu privé de ton écriture apparaîtra ici.",
  "A private glimpse of your writing will appear here.",
]);

function formatDate(date: Date, locale: "fr" | "en"): { day: string; time: string } {
  const d = new Date(date);
  const culture = locale === "fr" ? "fr-FR" : "en-US";
  const day = d.toLocaleDateString(culture, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(culture, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time };
}

function generateTitle(
  content: string | null,
  encryptedContent: string | null | undefined,
  locale: "fr" | "en",
  storedTitle?: string | null
): string {
  if (storedTitle?.trim() && !LEGACY_ENCRYPTED_TITLES.has(storedTitle.trim())) {
    return storedTitle.trim();
  }
  // If content is null/empty but encryptedContent exists, show encrypted entry title
  const safeContent = content ?? "";
  if (!safeContent && encryptedContent) {
    return locale === "fr" ? "Extrait privé" : "Private excerpt";
  }
  const words = safeContent.split(/\s+/).filter(Boolean);
  if (words.length === 0) return locale === "fr" ? "Entrée" : "Entry";
  return words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");
}

function generateExcerpt(
  content: string | null,
  encryptedContent: string | null | undefined,
  locale: "fr" | "en",
  storedExcerpt?: string | null
): string {
  if (storedExcerpt?.trim() && !LEGACY_ENCRYPTED_EXCERPTS.has(storedExcerpt.trim())) {
    return storedExcerpt.trim();
  }
  const safeContent = content ?? "";
  // If content is null/empty but encryptedContent exists, show placeholder
  if (!safeContent && encryptedContent) {
    return locale === "fr"
      ? "Un aperçu privé de ton écriture apparaîtra ici."
      : "A private glimpse of your writing will appear here.";
  }
  const plain = safeContent.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
  if (!plain) return "";
  if (plain.length <= 150) return plain;
  return `${plain.slice(0, 150).trim()}...`;
}

function normalizeExcerptComparison(value: string): string {
  return value.replace(/\.\.\.$/, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function removeTitleLeadFromExcerpt(title: string, excerpt: string): string {
  if (!title || !excerpt) return excerpt;
  const normalizedTitle = normalizeExcerptComparison(title);
  const normalizedExcerpt = excerpt.replace(/\s+/g, " ").trim();
  const comparisonExcerpt = normalizedExcerpt.toLowerCase();

  if (!normalizedTitle || !comparisonExcerpt.startsWith(normalizedTitle)) {
    return excerpt;
  }

  const trimmed = normalizedExcerpt.slice(normalizedTitle.length).trimStart();
  return trimmed.replace(/^[,.:;!?-]+\s*/, "");
}

function getMoodColor(mood?: string): string {
  switch (mood?.toLowerCase()) {
    case "joyeux":
      return "border-l-yellow-400";
    case "calme":
      return "border-l-blue-400";
    case "anxieux":
      return "border-l-orange-400";
    case "triste":
      return "border-l-indigo-400";
    case "energique":
      return "border-l-green-400";
    case "neutre":
    default:
      return "border-l-stone-300";
  }
}


export function JournalMagazineCard({
  entry,
  index = 0,
  exchangePreview,
}: JournalMagazineCardProps) {
  const locale = useLocale();
  const to = useLocalizedHref();
  const safeLocale = locale === "fr" ? "fr" : "en";
  const { day, time } = formatDate(entry.createdAt, safeLocale);
  const title = generateTitle(entry.content, entry.encryptedContent, safeLocale, entry.title);
  const rawExcerpt = generateExcerpt(entry.content, entry.encryptedContent, safeLocale, entry.excerpt);
  const excerpt = removeTitleLeadFromExcerpt(title, rawExcerpt);
  const coverImage = entry.images?.[0]?.url;
  const [imageError, setImageError] = useState(false);
  const moodBorder = getMoodColor(entry.mood);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={to(`/sanctuary/entry/${entry.id}`)}
        className="group block h-full"
      >
        <Card
          className={`overflow-hidden h-full border-l-4 ${moodBorder} bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-stone-800 dark:bg-stone-900 dark:hover:shadow-stone-950/40`}
        >
          {/* Image à la une */}
          <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden dark:bg-stone-800">
            {coverImage && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt={title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400 dark:text-stone-500">
                <BookImage className="h-12 w-12 opacity-50" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <CardContent className="p-5 space-y-3">
            {/* Date */}
            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-300">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="capitalize">{day}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{time}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-headline text-xl font-semibold text-stone-900 line-clamp-2 group-hover:text-[#C5A059] transition-colors dark:text-stone-100">
              {title}
            </h3>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed dark:text-stone-300">
                {excerpt}
              </p>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {entry.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider font-normal bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  >
                    {tag}
                  </Badge>
                ))}
                {entry.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  >
                    +{entry.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Mood indicator */}
            {entry.mood && (
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500 capitalize dark:text-stone-300">
                  {safeLocale === "fr" ? "Humeur" : "Mood"}:{" "}
                  <span className="font-medium text-stone-700 dark:text-stone-100">
                    {entry.mood}
                  </span>
                </span>
              </div>
            )}
          </CardContent>

          {exchangePreview}
        </Card>
      </Link>
    </motion.div>
    );
}
