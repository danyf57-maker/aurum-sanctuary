"use client";

import { motion } from "framer-motion";
import { Leaf, Lock, Shield, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const LandingV2 = () => {
  const placeholders = useMemo(
    () => [
      "What is weighing on you?",
      "A small victory...",
      "An intuition...",
      "A dream from last night...",
      "A frustration to release...",
    ],
    []
  );
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = placeholders[placeholderIndex];
    const typingSpeed = isDeleting ? 35 : 70;
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setPlaceholderText(current.slice(0, charIndex + 1));
        setCharIndex((value) => value + 1);
      } else if (isDeleting && charIndex > 0) {
        setPlaceholderText(current.slice(0, charIndex - 1));
        setCharIndex((value) => value - 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((value) => (value + 1) % placeholders.length);
      }
    }, isDeleting && charIndex === 0 ? 400 : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex, placeholders]);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div
      className="min-h-screen w-full bg-[#f3ede4] text-stone-900"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <header className="flex items-center justify-between border-b border-stone-300/80 px-6 py-6 md:px-16">
        <span
          className="text-2xl tracking-[0.3em] font-bold text-stone-900"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          AURUM
        </span>
        <div className="flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-stone-700">
           <a className="hover:text-stone-900 transition" href="#">Philosophy</a>
           <a className="hover:text-stone-900 transition border border-stone-800 px-4 py-2 rounded-full" href="#">Sign In</a>
        </div>
      </header>

      <motion.section
        className="px-6 pb-24 pt-20 md:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-12 items-center">
          <motion.div variants={childVariants} className="space-y-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-[#9b7230]">
              Le Vide Libérateur
            </p>
            <h1
              className="text-5xl font-bold leading-tight text-stone-900 sm:text-7xl"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Votre esprit est plein.<br/>Déposez-le ici.
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-light italic text-stone-700">
              Un sanctuaire chiffré pour vos pensées les plus intimes.
            </p>
          </motion.div>

          <motion.div variants={childVariants} className="w-full max-w-3xl flex flex-col gap-8 items-center">
            <div className="w-full relative group">
                <textarea
                  className="h-64 w-full resize-none rounded-[2rem] border border-stone-300/80 bg-white/96 p-10 text-2xl font-light text-stone-900 shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 focus:outline-none group-hover:shadow-[0_50px_120px_rgba(155,114,48,0.14)]"
                  placeholder={placeholderText}
                />
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-[#9b7230]/20 transition-colors duration-700 group-hover:border-[#9b7230]/40" />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full bg-stone-950 px-12 py-5 text-sm font-bold uppercase tracking-[0.3em] text-white shadow-2xl transition hover:bg-stone-800"
              type="button"
            >
              Entrer dans le Sanctuaire
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white/72 px-6 py-28 md:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 items-center">
          <motion.div
            variants={childVariants}
            className="relative overflow-hidden rounded-[3rem] bg-stone-900 p-16 text-stone-100 shadow-2xl group"
          >
            <div className="absolute -mr-32 -mt-32 h-64 w-64 rounded-full bg-white/5 blur-3xl transition-colors duration-700 group-hover:bg-white/10 top-0 right-0" />
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Le Bruit
            </h2>
            <p className="text-lg font-light leading-relaxed text-stone-200">
              Notifications, fragments de tâches, doutes persistants. Votre esprit sature, étouffé par le chaos numérique.
            </p>
            <div className="mt-12 space-y-4 text-xs uppercase tracking-[0.4em] text-stone-400">
              <p className="line-through">Toujours plus vite.</p>
              <p className="line-through">Trop d'informations.</p>
              <p className="line-through">Aucun répit.</p>
            </div>
          </motion.div>

          <motion.div
            variants={childVariants}
            className="relative overflow-hidden rounded-[3rem] border border-[#9b7230]/25 bg-white/98 p-16 text-stone-900 shadow-xl group"
          >
             <div className="absolute -mb-32 -ml-32 h-64 w-64 rounded-full bg-[#9b7230]/8 blur-3xl transition-colors duration-700 group-hover:bg-[#9b7230]/14 bottom-0 left-0" />
            <h2
              className="text-4xl font-bold mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Le Sanctuaire
            </h2>
            <p className="text-lg font-light leading-relaxed text-stone-800">
              Un espace doré, silencieux. Ici, vos paroles retrouvent leur poids. Chaque respiration redevient consciente.
            </p>
            <div className="mt-12 flex items-center gap-4 text-[#9b7230]">
              <Leaf className="h-6 w-6" />
              <span className="uppercase tracking-[0.3em] font-bold text-xs">Clarté Retrouvée</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="px-6 py-28 md:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={childVariants} className="mb-20 text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-stone-600">
              Votre Sécurité
            </p>
            <h2
              className="text-5xl font-bold text-stone-900"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              L'élégance du secret.
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Chiffrement Absolu",
                description: "Vos pensées sont scellées avant même de quitter votre appareil. Personne d'autre ne peut les lire.",
                icon: Shield,
              },
              {
                title: "Miroir intérieur",
                description: "Un reflet bienveillant qui vous aide à identifier vos patterns émotionnels sans jugement.",
                icon: Eye,
              },
              {
                title: "Vitesse Pure",
                description: "Une expérience fluide, conçue pour ne jamais interrompre le fil de vos idées.",
                icon: Lock,
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={childVariants}
                className="rounded-3xl border border-stone-300/80 bg-white/94 p-10 shadow-[0_18px_42px_rgba(120,94,72,0.12)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-[0_24px_56px_rgba(120,94,72,0.16)]"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 shadow-xl">
                    <feature.icon className="h-6 w-6 text-[#c49545]" />
                </div>
                <h3
                  className="text-2xl font-bold text-stone-900 mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {feature.title}
                </h3>
                <p className="font-light leading-relaxed text-stone-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="relative overflow-hidden bg-stone-950 px-6 py-40 text-[#d0a157] md:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,#d0a157_0%,transparent_70%)] opacity-[0.05]" />
        <motion.div
          variants={childVariants}
          className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center relative z-10"
        >
          <Leaf className="h-12 w-12" />
          <p
            className="text-4xl md:text-6xl font-bold leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            "Votre journal n'est pas un produit,<br/>c'est votre jardin sacré."
          </p>
          <div className="h-px w-24 bg-[#d0a157]/45" />
        </motion.div>
      </motion.section>

      <footer className="flex flex-col items-center gap-6 bg-[#f3ede4] px-6 py-20 text-xs uppercase tracking-[0.4em] text-stone-600">
        <div className="flex items-center gap-12">
            <a href="#" className="hover:text-stone-900 transition">Conditions</a>
            <a href="#" className="hover:text-stone-900 transition font-bold">AURUM</a>
            <a href="#" className="hover:text-stone-900 transition">Confidentialité</a>
        </div>
        <span className="flex items-center gap-2 text-stone-500">
          Conçu avec un calme absolu.
        </span>
      </footer>
    </div>
  );
};

export default LandingV2;
