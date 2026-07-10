
'use client';

import { Check, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// import { createCheckoutSession } from '@/app/actions/stripe';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useLocale } from '@/hooks/use-locale';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PricingOfferBlock } from '@/components/marketing/pricing-offer-block';
import { useToast } from '@/hooks/use-toast';
import { TrialExplainerCard } from '@/components/marketing/trial-explainer-card';
import { PUBLIC_PRICING } from '@/lib/billing/config';

export const dynamic = 'force-dynamic';

// Preferred naming; fallback keeps backward compatibility with existing env vars.
const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;
const formatPrice = (amount: number) => `${amount} ${PUBLIC_PRICING.currencySymbol}`;
type BillingPlan = 'monthly' | 'yearly';

const buildPlans = (t: ReturnType<typeof useTranslations>) => [
    {
        name: t("monthly.name"),
        price: formatPrice(PUBLIC_PRICING.monthlyAmount),
        period: t("monthly.period"),
        description: t("monthly.description"),
        features: [
            { text: t("features.entries"), included: true },
            { text: t("features.conversations"), included: true },
            { text: t("features.history"), included: true },
            { text: t("features.export"), included: true },
            { text: t("features.reflections"), included: true },
        ],
        cta: t("monthly.cta"),
        isRecommended: false,
        planKey: 'monthly' as const,
        priceId: PRICE_ID_MONTHLY,
    },
    {
        name: t("yearly.name"),
        price: formatPrice(PUBLIC_PRICING.yearlyAmount),
        period: t("yearly.period"),
        description: t("yearly.description"),
        features: [
            { text: t("features.entries"), included: true },
            { text: t("features.conversations"), included: true },
            { text: t("features.history"), included: true },
            { text: t("features.export"), included: true },
            { text: t("features.reflections"), included: true },
        ],
        cta: t("yearly.cta"),
        isRecommended: true,
        planKey: 'yearly' as const,
        priceId: PRICE_ID_YEARLY,
    }
];

const Feature = ({ text, included }: { text: string, included: boolean }) => (
    <li className="flex items-center gap-3">
        {included ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
        <span className={cn({ "text-muted-foreground": !included })}>{text}</span>
    </li>
);

function SubscribeButton({
    priceId,
    cta,
    isRecommended,
    loading,
    onClick,
}: {
    priceId: string | null | undefined;
    cta: string;
    isRecommended: boolean;
    loading: boolean;
    onClick: () => void;
}) {
    const t = useTranslations("pricing");
    const isStripeDisabled = !priceId || priceId.includes('xxx');

    return (
        <Button
            type="button"
            className={cn("w-full", { "bg-stone-600 text-white hover:bg-stone-700": !isRecommended })}
            size="lg"
            disabled={loading || isStripeDisabled}
            onClick={onClick}
        >
            {loading ? <Loader2 className="animate-spin" /> : isStripeDisabled ? t("comingSoon") : cta}
        </Button>
    );
}

export default function PricingPage() {
    const auth = useAuth();
    const user = auth ? auth.user : null;
    const authLoading = auth ? auth.loading : true;
    const router = useRouter();
    const { toast } = useToast();
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const automaticCheckoutStarted = useRef(false);
    const locale = useLocale();
    const t = useTranslations("pricing");
    const to = useLocalizedHref();
    const plans = useMemo(() => buildPlans(t), [t]);
    const reassurance = t.raw("reassurance.items") as { title: string; body: string }[];
    const faqs = t.raw("faqs") as { question: string; answer: string }[];

    const startCheckout = useCallback(async (planKey: BillingPlan) => {
        const selectedPlan = plans.find((plan) => plan.planKey === planKey);
        const priceId = selectedPlan?.priceId;
        if (!priceId || priceId.includes('xxx')) {
            toast({
                title: t("comingSoon"),
                description: t("checkoutNotConfigured"),
                variant: "destructive",
            });
            return;
        }

        if (!user) {
            const returnPath = to(`/pricing?checkout=${planKey}`);
            router.push(to(`/signup?redirect=${encodeURIComponent(returnPath)}`));
            return;
        }

        setLoadingPriceId(priceId);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ plan: planKey, source: 'pricing_page' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t("checkoutSessionError"));
            }

            const { url } = await response.json();
            if (!url) {
                throw new Error(t("checkoutNoUrl"));
            }

            window.location.href = url;
        } catch (error) {
            console.error('Failed to start checkout from pricing', error);
            toast({
                title: t("checkoutUnavailableTitle"),
                description: t("checkoutUnavailableDescription"),
                variant: "destructive",
            });
        } finally {
            setLoadingPriceId(null);
        }
    }, [plans, router, t, to, toast, user]);

    useEffect(() => {
        if (authLoading || !user || automaticCheckoutStarted.current) return;

        const currentUrl = new URL(window.location.href);
        const pendingPlan = currentUrl.searchParams.get('checkout');
        if (pendingPlan !== 'monthly' && pendingPlan !== 'yearly') return;

        automaticCheckoutStarted.current = true;
        currentUrl.searchParams.delete('checkout');
        window.history.replaceState(
            {},
            '',
            `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
        );
        void startCheckout(pendingPlan);
    }, [authLoading, startCheckout, user]);

    return (
        <div className="bg-stone-50/50 min-h-screen">
            <section className="py-24 md:py-32">
                <div className="container max-w-5xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
                        {t("title")}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="container max-w-7xl mx-auto">
                    <div className="mb-12 flex justify-center">
                        <PricingOfferBlock ctaHref="/pricing#plans" ctaLabel={locale === 'fr' ? 'Voir les formules' : 'See plans'} className="w-full" pagePath="/pricing" />
                    </div>
                    <div className="mx-auto mb-10 max-w-4xl">
                        <TrialExplainerCard namespace="pricing" />
                    </div>
                    <div id="plans" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={cn(
                                "flex flex-col h-full",
                                { "border-primary border-2 shadow-lg relative": plan.isRecommended }
                            )}>
                                {plan.isRecommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <Compass className="h-4 w-4" />
                                        {t("recommended")}
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="flex items-baseline gap-2 pt-4">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                    {locale === 'fr' && (
                                        <p className="text-xs text-muted-foreground">
                                            {t("taxIncluded")}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-4">
                                        {plan.features.map(feature => (
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
                                            onClick={() => void startCheckout(plan.planKey)}
                                        />
                                        {!plan.priceId && (
                                            <p className="mt-2 text-center text-xs text-stone-500">
                                                {t("offerPending")}
                                            </p>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
                        {reassurance.map((item) => (
                            <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                                <h2 className="font-headline text-xl text-stone-900">{item.title}</h2>
                                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                        <h2 className="mb-6 text-center font-headline text-3xl text-stone-900">
                            {t("faqTitle")}
                        </h2>
                        <div className="divide-y divide-stone-200 border-y border-stone-200">
                            {faqs.map((faq) => (
                                <details key={faq.question} className="group py-4">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-stone-900">
                                        <span>{faq.question}</span>
                                        <span className="text-xl leading-none text-stone-400 transition-transform group-open:rotate-45">+</span>
                                    </summary>
                                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-center mt-16 text-sm text-muted-foreground">
                    <p>{t("stripeNote")}</p>
                </div>
            </section>
        </div>
    );
}
