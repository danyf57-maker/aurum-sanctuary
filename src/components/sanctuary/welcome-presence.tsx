'use client';

/**
 * Welcome Presence Screen
 *
 * Appears once per session for premium users.
 * Sets the emotional tone - no metrics, just presence.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePresenceProps {
  userName?: string;
}

export function WelcomePresence({ userName }: WelcomePresenceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if already shown this session
    const shownThisSession = sessionStorage.getItem('aurum_welcome_shown');

    if (!shownThisSession) {
      // Show after brief delay (let page load)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setHasBeenShown(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenShown(true);
    sessionStorage.setItem('aurum_welcome_shown', 'true');
  };

  if (hasBeenShown) {
    return null;
  }

  const firstName = userName?.split(' ')[0] || 'cher explorateur';

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
            onClick={handleDismiss}
          />

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-x-4 top-[20vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
          >
            <div
              className={cn(
                'relative',
                'bg-gradient-to-b from-amber-50/95 via-stone-50/95 to-white/95',
                'backdrop-blur-md',
                'rounded-2xl shadow-2xl',
                'border border-amber-200/40',
                'p-8 md:p-10'
              )}
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="space-y-6 text-center">
                {/* Greeting */}
                <div className="space-y-2">
                  <h2 className="font-headline text-3xl text-stone-900">
                    Bienvenue, {firstName}
                  </h2>
                  <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                </div>

                {/* Message */}
                <div className="space-y-4 text-stone-700 leading-relaxed">
                  <p className="text-lg">
                    Cet espace est le tien.
                  </p>
                  <p className="text-base">
                    Ici, rien ne presse. Rien ne mesure. Aurum t'accompagne, sans te diriger.
                  </p>
                  <p className="text-sm text-stone-500 italic">
                    Écris ce qui demande à être posé. Le reste viendra.
                  </p>
                </div>

                {/* Subtle decoration */}
                <div className="pt-4">
                  <div className="inline-block px-4 py-2 rounded-full bg-amber-100/50 text-amber-800 text-xs font-medium tracking-wide">
                    Présence Premium
                  </div>
                </div>
              </div>

              {/* Golden hour glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/20 via-transparent to-amber-200/20 rounded-2xl blur-xl -z-10" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
