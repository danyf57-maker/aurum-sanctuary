"use client";

import { motion } from "framer-motion";

const HeroMinimal = () => {
  return (
    <section
      className="flex min-h-screen w-full items-center justify-center bg-[#F5F5DC] px-6 py-16"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl md:text-5xl">
            Votre esprit est plein. Déposez-le ici.
          </h1>
          <p className="text-base text-stone-700 sm:text-lg">
            Un sanctuaire chiffré pour vos pensées les plus intimes.
          </p>
        </div>

        <textarea
          className="h-36 w-full max-w-xl resize-none rounded-2xl border border-stone-300 bg-white/70 p-4 text-base text-stone-800 shadow-sm transition duration-300 focus:scale-[1.02] focus:border-stone-400 focus:outline-none focus:ring-0"
          placeholder="Écrivez ici..."
        />

        <motion.button
          className="rounded-full border border-stone-800 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-900 transition duration-300 hover:bg-stone-900 hover:text-[#F5F5DC]"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          type="button"
        >
          Entrer dans le Sanctuaire
        </motion.button>
      </div>
    </section>
  );
};

export default HeroMinimal;
