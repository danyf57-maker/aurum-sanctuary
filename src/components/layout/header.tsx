
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from '@/components/auth/auth-button';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.41,8.37a2.4,2.4,0,0,0-3.32,2.83,2.4,2.4,0,0,0,3.32-2.83m-1.2,3.32A1.2,1.2,0,1,1,12,10.5,1.2,1.2,0,0,1,11.21,11.69" />
        <path d="M19.5,12a7.5,7.5,0,1,0-9,7.21,1,1,0,0,0,1.41-1.41A5.5,5.5,0,1,1,17,12a1,1,0,0,0,0-2,7.42,7.42,0,0,0-1.55.2V7.5a1,1,0,0,0-2,0v1.1a7.5,7.5,0,0,0-7.42,6.4,1,1,0,0,0,1,1.1H8.5a1,1,0,0,0,1-1,5.5,5.5,0,0,1,10,0,1,1,0,0,0,1,1h.33A1,1,0,0,0,22,15a7.5,7.5,0,0,0-2.5-5.54" />
    </svg>
)

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
            <Logo className="h-6 w-6 text-foreground" />
            <span className="font-bold font-headline sm:inline-block">
              Sanctuaire
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
             <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Blog
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
