
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOneTap } from '@/components/auth/google-one-tap';
import { CookieConsent } from '@/components/legal/CookieConsent';

export const metadata: Metadata = {
  title: 'Aurum | Journal Intime IA & Sanctuaire de Santé Mentale',
  description: 'Allégez votre charge mentale avec Aurum. Un journal sécurisé qui utilise l\'IA pour transformer vos pensées en clarté. Essayez sans compte.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Aurum',
    applicationCategory: ['HealthApplication', 'LifestyleApplication'],
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
        "Analyse de sentiment IA",
        "Chiffrement privé",
        "Journaling guidé"
    ]
  };
  
  return (
    <html lang="fr">
      <head>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Literata:opsz,wght@7..72,400;700&display=swap" rel="stylesheet" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <GoogleOneTap />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
