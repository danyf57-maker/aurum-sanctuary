# Pivot benefits-first Aurum - 2026-06-25

Objectif: appliquer en une passe le pivot demande par Daniel et transmis par Hermes: passer d'un ton prudent/protecteur a un marketing direct, oriente benefices concrets, sans perdre les garde-fous produit.

## Sources de direction

- Daniel: travailler avec Hermes jusqu'a la fin des taches, puis deployer le site.
- Hermes: orienter aurumdiary.com vers les benefices visibles: reduire la rumination, prendre du recul rapidement, reperer les patterns, diminuer la charge mentale, clarifier sa pensee.
- Garde-fous Hermes: aucun diagnostic, aucune therapie, aucune promesse de guerison, pas de vocabulaire medical/clinique, ne pas remplacer un professionnel, rester honnete sur les benefices reels, proteger fortement la confidentialite.

## Fichiers a modifier

- `messages/fr.json`: texte public principal de la homepage FR.
- `messages/en.json`: miroir EN pour eviter une experience incoherente.
- `src/app/(marketing)/page.tsx`: uniquement si la structure empeche le nouveau message. Pas de refactor prevu.

## File de taches Hermes

### T1 - Hero

Zones: `hero.badge`, `hero.title`, `hero.subtitle`, `hero.helper`, placeholders, preview, CTA.

Criteres:
- Headline directe et orientee resultat.
- Sous-titre explicite sur le benefice: transformer le bruit mental en repere clair.
- CTA oriente action.
- Pas de promesse medicale.

### T2 - Section "Comment Aurum aide"

Zones: `marketingPage.exampleSection`, `marketingPage.useCases`.

Criteres:
- Liste de benefices assumee.
- Clarte, recul, patterns, charge mentale et continuite sont visibles.
- Exemples concrets, pas seulement "calme" ou "espace doux".

### T3 - Problemes deja connus

Zones: `marketingPage.problem`, `marketingPage.solution`, use cases associes.

Criteres:
- Parler de charge mentale, decisions ouvertes, boucles et bruit mental.
- Le probleme est concret et lie a la performance mentale quotidienne.

### T4 - Etudes

Zones: `marketingPage.studySection`, `studyCards`, `scientificProof`.

Criteres:
- Moins prudent dans le ton.
- Plus affirmatif sur les benefices tout en restant honnete: "peut aider", "suggere", "pour certaines personnes".
- References conservees.

### T5 - CTA

Zones: hero, sections, final CTA, floating CTA.

Criteres:
- CTA benefice + action.
- Exemples valides: "Transformer mon bruit mental en clarte", "Deposer ce qui tourne".

### T6 - Temoignages

Zones: `marketingPage.socialProof`.

Criteres:
- Temoignages orientes clarté, recul, reduction de rumination, charge mentale.
- Eviter le simple retour "calme".

### T7 - Relecture globale

Zones: homepage complete FR/EN.

Criteres:
- Ton uniforme: benefits-first, direct, professionnel.
- Pas de retour au style ancien trop prudent.
- Garde-fous conserves.

## Checklist avant validation Hermes

- [x] Les sections T1 a T7 ont ete modifiees ou confirmees.
- [x] FR et EN restent coherents.
- [x] Les garde-fous sont visibles dans FAQ/trust/science.
- [x] Les CTA sont plus actionnables.
- [ ] `npm run typecheck` execute jusqu'au bout.
- [x] Test cible homepage execute si possible.
- [ ] Apercu desktop/mobile verifie avant deploy.
- [x] Hermes reconsulte apres validation locale.
- [x] Hermes a confirme explicitement que les taches T1-T7 sont terminees.
- [ ] Deploy effectue apres confirmation Hermes.

## Etat de validation - 2026-06-25 16:02

Fait:
- `messages/fr.json` et `messages/en.json` parses OK apres formatage.
- Tests homepage OK: `npx vitest run src/app/__tests__/landing-audit-regressions.test.ts src/app/__tests__/dark-mode-contrast.test.ts` -> 2 fichiers, 9 tests.
- Hermes a valide explicitement le verdict final: "Taches T1-T7 : terminees."
- Hermes a accepte l'approche JSON + Vitest + extraits + build cloud pour ce jalon, car le blocage `tsc` local semble pre-existant et non lie aux modifications de copy.
- `tsconfig.json` corrige pour exclure les artefacts/caches (`.firebase`, `.next.bak-*`, `tmp`, `output`, `videos`, etc.). Avant correction, `tsc` incluait 21 645 fichiers TypeScript sous `.firebase`; apres correction, `tsc --showConfig` liste 385 fichiers et aucun artefact genere.

Blocage:
- `tsc --noEmit` reste silencieux plusieurs minutes et ne termine pas localement, meme sous Node 20 et avec une config temporaire sans plugin Next.
- `next build` local a aussi reste silencieux a 0% CPU avant interruption.

Decision:
- Deployer apres la confirmation Hermes, puis verifier l'URL publique.

## Tableau avant/apres

| Zone | Avant | Apres prevu |
| --- | --- | --- |
| Hero FR | "Ecris. Comprends. Garde une trace claire." | "Transforme ce qui tourne en clarte exploitable." |
| Sous-titre FR | "Aurum transforme tes pages en reperes..." | "Depose le bruit mental, repere les boucles, garde les decisions utiles..." |
| Comment Aurum aide | Trace et repere surtout doux | Benefices explicites: bruit mental, recul, patterns, decisions |
| Problemes | Journal/memoire claire | Boucles, charge mentale, decisions ouvertes |
| Etudes | Ton tres prudent | Ton plus affirmatif, nuances conservees |
| CTA | "Commencer a ecrire" | "Transformer mon bruit mental en clarte" / "Deposer ce qui tourne" |
| Temoignages | Garder le fil | Clarifier vite, reduire la rumination, mieux decider |
