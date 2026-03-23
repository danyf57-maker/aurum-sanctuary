'use client';

import { useState, useEffect } from 'react';
import HeroIntegrated from '@/components/landing/HeroIntegrated';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Compass, ArrowRight, ShieldCheck, Lock, Fingerprint, Brain, Moon, Flame, CircleHelp, Wind, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useTranslations } from 'next-intl';
import { PricingOfferBlock } from '@/components/marketing/pricing-offer-block';

type MarketingFaq = {
    question: string;
    answer: string;
};

type MarketingCard = {
    eyebrow?: string;
    title: string;
    body: string;
    example?: string;
    badge?: string;
    cta?: string;
};

type MarketingStudyCard = {
    eyebrow: string;
    title: string;
    body: string;
    example: string;
};

type MarketingExampleHighlight = {
    title: string;
    body: string;
};

const ExitIntent = () => null;

const FloatingCTA = ({
    visible,
    href,
    label,
    disabled = false,
}: {
    visible: boolean;
    href: string;
    label: string;
    disabled?: boolean;
}) => {
    const t = useTranslations('marketingPage.floatingCta');
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-8 right-8 z-[100]"
            >
                <Button
                    asChild={!disabled}
                    size="lg"
                    disabled={disabled}
                    className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 px-8 h-14 group border-4 border-white/20 backdrop-blur-sm"
                >
                    {disabled ? (
                        <span className="flex items-center gap-3">
                            <span className="font-headline font-semibold">{label}</span>
                            <ArrowRight className="w-5 h-5" />
                        </span>
                    ) : (
                    <Link href={href} className="flex items-center gap-3">
                        <span className="font-headline font-semibold">{label}</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    )}
                </Button>
                <div className="mt-2 text-center pointer-events-none">
                    <span className="text-[9px] text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-tighter font-bold">{t('label')}</span>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};
export default function Home() {
    const [showCTA, setShowCTA] = useState(false);
    const { user } = useAuth();
    const to = useLocalizedHref();
    const t = useTranslations('marketingPage');
    const primaryCtaHref = user ? to('/sanctuary/write') : to('/signup');
    const primaryCtaLabel = user ? t('returningUser.writeCta') : null;
    const primaryCtaLabelArrow = user ? t('returningUser.writeCtaArrow') : null;

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

    const faqs = t.raw('faqs') as MarketingFaq[];
    const studyCards = t.raw('studyCards') as MarketingStudyCard[];
    const exampleHighlights = t.raw('exampleSection.highlights') as MarketingExampleHighlight[];
    const useCaseCards = t.raw('useCases.cards') as MarketingCard[];
    const trustCards = t.raw('trust.cards') as MarketingCard[];
    const featureCards = t.raw('finalCta.cards') as MarketingCard[];
    const discoveries = t.raw('scientificProof.discoveries') as Array<{ label: string; body: string }>;
    const referenceAriaLabels = [
        t('references.aria1'),
        t('references.aria2'),
        t('references.aria3'),
        t('references.aria4'),
    ];
    return (
        <main>
            <HeroIntegrated />
            <section className="bg-white py-14 md:py-16">
                <div className="container">
                    <PricingOfferBlock className="mx-auto" pagePath="/" />
                </div>
            </section>
            <section className="bg-stone-50/60 py-16 md:py-20 border-y border-stone-200/70">
                <div className="container">
                    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div className="text-center lg:text-left">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                                {t('exampleSection.eyebrow')}
                            </p>
                            <h2 className="mb-4 text-3xl md:text-4xl font-headline text-stone-900">
                                {t('exampleSection.title')}
                            </h2>
                            <p className="text-lg font-light text-stone-600">
                                {t('exampleSection.subtitle')}
                            </p>
                            <div className="mt-6 grid gap-4">
                                {exampleHighlights.map((item) => (
                                    <div key={item.title} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm">
                                        <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                        <p className="mt-1 text-sm font-light leading-relaxed text-stone-600">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                                {t('exampleSection.entryLabel')}
                            </p>
                            <p className="mt-3 rounded-2xl bg-stone-900 px-5 py-4 text-lg font-light leading-relaxed text-white">
                                {t('exampleSection.entry')}
                            </p>
                            <div className="mt-5 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-5 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                                    {t('exampleSection.reflectionLabel')}
                                </p>
                                <p className="mt-3 text-lg font-light leading-relaxed text-stone-800">
                                    {t('exampleSection.reflection')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-14 md:py-16 bg-white border-y border-stone-200/70">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-headline text-stone-900 mb-4">
                            {t('studySection.title')}
                        </h2>
                        <p className="text-stone-600 font-light text-lg">
                            {t('studySection.subtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
                        {studyCards.map((card, index) => (
                            <article key={card.title} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-6">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-3 font-semibold">{card.eyebrow}</p>
                                <h3 className="text-xl font-headline text-stone-900 mb-2">{card.title}</h3>
                                <p className="text-sm text-stone-600 font-light leading-relaxed mb-3">{card.body}</p>
                                <p className="text-xs text-stone-500 font-light leading-relaxed">
                                    {card.example}
                                    {index === 0 && (
                                        <sup><a href={to('/etudes-scientifiques#etude-1')} aria-label={t('references.aria1')} className="no-underline font-semibold text-stone-700"> 1</a></sup>
                                    )}
                                    {index === 1 && (
                                        <sup><a href={to('/etudes-scientifiques#etude-2')} aria-label={t('references.aria2')} className="no-underline font-semibold text-stone-700"> 2</a></sup>
                                    )}
                                    {index === 2 && (
                                        <>
                                            <sup><a href={to('/etudes-scientifiques#etude-3')} aria-label={t('references.aria3')} className="no-underline font-semibold text-stone-700"> 3</a></sup>
                                            <sup><a href={to('/etudes-scientifiques#etude-4')} aria-label={t('references.aria4')} className="no-underline font-semibold text-stone-700"> 4</a></sup>
                                        </>
                                    )}
                                </p>
                            </article>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <Button asChild size="lg" className="h-12 px-8 rounded-xl">
                            <Link href={primaryCtaHref}>
                                {user ? t('studySection.ctaAuthenticated') : t('studySection.cta')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
            <section id="use-cases-seo" className="py-20 md:py-24 bg-white border-y border-stone-200/70">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-headline text-stone-900 mb-4">
                            {t('useCases.title')}
                        </h2>
                        <p className="text-stone-600 font-light text-lg">
                            {t('useCases.subtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useCaseCards.map((card, index) => (
                            <article key={card.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm h-full flex flex-col">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-stone-600 font-medium w-fit">
                                    {index === 0 && <Moon className="h-3.5 w-3.5" />}
                                    {index === 1 && <Brain className="h-3.5 w-3.5" />}
                                    {index === 2 && <Wind className="h-3.5 w-3.5" />}
                                    {index === 3 && <Flame className="h-3.5 w-3.5" />}
                                    {index === 4 && <CircleHelp className="h-3.5 w-3.5" />}
                                    {(index === 5 || index === 8) && <ListChecks className="h-3.5 w-3.5" />}
                                    {index === 6 && <Compass className="h-3.5 w-3.5" />}
                                    {index === 7 && <Moon className="h-3.5 w-3.5" />}
                                    {card.badge}
                                </div>
                                <h3 className="text-2xl font-headline text-stone-900 mb-3">{card.title}</h3>
                                <p className="text-stone-600 font-light leading-relaxed mb-6">{card.body}</p>
                                <Link href={primaryCtaHref} className="mt-auto text-primary font-medium hover:underline">
                                    {primaryCtaLabelArrow ?? t('useCases.cta')}
                                </Link>
                            </article>
                        ))}
                    </div>
                    <p className="mt-8 text-xs text-stone-500 text-center font-light">
                        {t('useCases.note')}
                        <sup>
                            <a href={to('/etudes-scientifiques#etude-3')} aria-label={t('references.aria3')} className="no-underline font-semibold text-stone-700"> 3</a>
                        </sup>
                        <sup>
                            <a href={to('/etudes-scientifiques#etude-4')} aria-label={t('references.aria4')} className="no-underline font-semibold text-stone-700"> 4</a>
                        </sup>
                        .
                    </p>
                </div>
            </section>

            {/* SECTION 3: Scientific social proof */}
            <section className="py-24 md:py-32 bg-stone-100/50">
                <div className="container max-w-4xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-4xl md:text-5xl font-headline text-stone-900 mb-6">{t('scientificProof.title')}</h2>
                        <p className="text-stone-700 font-light text-lg leading-relaxed">
                            {t('scientificProof.subtitle')}
                        </p>
                    </div>
                    <ul className="space-y-5 text-stone-800 font-light leading-relaxed text-lg max-w-3xl mx-auto">
                        {discoveries.map((discovery, index) => (
                            <li key={discovery.label} className="rounded-2xl border border-stone-200 bg-white p-6">
                                <span className="font-medium text-stone-900">{discovery.label}</span> {discovery.body}
                                <sup><a href={to(`/etudes-scientifiques#etude-${index + 1}`)} aria-label={referenceAriaLabels[index]} className="no-underline font-semibold text-stone-700"> {index + 1}</a></sup>.
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <div id="sanctuary-content" className="bg-background text-foreground">
                {/* SECTION 1: Problem */}
                <section className="py-24 md:py-32 bg-stone-100/50">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline text-stone-900 mb-6">
                            {t('problem.title')}
                        </h2>
                        <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/80 font-light">
                            <p>
                                {t('problem.body')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Solution */}
                <section className="py-24 md:py-32 bg-white">
                    <div className="container max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-headline text-stone-900 mb-6">
                            {t('solution.title')}
                        </h2>
                        <p className="text-stone-700 font-light text-lg leading-relaxed">
                            {t('solution.body')}
                        </p>
                    </div>
                </section>

                {/* SECTION 5: Trust & Privacy (Enhanced) */}
                <section className="py-24 md:py-40 bg-white">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-[#B8941F] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">{t('trust.eyebrow')}</span>
                            <h2 className="text-4xl md:text-6xl font-headline text-stone-900 mb-6">{t('trust.title')}</h2>
                            <p className="text-stone-700 font-light text-lg">{t('trust.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                            {trustCards.map((card, index) => (
                                <div key={card.title} className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                                        {index === 0 && <Lock className="w-6 h-6" />}
                                        {index === 1 && <Fingerprint className="w-6 h-6" />}
                                        {index === 2 && <ShieldCheck className="w-6 h-6" />}
                                    </div>
                                    <h3 className="text-xl font-headline mb-3 text-primary">{card.title}</h3>
                                    <p className="text-sm text-stone-700 font-light leading-relaxed mb-4">{card.body}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-stone-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="max-w-xl text-center md:text-left">
                                    <h4 className="text-3xl font-headline mb-4">{t('trust.manifestoTitle')}</h4>
                                    <p className="text-stone-400 font-light leading-relaxed">
                                        {t('trust.manifestoBody')}
                                    </p>
                                </div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-7xl font-headline text-primary/20 select-none">Aurum</div>
                                    <div className="w-20 h-px bg-white/20"></div>
                                    <span className="text-[10px] uppercase tracking-[0.4em] font-medium opacity-50">{t('trust.seal')}</span>
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
                        <Link href={primaryCtaHref}>
                            {user ? t('finalCta.buttonAuthenticated') : t('finalCta.button')}
                        </Link>
                    </Button>
                    <div className="mt-6">
                        <span className="text-xs text-stone-600 font-light">{t('finalCta.note')}</span>
                    </div>
                    <div className="mt-10 max-w-5xl mx-auto">
                        <p className="text-stone-700 font-light text-lg mb-6">
                            {t('finalCta.subtitle')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                            {featureCards.map((card) => (
                                <div key={card.title} className="rounded-2xl border border-stone-200 bg-white p-5">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500 mb-2 font-semibold">{card.eyebrow}</p>
                                    <p className="text-sm text-stone-700 font-light">{card.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container max-w-3xl pb-24 md:pb-32">
                    <h2 className="text-4xl font-headline text-stone-900 text-center mb-12">
                        {t('faqTitle')}
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
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-stone-500 mb-4">{t('references.title')}</h3>
                        <ul className="space-y-3 text-xs text-stone-500 leading-relaxed">
                            <li id="ref1">
                                <strong>1</strong> Pennebaker, J. W., & Beall, S. K. (1986). <em>Confronting a traumatic event: Toward an understanding of inhibition and disease.</em> Journal of Abnormal Psychology, 95, 274-281.
                            </li>
                            <li id="ref2">
                                <strong>2</strong> Spera, S. P., Buhrfeind, E. D., & Pennebaker, J. W. (1994). <em>Expressive writing and coping with job loss.</em> Academy of Management Journal, 37, 722-733.
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

            <FloatingCTA
                visible={showCTA}
                href={primaryCtaHref}
                label={primaryCtaLabel ?? t('floatingCta.cta')}
                disabled={false}
            />
            <ExitIntent />
        </main>
    );
}
