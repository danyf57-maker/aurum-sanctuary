
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { generateUserInsights } from "@/app/actions";
import { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Lightbulb, Loader2, Target } from "lucide-react";

interface InsightsSectionProps {
    user: UserProfile;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            {pending ? "Analyse en cours..." : "Actualiser mes insights"}
        </Button>
    );
}

export function InsightsSection({ user }: InsightsSectionProps) {
    const [insights, setInsights] = useState(user.insights);
    const { toast } = useToast();

    const handleGenerateInsights = async () => {
        const result = await generateUserInsights();
        if (result?.error) {
            toast({
                title: "Erreur lors de la génération",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Insights actualisés !",
                description: "Une nouvelle perspective sur votre journal a été générée.",
            });
            // We don't have the new insights here, the page will be revalidated
            // and the parent component will re-render with fresh data.
            // We can show a loading state until the new props arrive.
        }
    };

    const formattedDate = insights?.lastUpdatedAt
        ? `Dernière mise à jour le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(insights.lastUpdatedAt))}`
        : "Générez vos premiers insights pour commencer.";

    return (
        <section>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Vos Insights IA</CardTitle>
                    <CardDescription>{formattedDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {insights ? (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-amber-700" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-stone-800">Thème Principal</h4>
                                    <p className="text-muted-foreground">{insights.mainTheme}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <BrainCircuit className="w-5 h-5 text-blue-700" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-stone-800">Schémas Récurrents</h4>
                                    <p className="text-muted-foreground">{insights.recurringPatterns}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-stone-800">Piste de Réflexion</h4>
                                    <p className="text-muted-foreground">{insights.gentleAdvice}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Les insights vous aident à prendre du recul sur vos écrits.</p>
                            <p>Cliquez sur le bouton pour générer votre première analyse.</p>
                        </div>
                    )}

                    <form action={handleGenerateInsights}>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
