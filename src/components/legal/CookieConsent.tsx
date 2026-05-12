
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Cookie } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';

const COOKIE_CONSENT_KEY = 'aurum_cookie_consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const locale = useLocale();
  const isFr = locale === 'fr';
  const to = (href: string) => localizeHref(href, locale);

  useEffect(() => {
    // This effect runs only on the client
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: 'accepted' | 'declined') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent);
    window.dispatchEvent(new Event('aurum:cookie-consent-updated'));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-3 left-3 right-3 z-50 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:bottom-4 sm:left-4 sm:right-4 sm:mx-auto sm:max-w-3xl sm:p-4",
      "data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:slide-out-to-bottom-full data-[visible=true]:slide-in-from-bottom-full",
      "transition-transform duration-500"
    )} data-visible={isVisible}>
      <div className="mx-auto flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Cookie className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:mt-1 sm:h-5 sm:w-5" />
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {isFr
              ? "Cookies essentiels et mesure d'usage nous aident à faire fonctionner Aurum Diary. En continuant, vous acceptez notre "
              : "Essential cookies and product analytics help Aurum Diary run. By continuing, you accept our "}
            <Link href={to("/privacy")} className="underline hover:text-foreground">
              {isFr ? "Politique de Confidentialité" : "Privacy Policy"}
            </Link>.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button
            size="icon"
            aria-label={isFr ? "Accepter les cookies" : "Accept cookies"}
            onClick={() => handleConsent('accepted')}
            className="h-9 w-9 rounded-full"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">{isFr ? "Compris" : "Got it"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
