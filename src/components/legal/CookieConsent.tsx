
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';
import type { Locale } from '@/lib/locale';
import { localizeHref } from '@/lib/i18n/path';
import { detectPathLocale } from '@/i18n/routing';

const COOKIE_CONSENT_KEY = 'aurum_cookie_consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const locale: Locale = detectPathLocale(pathname || '/') || 'en';
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
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t",
      "data-[visible=true]:animate-in data-[visible=false]:animate-out data-[visible=false]:slide-out-to-bottom-full data-[visible=true]:slide-in-from-bottom-full",
      "transition-all duration-500"
    )} data-visible={isVisible}>
      <div className="container max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            {isFr
              ? "Nous utilisons des cookies essentiels et certaines technologies d'analyse pour faire fonctionner Aurum Diary, sécuriser votre session et mesurer l'usage du service. En continuant, vous acceptez notre "
              : "We use essential cookies and certain analytics technologies to run Aurum Diary, secure your session, and measure product usage. By continuing, you accept our "}
            <Link href={to("/privacy")} className="underline hover:text-foreground">
              {isFr ? "Politique de Confidentialité" : "Privacy Policy"}
            </Link>.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" onClick={() => handleConsent('accepted')}>
            {isFr ? "Compris" : "Got it"}
          </Button>
        </div>
      </div>
    </div>
  );
}
