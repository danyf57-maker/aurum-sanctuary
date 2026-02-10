/**
 * Privacy Policy Page
 * 
 * Explains how data is handled, encrypted, and processed according to GDPR requirements.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
    const lastUpdated = "29 Janvier 2026";

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-serif">Politique de Confidentialité</CardTitle>
                    <p className="text-muted-foreground mt-2">Dernière mise à jour : {lastUpdated}</p>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none mt-8">
                    <section>
                        <h2 className="text-2xl font-serif mt-6">1. Introduction</h2>
                        <p>
                            Chez Aurum Sanctuary, nous pensons que la santé mentale nécessite une confidentialité absolue. Cette politique explique comment nous protégeons vos données grâce à une architecture "Privacy-by-Design".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">2. Données Collectées</h2>
                        <ul>
                            <li><strong>Données de Compte :</strong> Email et informations de profil (stockées de manière sécurisée via Firebase).</li>
                            <li><strong>Entrées de Journal :</strong> Chiffrées sur votre appareil (Client-side Encryption). Nous n'avons pas accès au contenu en clair de manière persistante.</li>
                            <li><strong>Métadonnées :</strong> Fréquence des entrées, durée des sessions (utilisées pour les statistiques "Lite").</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">3. Comment nous utilisons vos données</h2>
                        <p>
                            Vos données sont utilisées exclusivement pour :
                        </p>
                        <ul>
                            <li>Fournir et améliorer les fonctionnalités de l'Application.</li>
                            <li>Générer des réflexions personnalisées via le moteur Aurum (traitement éphémère).</li>
                            <li>Gérer votre abonnement et vos préférences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">4. Architecture de Sécurité</h2>
                        <p>
                            Notre système repose sur trois piliers :
                        </p>
                        <ol>
                            <li><strong>Chiffrement Fort :</strong> Utilisation d'algorithmes standard de l'industrie (AES-256).</li>
                            <li><strong>Admin-Blind :</strong> Les administrateurs système ne peuvent pas déchiffrer votre contenu. Les clés de déchiffrement sont gérées par des services de gestion de clés (KMS) avec des politiques d'accès strictes.</li>
                            <li><strong>Traitement Éphémère :</strong> Lors de l'analyse par le moteur Aurum, le texte est déchiffré uniquement en mémoire vive (RAM) et n'est jamais écrit sur disque en clair.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">5. Vos Droits (RGPD)</h2>
                        <p>
                            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                        </p>
                        <ul>
                            <li><strong>Droit d'accès :</strong> Vous pouvez consulter vos données à tout moment.</li>
                            <li><strong>Droit de rectification :</strong> Vous pouvez modifier vos informations.</li>
                            <li><strong>Droit à l'effacement :</strong> Vous pouvez supprimer votre compte et toutes les données associées instantanément.</li>
                            <li><strong>Portabilité :</strong> Vous pouvez exporter vos données dans un format structuré (Epic 7).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mt-6">6. Conservation des données</h2>
                        <p>
                            Nous conservons vos données tant que votre compte est actif. En cas de suppression de compte, toutes les données chiffrées et métadonnées associées sont définitivement supprimées de nos bases de données actives sous 30 jours (sauvegardes comprises).
                        </p>
                    </section>

                    <section className="mt-12 p-6 bg-slate-100 dark:bg-slate-900 rounded-lg">
                        <p className="text-sm italic">
                            Nous ne vendons JAMAIS vos données personnelles à des tiers. Aurum Sanctuary est financé exclusivement par les abonnements des utilisateurs.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
