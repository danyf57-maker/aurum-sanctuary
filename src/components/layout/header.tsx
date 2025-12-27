
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { AuthButton } from '@/components/auth/auth-button';

export function Header() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  // Do not render the header on the homepage to allow for a custom hero header
  if (isHomepage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block">
              Sanctuaire d'Aurum
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/sanctuary"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Sanctuaire
            </Link>
             <Link
              href="/sanctuary/write"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Écrire
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
