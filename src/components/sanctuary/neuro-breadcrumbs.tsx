'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';

const BREADCRUMBS = {
  fr: [
    'Lecture du contexte émotionnel...',
    'Repérage des schémas qui reviennent...',
    'Composition du reflet...',
  ],
  en: [
    'Reading emotional context...',
    'Noticing recurring patterns...',
    'Composing the reflection...',
  ],
} as const;

interface NeuroBreadcrumbsProps {
  className?: string;
}

export function NeuroBreadcrumbs({ className }: NeuroBreadcrumbsProps) {
  const locale = useLocale();
  const breadcrumbs = locale === 'fr' ? BREADCRUMBS.fr : BREADCRUMBS.en;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breadcrumbs.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [breadcrumbs.length]);

  return (
    <div className={cn('h-8 flex items-center justify-center', className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="font-headline text-sm text-stone-400 italic tracking-wide"
        >
          {breadcrumbs[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
