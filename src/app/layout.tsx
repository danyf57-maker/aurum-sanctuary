
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';
import { MirrorChat } from '@/components/features/MirrorChat';

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
    <html lang="fr" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400&family=Dawning+of+a+New+Day&display=swap" rel="stylesheet" />
        {/* Le script GSI est maintenant dans GoogleAnalytics.tsx */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <TermsModal />
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <div className="relative flex min-h-screen flex-col bg-background" suppressHydrationWarning={true}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsent />
          <MirrorChat />
        </AuthProvider>
      </body>
    </html>
  );
}
