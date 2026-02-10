'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const BREADCRUMBS = [
  'Scanning emotional context...',
  'Clustering behavioral patterns...',
  'Synthesizing neuro-insights...',
];

interface NeuroBreadcrumbsProps {
  className?: string;
}

export function NeuroBreadcrumbs({ className }: NeuroBreadcrumbsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREADCRUMBS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

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
          {BREADCRUMBS[currentIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
