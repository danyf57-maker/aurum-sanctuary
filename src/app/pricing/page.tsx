
'use client';

import { Check, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// import { createCheckoutSession } from '@/app/actions/stripe';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/client';
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

// Preferred naming; fallback keeps backward compatibility with existing env vars.
const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

const buildPlans = (t: ReturnType<typeof useTranslations>) => [
    {
        name: t("monthly.name"),
        price: "13€",
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
        priceId: PRICE_ID_MONTHLY,
    },
    {
        name: t("yearly.name"),
        price: "129€",
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
    const router = useRouter();
    const { toast } = useToast();
    const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
    const locale = useLocale();
    const t = useTranslations("pricing");
    const to = (href: string) => localizeHref(href, locale);
    const plans = buildPlans(t);

    const startCheckout = async (priceId: string | null | undefined) => {
        if (!priceId || priceId.includes('xxx')) {
            toast({
                title: t("comingSoon"),
                description: t("checkoutNotConfigured"),
                variant: "destructive",
            });
            return;
        }

        setLoadingPriceId(priceId);
        void trackEvent({
            name: "checkout_start",
            params: { priceId, source: "pricing_page" },
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
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ priceId }),
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
    };

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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
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
                                            onClick={() => void startCheckout(plan.priceId)}
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
                </div>
                <div className="text-center mt-16 text-sm text-muted-foreground">
                    <p>{t("stripeNote")}</p>
                </div>
            </section>
        </div>
    );
}
