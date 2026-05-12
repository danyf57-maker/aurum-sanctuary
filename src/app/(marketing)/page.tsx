import HeroIntegrated from '@/components/landing/HeroIntegrated';
import { FloatingHomeCta } from '@/components/marketing/floating-home-cta';
import { localizeHref } from '@/lib/i18n/path';
import { getRequestLocale } from '@/lib/locale-server';
import {
    ArrowRight,
    Brain,
    CircleHelp,
    Compass,
    Fingerprint,
    Flame,
    ListChecks,
    Lock,
    Moon,
    ShieldCheck,
    Wind,
    type LucideIcon,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';

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

type ScientificDiscovery = {
    label: string;
    body: string;
};

type Translate = Awaited<ReturnType<typeof getTranslations>>;
type ToHref = (href: string) => string;

const FEATURED_USE_CASE_COUNT = 3;
const GUIDE_LINKS_BY_INDEX = [
    '/guides/overthinking-at-night',
    '/guides/charge-mentale',
    '/guides/journaling-prompts-for-clarity',
] as const;

const USE_CASE_ICONS: Record<number, LucideIcon> = {
    0: Moon,
    1: Brain,
    2: Wind,
    3: Flame,
    4: CircleHelp,
    5: ListChecks,
    6: Compass,
    7: Moon,
    8: ListChecks,
};

const TRUST_ICONS: LucideIcon[] = [Lock, Fingerprint, ShieldCheck];

function ReferenceLink({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: ReactNode;
}) {
    return (
        <sup>
            <a href={href} aria-label={label} className="no-underline font-semibold text-stone-700">
                {' '}
                {children}
            </a>
        </sup>
    );
}

function TrialSection({ trialT, to }: { trialT: Translate; to: ToHref }) {
    return (
        <section className="aurum-motion-section bg-white py-14 md:py-16">
            <div className="container">
                <div className="aurum-motion-card mx-auto w-full max-w-[720px] rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-8 shadow-sm md:p-10">
                    <div className="flex h-full flex-col justify-between gap-8">
                        <div className="space-y-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                                {trialT('badge')}
                            </p>
                            <h2 className="font-headline text-3xl text-stone-900 md:text-4xl">
                                {trialT('title')}
                            </h2>
                            <p className="max-w-2xl text-base text-stone-600">{trialT('body')}</p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={to('/pricing')}
                                className="aurum-motion-button inline-flex items-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 hover:bg-stone-800"
                            >
                                {trialT('cta')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ExampleSection({
    t,
    highlights,
}: {
    t: Translate;
    highlights: MarketingExampleHighlight[];
}) {
    return (
        <section className="aurum-motion-section aurum-motion-delay-1 border-y border-stone-200/70 bg-stone-50/60 py-16 md:py-20">
            <div className="container">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="text-center lg:text-left">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                            {t('exampleSection.eyebrow')}
                        </p>
                        <h2 className="mb-4 font-headline text-3xl text-stone-900 md:text-4xl">
                            {t('exampleSection.title')}
                        </h2>
                        <p className="text-lg font-light text-stone-600">{t('exampleSection.subtitle')}</p>
                        <div className="mt-6 grid gap-4">
                            {highlights.map((item) => (
                                <div key={item.title} className="aurum-motion-card rounded-2xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm">
                                    <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                                    <p className="mt-1 text-sm font-light leading-relaxed text-stone-600">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="aurum-motion-card rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {t('exampleSection.entryLabel')}
                        </p>
                        <p className="mt-3 rounded-2xl bg-stone-900 px-5 py-4 text-lg font-light leading-relaxed text-white">
                            {t('exampleSection.entry')}
                        </p>
                        <div className="aurum-motion-reveal mt-5 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-5 py-4">
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
    );
}

function StudyReferences({
    index,
    referenceLabels,
    to,
}: {
    index: number;
    referenceLabels: string[];
    to: ToHref;
}) {
    const referencesByCard = [[1], [2], [3, 4]];
    return (
        <>
            {(referencesByCard[index] ?? []).map((referenceNumber) => (
                <ReferenceLink
                    key={referenceNumber}
                    href={to(`/etudes-scientifiques#etude-${referenceNumber}`)}
                    label={referenceLabels[referenceNumber - 1]}
                >
                    {referenceNumber}
                </ReferenceLink>
            ))}
        </>
    );
}

function StudySection({
    t,
    cards,
    referenceLabels,
    primaryCtaHref,
    to,
}: {
    t: Translate;
    cards: MarketingStudyCard[];
    referenceLabels: string[];
    primaryCtaHref: string;
    to: ToHref;
}) {
    return (
        <section className="aurum-motion-section aurum-motion-delay-2 border-y border-stone-200/70 bg-white py-14 md:py-16">
            <div className="container">
                <div className="mx-auto mb-8 max-w-4xl text-center">
                    <h2 className="mb-4 font-headline text-3xl text-stone-900 md:text-4xl">
                        {t('studySection.title')}
                    </h2>
                    <p className="text-lg font-light text-stone-600">{t('studySection.subtitle')}</p>
                </div>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
                    {cards.map((card, index) => (
                        <article key={card.title} className="aurum-motion-card rounded-2xl border border-stone-200 bg-stone-50/70 p-6">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{card.eyebrow}</p>
                            <h3 className="mb-2 font-headline text-xl text-stone-900">{card.title}</h3>
                            <p className="mb-3 text-sm font-light leading-relaxed text-stone-600">{card.body}</p>
                            <p className="text-xs font-light leading-relaxed text-stone-500">
                                {card.example}
                                <StudyReferences index={index} referenceLabels={referenceLabels} to={to} />
                            </p>
                        </article>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <Link
                        href={primaryCtaHref}
                        className="aurum-motion-button inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        {t('studySection.cta')}
                    </Link>
                </div>
            </div>
        </section>
    );
}

function UseCaseBadge({ card, index }: { card: MarketingCard; index: number }) {
    const Icon = USE_CASE_ICONS[index];

    return (
        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-600">
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {card.badge}
        </div>
    );
}

function UseCasesSection({
    t,
    cards,
    guideLinkLabel,
    primaryCtaHref,
    referenceLabels,
    to,
}: {
    t: Translate;
    cards: MarketingCard[];
    guideLinkLabel: string;
    primaryCtaHref: string;
    referenceLabels: string[];
    to: ToHref;
}) {
    return (
        <section id="use-cases-seo" className="aurum-motion-section border-y border-stone-200/70 bg-white py-20 md:py-24">
            <div className="container">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2 className="mb-4 font-headline text-3xl text-stone-900 md:text-5xl">{t('useCases.title')}</h2>
                    <p className="text-lg font-light text-stone-600">{t('useCases.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card, index) => (
                        <article key={card.title} className="aurum-motion-card flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <UseCaseBadge card={card} index={index} />
                            <h3 className="mb-3 font-headline text-2xl text-stone-900">{card.title}</h3>
                            <p className="mb-6 font-light leading-relaxed text-stone-600">{card.body}</p>
                            <div className="mt-auto flex flex-col gap-2">
                                {index < FEATURED_USE_CASE_COUNT ? (
                                    <Link href={primaryCtaHref} className="font-medium text-primary hover:underline">
                                        {t('useCases.cta')}
                                    </Link>
                                ) : null}
                                {GUIDE_LINKS_BY_INDEX[index] ? (
                                    <Link
                                        href={to(GUIDE_LINKS_BY_INDEX[index])}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:underline"
                                    >
                                        {guideLinkLabel}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href={primaryCtaHref}
                        className="aurum-motion-button inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        {t('useCases.sectionCta')}
                    </Link>
                </div>
                <p className="mt-8 text-center text-xs font-light text-stone-500">
                    {t('useCases.note')}
                    <ReferenceLink href={to('/etudes-scientifiques#etude-3')} label={referenceLabels[2]}>
                        3
                    </ReferenceLink>
                    <ReferenceLink href={to('/etudes-scientifiques#etude-4')} label={referenceLabels[3]}>
                        4
                    </ReferenceLink>
                    .
                </p>
            </div>
        </section>
    );
}

function ScientificProofSection({
    t,
    discoveries,
    referenceLabels,
    to,
}: {
    t: Translate;
    discoveries: ScientificDiscovery[];
    referenceLabels: string[];
    to: ToHref;
}) {
    return (
        <section className="aurum-motion-section aurum-motion-delay-1 bg-stone-100/50 py-24 md:py-32">
            <div className="container mx-auto max-w-4xl">
                <div className="mx-auto mb-14 max-w-3xl text-center">
                    <h2 className="mb-6 font-headline text-4xl text-stone-900 md:text-5xl">{t('scientificProof.title')}</h2>
                    <p className="text-lg font-light leading-relaxed text-stone-700">{t('scientificProof.subtitle')}</p>
                </div>
                <ul className="mx-auto max-w-3xl space-y-5 text-lg font-light leading-relaxed text-stone-800">
                    {discoveries.map((discovery, index) => (
                        <li key={discovery.label} className="aurum-motion-card rounded-2xl border border-stone-200 bg-white p-6">
                            <span className="font-medium text-stone-900">{discovery.label}</span> {discovery.body}
                            <ReferenceLink
                                href={to(`/etudes-scientifiques#etude-${index + 1}`)}
                                label={referenceLabels[index]}
                            >
                                {index + 1}
                            </ReferenceLink>
                            .
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function ProblemSolutionSections({ t }: { t: Translate }) {
    return (
        <>
            <section className="aurum-motion-section bg-stone-100/50 py-24 md:py-32">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="mb-6 font-headline text-4xl text-stone-900 md:text-5xl">{t('problem.title')}</h2>
                    <div className="prose prose-lg mx-auto font-light text-foreground/80 lg:prose-xl">
                        <p>{t('problem.body')}</p>
                    </div>
                </div>
            </section>

            <section className="aurum-motion-section aurum-motion-delay-1 bg-white py-24 md:py-32">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="mb-6 font-headline text-4xl text-stone-900 md:text-5xl">{t('solution.title')}</h2>
                    <p className="text-lg font-light leading-relaxed text-stone-700">{t('solution.body')}</p>
                </div>
            </section>
        </>
    );
}

function TrustSection({ t, cards }: { t: Translate; cards: MarketingCard[] }) {
    return (
        <section className="aurum-motion-section bg-white py-24 md:py-40">
            <div className="container">
                <div className="mx-auto mb-20 max-w-3xl text-center">
                    <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#7A5D00]">{t('trust.eyebrow')}</span>
                    <h2 className="mb-6 font-headline text-4xl text-stone-900 md:text-6xl">{t('trust.title')}</h2>
                    <p className="text-lg font-light text-stone-700">{t('trust.subtitle')}</p>
                </div>

                <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon = TRUST_ICONS[index];
                        return (
                            <div key={card.title} className="aurum-motion-card flex flex-col items-center rounded-3xl border border-stone-100 bg-stone-50 p-8 text-center transition-shadow hover:shadow-lg">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                                    {Icon ? <Icon className="h-6 w-6" /> : null}
                                </div>
                                <h3 className="mb-3 font-headline text-xl text-primary">{card.title}</h3>
                                <p className="mb-4 text-sm font-light leading-relaxed text-stone-700">{card.body}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="aurum-motion-card aurum-motion-sheen relative overflow-hidden rounded-[2rem] bg-stone-900 p-8 text-white md:p-16">
                    <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="mb-4 font-headline text-3xl">{t('trust.manifestoTitle')}</h3>
                            <p className="font-light leading-relaxed text-stone-400">{t('trust.manifestoBody')}</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="select-none font-headline text-7xl text-primary/20">Aurum</div>
                            <div className="h-px w-20 bg-white/20" />
                            <span className="text-[10px] font-medium uppercase tracking-[0.4em] opacity-50">{t('trust.seal')}</span>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-[80px]" />
                </div>
            </div>
        </section>
    );
}

function FinalCtaSection({
    t,
    cards,
    primaryCtaHref,
}: {
    t: Translate;
    cards: MarketingCard[];
    primaryCtaHref: string;
}) {
    return (
        <section className="aurum-motion-section container border-t border-black/5 py-24 text-center md:py-32">
            <Link
                href={primaryCtaHref}
                className="aurum-motion-button inline-flex h-14 items-center justify-center rounded-md bg-primary px-12 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                {t('finalCta.button')}
            </Link>
            <div className="mt-6">
                <span className="text-xs font-light text-stone-600">{t('finalCta.note')}</span>
            </div>
            <div className="mx-auto mt-10 max-w-5xl">
                <p className="mb-6 text-lg font-light text-stone-700">{t('finalCta.subtitle')}</p>
                <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.body} className="aurum-motion-card rounded-2xl border border-stone-200 bg-white p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">{card.eyebrow}</p>
                            <p className="text-sm font-light text-stone-700">{card.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FaqSection({ t, faqs }: { t: Translate; faqs: MarketingFaq[] }) {
    return (
        <section className="aurum-motion-section container max-w-3xl pb-24 md:pb-32">
            <h2 className="mb-12 text-center font-headline text-4xl text-stone-900 dark:text-stone-100">{t('faqTitle')}</h2>
            <div className="w-full divide-y divide-stone-200 border-y border-stone-200 dark:divide-stone-700 dark:border-stone-700">
                {faqs.map((faq) => (
                    <details key={faq.question} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-headline text-xl font-normal text-stone-900 dark:text-stone-100">
                            <span>{faq.question}</span>
                            <span className="text-2xl leading-none text-stone-400 transition-transform group-open:rotate-45 dark:text-stone-300">+</span>
                        </summary>
                        <p className="mt-4 text-lg font-light leading-relaxed text-foreground/80 dark:text-stone-300">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

function ReferencesSection({ t }: { t: Translate }) {
    return (
        <section className="aurum-motion-section container max-w-4xl pb-24 md:pb-28">
            <div className="aurum-motion-card rounded-2xl border border-stone-200 bg-stone-50/60 p-6 md:p-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500">{t('references.title')}</h3>
                <ul className="space-y-3 text-xs leading-relaxed text-stone-500">
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
    );
}

export default async function Home() {
    const locale = await getRequestLocale();
    const isFr = locale === 'fr';
    const t = await getTranslations('marketingPage');
    const trialT = await getTranslations('trialOffer');
    const to = (href: string) => localizeHref(href, locale);
    const primaryCtaHref = to('/signup');
    const guideLinkLabel = isFr ? 'Lire le guide lié' : 'Read the related guide';

    const faqs = t.raw('faqs') as MarketingFaq[];
    const studyCards = t.raw('studyCards') as MarketingStudyCard[];
    const exampleHighlights = t.raw('exampleSection.highlights') as MarketingExampleHighlight[];
    const useCaseCards = t.raw('useCases.cards') as MarketingCard[];
    const trustCards = t.raw('trust.cards') as MarketingCard[];
    const featureCards = t.raw('finalCta.cards') as MarketingCard[];
    const discoveries = t.raw('scientificProof.discoveries') as ScientificDiscovery[];
    const referenceLabels = [
        t('references.aria1'),
        t('references.aria2'),
        t('references.aria3'),
        t('references.aria4'),
    ];

    return (
        <main className="aurum-landing-motion">
            <HeroIntegrated />
            <TrialSection trialT={trialT} to={to} />
            <ExampleSection t={t} highlights={exampleHighlights} />
            <StudySection
                t={t}
                cards={studyCards}
                referenceLabels={referenceLabels}
                primaryCtaHref={primaryCtaHref}
                to={to}
            />
            <UseCasesSection
                t={t}
                cards={useCaseCards}
                guideLinkLabel={guideLinkLabel}
                primaryCtaHref={primaryCtaHref}
                referenceLabels={referenceLabels}
                to={to}
            />
            <ScientificProofSection t={t} discoveries={discoveries} referenceLabels={referenceLabels} to={to} />

            <div id="sanctuary-content" className="bg-background text-foreground">
                <ProblemSolutionSections t={t} />
                <TrustSection t={t} cards={trustCards} />
                <FinalCtaSection t={t} cards={featureCards} primaryCtaHref={primaryCtaHref} />
                <FaqSection t={t} faqs={faqs} />
                <ReferencesSection t={t} />
            </div>

            <FloatingHomeCta />
        </main>
    );
}
