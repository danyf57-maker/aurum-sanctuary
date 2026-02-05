
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthButton } from '@/components/auth/auth-button';
import { MobileNav } from './mobile-nav';
import { useAuth, ALMA_EMAIL } from '@/providers/auth-provider';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1.93 5.54c1.47-1.12 3.4-1.33 5.05-.53 1.5.71 2.55 2.19 2.85 3.86.32 1.83-.35 3.68-1.5 4.9-1.28 1.34-3.21 1.9-5.01 1.45-1.57-.39-2.92-1.42-3.69-2.88-.08-.16-.14-.32-.2-.48-.42-1.09-.59-2.3-.49-3.51.11-1.3.57-2.54 1.34-3.58.12-.16.25-.31.39-.46.33-.35.7-.66 1.1-.91v.02zM12 17.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5 5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" />
  </svg>
)

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isHomepage = pathname === '/';

  // Do not render the header on the homepage to allow for a custom hero header
  if (isHomepage) {
    return null;
  }

  const isAdminPage = pathname.startsWith('/admin');
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/sanctuary') || pathname.startsWith('/insights') || pathname.startsWith('/settings');

  if (isAdminPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-[env(safe-area-inset-top)]">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Logo className="h-6 w-6 text-amber-600" />
              </motion.div>
              <span className="font-bold font-headline sm:inline-block">
                Aurum <span className="text-muted-foreground font-normal text-sm">/ Admin</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
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
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Logo className="h-6 w-6 text-amber-600" />
              </motion.div>
              <span className="font-bold font-headline sm:inline-block">
                Aurum
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Tableau de Bord
              </Link>
              <Link
                href="/sanctuary"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Journal
              </Link>
              <Link
                href="/sanctuary/write"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Écrire
              </Link>
              <Link
                href="/blog"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Blog
              </Link>
              {user?.email === ALMA_EMAIL && (
                <Link
                  href="/admin"
                  className="text-amber-600 transition-colors hover:text-amber-500"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        )}

        <MobileNav />

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAppPage && (
            <div className="hidden lg:flex items-center gap-4 mr-4">
               {/* Any specific app header items can go here */}
            </div>
          )}
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
