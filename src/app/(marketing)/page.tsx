'use client';

import Link from 'next/link';
import { Lock, Moon, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLocalizedHref } from '@/hooks/use-localized-href';
import { useLocale } from '@/hooks/use-locale';

type TrustCard = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

type ProblemCard = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

type StepCard = {
  title: string;
  body: string;
  step: string;
};

type CredibilityPoint = {
  title: string;
  body: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

function SectionShell({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-22 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function getCopy(locale: 'fr' | 'en') {
  const isFr = locale === 'fr';

  const trustCards: TrustCard[] = [
    {
      title: isFr ? 'Chiffré par défaut' : 'Encrypted by default',
      body: isFr ? 'Ce que vous écrivez reste à vous.' : 'What you write stays yours.',
      icon: <Lock className="h-5 w-5" />,
    },
    {
      title: isFr ? 'Privé par conception' : 'Private by design',
      body: isFr ? 'Conçu pour réfléchir, pas pour s’exposer.' : 'Built for reflection, not exposure.',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      title: isFr ? 'Pas de pub. Pas de données revendues.' : 'No ads. No data sold.',
      body: isFr ? 'Vos pensées ne sont pas un produit.' : 'Your thoughts are not a product.',
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  const problemCards: ProblemCard[] = [
    {
      title: isFr ? 'Vous n’arrivez pas à couper le soir' : "You can't switch off at night",
      body: isFr
        ? 'Vous êtes épuisé, mais dès que le silence revient, vos pensées prennent toute la place.'
        : "You're exhausted, but the second the room gets quiet, your thoughts get louder.",
      icon: <Moon className="h-5 w-5" />,
    },
    {
      title: isFr ? 'Vous portez trop mentalement' : 'You carry too much mentally',
      body: isFr
        ? 'Émotions, décisions, pensées inachevées, pression dans tous les sens: tout s’accumule au même endroit.'
        : 'Feelings, decisions, unfinished thoughts, pressure from every direction - all stuck in the same space.',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: isFr ? 'Vous bouclez sur les mêmes choses' : 'You keep looping on the same things',
      body: isFr
        ? 'Les mêmes émotions, les mêmes questions, les mêmes dialogues intérieurs, encore et encore.'
        : 'The same emotions, the same questions, the same internal conversations, again and again.',
      icon: <ArrowRight className="h-5 w-5" />,
    },
  ];

  const steps: StepCard[] = [
    {
      step: isFr ? 'Étape 1' : 'Step 1',
      title: isFr ? 'Écrivez librement' : 'Write freely',
      body: isFr
        ? 'Commencez par ce que vous avez en tête. Pas besoin d’écrire parfaitement, ni de savoir exactement ce que vous ressentez.'
        : "Start with what's on your mind. No pressure to write perfectly. No need to know exactly how you feel.",
    },
    {
      step: isFr ? 'Étape 2' : 'Step 2',
      title: isFr ? 'Réfléchissez avec guidance' : 'Reflect with guidance',
      body: isFr
        ? 'Aurum vous aide à ralentir, explorer ce qu’il y a dessous, et aller plus loin qu’un simple déversement mental.'
        : "Aurum helps you slow down, explore what's underneath, and go further than a simple brain dump.",
    },
    {
      step: isFr ? 'Étape 3' : 'Step 3',
      title: isFr ? 'Repérez vos motifs' : 'Notice your patterns',
      body: isFr
        ? 'Avec le temps, vous voyez ce qui revient: émotions, déclencheurs, thèmes, questions, tensions intérieures.'
        : 'Over time, you begin to see what repeats - emotions, triggers, themes, questions, inner tensions.',
    },
  ];

  const credibilityPoints: CredibilityPoint[] = [
    {
      title: isFr ? 'Étudié depuis les années 1980' : 'Studied since the 1980s',
      body: isFr
        ? 'La recherche sur l’écriture expressive est publiée depuis des décennies, sur des populations variées.'
        : 'Peer-reviewed expressive-writing research has been published for decades across different populations.',
    },
    {
      title: isFr ? 'Des bénéfices à court terme observés' : 'Evidence of short-term benefits',
      body: isFr
        ? 'Des essais randomisés ont lié l’écriture structurée à moins de détresse mentale, moins d’anxiété chez certains groupes, et un meilleur bien-être.'
        : 'Randomized trials have linked structured writing with lower mental distress, lower anxiety in some groups, and better well-being.',
    },
    {
      title: isFr ? 'Une vision honnête des limites' : 'Honest about the limits',
      body: isFr
        ? 'Les effets restent modestes et varient selon les personnes, le contexte et la manière d’écrire.'
        : 'The effects are modest and vary by person, context, and writing style.',
    },
  ];

  const faqs: FaqItem[] = [
    {
      question: isFr ? 'Aurum est-il privé ?' : 'Is Aurum private?',
      answer: isFr
        ? 'Oui. Aurum est conçu pour une réflexion privée. Ce que vous écrivez n’est pas fait pour être partagé publiquement.'
        : 'Yes. Aurum is built for private reflection. Your writing is not meant for public sharing.',
    },
    {
      question: isFr ? 'Faut-il savoir bien tenir un journal ?' : 'Do I need to be good at journaling?',
      answer: isFr
        ? 'Non. Vous pouvez commencer fatigué, confus, débordé, brouillon: c’est précisément le point.'
        : "No. You can start messy, tired, confused, overwhelmed - that's exactly the point.",
    },
    {
      question: isFr ? 'Aurum est-il une thérapie ?' : 'Is Aurum therapy?',
      answer: isFr
        ? 'Non. Aurum est un outil de réflexion guidée, pas une thérapie ni un soin médical.'
        : 'No. Aurum is a guided reflection tool, not therapy or medical care.',
    },
    {
      question: isFr
        ? 'Quelle différence avec une app de notes ou de journal ?'
        : 'What makes it different from a notes app or journal app?',
      answer: isFr
        ? 'Aurum est conçu pour vous aider à réfléchir, pas seulement à stocker du texte. L’outil vise plus de clarté et la mise en lumière des motifs récurrents dans le temps.'
        : 'Aurum is designed to help you reflect, not just store text. It supports deeper clarity and helps you notice recurring patterns over time.',
    },
    {
      question: isFr ? 'Pourquoi parler de science ?' : 'Why mention science?',
      answer: isFr
        ? 'Parce que l’écriture structurée est étudiée depuis des décennies. Nous nous appuyons sur cette recherche sans faire de promesses exagérées.'
        : 'Because structured writing has been studied for decades. We use that research to inform the experience - without making exaggerated claims.',
    },
    {
      question: isFr ? 'Comment commencer ?' : 'How do I start?',
      answer: isFr
        ? 'Vous pouvez commencer avec 5 entrées gratuites et voir si l’expérience trouve sa place dans votre vie.'
        : 'You can begin with 5 free entries and see whether the experience fits your life.',
    },
  ];

  return {
    trustCards,
    problemCards,
    steps,
    credibilityPoints,
    faqs,
    heroBadge: isFr ? 'Privé par conception. Pas de pub. Pas de données revendues.' : 'Private by design. No ads. No data sold.',
    heroTitle: isFr ? 'Votre corps est fatigué. Votre esprit continue de tourner.' : 'Your body is tired. Your mind is still running.',
    heroBody: isFr
      ? 'Un espace de réflexion privé guidé par IA pour la surcharge mentale, le trop-plein émotionnel, et les nuits où les pensées ne s’arrêtent pas.'
      : "A private AI-guided reflection space for overthinking, emotional overload, and nights when your thoughts won't switch off.",
    heroCta: isFr ? 'Commencer avec 5 entrées gratuites' : 'Start with 5 free entries',
    heroSecondary: isFr ? 'Voir comment ça marche' : 'See how it works',
    sideEyebrow: isFr ? 'Un endroit plus calme pour atterrir' : 'A quieter place to land',
    sideQuote: isFr
      ? 'Déposez ce qui tourne en boucle, suivez ce qui compte, et repartez avec plus de clarté qu’en arrivant.'
      : 'Put down what is circling, follow what matters, and leave with more clarity than you started with.',
    sideBody: isFr
      ? 'Aurum n’est ni un réseau social, ni une app de notes, ni une thérapie. C’est un espace de réflexion privé guidé par IA pour la surcharge mentale, les ruminations nocturnes et la clarté émotionnelle.'
      : 'Aurum is not a social app, a notes app, or therapy. It is a private AI-guided reflection space for mental overload, night overthinking, and emotional clarity.',
    problemEyebrow: isFr ? 'Reconnaître le problème' : 'Problem recognition',
    problemTitle: isFr ? 'Aurum est conçu pour les moments où votre esprit est trop chargé' : 'Aurum is for the moments when your mind feels too full',
    benefitTitle: isFr
      ? 'Aurum vous aide à alléger ce qui pèse, comprendre ce qui revient, et respirer mentalement un peu mieux'
      : "Aurum helps you clear what's heavy, understand what's recurring, and feel mentally lighter",
    benefitLead: isFr ? 'Ce n’est pas juste un journal vide.' : 'This is not just a blank journal.',
    benefitBody: isFr
      ? 'Aurum vous aide à mettre les pensées en mots, réfléchir avec guidance, et repérer les motifs dans le temps, pour comprendre ce qui revient au lieu de le porter seul.'
      : 'Aurum helps you put thoughts into words, reflect with guidance, and notice patterns over time - so you can understand what keeps returning instead of carrying it alone.',
    howTitle: isFr ? 'Un esprit plus calme commence par un endroit où déposer les choses' : 'A calmer mind starts with somewhere to put things down',
    howCta: isFr ? 'Commencer votre première entrée' : 'Begin your first entry',
    researchTitle: isFr ? 'Ancré dans des décennies de recherche sur l’écriture expressive' : 'Grounded in decades of expressive-writing research',
    researchLead: isFr ? 'Écrire n’est pas magique. Mais cela fait l’objet d’études depuis des décennies.' : 'Writing is not magic. But it has been studied for decades.',
    researchBody1: isFr
      ? 'La recherche sur l’écriture expressive suggère que l’écriture structurée peut aider certaines personnes à réduire leur détresse mentale, clarifier leurs émotions, et améliorer certains aspects du bien-être dans le temps.'
      : 'Research on expressive writing suggests that structured writing can help some people reduce mental distress, process emotions more clearly, and improve aspects of well-being over time.',
    researchBody2: isFr
      ? 'D’autres travaux montrent que les effets ne sont pas identiques pour tout le monde. C’est pourquoi Aurum ne promet ni traitement ni diagnostic. L’outil offre un espace privé et guidé pour réfléchir avec plus de clarté et de régularité.'
      : "Other studies show the effects are not the same for everyone. That's why Aurum does not promise treatment or diagnosis. It gives you a private, guided space to reflect more clearly and more consistently.",
    researchDisclaimer: isFr
      ? 'Aurum est un outil de réflexion inspiré par les travaux sur l’écriture et le traitement émotionnel. Ce n’est ni une thérapie ni un soin médical.'
      : 'Aurum is a reflection tool inspired by evidence on writing and emotional processing. It is not therapy or medical care.',
    privacyTitle: isFr ? 'Privé veut dire privé' : 'Private means private',
    privacyBody1: isFr ? 'Écrire n’aide vraiment que si vous vous sentez assez en sécurité pour être honnête.' : 'Writing only helps when you feel safe enough to be honest.',
    privacyBody2: isFr ? 'C’est pourquoi Aurum est construit autour de la confidentialité dès le départ:' : "That's why Aurum is built around privacy from the start:",
    privacyBullets: isFr
      ? ['chiffré par défaut', 'pas de publicité', 'pas de revente de vos données', 'conçu pour la réflexion personnelle, pas pour l’exposition publique']
      : ['encrypted by default', 'no ads', 'no selling your data', 'designed for personal reflection, not public sharing'],
    privacyFooter: isFr
      ? 'Aurum existe pour vous aider à penser plus clairement, pas pour vous observer, vous traquer, ou vous exposer.'
      : 'Aurum exists to help you think more clearly - not to watch, track, or expose you.',
    faqTitle: 'FAQ',
    finalTitle: isFr ? 'Quand vos pensées font trop de bruit, donnez-leur un endroit où se poser' : 'When your thoughts feel too loud, give them somewhere to land',
    finalBody: isFr ? 'Privé. Guidé. Conçu pour la clarté.' : 'Private. Guided. Built for clarity.',
    finalCta: isFr ? 'Commencer avec 5 entrées gratuites' : 'Start with 5 free entries',
  };
}

export default function Home() {
  const to = useLocalizedHref();
  const locale = useLocale();
  const copy = getCopy(locale);

  return (
    <main className="bg-[#f4ede6] text-stone-900">
      <SectionShell className="overflow-hidden pt-8 sm:pt-10 lg:pt-14">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-stone-300/80 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,1),_rgba(246,239,231,0.97)_50%,_rgba(233,220,204,0.99))] px-6 py-10 shadow-[0_24px_80px_rgba(120,94,72,0.14)] sm:px-8 sm:py-12 lg:px-14 lg:py-16">
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#d8b89a]/20 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[#b79174]/16 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/80" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.75fr)] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-stone-300 bg-white/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700 shadow-sm">
                {copy.heroBadge}
              </div>
              <h1 className="font-headline max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.03em] text-stone-950 sm:text-5xl lg:text-[5.2rem]">
                {copy.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-800 sm:text-[1.35rem]">
                {copy.heroBody}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-stone-950 px-6 text-sm text-white shadow-[0_10px_24px_rgba(28,25,23,0.18)] hover:bg-stone-800 sm:h-14 sm:px-8 sm:text-base">
                  <Link href={to('/signup')}>{copy.heroCta}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-stone-300 bg-white/90 px-6 text-sm text-stone-800 shadow-sm hover:bg-white sm:h-14 sm:px-8 sm:text-base">
                  <Link href="#how-it-works">{copy.heroSecondary}</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-stone-600">
                {copy.heroBadge}
              </p>
            </div>

            <div className="rounded-[1.85rem] border border-white/80 bg-white/92 p-5 shadow-[0_20px_50px_rgba(120,94,72,0.16)] backdrop-blur">
              <div className="rounded-[1.6rem] bg-stone-950 px-5 py-6 text-stone-100 shadow-inner">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-300">{copy.sideEyebrow}</p>
                <p className="mt-4 text-xl leading-relaxed text-stone-50">
                  {copy.sideQuote}
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <p className="text-sm leading-relaxed text-stone-200">
                    {copy.sideBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          {copy.trustCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.6rem] border border-stone-300/70 bg-white/95 p-6 shadow-[0_14px_34px_rgba(120,94,72,0.10)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2e5d8] text-stone-800">
                {card.icon}
              </div>
              <h2 className="font-headline text-xl font-semibold tracking-tight text-stone-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{card.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-600">{copy.problemEyebrow}</p>
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            {copy.problemTitle}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {copy.problemCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-stone-300/70 bg-[#fcf8f3] p-6 shadow-[0_16px_36px_rgba(120,94,72,0.09)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-700 shadow-[0_8px_20px_rgba(120,94,72,0.10)]">
                {card.icon}
              </div>
              <h3 className="font-headline text-2xl font-semibold tracking-tight text-stone-900">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-stone-700">{card.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="bg-white/55">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-300/70 bg-white/94 px-6 py-10 text-center shadow-[0_18px_44px_rgba(120,94,72,0.12)] sm:px-10 sm:py-12">
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            {copy.benefitTitle}
          </h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-stone-800">
            <p>{copy.benefitLead}</p>
            <p>{copy.benefitBody}</p>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="how-it-works">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            {copy.howTitle}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {copy.steps.map((step) => (
            <article
              key={step.step}
              className="rounded-[1.75rem] border border-stone-300/70 bg-white/94 p-6 shadow-[0_16px_34px_rgba(120,94,72,0.09)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">{step.step}</p>
              <h3 className="font-headline mt-4 text-2xl font-semibold tracking-tight text-stone-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-stone-700">{step.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="h-12 rounded-full bg-stone-900 px-6 text-sm text-white hover:bg-stone-800 sm:h-14 sm:px-8 sm:text-base">
            <Link href={to('/signup')}>{copy.howCta}</Link>
          </Button>
        </div>
      </SectionShell>

      <SectionShell className="bg-white/55">
        <div className="grid gap-7 rounded-[2rem] border border-stone-300/70 bg-white/94 p-6 shadow-[0_18px_44px_rgba(120,94,72,0.12)] sm:p-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              {copy.researchTitle}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-stone-800">
              {copy.researchLead}
            </p>
            <div className="mt-5 space-y-3 text-base leading-relaxed text-stone-700">
              <p>{copy.researchBody1}</p>
              <p>{copy.researchBody2}</p>
            </div>
          </div>
          <div className="space-y-4">
            {copy.credibilityPoints.map((point) => (
              <article key={point.title} className="rounded-[1.5rem] border border-stone-300/70 bg-[#fcf8f3] p-5 shadow-[0_8px_20px_rgba(120,94,72,0.06)]">
                <h3 className="font-headline text-xl font-semibold tracking-tight text-stone-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{point.body}</p>
              </article>
            ))}
            <p className="rounded-[1.5rem] border border-stone-200/80 bg-stone-950 px-5 py-4 text-sm leading-relaxed text-stone-200">
              {copy.researchDisclaimer}
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-7 rounded-[2rem] border border-stone-300/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,236,226,1))] p-6 shadow-[0_18px_44px_rgba(120,94,72,0.12)] sm:p-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              {copy.privacyTitle}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-800">
              <p>{copy.privacyBody1}</p>
              <p>{copy.privacyBody2}</p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_12px_28px_rgba(120,94,72,0.08)]">
            <ul className="space-y-4 text-base leading-relaxed text-stone-800">
              {copy.privacyBullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-stone-300 pt-6 text-base leading-relaxed text-stone-800">
              {copy.privacyFooter}
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="bg-white/55">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              {copy.faqTitle}
            </h2>
          </div>
          <div className="mt-10 rounded-[2rem] border border-stone-300/70 bg-white/95 p-4 shadow-[0_16px_36px_rgba(120,94,72,0.10)] sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {copy.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="border-stone-200">
                  <AccordionTrigger className="font-headline text-left text-lg font-medium text-stone-900 sm:text-xl">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-stone-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-stone-950 px-6 py-10 text-center text-white shadow-[0_20px_60px_rgba(40,26,18,0.22)] sm:px-10 sm:py-14">
          <h2 className="font-headline mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {copy.finalTitle}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-300">
            {copy.finalBody}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 rounded-full bg-[#f3e6d6] px-6 text-sm text-stone-950 hover:bg-[#ead7c2] sm:h-14 sm:px-8 sm:text-base">
              <Link href={to('/signup')}>{copy.finalCta}</Link>
            </Button>
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
