'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
  'Analyse Tonale',
  'Détection de Biais',
  'Extraction de Patterns',
  'Synthèse du Reflet',
];

interface ReflectionPulseProps {
  className?: string;
}

export function ReflectionPulse({ className }: ReflectionPulseProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timings = [0, 1500, 3000, 4500];
    const timeouts = timings.map((delay, index) =>
      setTimeout(() => setActiveStep(index), delay)
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {STEPS.map((label, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;

        return (
          <div key={label} className="flex items-center gap-1">
            {/* Connector line (before each circle except the first) */}
            {index > 0 && (
              <motion.div
                className="h-px w-5 origin-left"
                initial={{ scaleX: 0, backgroundColor: '#d6d3d1' }}
                animate={{
                  scaleX: 1,
                  backgroundColor: isCompleted || isActive ? '#fbbf24' : '#d6d3d1',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            )}

            {/* Circle + Label group */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className="rounded-full"
                animate={{
                  width: isActive ? 14 : 10,
                  height: isActive ? 14 : 10,
                  backgroundColor: isCompleted
                    ? '#f59e0b'
                    : isActive
                      ? '#fbbf24'
                      : '#d6d3d1',
                  opacity: isCompleted ? 0.8 : isActive ? 1 : 0.4,
                  scale: isActive ? [1, 1.15, 1] : 1,
                }}
                transition={
                  isActive
                    ? {
                        scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
                        default: { type: 'spring', stiffness: 300, damping: 20 },
                      }
                    : { type: 'spring', stiffness: 300, damping: 20 }
                }
              />
              <motion.span
                className="font-headline text-[10px] tracking-wide whitespace-nowrap"
                animate={{
                  opacity: isActive ? 1 : isCompleted ? 0.5 : 0.3,
                  color: isActive ? '#92400e' : '#78716c',
                  y: isActive ? 0 : 4,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {label}
              </motion.span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
