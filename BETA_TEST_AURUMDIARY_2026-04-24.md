# Beta Test Aurum Diary - 2026-04-24

## Correctifs livres

- P0 - Verification email / login: le handler d'action force maintenant la locale issue du parametre `lang`, et les namespaces client critiques restent disponibles apres navigation client. Objectif: eviter les cles brutes sur `/login?verified=true` et les ecrans post-login.
- P0 - Footer "Discuter avec Aurum": le lien public pointe vers `/sanctuary/write`, et l'ancien chemin `/sanctuary/chat` redirige en 308 vers la page d'ecriture.
- P1 - Menu mobile: les descriptions utilisent les cles existantes `nav.writeDesc`, `nav.journalDesc`, `nav.settingsDesc`.
- P1 - Prenom: Aurum ne persiste plus le local-part d'email comme prenom. Le trigger Firebase ne derive plus `firstName` depuis l'email et ne doit plus ecraser un prenom saisi.
- P1 - Reponses Aurum: le rendu des reflets supporte le gras Markdown simple (`**texte**`) sans afficher les marqueurs bruts.
- P2 - Rappels d'ecriture: les textes FR des notifications locales et Firebase Functions ont ete accentues.
- P2 - Modal CGU / bienvenue: le payload i18n racine inclut les namespaces app/auth necessaires pour eviter les cles brutes lors des transitions client.

## Tests ajoutes

- `src/app/__tests__/beta-report-regressions.test.ts`
- `src/lib/profile/__tests__/first-name.test.ts`
- `src/lib/__tests__/markdown-lite.test.ts`

## Verification locale

- `npx vitest run src/app/__tests__/beta-report-regressions.test.ts src/lib/profile/__tests__/first-name.test.ts src/lib/__tests__/markdown-lite.test.ts`
- `npm run typecheck`
- `npm --prefix functions run build`
- `npm run lint`
- `npm run verify`

## Points restants a traiter ensuite

- Ajouter une recherche et des filtres dans le journal.
- Ajouter une preuve sociale credible sur la landing page.
- Ajouter des screenshots ou une demo de l'app avant inscription.
- Clarifier l'offre gratuite sur la page pricing et ajouter une FAQ pricing.
