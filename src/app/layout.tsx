
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import { CookieConsent } from '@/components/legal/CookieConsent';
import { TermsModal } from '@/components/auth/TermsModal';

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
    title: 'Aurum | Transformez le chaos en clarté',
    description: 'Le journal intime privé par excellence. Chiffrement sur votre appareil, IA locale et design apaisant.',
    url: 'https://aurumdiary.com',
    siteName: 'Aurum Sanctuary',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aurum Sanctuary Banner',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurum | Transformez le chaos en clarté',
    description: 'Le journal intime privé par excellence. Chiffrement sur votre appareil.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://aurumdiary.com',
  },
  metadataBase: new URL('https://aurumdiary.com'),
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
          {children}
          <Toaster />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
