'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuth, ALMA_EMAIL } from '@/providers/auth-provider';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1.93 5.54c1.47-1.12 3.4-1.33 5.05-.53 1.5.71 2.55 2.19 2.85 3.86.32 1.83-.35 3.68-1.5 4.9-1.28 1.34-3.21 1.9-5.01 1.45-1.57-.39-2.92-1.42-3.69-2.88-.08-.16-.14-.32-.2-.48-.42-1.09-.59-2.3-.49-3.51.11-1.3.57-2.54 1.34-3.58.12-.16.25-.31.39-.46.33-.35.7-.66 1.1-.91v.02zM12 17.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5 5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" />
  </svg>
)

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0 pt-[calc(env(safe-area-inset-top)+2rem)]">
          <SheetTitle className="sr-only">Menu de navigation principal</SheetTitle>
          <MobileLink
            href="/"
            className="flex items-center"
            onOpenChange={setOpen}
          >
            <Logo className="mr-2 h-6 w-6 text-amber-600" />
            <span className="font-bold font-headline">Aurum</span>
          </MobileLink>
          <div className="my-4 h-[calc(100vh-8rem)] pb-10">
            <div className="flex flex-col space-y-3">
              <MobileLink href="/dashboard" onOpenChange={setOpen} active={pathname === '/dashboard'}>
                Tableau de Bord
              </MobileLink>
              <MobileLink href="/sanctuary/write" onOpenChange={setOpen} active={pathname === '/sanctuary/write'}>
                Écrire
              </MobileLink>
              <MobileLink href="/insights" onOpenChange={setOpen} active={pathname === '/insights'}>
                L'Écho
              </MobileLink>
              <MobileLink href="/sanctuary" onOpenChange={setOpen} active={pathname === '/sanctuary'}>
                Le Caveau
              </MobileLink>
              <MobileLink href="/blog" onOpenChange={setOpen} active={pathname.startsWith('/blog')}>
                Blog
              </MobileLink>
              <MobileLink href="/settings" onOpenChange={setOpen} active={pathname === '/settings'}>
                Paramètres
              </MobileLink>
              {user?.email === ALMA_EMAIL && (
                <MobileLink href="/admin" onOpenChange={setOpen} active={pathname.startsWith('/admin')} className="text-amber-600">
                  Admin
                </MobileLink>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  active,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={`text-lg font-medium transition-colors hover:text-primary ${active ? 'text-primary' : 'text-foreground/70'} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
