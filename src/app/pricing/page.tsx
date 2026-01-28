
'use client';

import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// Les ID de prix sont maintenant chargés depuis les variables d'environnement
const PRICE_ID_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO; 
const PRICE_ID_PREMIUM = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM;

const plans = [
    {
        name: "Essentiel",
        price: "0€",
        period: "/mois",
        description: "Pour commencer votre voyage d'introspection.",
        features: [
            { text: "10 entrées de journal par mois", included: true },
            { text: "5 conversations avec Aurum", included: true },
            { text: "Historique de 1 mois", included: true },
            { text: "Export des données", included: false },
            { text: "Analyses IA approfondies", included: false },
        ],
        cta: "Commencer gratuitement",
        isRecommended: false,
        href: "/sanctuary/write",
        priceId: null,
    },
    {
        name: "Pro",
        price: "19€",
        period: "/mois",
        description: "Pour un engagement profond avec votre monde intérieur.",
        features: [
            { text: "Entrées de journal illimitées", included: true },
            { text: "50 conversations avec Aurum", included: true },
            { text: "Historique complet", included: true },
            { text: "Export des données", included: true },
            { text: "Analyses IA approfondies", included: false },
        ],
        cta: "Choisir Pro",
        isRecommended: true,
        priceId: PRICE_ID_PRO,
    },
    {
        name: "Premium",
        price: "39€",
        period: "/mois",
        description: "L'expérience Aurum ultime, sans aucune limite.",
        features: [
            { text: "Entrées de journal illimitées", included: true },
            { text: "Conversations avec Aurum illimitées", included: true },
            { text: "Historique complet", included: true },
            { text: "Export des données", included: true },
            { text: "Analyses IA approfondies", included: true },
        ],
        cta: "Passer Premium",
        isRecommended: false,
        priceId: PRICE_ID_PREMIUM,
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
    const [isCurrentPlan, setIsCurrentPlan] = useState(false); // Logique à implémenter
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
    const { user } = useAuth();
    const router = useRouter();

    const handleFormAction = async (formData: FormData) => {
        if (!user) {
            router.push('/sanctuary/write'); // ou afficher un modal de connexion
            return;
        }
        await createCheckoutSession(formData);
    };

    return (
        <div className="bg-stone-50/50 min-h-screen">
            <section className="py-24 md:py-32">
                <div className="container max-w-5xl mx-auto text-center animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Trouvez le plan qui vous ressemble</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Que vous commenciez juste à explorer votre monde intérieur ou que vous soyez prêt pour une transformation profonde, Aurum a un plan pour vous.
                    </p>
                </div>
            </section>

            <section className="pb-24 md:pb-32">
                <div className="container max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {plans.map((plan) => (
                            <Card key={plan.name} className={cn(
                                "flex flex-col h-full",
                                { "border-primary border-2 shadow-lg relative": plan.isRecommended }
                            )}>
                                {plan.isRecommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
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
                    <p>Les abonnements sont gérés via Stripe. Vous pouvez annuler à tout moment.</p>
                </div>
            </section>
        </div>
    );
}
