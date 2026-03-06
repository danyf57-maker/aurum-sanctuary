'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LayoutDashboard, PenSquare, BookOpenText, BarChart3, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { LanguageSwitch } from './language-switch';
import { stripLocalePrefix } from '@/i18n/routing';
import { useLocalizedHref } from '@/hooks/use-localized-href';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1.93 5.54c1.47-1.12 3.4-1.33 5.05-.53 1.5.71 2.55 2.19 2.85 3.86.32 1.83-.35 3.68-1.5 4.9-1.28 1.34-3.21 1.9-5.01 1.45-1.57-.39-2.92-1.42-3.69-2.88-.08-.16-.14-.32-.2-.48-.42-1.09-.59-2.3-.49-3.51.11-1.3.57-2.54 1.34-3.58.12-.16.25-.31.39-.46.33-.35.7-.66 1.1-.91v.02zM12 17.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5 5.5 2.47 5.5 5.5-2.47 5.5-5.5 5.5z" />
  </svg>
)

const mobileNavItems = [
  { href: '/dashboard', label: 'Tableau de Bord', helper: 'Vue d’ensemble', icon: LayoutDashboard },
  { href: '/sanctuary/write', label: 'Écrire', helper: 'Nouvelle page', icon: PenSquare },
  { href: '/sanctuary', label: 'Journal', helper: 'Tes entrées', icon: BookOpenText },
  { href: '/sanctuary/magazine', label: 'Magazine', helper: 'Profils & progression', icon: BarChart3 },
  { href: '/insights', label: 'Analyses', helper: 'Clarté guidée', icon: Sparkles },
  { href: '/settings', label: 'Paramètres', helper: 'Compte & données', icon: Settings },
] as const;

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const normalizedPath = stripLocalePrefix(pathname || '/');
  const to = useLocalizedHref();

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return normalizedPath === "/dashboard";
    if (href === "/sanctuary") return normalizedPath === "/sanctuary";
    return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
  };

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 w-10 rounded-xl border border-stone-200 bg-white/90 p-0 text-stone-800 shadow-sm hover:bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-r border-stone-200/80 bg-gradient-to-b from-stone-50 to-white pr-0 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <SheetTitle className="sr-only">Menu de navigation principal</SheetTitle>
          <MobileLink
            href={to('/')}
            className="mb-4 flex items-center rounded-2xl border border-stone-200/80 bg-white px-3 py-2 shadow-sm"
            onOpenChange={setOpen}
          >
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold font-headline text-2xl leading-none">Aurum</span>
          </MobileLink>
          <div className="my-4 h-[calc(100vh-8rem)] pb-10">
            <div className="mb-4 px-3">
              <LanguageSwitch compact />
            </div>
            <div className="flex flex-col space-y-1.5 pr-4">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                Navigation rapide
              </p>
              {mobileNavItems.map((item) => {
                const isActive = isItemActive(item.href);
                return (
                  <MobileLink key={item.href} href={to(item.href)} onOpenChange={setOpen} active={isActive}>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-amber-600" : "text-stone-400")} />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className="mt-0.5 pl-7 text-xs text-stone-500">{item.helper}</span>
                  </MobileLink>
                );
              })}
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
  const to = useLocalizedHref();
  const hrefString = typeof href === 'string' ? href : href.toString();
  const localizedHref = to(hrefString);
  return (
    <Link
      href={localizedHref}
      onClick={() => {
        router.push(localizedHref);
        onOpenChange?.(false);
      }}
      className={cn(
        "relative flex flex-col rounded-2xl border px-3 py-2.5 text-base transition-all",
        active
          ? "border-amber-200/80 bg-white text-stone-900 shadow-sm"
          : "border-transparent text-foreground/70 hover:border-stone-200/80 hover:bg-white/80 hover:text-stone-900",
        className
      )}
      {...props}
    >
      {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-amber-500" aria-hidden />}
      {children}
    </Link>
  );
}
