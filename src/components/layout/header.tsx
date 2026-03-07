
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthButton } from '@/components/auth/auth-button';
import { MobileNav } from './mobile-nav';
import { LanguageSwitch } from './language-switch';
import { stripLocalePrefix } from '@/i18n/routing';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useTranslations } from 'next-intl';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1.93 5.54c1.47-1.12 3.4-1.33 5.05-.53 1.5.71 2.55 2.19 2.85 3.86.32 1.83-.35 3.68-1.5 4.9-1.28 1.34-3.21 1.9-5.01 1.45-1.57-.39-2.92-1.42-3.69-2.88-.08-.16-.14-.32-.2-.48-.42-1.09-.59-2.3-.49-3.51.11-1.3.57-2.54 1.34-3.58.12-.16.25-.31.39-.46.33-.35.7-.66 1.1-.91v.02zM12 17.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5 5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" />
  </svg>
)

export function Header() {
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tHeader = useTranslations('header');
  const to = useLocalizedHref();
  const normalizedPath = stripLocalePrefix(pathname || '/');
  const isHomepage = normalizedPath === '/';

  // Do not render the header on the homepage to allow for a custom hero header
  if (isHomepage) {
    return null;
  }

  const isAdminPage = normalizedPath.startsWith('/admin');
  const isAppPage = normalizedPath.startsWith('/dashboard') || normalizedPath.startsWith('/sanctuary') || normalizedPath.startsWith('/insights') || normalizedPath.startsWith('/settings');
  const currentSection = normalizedPath.startsWith('/sanctuary/write')
    ? tNav('write')
    : normalizedPath.startsWith('/sanctuary/magazine')
    ? tNav('magazine')
    : normalizedPath.startsWith('/sanctuary')
    ? tNav('journal')
    : normalizedPath.startsWith('/dashboard')
    ? tNav('dashboard')
    : normalizedPath.startsWith('/insights')
    ? tNav('insights')
    : normalizedPath.startsWith('/settings')
    ? tNav('settings')
    : null;

  if (isAdminPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <Link href={to('/')} className="mr-6 flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Logo className="h-6 w-6 text-amber-600" />
              </motion.div>
              <span className="font-bold font-headline sm:inline-block">
                Aurum <span className="text-muted-foreground font-normal text-sm">/ {tHeader('admin')}</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <LanguageSwitch className="hidden sm:inline-flex" compact />
            <AuthButton />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {!isAppPage && (
          <div className="mr-4 hidden md:flex">
            <Link href={to('/')} className="mr-6 flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Logo className="h-6 w-6 text-amber-600" />
              </motion.div>
              <span className="font-bold font-headline sm:inline-block">
                Aurum
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href={to('/sanctuary/write')}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {tHeader('quickWrite')}
              </Link>
              <Link
                href={to('/sanctuary')}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {tHeader('journal')}
              </Link>
              <Link
                href={to('/sanctuary/magazine')}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {tHeader('magazine')}
              </Link>
            </nav>
          </div>
        )}

        <MobileNav />

        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSwitch className="hidden sm:inline-flex" compact />
          {isAppPage && (
            <div className="hidden lg:flex items-center gap-4 mr-4">
              {currentSection && (
                <div className="rounded-full border border-stone-200 bg-stone-100/70 px-3 py-1 text-xs font-medium text-stone-700">
                  {tHeader('activeSection', { section: currentSection })}
                </div>
              )}
            </div>
          )}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
