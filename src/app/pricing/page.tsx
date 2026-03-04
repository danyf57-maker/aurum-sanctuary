'use client';

import { useMemo, useState } from 'react';
import { Check, X, Compass, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { usePathname, useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/client';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

type UiCopy = {
  title: string;
  subtitle: string;
  back: string;
  recommended: string;
  monthlyName: string;
  monthlyPeriod: string;
  monthlyDesc: string;
  yearlyName: string;
  yearlyPeriod: string;
  yearlyDesc: string;
  featureEntries: string;
  featureConversations: string;
  featureHistory: string;
  featureExport: string;
  featureReflections: string;
  ctaMonthly: string;
  ctaYearly: string;
  comingSoon: string;
  comingSoonDescription: string;
  offerPreparing: string;
  paymentUnavailable: string;
  paymentUnavailableDescription: string;
  stripeNote: string;
};

const COPY: Record<'fr' | 'en', UiCopy> = {
  fr: {
    title: 'Choisis ton offre',
    subtitle: 'Accès complet à Aurum dès 13€/mois ou 129€/an.',
    back: '← Retour à l’accueil',
    recommended: 'Recommandé',
    monthlyName: 'Mensuel',
    monthlyPeriod: '/mois',
    monthlyDesc: 'Accès complet à Aurum, facturé au mois.',
    yearlyName: 'Annuel',
    yearlyPeriod: '/an',
    yearlyDesc: 'Le même accès complet, avec 2 mois offerts.',
    featureEntries: 'Entrées de journal illimitées',
    featureConversations: 'Conversations avec Aurum illimitées',
    featureHistory: 'Historique complet',
    featureExport: 'Export des données',
    featureReflections: 'Reflets approfondis',
    ctaMonthly: 'Choisir mensuel',
    ctaYearly: 'Choisir annuel',
    comingSoon: 'Bientôt disponible',
    comingSoonDescription: "Cette option n'est pas encore configurée.",
    offerPreparing: 'Offre en préparation. Contacte-nous sur aurumdiary.com pour être prévenu.',
    paymentUnavailable: 'Paiement indisponible',
    paymentUnavailableDescription: "Impossible d'ouvrir Stripe pour le moment. Réessaie dans quelques secondes.",
    stripeNote: 'Les abonnements sont gérés via Stripe. Résiliation possible à tout moment.',
  },
  en: {
    title: 'Choose your plan',
    subtitle: 'Full Aurum access from €13/month or €129/year.',
    back: '← Back to homepage',
    recommended: 'Recommended',
    monthlyName: 'Monthly',
    monthlyPeriod: '/month',
    monthlyDesc: 'Full Aurum access, billed monthly.',
    yearlyName: 'Yearly',
    yearlyPeriod: '/year',
    yearlyDesc: 'Same full access, with 2 months free.',
    featureEntries: 'Unlimited journal entries',
    featureConversations: 'Unlimited conversations with Aurum',
    featureHistory: 'Full history',
    featureExport: 'Data export',
    featureReflections: 'In-depth reflections',
    ctaMonthly: 'Choose monthly',
    ctaYearly: 'Choose yearly',
    comingSoon: 'Coming soon',
    comingSoonDescription: "This pricing option isn't configured yet.",
    offerPreparing: 'Offer in preparation. Contact us on aurumdiary.com to get notified.',
    paymentUnavailable: 'Payment unavailable',
    paymentUnavailableDescription: 'Unable to open Stripe right now. Please retry in a moment.',
    stripeNote: 'Subscriptions are handled by Stripe. Cancel anytime.',
  },
};

function buildPlans(copy: UiCopy) {
  return [
    {
      name: copy.monthlyName,
      price: '13€',
      period: copy.monthlyPeriod,
      description: copy.monthlyDesc,
      features: [
        { text: copy.featureEntries, included: true },
        { text: copy.featureConversations, included: true },
        { text: copy.featureHistory, included: true },
        { text: copy.featureExport, included: true },
        { text: copy.featureReflections, included: true },
      ],
      cta: copy.ctaMonthly,
      isRecommended: false,
      priceId: PRICE_ID_MONTHLY,
    },
    {
      name: copy.yearlyName,
      price: '129€',
      period: copy.yearlyPeriod,
      description: copy.yearlyDesc,
      features: [
        { text: copy.featureEntries, included: true },
        { text: copy.featureConversations, included: true },
        { text: copy.featureHistory, included: true },
        { text: copy.featureExport, included: true },
        { text: copy.featureReflections, included: true },
      ],
      cta: copy.ctaYearly,
      isRecommended: true,
      priceId: PRICE_ID_YEARLY,
    },
  ];
}

const Feature = ({ text, included }: { text: string; included: boolean }) => (
  <li className="flex items-center gap-3">
    {included ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
    <span className={cn({ 'text-muted-foreground': !included })}>{text}</span>
  </li>
);

function SubscribeButton({
  priceId,
  cta,
  isRecommended,
  loading,
  onClick,
  comingSoon,
}: {
  priceId: string | null | undefined;
  cta: string;
  isRecommended: boolean;
  loading: boolean;
  onClick: () => void;
  comingSoon: string;
}) {
  const isStripeDisabled = !priceId || priceId.includes('xxx');

  return (
    <Button
      type="button"
      className={cn('w-full', { 'bg-stone-600 text-white hover:bg-stone-700': !isRecommended })}
      size="lg"
      disabled={loading || isStripeDisabled}
      onClick={onClick}
    >
      {loading ? <Loader2 className="animate-spin" /> : isStripeDisabled ? comingSoon : cta}
    </Button>
  );
}

export default function PricingPage() {
  const auth = useAuth();
  const user = auth ? auth.user : null;
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const isFr = pathname.startsWith('/fr');
  const locale: 'fr' | 'en' = isFr ? 'fr' : 'en';
  const copy = COPY[locale];
  const plans = useMemo(() => buildPlans(copy), [copy]);
  const to = (href: string) => (locale === 'fr' ? `/fr${href}` : href);

  const startCheckout = async (priceId: string | null | undefined) => {
    if (!priceId || priceId.includes('xxx')) {
      toast({
        title: copy.comingSoon,
        description: copy.comingSoonDescription,
        variant: 'destructive',
      });
      return;
    }

    setLoadingPriceId(priceId);
    void trackEvent({
      name: 'checkout_start',
      params: { priceId, source: 'pricing_page', locale },
    });

    if (!user) {
      router.push(to('/login'));
      setLoadingPriceId(null);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to create checkout session.');
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No checkout URL received.');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout from pricing', error);
      toast({
        title: copy.paymentUnavailable,
        description: copy.paymentUnavailableDescription,
        variant: 'destructive',
      });
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-5xl mx-auto text-center animate-fade-in">
          <div className="mb-6">
            <Link href={to('/')} className="inline-flex items-center text-sm font-medium text-stone-600 hover:text-stone-900">
              {copy.back}
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{copy.subtitle}</p>
        </div>
      </section>

      <section id="plans" className="pb-24 md:pb-32">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn('flex flex-col h-full', {
                  'border-primary border-2 shadow-lg relative': plan.isRecommended,
                })}
              >
                {plan.isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    {copy.recommended}
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-2 pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <Feature key={feature.text} {...feature} />
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <SubscribeButton
                      priceId={plan.priceId}
                      cta={plan.cta}
                      isRecommended={plan.isRecommended}
                      loading={loadingPriceId === plan.priceId}
                      comingSoon={copy.comingSoon}
                      onClick={() => void startCheckout(plan.priceId)}
                    />
                    {!plan.priceId && (
                      <p className="mt-2 text-center text-xs text-stone-500">{copy.offerPreparing}</p>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p>{copy.stripeNote}</p>
        </div>
      </section>
    </div>
  );
}
