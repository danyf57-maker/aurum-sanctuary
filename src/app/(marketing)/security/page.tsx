'use client';

import React from 'react';
import { ShieldCheck, Lock, Fingerprint, EyeOff, Key, Database, Server, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SecurityBadge = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-stone-100 shadow-sm transition-all hover:shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-headline mb-3 text-stone-900">{title}</h3>
        <p className="text-sm text-stone-500 font-light leading-relaxed">
            {description}
        </p>
    </div>
);

export default function SecurityPage() {
    const securityFaqs = [
        {
            question: "Est-ce qu'Aurum peut lire mes entrées ?",
            answer: "Non. Grâce à notre architecture Zero-Knowledge, vos données sont chiffrées sur votre appareil (navigateur ou application mobile) avec une clé dérivée de votre passphrase. Le serveur ne reçoit que des données chiffrées ('ciphertext') qu'il est incapable de déchiffrer."
        },
        {
            question: "Qu'est-ce que le chiffrement AES-256 ?",
            answer: "L'Advanced Encryption Standard (AES) avec une clé de 256 bits est le standard de chiffrement le plus robuste utilisé par les gouvernements et les institutions bancaires mondiales. Il est considéré comme inviolable par les capacités de calcul actuelles."
        },
        {
            question: "Où sont stockées mes données ?",
            answer: "Vos données chiffrées sont stockées sur des serveurs sécurisés en Europe (Google Cloud / Firebase). Cependant, sans votre passphrase, ces données sont des suites de caractères aléatoires inutilisables."
        },
        {
            question: "Que se passe-t-il si j'oublie ma passphrase ?",
            answer: "Comme nous ne stockons pas votre passphrase, nous ne pouvons pas réinitialiser votre accès. C'est pourquoi nous générons une 'Phrase de Récupération' (12 mots BIP39) lors de la création de votre compte. C'est votre seule issue de secours."
        }
    ];

    return (
        <main className="min-h-screen bg-stone-50/50 pt-24 pb-40">
            <div className="container max-w-5xl">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Souveraineté Numérique</span>
                        <h1 className="text-4xl md:text-6xl font-headline mb-6 text-stone-900">Le Sanctuaire de vos secrets.</h1>
                        <p className="text-stone-500 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                            Nous avons construit Aurum avec une conviction : votre jardin secret ne doit appartenir qu'à vous. Voici comment nous garantissons techniquement votre vie privée.
                        </p>
                    </motion.div>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <SecurityBadge 
                        icon={Lock}
                        title="Zero-Knowledge"
                        description="Nous n'avons jamais accès à votre passphrase. Vos données sont chiffrées avant même d'arriver sur nos serveurs."
                    />
                    <SecurityBadge 
                        icon={ShieldCheck}
                        title="AES-256 GCM"
                        description="Nous utilisons le standard de chiffrement le plus élevé du marché pour protéger l'intégrité de vos écrits."
                    />
                    <SecurityBadge 
                        icon={Fingerprint}
                        title="Anonymat par Design"
                        description="Vos écrits ne sont jamais liés à votre identité réelle. Nous ne vendons et ne vendrons jamais vos données."
                    />
                </div>

                {/* The Data Journey */}
                <section className="bg-white rounded-[2.5rem] p-12 md:p-20 border border-stone-200 mb-32 shadow-sm">
                    <h2 className="text-3xl md:text-4xl font-headline mb-12 text-center">Le parcours de votre pensée</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-7 items-center gap-8">
                        {/* Step 1 */}
                        <div className="lg:col-span-2 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold">1</div>
                            <Smartphone className="w-8 h-8 mx-auto mb-4 text-stone-400" />
                            <h4 className="font-bold mb-2">Capture</h4>
                            <p className="text-xs text-stone-500 font-light">Vous écrivez dans l'interface sécurisée.</p>
                        </div>
                        <div className="hidden lg:block text-stone-200 text-center"><ArrowRight /></div>
                        
                        {/* Step 2 */}
                        <div className="lg:col-span-2 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold">2</div>
                            <Key className="w-8 h-8 mx-auto mb-4 text-primary" />
                            <h4 className="font-bold mb-2">Chiffrement Local</h4>
                            <p className="text-xs text-stone-500 font-light">Votre passphrase transforme le texte en code illisible.</p>
                        </div>
                        <div className="hidden lg:block text-stone-200 text-center"><ArrowRight /></div>

                        {/* Step 3 */}
                        <div className="lg:col-span-2 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold">3</div>
                            <Database className="w-8 h-8 mx-auto mb-4 text-stone-400" />
                            <h4 className="font-bold mb-2">Stockage Aveugle</h4>
                            <p className="text-xs text-stone-500 font-light">Le serveur stocke le code sans pouvoir le lire.</p>
                        </div>
                    </div>
                </section>

                {/* Technical Specs */}
                <div className="max-w-3xl mx-auto mb-32">
                    <h2 className="text-3xl font-headline mb-12 text-center">Spécifications Techniques</h2>
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-stone-100/50 border border-stone-200 flex justify-between items-center">
                            <span className="font-medium">Algorithme de chiffrement</span>
                            <span className="text-primary font-mono text-sm">AES-256-GCM</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-stone-100/50 border border-stone-200 flex justify-between items-center">
                            <span className="font-medium">Dérivation de clé</span>
                            <span className="text-primary font-mono text-sm">PBKDF2 (100,000 rounds)</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-stone-100/50 border border-stone-200 flex justify-between items-center">
                            <span className="font-medium">Standard de récupération</span>
                            <span className="text-primary font-mono text-sm">BIP39 (Mnémonique 12 mots)</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-stone-100/50 border border-stone-200 flex justify-between items-center">
                            <span className="font-medium">Hébergement des données</span>
                            <span className="text-primary font-mono text-sm">Google Cloud (France/EU)</span>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-headline mb-12 text-center">Questions de Sécurité</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {securityFaqs.map((faq, index) => (
                            <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger className="text-lg text-left font-headline font-normal">{faq.question}</AccordionTrigger>
                                <AccordionContent className="prose prose-stone font-light text-stone-600">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Final Note */}
                <div className="mt-40 p-12 rounded-[2rem] bg-primary text-primary-foreground text-center">
                    <EyeOff className="w-12 h-12 mx-auto mb-8 opacity-50" />
                    <h3 className="text-3xl font-headline mb-6">Notre promesse est mathématique.</h3>
                    <p className="max-w-2xl mx-auto font-light leading-relaxed">
                        La confiance est fragile. C'est pourquoi nous l'avons remplacée par du code et des mathématiques. Votre Sanctuaire est protégé par les lois du chiffrement.
                    </p>
                </div>
            </div>
        </main>
    );
}

function ArrowRight() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right mx-auto opacity-20"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    );
}
