'use client';

import { useState, useEffect, useRef } from 'react';
import HeroIntegrated from '@/components/landing/HeroIntegrated';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Compass, ArrowRight, ShieldCheck, Lock, Fingerprint, X, Brain, Moon, Flame, CircleHelp, Wind, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/web-client';
import { trackEvent } from '@/lib/analytics/client';
import { PricingOfferBlock } from '@/components/marketing/pricing-offer-block';

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
                    <h3 className="text-3xl md:text-4xl font-headline mb-6 text-stone-900">One last thing before you go...</h3>
                    <p className="text-stone-500 text-lg mb-10 leading-relaxed font-light">
                        Not sure where to start? Take our 30-second wellbeing assessment to get your personalized profile.
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
                            Take the assessment (30s)
                        </Button>
                        <button
                            onClick={() => { setShow(false); setDismissed(true); }}
                            className="text-stone-400 text-sm hover:underline font-light"
                        >
                            No thanks, I want to keep browsing
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
            q: "When you think about your day, what stands out most?",
            options: [
                { label: "D", text: "I have a lot to do and I want to move fast" },
                { label: "I", text: "I need to connect with others and share" },
                { label: "S", text: "I seek calm and harmony" },
                { label: "C", text: "I analyze situations before acting" },
            ],
        },
        {
            q: "When facing a difficult situation, your first reaction is:",
            options: [
                { label: "D", text: "Take control and find a solution" },
                { label: "I", text: "Talk about it to see different perspectives" },
                { label: "S", text: "Regain calm before reacting" },
                { label: "C", text: "Understand all details before deciding" },
            ],
        },
        {
            q: "If you opened your journal now, you would write about:",
            options: [
                { label: "D", text: "Your goals and what you want to accomplish" },
                { label: "I", text: "Your interactions and what touched you emotionally" },
                { label: "S", text: "Your need for peace and stability" },
                { label: "C", text: "Your deep reflections and analyses" },
            ],
        },
        {
            q: "What you are mainly looking for right now:",
            options: [
                { label: "D", text: "Momentum and action" },
                { label: "I", text: "Connection and inspiration" },
                { label: "S", text: "Safety and comfort" },
                { label: "C", text: "Clarity and structure" },
            ],
        },
        {
            q: "When you have to choose, you prioritize:",
            options: [
                { label: "D", text: "Efficiency and speed" },
                { label: "I", text: "Impact on others" },
                { label: "S", text: "Safety and predictability" },
                { label: "C", text: "Logic and facts" },
            ],
        },
        {
            q: "Your natural communication style:",
            options: [
                { label: "D", text: "Direct and concise" },
                { label: "I", text: "Warm and expressive" },
                { label: "S", text: "Calm and thoughtful" },
                { label: "C", text: "Structured and precise" },
            ],
        },
        {
            q: "Your ideal environment:",
            options: [
                { label: "D", text: "Dynamic, with constant challenges" },
                { label: "I", text: "Collaborative, with lots of interactions" },
                { label: "S", text: "Stable, with few changes" },
                { label: "C", text: "Organized, with clear processes" },
            ],
        },
        {
            q: "What motivates you the most:",
            options: [
                { label: "D", text: "Results and winning" },
                { label: "I", text: "Recognition and connection" },
                { label: "S", text: "Safety and belonging" },
                { label: "C", text: "Mastery and excellence" },
            ],
        },
    ];

    type ProfileKey = "D" | "I" | "S" | "C" | "MIXTE";

    const profileMap: Record<ProfileKey, { title: string; description: string }> = {
        D: {
            title: "The Pioneer",
            description: "You like to move fast and decide. Your journal helps channel that energy.",
        },
        I: {
            title: "The Connector",
            description: "You are driven by relationships and emotions. Your journal becomes a space for expression.",
        },
        S: {
            title: "The Anchor",
            description: "You seek peace and consistency. Your journal gives you a stable refuge.",
        },
        C: {
            title: "The Architect",
            description: "You like to understand before acting. Your journal becomes your ideas lab.",
        },
        MIXTE: {
            title: "Mixed profile - The Balancer",
            description: "You combine multiple strengths. Your journal adapts to your complexity.",
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
                                <span className="text-primary/60 text-[10px] uppercase tracking-widest mb-6 block font-bold">Reflection path • {step + 1}/{questions.length}</span>
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
                                <h3 className="text-3xl md:text-5xl font-headline mb-6 text-stone-900">Your profile is ready.</h3>
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
                                        {user ? "See my result in Magazine" : "Create my account to see my result"}
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
                        <span className="font-headline font-semibold">Start my Sanctuary</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
                <div className="mt-2 text-center pointer-events-none">
                    <span className="text-[9px] text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-tighter font-bold">No commitment • Private</span>
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
            question: "Who can read my data?",
            answer: "No one. We use an admin-blind architecture with client-side AES-256 encryption. Your entries are encrypted with your private key before being sent. Even with full server access, your writing cannot be decrypted without your password."
        },
        {
            question: "How can I calm anxiety at night and sleep better?",
            answer: "Write 3 lines before bed: what weighs on you, what you feel, and what you need tomorrow. The goal is to move rumination out of your head and calm your mind."
        },
        {
            question: "How can I reduce mental load in 5 minutes?",
            answer: "Set a 5-minute timer and write without editing: facts, emotions, needs. This short routine helps release pressure and regain clarity, even on busy days."
        },
        {
            question: "How do I stop overthinking quickly?",
            answer: "When your mind is spinning, write one idea per line. This turns a messy flow into a concrete list. Then choose one small action for today."
        },
        {
            question: "Does journaling really help with stress and anxiety?",
            answer: "Studies suggest that regular writing can improve psychological wellbeing and reduce some stress and anxiety symptoms. It is not magic, but it is simple, accessible, and useful."
        },
        {
            question: "Which online journal is truly private?",
            answer: "Choose an end-to-end encrypted journal, ad-free, where your notes are never publicly exposed. On Aurum, you write in a private space built for mental clarity."
        },
        {
            question: "Is it free?",
            answer: "Yes, you can start for free. Paid plans are available if you want advanced features."
        }
    ];

    return (
        <main>
            <HeroIntegrated />
            <section id="use-cases-seo" className="py-20 md:py-24 bg-white border-y border-stone-200/70">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-headline text-stone-900 mb-4">
                            Common pain points: how writing can truly help
                        </h2>
                        <p className="text-stone-600 font-light text-lg">
                            Practical examples to reduce mental load, calm anxiety, and break rumination loops.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <Moon className="h-3.5 w-3.5" />
                                Insomnia
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Your brain keeps racing at night</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                Write what keeps looping. In practice: 3 lines before sleep
                                (fact, emotion, need) can already calm your mind.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Calm my nights →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <Brain className="h-3.5 w-3.5" />
                                Self-talk
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">You talk to yourself too harshly</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                When the inner voice says "I'm not good enough", write a fairer version:
                                "I'm moving forward step by step." It helps rebuild confidence.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Rebuild confidence →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <Wind className="h-3.5 w-3.5" />
                                Overthinking
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Everything feels messy in your head</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                Write one idea per line. You turn mental confusion into clear points,
                                then choose one small step for today.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Find clarity →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <Flame className="h-3.5 w-3.5" />
                                Pressure
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">You hold everything in, then explode</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                A few consistent lines beat one rare long session.
                                You decompress before overload and regain calm.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Release pressure →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <CircleHelp className="h-3.5 w-3.5" />
                                Getting started
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">You don't know where to start</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                Simple rule: start with one fact, one emotion, one need.
                                That's enough to begin without pressure, even in 2 minutes.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Start now →
                            </Link>
                        </article>

                        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                <ListChecks className="h-3.5 w-3.5" />
                                Mental load
                            </div>
                            <h3 className="text-2xl font-headline text-stone-900 mb-3">Your task list is suffocating you</h3>
                            <p className="text-stone-600 font-light leading-relaxed mb-6">
                                Set a 5-minute timer and write without editing:
                                facts, emotions, needs. This short routine gives you mental breathing room.
                            </p>
                            <Link href="/sanctuary/write" className="mt-auto text-primary font-medium hover:underline">
                                Lighten my mental load →
                            </Link>
                        </article>
                    </div>
                    <p className="mt-8 text-xs text-stone-500 text-center font-light">
                        Based on recent research on writing and psychological wellbeing
                        <sup>
                            <a href="#ref3" aria-label="See reference 3" className="no-underline"> 3</a>
                        </sup>
                        <sup>
                            <a href="#ref4" aria-label="See reference 4" className="no-underline"> 4</a>
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
                            What does a cluttered mind feel like?
                        </h2>
                        <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/80 font-light">
                            <p>
                                It is when thoughts loop endlessly. It can block sleep and make you feel low
                                or irritable. Sometimes you just feel stuck.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Solution */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline mb-6">
                            The superpower of writing.
                        </h2>
                        <p className="text-stone-600 font-light text-lg leading-relaxed">
                            Writing your thoughts, even the most private ones, is like telling them "Stop." It calms them down.
                            Aurum is your tool to do it safely.
                        </p>
                    </div>
                </section>

                {/* SECTION 3: Scientific social proof */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container max-w-4xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-4xl md:text-5xl font-headline mb-6">This is not magic. It is an observed effect.</h2>
                            <p className="text-stone-600 font-light text-lg leading-relaxed">
                                Researchers have studied the power of writing. In their studies, they found surprising results:
                            </p>
                        </div>
                        <ul className="space-y-5 text-stone-700 font-light leading-relaxed text-lg max-w-3xl mx-auto">
                            <li className="rounded-2xl border border-stone-200 bg-white p-6">
                                <span className="font-medium text-stone-900">Finding #1:</span> Participants who took time
                                to write about their worries saw medical visits cut by half
                                <sup><a href="#ref1" aria-label="See reference 1" className="no-underline"> *</a></sup>.
                            </li>
                            <li className="rounded-2xl border border-stone-200 bg-white p-6">
                                <span className="font-medium text-stone-900">Finding #2:</span> In another study of people
                                who had lost their jobs, those who wrote about their emotions were twice as likely to find
                                a new job
                                <sup><a href="#ref2" aria-label="See reference 2" className="no-underline"> **</a></sup>.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* SECTION 5: Trust & Privacy (Enhanced) */}
                <section className="py-24 md:py-40 bg-white">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">Your Integrity, Our Priority</span>
                            <h2 className="text-4xl md:text-6xl font-headline mb-6">A sanctuary where you stay in full control.</h2>
                            <p className="text-stone-500 font-light text-lg">Aurum is built around one simple idea: your inner world belongs to you, and only you.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Absolute Privacy</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed mb-4">
                                    Your thoughts are encrypted (AES-256) directly on your device. Even we cannot read your private notes.
                                </p>
                                {/* Security page removed - TABULA RASA */}
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <Fingerprint className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Guaranteed Anonymity</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    No personal data is tied to your writing. The Aurum analysis engine runs locally on your device.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-headline mb-3 text-primary">Right to Be Forgotten</h3>
                                <p className="text-sm text-stone-500 font-light leading-relaxed">
                                    You keep 100% ownership of your data. Export your journals or delete your account in one click.
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="max-w-xl text-center md:text-left">
                                    <h4 className="text-3xl font-headline mb-4">Our Trust Manifesto</h4>
                                    <p className="text-stone-400 font-light leading-relaxed">
                                        "We do not sell ads. We do not sell your data. We deliver clarity and peace of mind. Your journal is not a product, it is your private sanctuary."
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-7xl font-headline text-primary/20 select-none">Aurum</div>
                                    <div className="w-20 h-px bg-white/20"></div>
                                    <span className="text-[10px] uppercase tracking-[0.4em] font-medium opacity-50">Protection Seal</span>
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
                    <PricingOfferBlock className="mb-10" ctaHref="/pricing" />
                    <Button asChild size="lg" className="h-14 px-12 text-base">
                        <Link href="/sanctuary/write">Discover my first reflection</Link>
                    </Button>
                    <div className="mt-6">
                        <span className="text-xs text-stone-400 font-light">Instant access • 100% Encrypted • No card required</span>
                    </div>
                    <div className="mt-10 max-w-5xl mx-auto">
                        <p className="text-stone-600 font-light text-lg mb-6">
                            In your Aurum space, you get a clear framework to move forward every day.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mb-2 font-semibold">Personal Space</p>
                                <p className="text-sm text-stone-600 font-light">Your private journal, structured and easy to resume.</p>
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mb-2 font-semibold">Useful Stats</p>
                                <p className="text-sm text-stone-600 font-light">Simple markers to track your emotional progress.</p>
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mb-2 font-semibold">Guided Assessments</p>
                                <p className="text-sm text-stone-600 font-light">Fast paths to understand yourself without overwhelm.</p>
                            </div>
                            <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mb-2 font-semibold">Talk with Aurum</p>
                                <p className="text-sm text-stone-600 font-light">A private dialogue to clarify what you are going through.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 8: Interactive personality quiz (moved above FAQ) */}
                <div id="evaluation">
                    <QuizSection />
                </div>

                <section className="container max-w-3xl pb-24 md:pb-32">
                    <h2 className="text-4xl font-headline text-center mb-12">
                        Frequently Asked Questions
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
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 mb-4">References</h3>
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
