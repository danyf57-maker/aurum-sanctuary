"use client";

import React, { useState, useEffect } from "react";
import HeroIntegrated from "@/components/landing/HeroIntegrated";
import ProfileQuiz from "@/components/landing/ProfileQuiz";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PenSquare,
  Compass,
  Eye,
  Waves,
  Sprout,
  Shield,
  Quote,
  ArrowRight,
  Send,
  ShieldCheck,
  Lock,
  Fingerprint,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/analytics/client";

const ExitIntent = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
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
          onClick={() => {
            setShow(false);
            setDismissed(true);
          }}
          className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-3xl md:text-4xl font-headline mb-6 text-stone-900">
            Une dernière chose avant de partir...
          </h3>
          <p className="text-stone-500 text-lg mb-10 leading-relaxed font-light">
            Tu ne sais pas par où commencer ? Fais notre évaluation de bien-être
            en 30 secondes pour retrouver une clarté mentale rapide et privée.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <Button
              onClick={() => {
                void trackEvent({
                  name: "cta_click",
                  params: { location: "exit_intent", target: "#decouvrir" },
                });
                setShow(false);
                setDismissed(true);
                document
                  .getElementById("decouvrir")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              size="lg"
              className="h-16 px-12 text-lg rounded-2xl w-full sm:w-auto"
            >
              Faire le Test (30s)
            </Button>
            <button
              onClick={() => {
                setShow(false);
                setDismissed(true);
              }}
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

const FloatingCTA = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-8 right-8 z-[100]"
      >
        <Button
          asChild
          size="lg"
          className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 px-8 h-14 group border-4 border-white/20 backdrop-blur-sm"
        >
          <Link
            href="/signup"
            className="flex items-center gap-3"
            onClick={() =>
              void trackEvent({
                name: "cta_click",
                params: { location: "floating_cta", target: "/signup" },
              })
            }
          >
            <span className="font-headline font-semibold">Créer mon compte</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <div className="mt-2 text-center pointer-events-none">
          <span className="text-[9px] text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-tighter font-bold">
            Sans engagement • Privé
          </span>
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const howItWorks = [
    {
      icon: <PenSquare />,
      title: "1. Tu écris librement",
      description:
        "Tu poses ce que tu vis, sans pression ni performance, dans un espace privé.",
    },
    {
      icon: <Eye />,
      title: "2. Aurum repère les thèmes",
      description:
        "Aurum met en lumière les tensions, les patterns et les points de bascule dans tes écrits.",
    },
    {
      icon: <Sprout />,
      title: "3. Tu repars avec plus de clarté",
      description:
        "Tu vois mieux ce qui se joue en toi et tu avances avec une direction plus nette.",
    },
  ];

  const testimonials = [
    {
      name: "Camille, 34 ans",
      initials: "C",
      quote:
        "J'étais sceptique à l'idée de confier mes pensées à un algorithme de miroir. Mais Aurum est différent. C'est un miroir bienveillant, pas un juge. Les 'insights' m'ont ouvert les yeux sur des schémas que j'ignorais totalement.",
    },
    {
      name: "Léo, 41 ans",
      initials: "L",
      quote:
        "Ma charge mentale était énorme. Le simple fait d'écrire, de 'déposer' mes angoisses dans Aurum chaque soir, a eu un effet libérateur. C'est plus qu'un journal, c'est une soupape de sécurité.",
    },
    {
      name: "Jeanne, 28 ans",
      initials: "J",
      quote:
        "Aurum ne donne pas de réponses, il aide à poser les bonnes questions. C'est un compagnon de route silencieux sur le chemin de l'introspection, sans la pression d'une performance.",
    },
  ];

  const faqs = [
    {
      question: "Qui peut lire mes données ?",
      answer:
        "Personne. Nous utilisons une architecture 'Admin-Blind' avec chiffrement AES-256 côté client. Tes entrées sont chiffrées avec ta clé privée avant d'être envoyées. Techniquement, même avec un accès total à nos serveurs, il est impossible de déchiffrer tes écrits sans ton mot de passe.",
    },
    {
      question: "Comment Aurum aide à la santé mentale ?",
      answer:
        "Aurum est un outil d'introspection, pas un substitut à une thérapie. Il t'offre un espace sécurisé pour extérioriser tes pensées et t'aide à identifier des schémas émotionnels. Cet acte d'écriture et de réflexion peut être une composante bénéfique d'une bonne hygiène mentale.",
    },
    {
      question: "Est-ce gratuit ?",
      answer:
        "Oui, Aurum propose une offre gratuite généreuse pour te permettre de commencer ton voyage. Des plans payants sont disponibles pour ceux qui souhaitent un usage plus intensif et des fonctionnalités avancées, ce qui nous permet de maintenir et d'améliorer le service en toute indépendance.",
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HeroIntegrated />

      <div id="sanctuary-content" className="bg-background text-foreground">
        {/* SECTION 1: Quiz de Profil */}
        <section className="pt-24 md:pt-32 pb-8 bg-stone-100/50">
          <div className="container max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-headline mb-6">
              Et si tu comprenais enfin comment tu penses ?
            </h2>
            <p className="text-stone-600 font-light text-lg">
              4 questions pour révéler ton profil de réflexion. Ton résultat
              personnalisé t&apos;attend.
            </p>
          </div>
        </section>
        <ProfileQuiz />

        {/* SECTION 3: How It Works */}
        <section className="py-24 md:py-32 container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-headline mb-4">
              Comment ça marche
            </h2>
            <p className="text-muted-foreground">
              En 5 minutes, tu transformes le flou en direction.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {howItWorks.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center">
                <div className="text-primary w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-6">
                  {React.cloneElement(feature.icon as React.ReactElement, {
                    className: "w-8 h-8",
                  })}
                </div>
                <h3 className="text-2xl font-headline text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3.5: Avant / Après */}
        <section className="py-24 md:py-40 bg-stone-900 text-white overflow-hidden relative">
          <div className="container relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-6xl font-headline mb-6">
                Le contraste Aurum
              </h2>
              <p className="text-stone-400 font-light text-lg">
                Passe du brouillard mental à une clarté rapide et confidentielle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-px bg-white/10 rounded-[2.5rem] overflow-hidden border border-white/10 backdrop-blur-sm">
              {/* Sans Aurum */}
              <div className="p-10 md:p-20 bg-stone-900/50">
                <div className="flex items-center gap-3 mb-8 text-red-400/80">
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    Sans Aurum
                  </span>
                </div>
                <ul className="space-y-6">
                  {[
                    "Pensées en boucle et insomnies",
                    "Difficulté à identifier ses déclencheurs",
                    "Sentiment de subir ses émotions",
                    "Chaos mental persistant",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-4 text-stone-400 font-light"
                    >
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
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    Avec Aurum
                  </span>
                </div>
                <ul className="space-y-6">
                  {[
                    "Sommeil retrouvé et esprit apaisé",
                    "Insights clairs sur tes patterns",
                    "Maîtrise rapide de ton paysage intérieur",
                    "Clarté d'esprit au quotidien, en privé",
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

        {/* SECTION 5: Trust & Privacy (Enhanced) */}
        <section id="manifesto" className="py-24 md:py-40 bg-white scroll-mt-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
                Ton Intégrité, Notre Priorité
              </span>
              <h2 className="text-4xl md:text-6xl font-headline mb-6">
                Ton espace reste privé.
              </h2>
              <p className="text-stone-500 font-light text-lg">
                Ton monde intérieur n&apos;appartient qu&apos;à toi. Aurum t&apos;aide
                à clarifier sans exposer ton intimité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-headline mb-3 text-primary">
                  Confidentialité Absolue
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed mb-4">
                  Tes pensées sont chiffrées (AES-256) directement sur ton
                  appareil. Même nous ne pouvons pas lire tes secrets.
                </p>
                {/* Security page removed - TABULA RASA */}
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-headline mb-3 text-primary">
                  Espace non public
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  Tes pages ne sont pas visibles publiquement. Tu écris pour toi,
                  pas pour un fil social.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all hover:shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-headline mb-3 text-primary">
                  Limites claires
                </h3>
                <p className="text-sm text-stone-500 font-light leading-relaxed">
                  Aurum n&apos;établit pas de diagnostic médical. En cas de détresse
                  aiguë, une aide humaine doit être contactée en priorité.
                </p>
              </div>
            </div>

            <div className="bg-stone-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <h4 className="text-3xl font-headline mb-4">
                    Notre Manifeste de Confiance
                  </h4>
                  <p className="text-stone-400 font-light leading-relaxed">
                    "Nous ne vendons pas de publicité. Nous ne vendons pas tes
                    données. Nous vendons de la clarté et de la tranquillité
                    d'esprit. Ton journal n'est pas un produit, c'est ton
                    jardin sacré."
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="text-7xl font-headline text-primary/20 select-none">
                    Aurum
                  </div>
                  <div className="w-20 h-px bg-white/20"></div>
                  <span className="text-[10px] uppercase tracking-[0.4em] font-medium opacity-50">
                    Sceau de Protection
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
            </div>

            {/* Security page removed - TABULA RASA */}
          </div>
        </section>

        {/* SECTION 6: Social Proof / Testimonials */}
        <section className="py-24 md:py-32 bg-stone-100/50">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-headline mb-4">
                Ils ont retrouvé leur clarté mentale
              </h2>
              <p className="text-muted-foreground">
                L'expérience Aurum racontée par ceux qui ont retrouvé du calme,
                vite et en privé.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm hover:bg-white/60 transition-colors duration-300"
                >
                  <CardHeader className="flex-row gap-4 items-center pb-2">
                    <Avatar className="h-10 w-10 border border-white/50">
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-stone-800">
                        {testimonial.name}
                      </h4>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: CTA Final & FAQ */}
        <section className="container py-24 md:py-32 text-center border-t border-black/5">
          <h2 className="text-4xl font-headline mb-4">Commence aujourd&apos;hui</h2>
          <p className="text-muted-foreground mb-8">
            Une première page suffit pour y voir plus clair.
          </p>
          <Button asChild size="lg" className="h-14 px-12 text-base">
            <Link
              href="/signup"
              onClick={() =>
                void trackEvent({
                  name: "cta_click",
                  params: { location: "final_cta_primary", target: "/signup" },
                })
              }
            >
              Créer mon compte
            </Link>
          </Button>
          <div className="mt-4">
            <Link
              href="/login"
              className="text-sm text-stone-500 hover:underline"
              onClick={() =>
                void trackEvent({
                  name: "cta_click",
                  params: { location: "final_cta_secondary", target: "/login" },
                })
              }
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
          <div className="mt-6">
            <span className="text-xs text-stone-400 font-light">
              Accès immédiat • Clarté mentale rapide • 100% Chiffré
            </span>
          </div>
        </section>

        <section className="container max-w-3xl pb-24 md:pb-32">
          <h2 className="text-4xl font-headline text-center mb-12">
            Questions Fréquentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index + 1}`} key={index}>
                <AccordionTrigger className="text-xl text-left font-headline font-normal">
                  {faq.question}
                </AccordionTrigger>
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
