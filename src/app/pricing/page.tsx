
'use client';

import { Check, X, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
// import { createCheckoutSession } from '@/app/actions/stripe';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/client';

export const dynamic = 'force-dynamic';

// Preferred naming; fallback keeps backward compatibility with existing env vars.
const PRICE_ID_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
const PRICE_ID_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

const plans = [
    {
        name: "Mensuel",
        price: "13€",
        period: "/mois",
        description: "L'accès complet à Aurum, facturé au mois.",
        features: [
            { text: "Entrées de journal illimitées", included: true },
            { text: "Conversations avec Aurum illimitées", included: true },
            { text: "Historique complet", included: true },
            { text: "Export des données", included: true },
            { text: "Reflets approfondis", included: true },
        ],
        cta: "Choisir mensuel",
        isRecommended: false,
        href: "/pricing",
        priceId: PRICE_ID_MONTHLY,
    },
    {
        name: "Annuel",
        price: "129€",
        period: "/an",
        description: "Le même accès complet, avec 2 mois offerts.",
        features: [
            { text: "Entrées de journal illimitées", included: true },
            { text: "Conversations avec Aurum illimitées", included: true },
            { text: "Historique complet", included: true },
            { text: "Export des données", included: true },
            { text: "Reflets approfondis", included: true },
        ],
        cta: "Choisir annuel",
        isRecommended: true,
        href: "/pricing",
        priceId: PRICE_ID_YEARLY,
    }
];

const Feature = ({ text, included }: { text: string, included: boolean }) => (
    <li className="flex items-center gap-3">
        {included ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-muted-foreground" />}
        <span className={cn({ "text-muted-foreground": !included })}>{text}</span>
    </li>
);

function SubscribeButton({ priceId, cta, isRecommended }: { priceId: string | null | undefined, cta: string, isRecommended: boolean }) {
    const { pending } = useFormStatus();
    const isCurrentPlan = false; // TODO: lire le plan actuel user
    const isStripeDisabled = !priceId || priceId.includes('xxx');

    return (
        <Button
            type="submit"
            className={cn("w-full", { "bg-stone-600 text-white hover:bg-stone-700": !isRecommended })}
            size="lg"
            disabled={pending || isCurrentPlan || isStripeDisabled}
        >
            {pending ? <Loader2 className="animate-spin" /> : isCurrentPlan ? 'Plan Actuel' : isStripeDisabled ? 'Bientôt disponible' : cta}
        </Button>
    );
}

export default function PricingPage() {
    const auth = useAuth();
    const user = auth ? auth.user : null;
    const router = useRouter();

    const handleFormAction = async (formData: FormData) => {
        const priceId = String(formData.get('priceId') || '');
        void trackEvent({
            name: "checkout_start",
            params: { priceId, source: "pricing_page" },
        });

        if (!user) {
            router.push('/sanctuary/write'); // ou afficher un modal de connexion
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
                throw new Error(errorData.error || 'Impossible de créer la session de paiement.');
            }

            const { url } = await response.json();
            if (!url) {
                throw new Error('Aucune URL de paiement reçue.');
            }

            window.location.href = url;
        } catch (error) {
            console.error('Failed to start checkout from pricing', error);
        }
    };

    return (
        <div className="bg-stone-50/50 min-h-screen">
            <section className="py-24 md:py-32">
                <div className="container max-w-5xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Choisissez votre formule</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Accès complet à Aurum à partir de 13€/mois, ou 129€/an.
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
                                        Recommandé
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
                                    {plan.priceId ? (
                                        <form action={handleFormAction} className="w-full">
                                            <input type="hidden" name="priceId" value={plan.priceId} />
                                            <SubscribeButton priceId={plan.priceId} cta={plan.cta} isRecommended={plan.isRecommended} />
                                        </form>
                                    ) : (
                                        <Button asChild className="w-full bg-stone-600 text-white hover:bg-stone-700" size="lg">
                                            <Link href={plan.href!}>{plan.cta}</Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="text-center mt-16 text-sm text-muted-foreground">
                    <p>Les abonnements sont gérés via Stripe. Résiliation possible à tout moment.</p>
                </div>
            </section>
        </div>
    );
}
