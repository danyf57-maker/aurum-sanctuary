
import type { Metadata, Viewport } from 'next';
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

import { Cormorant_Garamond, Inter, Dawning_of_a_New_Day } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dawning = Dawning_of_a_New_Day({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dawning',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aurum | Journal Intime IA & Sanctuaire de Santé Mentale',
  description: 'Allégez votre charge mentale avec Aurum. Un journal sécurisé qui utilise l\'IA pour transformer vos pensées en clarté. Essayez sans compte.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aurum",
  },
  openGraph: {
    title: 'Aurum | Journal Intime IA',
    description: 'Un sanctuaire pour vos pensées. Journal sécurisé et analyses IA.',
    url: 'https://aurum-sanctuary.vercel.app',
    siteName: 'Aurum Sanctuary',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Aurum App Icon',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Aurum | Journal Intime IA',
    description: 'Un sanctuaire pour vos pensées. Journal sécurisé et analyses IA.',
    images: ['/icons/icon-512x512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {/* Le script GSI est maintenant dans GoogleAnalytics.tsx */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          inter.variable,
          cormorant.variable,
          dawning.variable
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
