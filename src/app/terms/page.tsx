/**
 * Terms of Service Page
 * 
 * Legally required document explaining user rights and responsibilities.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
    const lastUpdated = "29 Janvier 2026";

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-serif">Conditions d'Utilisation</CardTitle>
                    <p className="text-muted-foreground mt-2">Dernière mise à jour : {lastUpdated}</p>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none mt-8">
                    <section>
                        <h2 className="text-2xl font-serif mt-6">1. Acceptation des Conditions</h2>
                        <p>
                            En accédant à Aurum Sanctuary ("l'Application"), vous acceptez d'être lié par les présentes Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">2. Description du Service</h2>
                        <p>
                            Aurum Sanctuary est un service de journalisation de santé mentale. Nous fournissons des outils pour capturer vos pensées, analyser vos émotions et générer des reflets basés sur vos entrées.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">3. Confidentialité et Chiffrement</h2>
                        <p>
                            Votre vie privée est notre priorité absolue.
                        </p>
                        <ul>
                            <li><strong>Chiffrement Client :</strong> Vos entrées de journal sont chiffrées sur votre appareil avant d'être envoyées à nos serveurs.</li>
                            <li><strong>Architecture Admin-Blind :</strong> Nous utilisons des mécanismes qui empêchent nos administrateurs d'accéder à la clé de déchiffrement de vos données.</li>
                            <li><strong>Traitement :</strong> L'analyse par le moteur Aurum est effectuée dans un environnement sécurisé où vos données sont temporairement déchiffrées uniquement pour le traitement, sans stockage persistant du contenu en clair.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">4. Responsabilité de l'Utilisateur</h2>
                        <p>
                            Vous êtes responsable de :
                        </p>
                        <ul>
                            <li>Maintenir la confidentialité de vos identifiants de compte.</li>
                            <li>Toute activité se déroulant sous votre compte.</li>
                            <li>Ne pas utiliser le service pour des activités illégales ou nuisibles.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">5. Clause de Non-Responsabilité Médicale</h2>
                        <p className="font-semibold text-amber-700 dark:text-amber-500">
                            IMPORTANT : Aurum Sanctuary n'est pas un service médical ou de santé mentale professionnel.
                        </p>
                        <p>
                            Le contenu généré par le moteur Aurum et les outils de l'Application sont destinés à des fins de réflexion personnelle et de bien-être général. Ils ne remplacent pas les conseils, le diagnostic ou le traitement d'un professionnel de santé. Si vous êtes en situation de crise ou avez besoin d'aide médicale, contactez immédiatement un professionnel qualifié ou les services d'urgence.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">6. Abonnements et Paiements</h2>
                        <p>
                            Certains services peuvent être soumis à un abonnement payant. Les conditions de paiement et d'annulation sont régies par notre partenaire de paiement Stripe.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">7. Modifications des Conditions</h2>
                        <p>
                            Nous nous réservons le droit de modifier ces conditions à tout moment. Nous vous informerons de tout changement important via l'Application ou par email.
                        </p>
                    </section>

                    <section className="mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <p className="text-sm italic">
                            Pour toute question concernant ces conditions, veuillez nous contacter via les paramètres de votre compte.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
