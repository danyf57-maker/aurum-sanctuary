"use client";

/**
 * Reflection Response Component
 *
 * Displays Aurum's reflection with golden, elegant design.
 * Positioned as a continuation of the entry, not a separate AI response.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReflectionResponseProps {
  reflection: string;
  patternsUsed?: number;
  className?: string;
}

export function ReflectionResponse({
  reflection,
  patternsUsed = 0,
  className,
}: ReflectionResponseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "relative",
          "bg-gradient-to-br from-amber-50 via-amber-50/80 to-white",
          "backdrop-blur-sm",
          "rounded-2xl",
          "border-2 border-amber-300/60",
          "p-8 md:p-10",
          "shadow-lg shadow-amber-100/50"
        )}
      >
        {/* Golden accent line at top */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h3 className="font-headline text-lg text-amber-800 tracking-wide uppercase">
            Réflexion d&apos;Aurum
          </h3>
        </div>

        {/* Reflection text */}
        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-stone-800 font-light">
            {reflection}
          </p>
        </div>

        {/* Subtle footer (patterns used, if any) */}
        {patternsUsed > 0 && (
          <div className="mt-6 pt-6 border-t border-amber-200/50">
            <p className="text-xs text-amber-600/70 italic">
              Ce reflet s&apos;appuie sur {patternsUsed} thème
              {patternsUsed > 1 ? "s" : ""} que tu as déjà exploré
              {patternsUsed > 1 ? "s" : ""}.
            </p>
          </div>
        )}

        {/* Golden glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200/20 via-amber-100/10 to-amber-200/20 rounded-2xl blur-lg -z-10" />
      </div>
    </motion.div>
  );
}
