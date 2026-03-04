
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M16.9 8.28c-.46-1.2-1.52-2.04-2.8-2.28-1.57-.29-3.13.41-4.11 1.6-1.12 1.36-1.39 3.2-.68 4.8.52 1.18 1.44 2.1 2.65 2.62 1.5.64 3.16.48 4.49-.49.98-.72 1.63-1.88 1.76-3.14.15-1.49-.49-2.99-1.59-3.95-.27-.24-.55-.45-.82-.66zM12.01 16.01c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c1.28 0 2.4.68 3.05 1.71-.31.25-.6.54-.86.86-1.1 1.1-1.74 2.6-1.59 4.21.1 1.05.58 2.02 1.33 2.72-.88.65-1.98 1.01-3.11 1.01-1.02 0-1.99-.36-2.78-1z" />
  </svg>
)

export function Footer() {
  const pathname = usePathname();
  const isFr = pathname.startsWith('/fr');
  const to = (href: string) => {
    if (!href.startsWith('/')) return href;
    if (isFr) return href === '/' ? '/fr' : `/fr${href}`;
    return href;
  };

  return (
    <footer className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 pb-[env(safe-area-inset-bottom)]">
      <div className="container max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-amber-600" />
              <span className="font-bold text-xl font-headline">Aurum</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {isFr ? "Le silence qui t'écoute." : "Silence that listens to you."}
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">{isFr ? "Ressources" : "Resources"}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href={to("/sanctuary/chat")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Parler avec Aurum" : "Talk with Aurum"}</Link></li>
                <li><Link href={to("/sources-citations")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Sources des citations" : "Quote sources"}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">{isFr ? "Offres" : "Offers"}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href={to("/pricing")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Abonnements" : "Subscriptions"}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">{isFr ? "Légal" : "Legal"}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href={to("/terms")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Conditions d'utilisation" : "Terms of Use"}</Link></li>
                <li><Link href={to("/privacy")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Politique de confidentialité" : "Privacy Policy"}</Link></li>
                <li><a href="mailto:contact@aurumdiary.com" className="text-sm text-muted-foreground hover:text-foreground">contact@aurumdiary.com</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">{isFr ? "Compte" : "Account"}</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href={to("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Tableau de bord" : "Dashboard"}</Link></li>
                <li><Link href={to("/settings")} className="text-sm text-muted-foreground hover:text-foreground">{isFr ? "Paramètres & Données" : "Settings & Data"}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-200 dark:border-stone-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Aurum. {isFr ? "Un espace pour toi." : "A space for you."}
          </p>
        </div>
      </div>
    </footer>
  );
}
