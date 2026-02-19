# Journal des changements - 18/02/2026

## Contexte
Cette note documente les travaux réalisés aujourd'hui sur Aurum (landing, SEO/AIO, navigation, admin, analytics).

## 1) Landing & UX
- Harmonisation du ton en `tu` sur la landing.
- Clarification du message principal:  
  `Un espace privé pour écrire et comprendre ce que tu ressens.`
- Suppression de blocs jugés peu pertinents:
  - bloc de preuves chiffrées,
  - section "Journal d'Alma cards" sur la landing (retirée ensuite à ta demande).
- Suppression du second test et redirection des interactions vers le premier quiz (`#decouvrir`).
- CTA principaux/secondaires rationalisés.
- Correction navigation footer:
  - `Discuter avec Aurum` pointe vers une route existante,
  - création d'une page dédiée `Notre Manifeste` (au lieu d'une ancre cassée).

## 2) SEO + AIO (phase technique)
- Métadonnées renforcées par page (home, blog, pricing, etc.) et canonicals corrigés.
- Domaine canonique unifié vers `aurumdiary.com` (y compris blog articles).
- Sitemap refondu:
  - retrait des pages auth de la logique stratégique (`/login`, `/signup`),
  - ajout des pages business/légales/éditoriales + slugs blog.
- JSON-LD ajouté:
  - `FAQPage` sur la landing,
  - `BlogPosting` sur les articles.
- Ajout des points d'ancrage AIO:
  - `public/llms.txt`,
  - `public/ai.txt`,
  - pages `auteur` et `methodologie`.

## 3) Knowledge Hub (SEO/AIO contenu)
- Création de `/guides` + 5 pages piliers en format Q/R:
  - `/guides/charge-mentale`
  - `/guides/journal-guide`
  - `/guides/introspection`
  - `/guides/confidentialite-mentale`
  - `/guides/routine-5-minutes`
- Intégration au sitemap et à `llms.txt`.
- Décision UX conservée: pas d'ajout au menu principal pour l'instant.

## 4) Navigation & pages éditoriales
- Nouvelle page: `/manifeste`.
- Footer mis à jour:
  - `Notre Manifeste` -> `/manifeste`,
  - retrait de `LLMs.txt` du menu user (fichier toujours accessible publiquement via `/llms.txt`).

## 5) Admin & Analytics V1 (implémenté aujourd'hui)

### Accès admin
- Ton email `danyf57@gmail.com` est reconnu comme admin (avec Alma) côté client + serveur.
- Base prête pour élargir via variable d'env `ADMIN_EMAILS` (CSV).

### Tracking standardisé
- Événements V1:
  - `cta_click`
  - `quiz_complete`
  - `signup`
  - `login`
  - `entry_created`
  - `first_entry`
  - `checkout_start`
  - `purchase`
  - `aurum_message_sent`
- `POST /api/track`:
  - valide les événements,
  - enregistre dans Firestore (`analyticsEvents`),
  - enrichit avec user session si présente,
  - forward vers GA Measurement Protocol si configuré.

### Dashboard admin réel
- Nouveau endpoint sécurisé: `GET /api/admin/analytics` (admin only).
- `/admin` branché sur données réelles (plus de mock):
  - KPIs acquisition/activation/usage,
  - funnel mensuel,
  - top leads scorés,
  - événements récents.
- Score lead V1 (pondérations) implémenté côté agrégation.

### Instrumentation UI / server
- Tracking ajouté sur:
  - signup/login (email + Google),
  - CTA landing (hero, floating, final, exit intent),
  - completion quiz,
  - checkout start pricing,
  - création d'entrée + first entry (server action),
  - messages Aurum (server action),
  - achats Stripe (webhook).

## 6) Déploiement / statut
- Plusieurs déploiements Firebase effectués dans la journée.
- Comportement observé: le CLI peut rester bloqué en fin de run sur la mise à jour SSR.
- Dernier timestamp live confirmé vu pendant la session: `2026-02-18 14:13:10` (channel `live`).

## 7) Points techniques ouverts
- Firestore index manquant pour la requête `publicPosts` (`isPublic` + `publishedAt`).
  - Impact actuel: warning build + fallback vide sur certains écrans/blog si index absent.
  - Action: créer l'index composite depuis le lien fourni par Firebase.

## 8) Fichiers clés touchés aujourd'hui (extraits)
- Landing/navigation:
  - `src/app/(marketing)/page.tsx`
  - `src/components/landing/HeroIntegrated.tsx`
  - `src/components/landing/ProfileQuiz.tsx`
  - `src/components/layout/footer.tsx`
  - `src/app/manifeste/page.tsx`
- SEO/AIO:
  - `src/app/layout.tsx`
  - `src/app/(marketing)/layout.tsx`
  - `src/app/blog/page.tsx`
  - `src/app/blog/[slug]/page.tsx`
  - `src/app/sitemap.ts`
  - `public/llms.txt`
  - `public/ai.txt`
  - `src/app/auteur/page.tsx`
  - `src/app/methodologie/page.tsx`
  - `src/app/guides/page.tsx`
  - `src/app/guides/[slug]/page.tsx`
  - `src/lib/knowledge-hub.ts`
- Admin/analytics:
  - `src/lib/analytics/types.ts`
  - `src/lib/analytics/client.ts`
  - `src/lib/analytics/server.ts`
  - `src/app/api/track/route.ts`
  - `src/app/api/admin/analytics/route.ts`
  - `src/app/admin/page.tsx`
  - `src/providers/auth-provider.tsx`
  - `src/lib/firebase/admin.ts`
  - `src/app/actions.ts`
  - `src/app/actions/chat.ts`
  - `src/app/api/stripe/webhook/route.ts`
  - `src/app/signup/page.tsx`
  - `src/app/login/page.tsx`
  - `src/app/pricing/page.tsx`

## 9) Validation
- TypeScript: `npm run typecheck` OK après les changements V1.
