'use client';

import React, { useState, useEffect } from 'react';
import HeroIntegrated from '@/components/landing/HeroIntegrated';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { PenSquare, Compass, Eye, Waves, Sprout, Shield, Quote, ArrowRight, Send, ShieldCheck, Lock, Fingerprint, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const ExitIntent = () => {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !dismissed) {
                setShow(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [dismissed]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-10 md:p-16 max-w-2xl w-full relative shadow-2xl border border-stone-200"
            >
                <button
                    onClick={() => { setShow(false); setDismissed(true); }}
                    className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                        <Compass className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-headline mb-6 text-stone-900">Une dernière chose avant de partir...</h3>
                    <p className="text-stone-500 text-lg mb-10 leading-relaxed font-light">
                        Vous ne savez pas par où commencer ? Faites notre évaluation de bien-être en 30 secondes pour obtenir votre profil personnalisé.
                    </p>
                    <div className="flex flex-col gap-4 items-center">
                        <Button
                            onClick={() => {
                                setShow(false);
                                setDismissed(true);
                                document.getElementById('evaluation')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            size="lg"
                            className="h-16 px-12 text-lg rounded-2xl w-full sm:w-auto"
                        >
                            Faire le Test (30s)
                        </Button>
                        <button
                            onClick={() => { setShow(false); setDismissed(true); }}
                            className="text-stone-400 text-sm hover:underline font-light"
                        >
                            Non merci, je souhaite continuer à naviguer
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const QuizSection = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    const questions = [
        {
            q: "Comment vous sentez-vous aujourd'hui ?",
            options: ["Sérénité", "Turbulence", "Réflexion", "Action"]
        },
        {
            q: "Quel est votre objectif principal ?",
            options: ["Clarté Mentale", "Paix Intérieure", "Croissance", "Présence"]
        },
        {
            q: "Combien de temps avez-vous pour vous ?",
            options: ["2 min", "5 min", "15 min+"]
        }
    ];

    const handleAnswer = (option: string) => {
        setAnswers([...answers, option]);
        setStep(step + 1);
    };

    return (
        <section className="py-24 md:py-40 bg-stone-50/50">
            <div className="container max-w-4xl">
                <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-20 relative overflow-hidden shadow-sm">
                    <AnimatePresence mode="wait">
                        {step < questions.length ? (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="text-center"
                            >
                                <span className="text-primary/60 text-[10px] uppercase tracking-widest mb-6 block font-bold">Évaluation de Bien-être • {step + 1}/{questions.length}</span>
                                <h3 className="text-3xl md:text-5xl font-headline mb-12 text-stone-900">{questions[step].q}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {questions[step].options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(option)}
                                            className="p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-primary/40 hover:bg-primary/5 transition-all text-lg font-light text-stone-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-3xl md:text-5xl font-headline mb-6 text-stone-900">Votre profil est prêt.</h3>
                                <p className="text-stone-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                                    Basé sur vos réponses, nous avons préparé un sanctuaire personnalisé pour votre {answers[1]?.toLowerCase() || "bien-être"}. Découvrez votre première analyse offerte.
                                </p>
                                <Button size="lg" className="h-16 px-16 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all" asChild>
                                    <Link href="/sanctuary/write">Commencer l'Expérience</Link>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
            </div>
        </section>
    );
};

const AlmaCard = ({ title, time, entry, response }: { title: string, time: string, entry: string, response: string }) => (
    <div className="flex-1 bg-white/60 backdrop-blur-md p-10 rounded-sm border border-white/40 shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl hover:bg-white/80 min-w-[300px] group overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-0 bg-primary/40 transition-all duration-700 group-hover:h-full"></div>
        <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6 font-medium">
            <span>{title}</span>
            <span>{time}</span>
        </div>
        <p className="font-handwriting text-2xl text-stone-800 mb-8 leading-relaxed italic">
            "{entry}"
        </p>
        <div className="w-8 h-px bg-primary/30 mb-6 transition-all duration-700 ease-in-out group-hover:w-full group-hover:bg-primary/60"></div>
        <p className="text-sm italic text-stone-600 leading-relaxed font-light">
            {response}
        </p>
    </div>
);

const FloatingCTA = ({ visible }: { visible: boolean }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-8 right-8 z-[100]"
            >
                <Button asChild size="lg" className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 px-8 h-14 group border-4 border-white/20 backdrop-blur-sm">
                    <Link href="/sanctuary/write" className="flex items-center gap-3">
                        <span className="font-headline font-semibold">Commencer mon Sanctuaire</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
                <div className="mt-2 text-center pointer-events-none">
                    <span className="text-[9px] text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-tighter font-bold">Sans engagement • Privé</span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);



export default function Home() {
    const [showCTA, setShowCTA] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.8) {
                setShowCTA(true);
            } else {
                setShowCTA(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const almaJournalEntries = [
        {
            title: "SYNDROME DE L'IMPOSTEUR",
            time: "Mardi, 14h02",
            entry: "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends qu'ils découvrent que je n'ai aucune idée de ce que je fais.",
            response: "Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ta compétence, pas de ton imposture."
        },
        {
            title: "ANXIÉTÉ INSOMNIE",
            time: "Dimanche, 03h15",
            entry: "La liste des tâches tourne en boucle. Si je dors maintenant, j'ai peur d'oublier l'essentiel pour demain. Mon cerveau refuse le bouton off.",
            response: "Ta mémoire est faillible, ce Sanctuaire ne l'est pas. Dépose tout ici. Ton esprit a la permission de s'éteindre."
        },
        {
            title: "FATIGUE ÉMOTIONNELLE",
            time: "Lundi, 19h30",
            entry: "J'ai dit 'ça va super' douze fois aujourd'hui. Je crois que je ne sais même plus ce que je ressens vraiment sous le masque.",
            response: "La dissonance émotionnelle est épuisante. Ici, tu n'as pas de public. Dis-nous la vérité."
        }
    ];

    const howItWorks = [
        {
            icon: <PenSquare />,
            title: "1. Videz votre sac",
            description: "Déposez vos pensées sans filtre. Libérez immédiatement votre charge mentale dans un espace conçu pour libérer votre esprit et stabiliser vos pensées.",
        },
        {
            icon: <Eye />,
            title: "2. Obtenez une perspective",
            description: "Ne tournez plus en rond. Aurum révèle les schémas invisibles de votre esprit pour transformer votre confusion en reflets actionnables.",
        },
        {
            icon: <Sprout />,
            title: "3. Retrouvez le contrôle",
            description: "Prenez de la hauteur. Cultivez activement votre paysage émotionnel pour ne plus subir vos journées, mais les vivre avec une présence renouvelée.",
        }
    ];

    const testimonials = [
        {
            name: "Camille, 34 ans",
            initials: "C",
            quote: "J'étais sceptique à l'idée de confier mes pensées à un algorithme de miroir. Mais Aurum est différent. C'est un miroir bienveillant, pas un juge. Les 'insights' m'ont ouvert les yeux sur des schémas que j'ignorais totalement."
        },
        {
            name: "Léo, 41 ans",
            initials: "L",
            quote: "Ma charge mentale était énorme. Le simple fait d'écrire, de 'déposer' mes angoisses dans Aurum chaque soir, a eu un effet libérateur. C'est plus qu'un journal, c'est une soupape de sécurité."
        },
        {
            name: "Jeanne, 28 ans",
            initials: "J",
            quote: "Aurum ne donne pas de réponses, il aide à poser les bonnes questions. C'est un compagnon de route silencieux sur le chemin de l'introspection, sans la pression d'une performance."
        }
    ];

    const faqs = [
        {
            question: "Qui peut lire mes données ?",
            answer: "Personne. Nous utilisons une architecture 'Admin-Blind' avec chiffrement AES-256 côté client. Vos entrées sont chiffrées avec votre clé privée avant d'être envoyées. Techniquement, même avec un accès total à nos serveurs, il est impossible de déchiffrer vos écrits sans votre mot de passe."
        },
        {
            question: "Comment Aurum aide à la santé mentale ?",
            answer: "Aurum est un outil d'introspection, pas un substitut à une thérapie. Il vous offre un espace sécurisé pour extérioriser vos pensées et vous aide à identifier des schémas émotionnels. Cet acte d'écriture et de réflexion peut être une composante bénéfique d'une bonne hygiène mentale."
        },
        {
            question: "Est-ce gratuit ?",
            answer: "Oui, Aurum propose une offre gratuite généreuse pour vous permettre de commencer votre voyage. Des plans payants sont disponibles pour ceux qui souhaitent un usage plus intensif et des fonctionnalités avancées, ce qui nous permet de maintenir et d'améliorer le service en toute indépendance."
        }
    ];

    return (
        <main>
            <HeroIntegrated />

            <div id="sanctuary-content" className="bg-background text-foreground">
                {/* SECTION 1: Métaphore du jardin (Simple & Strong) */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline mb-6">
                            Cultivez votre clarté.
                        </h2>
                        <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/80 font-light">
                            <p>Aurum est l'outil qui vous permet de nommer, de trier et de comprendre ce qui pousse en vous. Pour que vous puissiez cultiver la paix, et pas le chaos.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: How It Works */}
                <section className="py-24 md:py-32 container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-4xl font-headline mb-4">La fin de la surcharge mentale</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {howItWorks.map((feature) => (
                            <div key={feature.title} className="flex flex-col items-center">
                                <div className="text-primary w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-6">
                                    {React.cloneElement(feature.icon as React.ReactElement, { className: "w-8 h-8" })}
                                </div>
                                <h3 className="text-2xl font-headline text-primary mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3.5: Avant / Après */}
                <section className="py-24 md:py-40 bg-stone-900 text-white overflow-hidden relative">
                    <div className="container relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-6xl font-headline mb-6">Le contraste Aurum</h2>
                            <p className="text-stone-400 font-light text-lg">Pourquoi continuer à naviguer dans le brouillard ?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-px bg-white/10 rounded-[2.5rem] overflow-hidden border border-white/10 backdrop-blur-sm">
                            {/* Sans Aurum */}
                            <div className="p-10 md:p-20 bg-stone-900/50">
                                <div className="flex items-center gap-3 mb-8 text-red-400/80">
                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Sans Aurum</span>
                                </div>
                                <ul className="space-y-6">
                                    {[
                                        "Pensées en boucle et insomnies",
                                        "Difficulté à identifier ses déclencheurs",
                                        "Sentiment de subir ses émotions",
                                        "Chaos mental persistant"
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 text-stone-400 font-light">
                                            <span className="text-red-400/50 flex-shrink-0">—</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Avec Aurum */}
                            <div className="p-10 md:p-20 bg-white/5 relative">
                                <div className="absolute top-0 right-0 p-8">
                                    <Waves className="w-12 h-12 text-primary/20" />
                                </div>
                                <div className="flex items-center gap-3 mb-8 text-primary">
                                    <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Avec Aurum</span>
                                </div>
                                <ul className="space-y-6">
                                    {[
                                        "Sommeil retrouvé et esprit apaisé",
                                        "Insights clairs sur vos patterns",
                                        "Maîtrise de son paysage intérieur",
                                        "Clarté d'esprit au quotidien"
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-4 text-white font-light">
                                            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[160px] rounded-full pointer-events-none"></div>
                </section>

                {/* SECTION 4: Le Journal d'Alma */}
                <section className="py-24 md:py-32 bg-gradient-to-b from-background to-stone-200/30">
                    <div className="container">
                        <div className="text-center max-w-2xl mx-auto mb-20">
                            <h2 className="text-5xl font-headline mb-4">D'une pensée à une prise de conscience</h2>
                            <p className="text-muted-foreground">
                                Le Journal d'Alma est une fenêtre sur l'introspection. Découvrez comment de simples mots peuvent se transformer en révélations.
                            </p>
                        </div>

                        {/* Desktop Grid */}
                        <div className="hidden md:flex gap-8">
                            {almaJournalEntries.map((item, index) => (
                                <AlmaCard key={index} {...item} />
                            ))}
                        </div>

                        {/* Mobile Carousel */}
                        <div className="md:hidden">
                            <Carousel opts={{ loop: true }}>
                                <CarouselContent className="-ml-4">
                                    {almaJournalEntries.map((item, index) => (
                                        <CarouselItem key={index} className="pl-4 basis-11/12">
                                            <div className="p-1 h-full">
                                                <AlmaCard {...item} />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: Trust & Privacy (Enhanced) */}
                <section className="py-24 md:py-40 bg-white">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Votre Intégrité, Notre Priorité</span>
                            <h2 className="text-4xl md:text-6xl font-headline mb-6">Un sanctuaire où vous êtes le seul maître.</h2>
                            <p className="text-stone-500 font-light text-lg">Nous avons conçu Aurum autour d'une idée simple : votre monde intérieur ne regarde que vous. Pas même nous.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Confidentialité Absolue</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed mb-4">
                                    Vos pensées sont chiffrées (AES-256) directement sur votre appareil. Même nous ne pouvons pas lire vos secrets.
                                </p>
                                {/* Security page removed - TABULA RASA */}
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Fingerprint className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Anonymat Garanti</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    Aucune donnée personnelle n'est liée à vos écrits. Le moteur d'analyse Aurum opère en local sur votre appareil.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Droit à l'Oubli</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    Vous restez propriétaire de vos données à 100%. Exportez vos journaux ou supprimez votre compte en un clic, sans délai.
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="max-w-xl text-center md:text-left">
                                    <h4 className="text-3xl font-headline mb-4">Notre Manifeste de Confiance</h4>
                                    <p className="text-stone-400 font-light leading-relaxed">
                                        "Nous ne vendons pas de publicité. Nous ne vendons pas vos données. Nous vendons de la clarté et de la tranquillité d'esprit. Votre journal n'est pas un produit, c'est votre jardin sacré."
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-7xl font-headline text-primary/20 select-none">Aurum</div>
                                    <div className="w-20 h-px bg-white/20"></div>
                                    <span className="text-[10px] uppercase tracking-[0.4em] font-medium opacity-50">Sceau de Protection</span>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
                        </div>

                        {/* Security page removed - TABULA RASA */}
                    </div>
                </section>

                {/* SECTION 5.1: Interactive Quiz */}
                <div id="evaluation">
                    <QuizSection />
                </div>

                {/* SECTION 6: Social Proof / Testimonials */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-4xl font-headline mb-4">Ils ont trouvé leur sanctuaire</h2>
                            <p className="text-muted-foreground">L'expérience Aurum, racontée par ceux qui l'écrivent chaque jour.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <Card key={index} className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm hover:bg-white/60 transition-colors duration-300">
                                    <CardHeader className="flex-row gap-4 items-center pb-2">
                                        <Avatar className="h-10 w-10 border border-white/50">
                                            <AvatarFallback className="bg-amber-100 text-amber-800">{testimonial.initials}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-stone-800">{testimonial.name}</h4>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-stone-600 italic leading-relaxed">"{testimonial.quote}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 7: CTA Final & FAQ */}
                <section className="container py-24 md:py-32 text-center border-t border-black/5">
                    <Button asChild size="lg" className="h-14 px-12 text-base">
                        <Link href="/sanctuary/write">Découvrir mon premier reflet</Link>
                    </Button>
                    <div className="mt-6">
                        <span className="text-xs text-stone-400 font-light">Accès immédiat • 100% Chiffré • Utilisation illimitée en version Beta</span>
                    </div>
                </section>

                <section className="container max-w-3xl pb-24 md:pb-32">
                    <h2 className="text-4xl font-headline text-center mb-12">
                        Questions Fréquentes
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger className="text-xl text-left font-headline font-normal">{faq.question}</AccordionTrigger>
                                <AccordionContent className="prose prose-lg font-light text-foreground/80">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </section>

            </div>

            <FloatingCTA visible={showCTA} />
            <ExitIntent />
        </main>
    );
}
