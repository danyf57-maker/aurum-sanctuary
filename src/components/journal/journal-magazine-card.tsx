"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookImage, Calendar, Clock } from "lucide-react";
import { JournalEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface JournalMagazineCardProps {
  entry: JournalEntry;
  index?: number;
}

function formatDate(date: Date): { day: string; time: string } {
  const d = new Date(date);
  const day = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time };
}

function generateTitle(content: string): string {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Entrée";
  return words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");
}

function generateExcerpt(content: string, maxLength = 150): string {
  const plain = content.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
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

function getSentimentBadge(sentiment?: string): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (sentiment?.toLowerCase()) {
    case "positive":
      return { label: "Positif", variant: "default" };
    case "negative":
      return { label: "Négatif", variant: "destructive" };
    case "neutral":
    default:
      return { label: "Neutre", variant: "secondary" };
  }
}

export function JournalMagazineCard({
  entry,
  index = 0,
}: JournalMagazineCardProps) {
  const { day, time } = formatDate(entry.createdAt);
  const title = generateTitle(entry.content);
  const excerpt = generateExcerpt(entry.content);
  const coverImage = entry.images?.[0]?.url;
  const moodBorder = getMoodColor(entry.mood);
  const sentimentBadge = getSentimentBadge(entry.sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/sanctuary/entry/${entry.id}`}
        className="group block h-full"
      >
        <Card
          className={`overflow-hidden h-full border-l-4 ${moodBorder} bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
        >
          {/* Image à la une */}
          <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-400">
                <BookImage className="h-12 w-12 opacity-50" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Sentiment badge */}
            <div className="absolute top-3 right-3">
              <Badge
                variant={sentimentBadge.variant}
                className="text-xs shadow-sm"
              >
                {sentimentBadge.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-5 space-y-3">
            {/* Date */}
            <div className="flex items-center gap-3 text-xs text-stone-500">
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
            <h3 className="font-headline text-xl font-semibold text-stone-900 line-clamp-2 group-hover:text-[#C5A059] transition-colors">
              {title}
            </h3>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed">
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
                    className="text-[10px] uppercase tracking-wider font-normal bg-stone-50"
                  >
                    {tag}
                  </Badge>
                ))}
                {entry.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal bg-stone-50"
                  >
                    +{entry.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Mood indicator */}
            {entry.mood && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-xs text-stone-500 capitalize">
                  Humeur:{" "}
                  <span className="font-medium text-stone-700">
                    {entry.mood}
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
