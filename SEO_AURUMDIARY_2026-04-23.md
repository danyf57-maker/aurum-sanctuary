# Audit et optimisations SEO Aurum Diary

Date: 2026-04-23

## Objectif

Rendre `aurumdiary.com` plus propre pour Google, plus lisible pour les moteurs de réponse, et plus cohérent avec le positionnement public d'Aurum: écriture privée, clarté émotionnelle, reflets guidés, confidentialité.

## Actions réalisées

- Ajout de `x-default` dans les hreflang.
- Ajout de `/etudes-scientifiques` et `/fr/etudes-scientifiques` au sitemap.
- Redirections permanentes des anciennes URLs légales:
  - `/legal/terms` vers `/terms`
  - `/legal/privacy` vers `/privacy`
  - `/fr/legal/terms` vers `/fr/terms`
  - `/fr/legal/privacy` vers `/fr/privacy`
- Correction des canonicals FR:
  - `/fr/privacy` canonicalise vers `/fr/privacy`
  - `/fr/terms` canonicalise vers `/fr/terms`
- Expansion SEO des trois guides prioritaires:
  - `overthinking-at-night`
  - `journaling-prompts-for-clarity`
  - `charge-mentale`
- Nettoyage des mentions publiques `AI/IA` sur les pages Aurum ciblées.
- Remplacement par une terminologie plus alignée:
  - reflets guidés
  - lecture guidée
  - méthodologie
  - fonctionnalités de réflexion
- Passage de `/ai-video-models` en `noindex,nofollow` pour éviter de diluer la topicalité du site.
- Chargement différé de GTM et Google One Tap.
- Renforcement du contraste du doré et de la couleur primaire.
- Ajout de tests de régression SEO.

## Vérifications

Commandes exécutées avec succès:

- `npm run typecheck`
- `npm run lint`
- tests Vitest ciblés: 7 tests OK
- `npm run build`
- `npm run verify`

Le script global `npm run verify` termine avec `Verification complete.`

## Déploiement

Déploiement effectué le 2026-04-23 sur:

- Firebase Hosting: `aurum-diary-prod.web.app`
- Firebase App Hosting: backend `aurum-sanctuary`, utilisé par `aurumdiary.com`

Point important: le domaine principal `aurumdiary.com` est servi par Firebase App Hosting, pas uniquement par Firebase Hosting. Pour que les changements SEO soient visibles sur le domaine public, il faut donc déployer App Hosting.

Contrôles live réalisés sur `https://aurumdiary.com`:

- `sitemap.xml` contient les nouveaux guides, `/etudes-scientifiques`, les URLs FR/EN et les hreflang `x-default`.
- `/legal/terms` redirige bien vers `/terms`.
- `/fr/guides/rosebud-alternative` retourne `200`.
- `/fr/guides/rosebud-alternative` contient les schémas `FAQPage` et `HowTo`.
- Les canonicals et alternates de `/fr/guides/rosebud-alternative` pointent vers les bonnes URLs FR/EN.

## Passe performance et expérience prospect/client

Passe complémentaire effectuée et déployée le 2026-04-23.

Objectif: rendre le parcours prospect plus rapide, le build plus propre, et l'expérience client/admin plus fiable.

Actions réalisées:

- Suppression de `framer-motion` de la page marketing principale pour retirer du JavaScript non essentiel du parcours prospect.
- Remplacement de l'animation du CTA flottant par des transitions CSS.
- Passage du listener de scroll du CTA flottant en mode passif.
- Stabilisation des contenus du hero avec `useMemo` pour éviter du recalcul inutile pendant l'animation du placeholder.
- Déclaration explicite des routes admin analytics comme dynamiques:
  - `/api/admin/analytics`
  - `/api/admin/analytics/email-funnel`
  - `/api/admin/analytics/reminder-funnel`
  - `/api/admin/analytics/revenue-summary`
- Ajout de tests de garde pour empêcher le retour de `framer-motion` sur la home et vérifier les routes analytics dynamiques.

Résultat build:

- First Load JS de la home: `297 kB` avant la première passe, puis `260 kB` après optimisation.
- Les warnings de build liés aux routes admin analytics dynamiques ont disparu.
- `npm run verify` passe.

Contrôles live après déploiement:

- `https://aurumdiary.com/` retourne `200`.
- La home publique contient le nouveau contenu marketing et ne contient pas `framer-motion`.
- `https://aurumdiary.com/sitemap.xml` reste correct avec les entrées SEO et `x-default`.
- `/fr/guides/rosebud-alternative` retourne `200`.

## Passe server-first de la home

Passe complémentaire effectuée et déployée le 2026-04-24.

Objectif: convertir progressivement la home marketing en architecture server-first pour réduire l'hydratation, accélérer l'expérience mobile et améliorer la première impression prospect.

Actions réalisées:

- Conversion de `src/app/(marketing)/page.tsx` en composant serveur.
- Déplacement des traductions de la home vers `getTranslations` côté serveur.
- Conservation de `HeroIntegrated` comme îlot client principal, car il porte l'écriture de brouillon, la langue et l'état d'authentification.
- Création d'un petit îlot client dédié au CTA flottant: `src/components/marketing/floating-home-cta.tsx`.
- Rendu serveur des sections marketing statiques:
  - offre d'essai
  - exemple de reflet
  - études
  - cas d'usage
  - preuve scientifique
  - problème/solution
  - confiance
  - CTA final
  - références
- Remplacement de l'accordéon FAQ hydraté par des `<details>` HTML natifs.
- Suppression de l'usage client de `useAuth`, `useTranslations`, `useLocalizedHref`, `Accordion`, `Button` et `PricingOfferBlock` dans la page home elle-même.
- Ajout d'un test de garde pour vérifier que la page marketing reste server-first et que le scroll passif vit dans l'îlot CTA.

Résultat build:

- Taille de la route `/`: `14.7 kB` avant cette passe, puis `4.73 kB`.
- First Load JS de la home: `260 kB` avant cette passe, puis `250 kB`.
- `npm run verify` passe.

Contrôles live après déploiement:

- `https://aurumdiary.com/` retourne `200`.
- `https://aurumdiary.com/fr` retourne le contenu FR attendu.
- Le contenu marketing principal est présent dans le HTML rendu serveur.
- La FAQ est rendue en HTML natif avec `<details>`.
- `https://aurumdiary.com/sitemap.xml` reste correct avec les entrées SEO et `x-default`.

## Passe payload i18n client

Passe complémentaire effectuée et déployée le 2026-04-24.

Objectif: réduire le volume de messages `next-intl` sérialisés dans `NextIntlClientProvider`, surtout sur la home prospect, sans casser les routes client qui utilisent encore `useTranslations`.

Actions réalisées:

- Ajout de l'en-tête interne `x-aurum-path` dans `src/middleware.ts` pour que le layout connaisse la route normalisée côté serveur.
- Remplacement du passage global `messages={messages}` par `messages={clientMessages}` dans `src/app/layout.tsx`.
- Ajout d'un sélecteur de messages client par route:
  - socle global: navigation, header, auth, paywall, modal de conditions
  - home: uniquement les clés client nécessaires au hero et au CTA flottant
  - login, signup, forgot password, pricing, settings, account data et sanctuary: namespaces ciblés
- Réduction supplémentaire de la home en ne transmettant plus tout `hero` ni tout `marketingPage` aux îlots clients.
- Ajout d'un test de garde pour empêcher le retour au provider i18n global complet.

Résultat mesuré:

- Home locale HTML/RSC: environ `131.6 KB` avant cette passe, puis `116.1 KB`.
- Gain brut avant compression: environ `15.5 KB` sur la home prospect.
- Taille de route build `/`: reste à `4.73 kB`.
- First Load JS de la home: reste à `250 kB`, ce qui est normal car cette passe réduit surtout la donnée sérialisée et pas les chunks JS.
- `npm run verify` passe.

Contrôles live après déploiement:

- `https://aurumdiary.com/` retourne `200`.
- Taille HTML/RSC live de la home: environ `116.1 KB`.
- Routes contrôlées sans erreur `IntlError` ni `Missing message`:
  - `/`
  - `/fr`
  - `/login`
  - `/signup`
  - `/pricing`
  - `/forgot-password`
  - `/settings`
  - `/account/data`
  - `/account/profile`
  - `/sanctuary`
  - `/sanctuary/write`
- La home live ne sérialise plus les gros blocs i18n inutiles comme `quotes`, `personalityQuestionnaire`, `diagnostic` ou `trustItems`.
- `https://aurumdiary.com/sitemap.xml` reste correct avec les entrées SEO et `x-default`.

## Notes

Le build affiche des warnings locaux existants liés à des variables d'environnement manquantes pour Upstash, Firebase et Stripe, ainsi que des routes admin analytics dynamiques. Ces warnings n'ont pas bloqué le build.

## Prochaines priorités recommandées

1. Soumettre `https://aurumdiary.com/sitemap.xml` dans Google Search Console.
2. Demander l'indexation des pages prioritaires:
   - `/`
   - `/guides`
   - `/guides/rosebud-alternative`
   - `/guides/how-to-stop-rumination`
   - `/guides/journal-prompts-for-anxiety`
   - `/fr/guides/rosebud-alternative`
   - `/fr/guides/how-to-stop-rumination`
   - `/fr/guides/journal-prompts-for-anxiety`
3. Surveiller l'indexation et la désindexation progressive des anciennes URLs `/legal/*`.
4. Ajouter progressivement des guides longs sur les requêtes proches:
   - private journal app
   - emotional clarity journal
   - mental load journaling
   - how to stop rumination at night
5. Créer un maillage interne plus fort entre home, guides, pricing et pages de confiance.
6. Mesurer Lighthouse/PageSpeed après propagation CDN et prioriser LCP mobile.
7. Continuer à découper les îlots clients restants: hero, auth globale, header/footer, cookie consent et analytics.
8. Mesurer Lighthouse/PageSpeed sur mobile après propagation CDN.
9. Remplacer progressivement les derniers composants client marketing par des composants serveur ou des îlots plus petits quand l'interactivité réelle est limitée.
