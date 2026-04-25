# MEMORY.md - Aurum Long-Term Context

## User

- Daniel travaille sur Aurum Diary / Aurum Sanctuary.
- Il préfère l'action directe, les réponses claires et les vérifications concrètes.
- Il veut éviter les mentions publiques "IA/AI" dans l'interface et remplacer les signes trop IA par une esthétique plus humaine, calme et introspective.

## Product

- Aurum est un SaaS de journaling émotionnel et d'introspection.
- Positionnement à garder : compagnon d'écriture et de clarté personnelle, pas application médicale, pas thérapie, pas diagnostic.
- Formulations sûres : "mettre des mots", "y voir plus clair", "repérer ce qui revient", "espace privé".
- Direction copy landing validée le 2026-04-25 : plus viscérale, intime et incarnée. Faire sentir les boucles concrètes avant de parler de clarté : message relu, conversation rejouée, poitrine qui serre, calme qui semble vide, schémas qu'on n'arrive pas encore à lâcher.
- Éviter : promesses de guérison, vocabulaire clinique directif, diagnostic, scores médicaux, posture de psy.
- Référence produit locale importante : `AURUM_REFERENCES_FOR_CODEX.md`. La lire avant les changements liés à onboarding, journaling, prompts, marketing, pricing, Premium, contenus TikTok ou garde-fous santé mentale.

## Business / UX

- Modèle économique cible : Freemium + Premium à 6,99 EUR/mois.
- La valeur Premium doit rester une valeur de clarté personnelle, pas une promesse de soin.
- L'expérience centrale doit rester l'écriture privée. Les animations et éléments visuels doivent rester subtils et ne jamais gêner l'écriture.

## Technical Context

- Repo local : `/Users/danielfioriti/Documents/aurum-sanctuary`.
- Production : `https://aurumdiary.com`.
- Branche de travail récente : `codex/seo-writing-guides`, PR draft #126.
- Main est protégé. Pousser sur la branche de travail puis créer/déclencher les rollouts si nécessaire.
- Firebase App Hosting rollout déjà utilisé avec :
  `firebase apphosting:rollouts:create aurum-sanctuary --git-commit <sha> --force`
- Vérifications habituelles avant conclusion :
  - `npx vitest run <test ciblé>`
  - `npm run typecheck`
  - `npm run lint`
  - Playwright pour les vérifications desktop/mobile quand il y a un changement visuel.

## Recent Durable Work

- Ajout de 8 guides SEO/GEO bilingues depuis `doc-ecriture-bien-fait-psy/` dans `src/lib/knowledge-hub.ts`.
- Guides ajoutés au sitemap et couverts par tests.
- Correction des CTA de guides : le bouton "Lire le manifeste" est maintenant encadré, et les boutons wrap correctement sur mobile.
- Correction du bug d'écriture importée depuis la landing : `PremiumJournalForm` ne réhydrate plus le paramètre `initial` après suppression du contenu, donc l'utilisateur peut effacer la dernière lettre.
- Canva : un carrousel Instagram Aurum a été créé. Lien éditable : `https://www.canva.com/d/qKddnQPv5jZIizy`.

## Current / Next Possible Task

- Daniel a validé l'idée d'une animation de curseur en plume d'oie sur aurumdiary.com.
- Direction approuvée : version subtile, desktop uniquement, désactivée sur mobile/tablette, respect de `prefers-reduced-motion`, et curseur normal dans les zones d'écriture ou de saisie.
- Ne pas implémenter de plume agressive dans l'espace d'écriture : l'UX d'écriture doit rester propre.

## Workspace Hygiene

- Ne pas supprimer ni revert les fichiers non suivis sans demande explicite.
- Fichiers/dossiers non suivis vus récemment : `AURUM_REFERENCES_FOR_CODEX.md`, `doc-ecriture-bien-fait-psy/`, `Images Pubs Aurum/`, `output/`, `.playwright-cli/`, `public/sw 2.js`.
- `memory/YYYY-MM-DD.md` sert aux notes brutes. `MEMORY.md` doit rester synthétique et durable.
