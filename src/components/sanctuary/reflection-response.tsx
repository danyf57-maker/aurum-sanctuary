'use client';

/**
 * Reflection Response Component
 *
 * Displays Aurum's reflection with gentle, spacious design.
 * Not a chat bubble - more like a presence speaking.
 */

import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      <div
        className={cn(
          'relative',
          'bg-gradient-to-br from-amber-50/80 via-stone-50/60 to-white/90',
          'backdrop-blur-sm',
          'rounded-2xl',
          'border border-amber-200/30',
          'p-8 md:p-10',
          'shadow-lg shadow-stone-200/50'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-amber-100/60">
            <Eye className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="font-headline text-xl text-stone-900">Reflet</h3>
        </div>

        {/* Reflection text */}
        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-stone-800 font-light">
            {reflection}
          </p>
        </div>

        {/* Subtle footer (patterns used, if any) */}
        {patternsUsed > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-200/50">
            <p className="text-xs text-stone-400 italic">
              Ce reflet s'appuie sur {patternsUsed} thème{patternsUsed > 1 ? 's' : ''} que
              tu as déjà exploré{patternsUsed > 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* Golden glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200/10 via-transparent to-amber-200/10 rounded-2xl blur-lg -z-10" />
      </div>
    </motion.div>
  );
}
