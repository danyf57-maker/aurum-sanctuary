'use client';

import { useState, useEffect, useRef } from 'react';
import HeroIntegrated from '@/components/landing/HeroIntegrated';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Compass, ArrowRight, ShieldCheck, Lock, Fingerprint, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/web-client';
import { trackEvent } from '@/lib/analytics/client';

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
                        Tu ne sais pas par où commencer ? Fais notre évaluation de bien-être en 30 secondes pour obtenir ton profil personnalisé.
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
                            Faire le parcours (30s)
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
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const quizStartedAtRef = useRef<number | null>(null);
    const stepStartedAtRef = useRef<number>(Date.now());
    const hasTrackedStartRef = useRef(false);
    const hasTrackedResultRef = useRef(false);

    const questions = [
        {
            q: "Quand tu penses à ta journée, qu'est-ce qui ressort le plus ?",
            options: [
                { label: "D", text: "J'ai beaucoup de choses à faire et je veux avancer vite" },
                { label: "I", text: "J'ai besoin de connecter avec les autres et partager" },
                { label: "S", text: "Je cherche la tranquillité et l'harmonie" },
                { label: "C", text: "J'analyse les situations avant d'agir" },
            ],
        },
        {
            q: "Face à une situation difficile, ta première réaction est de :",
            options: [
                { label: "D", text: "Prendre le problème en main et trouver une solution" },
                { label: "I", text: "En parler pour voir différentes perspectives" },
                { label: "S", text: "Retrouver mon calme avant de réagir" },
                { label: "C", text: "Comprendre tous les détails avant de décider" },
            ],
        },
        {
            q: "Si tu ouvrais ton journal maintenant, tu écrirais sur :",
            options: [
                { label: "D", text: "Tes objectifs et ce que tu veux accomplir" },
                { label: "I", text: "Tes interactions et ce qui t'a touché émotionnellement" },
                { label: "S", text: "Ton besoin de paix et de stabilité" },
                { label: "C", text: "Tes réflexions profondes et analyses" },
            ],
        },
        {
            q: "Ce que tu cherches avant tout en ce moment :",
            options: [
                { label: "D", text: "Du momentum et de l'action" },
                { label: "I", text: "De la connexion et de l'inspiration" },
                { label: "S", text: "De la sécurité et du réconfort" },
                { label: "C", text: "De la clarté et de la structure" },
            ],
        },
        {
            q: "Quand tu dois choisir, tu privilégies :",
            options: [
                { label: "D", text: "L'efficacité et la rapidité" },
                { label: "I", text: "L'impact sur les autres" },
                { label: "S", text: "La sécurité et la prévisibilité" },
                { label: "C", text: "La logique et les faits" },
            ],
        },
        {
            q: "Ton style de communication naturel :",
            options: [
                { label: "D", text: "Direct et concis" },
                { label: "I", text: "Chaleureux et expressif" },
                { label: "S", text: "Posé et réfléchi" },
                { label: "C", text: "Structuré et précis" },
            ],
        },
        {
            q: "Ton environnement idéal :",
            options: [
                { label: "D", text: "Dynamique, avec des défis constants" },
                { label: "I", text: "Collaboratif, avec beaucoup d'échanges" },
                { label: "S", text: "Stable, avec peu de changements" },
                { label: "C", text: "Organisé, avec des processus clairs" },
            ],
        },
        {
            q: "Ce qui te motive le plus :",
            options: [
                { label: "D", text: "Les résultats et la victoire" },
                { label: "I", text: "La reconnaissance et la connexion" },
                { label: "S", text: "La sécurité et l'appartenance" },
                { label: "C", text: "La maîtrise et l'excellence" },
            ],
        },
    ];

    type ProfileKey = "D" | "I" | "S" | "C" | "MIXTE";

    const profileMap: Record<ProfileKey, { title: string; description: string }> = {
        D: {
            title: "Le Pionnier",
            description: "Tu aimes avancer vite et décider. Ton journal t'aide à canaliser cette énergie.",
        },
        I: {
            title: "Le Connecteur",
            description: "Tu es guidé par les relations et les émotions. Ton journal devient un espace d'expression.",
        },
        S: {
            title: "L'Ancre",
            description: "Tu cherches la paix et la constance. Ton journal t'offre un refuge stable.",
        },
        C: {
            title: "L'Architecte",
            description: "Tu aimes comprendre avant d'agir. Ton journal devient ton laboratoire d'idées.",
        },
        MIXTE: {
            title: "Profil mixte • L'Équilibriste",
            description: "Tu combines plusieurs forces. Ton journal s'adapte à ta complexité.",
        },
    };

    const getProfile = (currentAnswers: string[]): ProfileKey => {
        const counts = { D: 0, I: 0, S: 0, C: 0 };
        currentAnswers.forEach((a) => {
            if (a in counts) counts[a as keyof typeof counts] += 1;
        });
        const max = Math.max(counts.D, counts.I, counts.S, counts.C);
        const winners = (Object.keys(counts) as Array<keyof typeof counts>).filter(
            (key) => counts[key] === max
        );
        return winners.length === 1 ? winners[0] : "MIXTE";
    };

    const persistQuizResult = async (profile: string, profileTitle: string, currentAnswers: string[]) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "users", user.uid, "assessments"), {
                source: "landing-quiz",
                profile,
                profileTitle,
                answers: currentAnswers,
                completedAt: new Date().toISOString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to save landing quiz result:", error);
        }
    };

    useEffect(() => {
        if (step === questions.length && !hasTrackedResultRef.current) {
            hasTrackedResultRef.current = true;
            void trackEvent({
                name: "quiz_result_viewed",
                params: {
                    profile_result: getProfile(answers),
                    total_steps: questions.length,
                },
            });
        }
    }, [answers, questions.length, step]);

    const handleAnswer = (option: string) => {
        const now = Date.now();
        if (!hasTrackedStartRef.current) {
            hasTrackedStartRef.current = true;
            quizStartedAtRef.current = now;
            stepStartedAtRef.current = now;
            void trackEvent({
                name: "quiz_started",
                params: {
                    source_page: "landing",
                },
            });
        }

        const timeSpentMs = Math.max(0, now - stepStartedAtRef.current);
        void trackEvent({
            name: "quiz_step_completed",
            params: {
                step_number: step + 1,
                answer_letter: option,
                time_spent_ms: timeSpentMs,
            },
        });

        const nextAnswers = [...answers, option];
        setAnswers(nextAnswers);

        const nextStep = step + 1;
        if (nextStep === questions.length) {
            const profile = getProfile(nextAnswers);
            const profileTitle = profileMap[profile].title;
            const totalTimeMs =
                quizStartedAtRef.current != null
                    ? Math.max(0, now - quizStartedAtRef.current)
                    : null;
            void trackEvent({
                name: "quiz_complete",
                params: {
                    profile_result: profile,
                    total_time_ms: totalTimeMs,
                    total_steps: questions.length,
                },
            });
            const quizData = {
                answers: nextAnswers,
                completedAt: new Date().toISOString(),
                profile,
            };
            try {
                localStorage.setItem("aurum-quiz-data", JSON.stringify(quizData));
            } catch {
                // No-op if storage is unavailable
            }
            void persistQuizResult(profile, profileTitle, nextAnswers);
        }
        stepStartedAtRef.current = Date.now();
        setStep(nextStep);
    };

    const finalProfile = getProfile(answers);
    const profile = profileMap[finalProfile];

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
                                <span className="text-primary/60 text-[10px] uppercase tracking-widest mb-6 block font-bold">Parcours de réflexion • {step + 1}/{questions.length}</span>
                                <h3 className="text-3xl md:text-5xl font-headline mb-12 text-stone-900">{questions[step].q}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {questions[step].options.map((option) => (
                                        <button
                                            key={option.text}
                                            onClick={() => handleAnswer(option.label)}
                                            className="p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-primary/40 hover:bg-primary/5 transition-all text-left text-stone-700 shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">
                                                {option.label}
                                            </span>
                                            <span className="text-base font-light">{option.text}</span>
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
                                <h3 className="text-3xl md:text-5xl font-headline mb-6 text-stone-900">Ton profil est prêt.</h3>
                                <p className="text-stone-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                                    <span className="font-medium text-stone-700">{profile.title}</span>
                                    <br />
                                    {profile.description}
                                </p>
                                <Button size="lg" className="h-16 px-16 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all" asChild>
                                    <Link
                                        href={user ? "/sanctuary/magazine" : `/signup?quiz=complete&profile=${finalProfile}`}
                                        onClick={() =>
                                            void trackEvent({
                                                name: "quiz_cta_clicked",
                                                params: {
                                                    profile_result: finalProfile,
                                                    cta_location: "quiz_result",
                                                    destination: user ? "magazine" : "signup",
                                                },
                                            })
                                        }
                                    >
                                        {user ? "Voir mon résultat dans Magazine" : "Créer mon compte pour voir mon résultat"}
                                    </Link>
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

    const faqs = [
        {
            question: "Qui peut lire mes données ?",
            answer: "Personne. Nous utilisons une architecture 'Admin-Blind' avec chiffrement AES-256 côté client. Tes entrées sont chiffrées avec ta clé privée avant d'être envoyées. Techniquement, même avec un accès total à nos serveurs, il est impossible de déchiffrer tes écrits sans ton mot de passe."
        },
        {
            question: "Comment calmer l'anxiété la nuit et mieux dormir ?",
            answer: "Écris 3 lignes avant de te coucher: ce qui te pèse, ce que tu ressens, puis ce dont tu as besoin demain. Le but est de sortir la rumination de ta tête pour apaiser ton esprit."
        },
        {
            question: "Comment réduire la charge mentale en 5 minutes ?",
            answer: "Pose un minuteur 5 minutes et écris sans corriger: faits, émotions, besoins. Cette routine courte t'aide à relâcher la pression et à retrouver de la clarté, même pendant une journée chargée."
        },
        {
            question: "Comment arrêter de trop penser (overthinking) rapidement ?",
            answer: "Quand tout tourne dans ta tête, écris une idée par ligne. Cela transforme un flot confus en liste concrète. Ensuite, choisis une seule petite action à faire aujourd'hui."
        },
        {
            question: "Est-ce que l'écriture aide vraiment contre le stress et l'anxiété ?",
            answer: "Les études montrent que l'écriture régulière peut améliorer le bien-être psychologique et réduire certains symptômes liés au stress et à l'anxiété. Ce n'est pas magique, mais c'est un outil simple, accessible et utile."
        },
        {
            question: "Quel journal intime en ligne est vraiment privé ?",
            answer: "Choisis un journal intime chiffré de bout en bout, sans publicité, où tes notes ne sont pas exposées publiquement. Sur Aurum, tu écris dans un espace privé conçu pour la clarté mentale."
        },
        {
            question: "Est-ce gratuit ?",
            answer: "Oui, tu peux commencer gratuitement. Des plans payants existent si tu veux aller plus loin avec des fonctionnalités avancées."
        }
    ];

    return (
        <main>
            <HeroIntegrated />
            <section id="use-cases-seo" className="py-20 md:py-24 bg-white border-y border-stone-200/70">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-headline text-stone-900 mb-4">
                            Douleurs fréquentes : comment l&apos;écriture peut vraiment aider
                        </h2>
                        <p className="text-stone-600 font-light text-lg">
                            Des exemples concrets pour relâcher la charge mentale, calmer l&apos;anxiété et sortir de la rumination.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <article className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Douleur: insomnie et pensées nocturnes</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-4">
                                Écrire ce qui tourne en boucle aide à le sortir de ta tête. En pratique:
                                3 lignes avant de dormir (fait, émotion, besoin) peuvent déjà t&apos;apaiser.
                            </p>
                            <Link href="/sanctuary/write" className="text-primary font-medium hover:underline">
                                Apaiser mes nuits →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Douleur: je me parle mal</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-4">
                                Quand la petite voix dit &quot;je suis nul&quot;, écris une version plus juste:
                                &quot;j&apos;avance petit à petit&quot;. Ce réflexe de self-talk positif aide à retrouver de l&apos;élan.
                            </p>
                            <Link href="/sanctuary/write" className="text-primary font-medium hover:underline">
                                Reprendre confiance →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Douleur: overthinking et confusion mentale</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-4">
                                Écris une idée par ligne. Tu transformes le chaos mental en points clairs.
                                Puis choisis un seul petit pas à faire aujourd&apos;hui.
                            </p>
                            <Link href="/sanctuary/write" className="text-primary font-medium hover:underline">
                                Retrouver de la clarté →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Douleur: je garde tout, puis j&apos;explose</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-4">
                                Quelques lignes régulières valent mieux qu&apos;une longue session rare.
                                Tu décompresses avant saturation et tu retrouves plus de calme au quotidien.
                            </p>
                            <Link href="/sanctuary/write" className="text-primary font-medium hover:underline">
                                Relâcher la pression →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Douleur: je ne sais pas par où commencer</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-4">
                                Règle ultra simple: commence par un fait, une émotion, un besoin.
                                C&apos;est assez pour démarrer sans pression, même quand tu n&apos;as que 2 minutes.
                            </p>
                            <Link href="/sanctuary/write" className="text-primary font-medium hover:underline">
                                Commencer maintenant →
                            </Link>
                        </article>
                    </div>
                    <p className="mt-8 text-xs text-stone-500 text-center font-light">
                        Basé sur des recherches récentes sur l&apos;écriture et le bien-être psychologique
                        <sup>
                            <a href="#ref3" aria-label="Voir référence 3" className="no-underline"> 3</a>
                        </sup>
                        <sup>
                            <a href="#ref4" aria-label="Voir référence 4" className="no-underline"> 4</a>
                        </sup>
                        .
                    </p>
                </div>
            </section>

            <div id="sanctuary-content" className="bg-background text-foreground">
                {/* SECTION 1: Problem */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline mb-6">
                            C'est comment, une tête en bazar ?
                        </h2>
                        <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/80 font-light">
                            <p>
                                C'est quand les pensées tournent en rond sans s'arrêter. Ça peut empêcher de dormir, rendre triste
                                ou énervé. On a parfois l'impression d'être coincé.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Solution */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline mb-6">
                            Le super-pouvoir de l'écriture.
                        </h2>
                        <p className="text-stone-600 font-light text-lg leading-relaxed">
                            Écrire tes pensées, même les plus secrètes, c'est comme leur dire "Stop !". Ça les calme.
                            Aurum est ton outil pour faire ça, en toute sécurité.
                        </p>
                    </div>
                </section>

                {/* SECTION 3: Scientific social proof */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-4xl md:text-5xl font-headline mb-6">Ce n'est pas de la magie, c'est un phénomène observé.</h2>
                            <p className="text-stone-600 font-light text-lg leading-relaxed">
                                Des chercheurs se sont penchés sur le pouvoir de l'écriture. Dans leurs études, ils ont fait des découvertes surprenantes :
                            </p>
                        </div>
                        <ul className="space-y-5 text-stone-700 font-light leading-relaxed text-lg max-w-3xl mx-auto">
                            <li className="rounded-2xl border border-stone-200 bg-white p-6">
                                <span className="font-medium text-stone-900">Découverte n°1 :</span> Les participants qui prenaient le temps
                                d'écrire sur leurs soucis ont vu leurs visites chez le médecin diminuer de moitié
                                <sup><a href="#ref1" aria-label="Voir référence 1" className="no-underline"> *</a></sup>.
                            </li>
                            <li className="rounded-2xl border border-stone-200 bg-white p-6">
                                <span className="font-medium text-stone-900">Découverte n°2 :</span> Dans une autre étude sur des personnes
                                ayant perdu leur emploi, celles qui écrivaient sur leurs émotions avaient deux fois plus de chances de retrouver
                                un travail que les autres
                                <sup><a href="#ref2" aria-label="Voir référence 2" className="no-underline"> **</a></sup>.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 5: Trust & Privacy (Enhanced) */}
                <section className="py-24 md:py-40 bg-white">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Ton Intégrité, Notre Priorité</span>
                            <h2 className="text-4xl md:text-6xl font-headline mb-6">Un sanctuaire où tu es le seul maître.</h2>
                            <p className="text-stone-500 font-light text-lg">Nous avons conçu Aurum autour d'une idée simple : ton monde intérieur ne regarde que toi. Pas même nous.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Confidentialité Absolue</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed mb-4">
                                    Tes pensées sont chiffrées (AES-256) directement sur ton appareil. Même nous ne pouvons pas lire tes secrets.
                                </p>
                                {/* Security page removed - TABULA RASA */}
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Fingerprint className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Anonymat Garanti</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    Aucune donnée personnelle n'est liée à tes écrits. Le moteur d'analyse Aurum opère en local sur ton appareil.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Droit à l'Oubli</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    Tu restes propriétaire de tes données à 100%. Exporte tes journaux ou supprime ton compte en un clic, sans délai.
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="max-w-xl text-center md:text-left">
                                    <h4 className="text-3xl font-headline mb-4">Notre Manifeste de Confiance</h4>
                                    <p className="text-stone-400 font-light leading-relaxed">
                                        "Nous ne vendons pas de publicité. Nous ne vendons pas tes données. Nous vendons de la clarté et de la tranquillité d'esprit. Ton journal n'est pas un produit, c'est ton jardin sacré."
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

                {/* SECTION 7: CTA Final */}
                <section className="container py-24 md:py-32 text-center border-t border-black/5">
                    <Button asChild size="lg" className="h-14 px-12 text-base">
                        <Link href="/sanctuary/write">Découvrir mon premier reflet</Link>
                    </Button>
                    <div className="mt-6">
                        <span className="text-xs text-stone-400 font-light">Accès immédiat • 100% Chiffré • Utilisation illimitée en version Beta</span>
                    </div>
                </section>

                {/* SECTION 8: Interactive personality quiz (moved above FAQ) */}
                <div id="evaluation">
                    <QuizSection />
                </div>

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

                <section className="container max-w-4xl pb-24 md:pb-28">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6 md:p-8">
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 mb-4">Références</h3>
                        <ul className="space-y-3 text-xs text-stone-500 leading-relaxed">
                            <li id="ref1">
                                <strong>*</strong> Pennebaker, J. W., & Beall, S. K. (1986). <em>Confronting a traumatic event: Toward an understanding of inhibition and disease.</em> Journal of Abnormal Psychology, 95, 274-281.
                            </li>
                            <li id="ref2">
                                <strong>**</strong> Spera, S. P., Buhrfeind, E. D., & Pennebaker, J. W. (1994). <em>Expressive writing and coping with job loss.</em> Academy of Management Journal, 37, 722-733.
                            </li>
                            <li id="ref3">
                                <strong>3</strong> Sohal, M., Singh, P., Dhillon, B. S., & Gill, H. S. (2022). <em>Efficacy of journaling in the management of mental illness: a systematic review and meta-analysis.</em> Family Medicine and Community Health.
                            </li>
                            <li id="ref4">
                                <strong>4</strong> Yosep, I., et al. (2025). <em>Positive self talk journaling intervention to improve psychological well-being among child and adolescents in juvenile.</em> Child and Adolescent Psychiatry and Mental Health.
                            </li>
                        </ul>
                    </div>
                </section>

            </div>

            <FloatingCTA visible={showCTA} />
            <ExitIntent />
        </main>
    );
}
