'use client';

import Link from 'next/link';
import { Lock, Moon, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useLocalizedHref } from '@/hooks/use-localized-href';

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

const trustCards: TrustCard[] = [
  {
    title: 'Encrypted by default',
    body: 'What you write stays yours.',
    icon: <Lock className="h-5 w-5" />,
  },
  {
    title: 'Private by design',
    body: 'Built for reflection, not exposure.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'No ads. No data sold.',
    body: 'Your thoughts are not a product.',
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const problemCards: ProblemCard[] = [
  {
    title: "You can't switch off at night",
    body: "You're exhausted, but the second the room gets quiet, your thoughts get louder.",
    icon: <Moon className="h-5 w-5" />,
  },
  {
    title: 'You carry too much mentally',
    body: 'Feelings, decisions, unfinished thoughts, pressure from every direction - all stuck in the same space.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'You keep looping on the same things',
    body: 'The same emotions, the same questions, the same internal conversations, again and again.',
    icon: <ArrowRight className="h-5 w-5" />,
  },
];

const steps: StepCard[] = [
  {
    step: 'Step 1',
    title: 'Write freely',
    body: "Start with what's on your mind. No pressure to write perfectly. No need to know exactly how you feel.",
  },
  {
    step: 'Step 2',
    title: 'Reflect with guidance',
    body: 'Aurum helps you slow down, explore what\'s underneath, and go further than a simple brain dump.',
  },
  {
    step: 'Step 3',
    title: 'Notice your patterns',
    body: 'Over time, you begin to see what repeats - emotions, triggers, themes, questions, inner tensions.',
  },
];

const credibilityPoints: CredibilityPoint[] = [
  {
    title: 'Studied since the 1980s',
    body: 'Peer-reviewed expressive-writing research has been published for decades across different populations.',
  },
  {
    title: 'Evidence of short-term benefits',
    body: 'Randomized trials have linked structured writing with lower mental distress, lower anxiety in some groups, and better well-being.',
  },
  {
    title: 'Honest about the limits',
    body: 'The effects are modest and vary by person, context, and writing style.',
  },
];

const faqs: FaqItem[] = [
  {
    question: 'Is Aurum private?',
    answer: 'Yes. Aurum is built for private reflection. Your writing is not meant for public sharing.',
  },
  {
    question: 'Do I need to be good at journaling?',
    answer: "No. You can start messy, tired, confused, overwhelmed - that's exactly the point.",
  },
  {
    question: 'Is Aurum therapy?',
    answer: 'No. Aurum is a guided reflection tool, not therapy or medical care.',
  },
  {
    question: 'What makes it different from a notes app or journal app?',
    answer: 'Aurum is designed to help you reflect, not just store text. It supports deeper clarity and helps you notice recurring patterns over time.',
  },
  {
    question: 'Why mention science?',
    answer: 'Because structured writing has been studied for decades. We use that research to inform the experience - without making exaggerated claims.',
  },
  {
    question: 'How do I start?',
    answer: 'You can begin with 5 free entries and see whether the experience fits your life.',
  },
];

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
    <section id={id} className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export default function Home() {
  const to = useLocalizedHref();

  return (
    <main className="bg-[#f4ede6] text-stone-900">
      <SectionShell className="overflow-hidden pt-8 sm:pt-10 lg:pt-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-stone-300/80 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(246,239,231,0.96)_55%,_rgba(235,224,210,0.98))] px-6 py-10 shadow-[0_20px_60px_rgba(120,94,72,0.12)] sm:px-8 sm:py-12 lg:px-14 lg:py-16">
          <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#d8b89a]/20 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[#b79174]/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.75fr)] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-stone-300 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-700">
                Private by design. No ads. No data sold.
              </div>
              <h1 className="font-headline max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-stone-950 sm:text-5xl lg:text-7xl">
                Your body is tired. Your mind is still running.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-800 sm:text-xl">
                A private AI-guided reflection space for overthinking, emotional overload, and nights when your thoughts won't switch off.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-stone-900 px-6 text-sm text-white hover:bg-stone-800 sm:h-14 sm:px-8 sm:text-base">
                  <Link href={to('/signup')}>Start with 5 free entries</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-stone-300 bg-white/80 px-6 text-sm text-stone-800 hover:bg-white sm:h-14 sm:px-8 sm:text-base">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-stone-600">
                Private by design. No ads. No data sold.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/88 p-5 shadow-[0_18px_40px_rgba(120,94,72,0.14)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-stone-950 px-5 py-6 text-stone-100">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-300">A quieter place to land</p>
                <p className="mt-4 text-lg leading-relaxed text-stone-100">
                  Put down what is circling, follow what matters, and leave with more clarity than you started with.
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <p className="text-sm leading-relaxed text-stone-200">
                    Aurum is not a social app, a notes app, or therapy. It is a private AI-guided reflection space for mental overload, night overthinking, and emotional clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.5rem] border border-stone-300/70 bg-white/92 p-6 shadow-[0_10px_30px_rgba(120,94,72,0.08)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">
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
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-600">Problem recognition</p>
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Aurum is for the moments when your mind feels too full
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {problemCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-stone-300/70 bg-[#fcf8f3] p-6 shadow-[0_12px_30px_rgba(120,94,72,0.08)]"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-700 shadow-sm">
                {card.icon}
              </div>
              <h3 className="font-headline text-2xl font-semibold tracking-tight text-stone-900">{card.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-stone-700">{card.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="bg-white/60">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-300/70 bg-white/92 px-6 py-10 text-center shadow-[0_14px_40px_rgba(120,94,72,0.10)] sm:px-10 sm:py-12">
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Aurum helps you clear what&apos;s heavy, understand what&apos;s recurring, and feel mentally lighter
          </h2>
          <div className="mx-auto mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-stone-800">
            <p>This is not just a blank journal.</p>
            <p>
              Aurum helps you put thoughts into words, reflect with guidance, and notice patterns over time - so you can understand what keeps returning instead of carrying it alone.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="how-it-works">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            A calmer mind starts with somewhere to put things down
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.step}
              className="rounded-[1.75rem] border border-stone-300/70 bg-white/92 p-6 shadow-[0_12px_30px_rgba(120,94,72,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">{step.step}</p>
              <h3 className="font-headline mt-4 text-2xl font-semibold tracking-tight text-stone-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-stone-700">{step.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="h-12 rounded-full bg-stone-900 px-6 text-sm text-white hover:bg-stone-800 sm:h-14 sm:px-8 sm:text-base">
            <Link href={to('/signup')}>Begin your first entry</Link>
          </Button>
        </div>
      </SectionShell>

      <SectionShell className="bg-white/60">
        <div className="grid gap-8 rounded-[2rem] border border-stone-300/70 bg-white/92 p-6 shadow-[0_14px_40px_rgba(120,94,72,0.10)] sm:p-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Grounded in decades of expressive-writing research
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-stone-800">
              Writing is not magic. But it has been studied for decades.
            </p>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-stone-700">
              <p>
                Research on expressive writing suggests that structured writing can help some people reduce mental distress, process emotions more clearly, and improve aspects of well-being over time.
              </p>
              <p>
                Other studies show the effects are not the same for everyone. That&apos;s why Aurum does not promise treatment or diagnosis. It gives you a private, guided space to reflect more clearly and more consistently.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {credibilityPoints.map((point) => (
              <article key={point.title} className="rounded-[1.5rem] border border-stone-300/70 bg-[#fcf8f3] p-5">
                <h3 className="font-headline text-xl font-semibold tracking-tight text-stone-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{point.body}</p>
              </article>
            ))}
            <p className="rounded-[1.5rem] border border-stone-200/80 bg-stone-950 px-5 py-4 text-sm leading-relaxed text-stone-200">
              Aurum is a reflection tool inspired by evidence on writing and emotional processing. It is not therapy or medical care.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-8 rounded-[2rem] border border-stone-300/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,236,226,0.98))] p-6 shadow-[0_14px_40px_rgba(120,94,72,0.10)] sm:p-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Private means private
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-800">
              <p>Writing only helps when you feel safe enough to be honest.</p>
              <p>That&apos;s why Aurum is built around privacy from the start:</p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/80 bg-white/92 p-6 shadow-sm">
            <ul className="space-y-4 text-base leading-relaxed text-stone-800">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                <span>encrypted by default</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                <span>no ads</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                <span>no selling your data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-stone-900" />
                <span>designed for personal reflection, not public sharing</span>
              </li>
            </ul>
            <p className="mt-6 border-t border-stone-300 pt-6 text-base leading-relaxed text-stone-800">
              Aurum exists to help you think more clearly - not to watch, track, or expose you.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell className="bg-white/60">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="font-headline mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              FAQ
            </h2>
          </div>
          <div className="mt-10 rounded-[2rem] border border-stone-300/70 bg-white/92 p-4 shadow-[0_12px_30px_rgba(120,94,72,0.08)] sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
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
            When your thoughts feel too loud, give them somewhere to land
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-300">
            Private. Guided. Built for clarity.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 rounded-full bg-[#f3e6d6] px-6 text-sm text-stone-950 hover:bg-[#ead7c2] sm:h-14 sm:px-8 sm:text-base">
              <Link href={to('/signup')}>Start with 5 free entries</Link>
            </Button>
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
