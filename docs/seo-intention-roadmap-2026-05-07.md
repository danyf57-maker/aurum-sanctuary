# Roadmap SEO/GEO Aurum - Intentions, contenus, autorite

Date: 2026-05-07

## Objectif

Transformer les apprentissages concurrentiels Day One / Stoic / Reflection en une roadmap executable pour aurumdiary.com.

Le principe n'est pas de copier la vente de liens ni les promesses medicales des concurrents. Le principe est:

1. trouver les intentions de recherche proches du besoin Aurum;
2. produire des contenus utiles et extractibles;
3. accumuler une autorite editoriale saine;
4. convertir vers l'ecriture privee, pas vers un paywall agressif.

## Audit rapide de l'existant

Le repo possede deja une base SEO solide:

- routes publiques bilingues gerees par le routing FR/EN;
- `/guides` et `/fr/guides` comme Knowledge Hub;
- `src/lib/knowledge-hub.ts` comme source de contenu bilingue;
- sitemap dynamique qui ajoute tous les guides;
- schemas `Article`, `BreadcrumbList`, `FAQPage`, et `HowTo` sur les pages guides;
- `public/llms.txt` et `public/ai.txt` pour l'indexation IA;
- tests existants pour sitemap, schemas et profondeur de contenu.

Guides deja presents et pertinents pour cette strategie:

- `/guides/journal-guide`
- `/guides/charge-mentale`
- `/guides/overthinking-at-night`
- `/guides/journaling-prompts-for-clarity`
- `/guides/journal-prompts-for-anxiety`
- `/guides/journaling-et-rumination`
- `/guides/prompts-ecriture-expressive`
- `/guides/private-journal-app`
- `/guides/emotional-clarity-journal`
- `/guides/private-diary-vs-notes-app`
- `/guides/rosebud-alternative`

Conclusion: il ne faut pas lancer un second blog SEO parallele. Il faut renforcer le Knowledge Hub et ameliorer les chemins de conversion depuis les guides.

## Garde-fous de positionnement

Aurum peut capter des intentions proches de l'anxiete, de la rumination, du stress et de la charge mentale, mais sans promettre de soin.

Formulations a privilegier:

- "pensees qui reviennent"
- "boucle mentale"
- "mettre des mots"
- "ecrire ce qui prend de la place"
- "clarifier ce que tu ressens"
- "espace prive"
- "reperer ce qui revient"

Formulations a eviter en titre/H1/CTA:

- "traiter l'anxiete"
- "guerir la rumination"
- "journal pour depression"
- "diagnostic emotionnel"
- "coach therapeutique"
- "burnout" comme promesse frontale

## Mapping priorise

| Priorite | URL cible | Etat | Intention | Angle Aurum | CTA recommande |
|---|---|---|---|---|---|
| P0 | `/guides/journal-guide` | Existant a renforcer | "journal guide", "journal guide en ligne", "comment commencer un journal guide" | Commencer quand la page blanche bloque | "Commencer une page guidee" |
| P0 | `/guides/charge-mentale` | Existant a renforcer | "charge mentale", "ecrire charge mentale", "trop de choses dans la tete" | Trier obligations, emotions, prochaines actions | "Deposer ce qui pese" |
| P0 | `/guides/overthinking-at-night` | Existant | "pensees le soir", "je pense trop la nuit" | Le soir, donner un endroit a la boucle | "Ecrire ce qui tourne ce soir" |
| P0 | `/guides/journaling-prompts-for-clarity` | Existant | "prompts journaling", "prompts ecriture", "questions journal intime" | Prompts pour clarifier sans dramatiser | "Utiliser un prompt dans Aurum" |
| P0 | `/guides/pensees-recurrentes` | A creer | "pensees recurrentes", "pourquoi je repense toujours a la meme chose" | Voir ce qui revient sans le nourrir | "Ecrire la pensee qui revient" |
| P0 | `/guides/prompts-pensees-recurrentes` | A creer | "prompts pensees recurrentes", "prompts rumination" | 15 prompts pour transformer une boucle en phrases distinctes | "Ouvrir un prompt prive" |
| P0 | `/guides/conversation-qui-revient` | A creer | "je repense a une conversation", "conversation qui tourne en boucle" | Le message ou l'echange est fini, mais continue dedans | "Deposer la conversation" |
| P1 | `/guides/je-ne-sais-pas-ce-que-je-ressens` | A creer | "je ne sais pas ce que je ressens", "comprendre mes emotions" | Partir d'un fait, d'une sensation, puis d'un mot emotionnel | "Ecrire une premiere phrase" |
| P1 | `/guides/journal-emotionnel` | A creer ou rediriger vers `emotional-clarity-journal` | "journal emotionnel", "journal des emotions" | Nommer sans se diagnostiquer | "Commencer un journal emotionnel" |
| P1 | `/guides/journal-intime-prive-en-ligne` | A creer ou fusionner avec `private-journal-app` | "journal intime prive", "journal intime en ligne securise" | Confidentialite comme condition d'ecriture vraie | "Creer un espace prive" |
| P1 | `/guides/meilleures-applications-journal-intime-prive` | A creer | "meilleure application journal intime", "application journal intime prive" | Comparatif factuel, Aurum positionne sur clarté et privacy | "Essayer Aurum gratuitement" |
| P1 | `/guides/aurum-vs-day-one` | A creer plus tard | "Day One alternative", "Day One vs ..." | Day One = journal generaliste; Aurum = pensees qui reviennent | "Comparer puis essayer Aurum" |
| P1 | `/guides/aurum-vs-stoic` | A creer plus tard | "Stoic alternative", "Stoic app alternative" | Stoic = stoicisme + mood; Aurum = ecriture privee et motifs | "Voir l'approche Aurum" |
| P2 | `/guides/prompts-charge-mentale` | A creer | "prompts charge mentale" | Transformer la surcharge en liste lisible et emotion nommee | "Utiliser ces prompts" |
| P2 | `/guides/ecrire-le-soir` | A creer ou fusionner avec `overthinking-at-night` | "ecrire le soir", "journal du soir" | Rituel court avant de laisser la page | "Ecrire 5 minutes" |

## Recommandation d'architecture

Court terme: rester dans `/guides/[slug]`.

Raison:

- le sitemap, les schemas et les tests existent deja;
- les pages sont bilingues par construction;
- le maillage peut etre centralise;
- le systeme est deja connu par le repo.

Plus tard, si les prompts prennent du volume, on pourra envisager une sous-collection `/prompts/...`, mais ce n'est pas necessaire maintenant.

## Amelioration de conversion

Le CTA actuel des guides pointe surtout vers:

- signup;
- pricing;
- tous les guides;
- manifeste.

Pour une strategie organique, il faut ajouter un CTA contextuel vers l'ecriture avec pre-remplissage:

`/sanctuary/write?initial=<prompt encode>`

Le composant `HeroDraftBox` utilise deja ce pattern. La page d'ecriture lit deja `initial` dans `PremiumJournalForm`.

Proposition:

- ajouter a chaque guide un `suggestedPrompt` localise;
- ajouter un bouton primaire contextuel:
  - FR: "Ecrire avec ce prompt"
  - EN: "Write with this prompt"
- l'URL cible devient `/sanctuary/write?initial=...` localisee via `toLocalePath`;
- garder signup comme fallback pour les utilisateurs non connectes via la page d'ecriture existante.

## P0 implementation

Premier lot recommande:

1. Ajouter `suggestedPrompt` au type `KnowledgeHubTopic`.
2. Modifier le CTA de `src/app/guides/[slug]/page.tsx` pour inclure un bouton "Ecrire avec ce prompt".
3. Creer `/guides/pensees-recurrentes`.
4. Creer `/guides/prompts-pensees-recurrentes`.
5. Creer `/guides/conversation-qui-revient`.
6. Mettre a jour `public/llms.txt` avec les nouvelles pages P0.
7. Etendre les tests sitemap / knowledge hub aux nouveaux slugs.

## Structure type pour une nouvelle page guide

Chaque page doit contenir:

- une question en H1 ou proche du H1;
- une reponse courte directe;
- 5 a 7 paragraphes de fond;
- une methode simple;
- un exemple concret;
- un prompt pret a utiliser;
- un bloc "Comment Aurum aide";
- une FAQ;
- un CTA d'ecriture contextuel.

## Contenus sociaux derives

Chaque page P0 doit produire:

- 3 scripts Reels/TikTok;
- 1 carrousel Instagram;
- 1 post LinkedIn/X;
- 1 email court ou section newsletter.

Exemple pour `/guides/conversation-qui-revient`:

- Reel 1: "La conversation est terminee. Pourquoi elle continue dans ta tete ?"
- Reel 2: "3 phrases pour deposer un message que tu relis trop."
- Reel 3: "Ce n'est pas toujours la personne qui te manque. Parfois, c'est la reponse."
- Carousel: "Comment ecrire une conversation qui tourne en boucle"
- Post texte: "Une conversation peut finir dehors et continuer longtemps dedans."

## Mesure

Sans Search Console, on ne doit pas inventer les performances.

Mesures a suivre:

- impressions par URL;
- clics organiques;
- requetes exactes;
- CTR;
- position moyenne;
- clics CTA guide -> write;
- taux de creation de compte apres arrivee depuis guide;
- premiere entree creee apres arrivee depuis guide;
- passage gratuit -> Premium pour les cohortes organiques.

## Decision

La prochaine action utile est l'implementation du P0 conversion + 3 nouveaux guides:

- `pensees-recurrentes`
- `prompts-pensees-recurrentes`
- `conversation-qui-revient`

Ce lot exploite le gap concurrentiel identifie: les leaders dominent les prompts generalistes et emotionnels en anglais, mais Aurum peut occuper en francais le territoire plus precis des pensees qui reviennent, de la conversation qui continue dedans, et de l'ecriture privee comme point d'entree.

## P1 implementation - commercial intent cluster

Deuxieme lot implemente le 2026-05-08:

1. Creer `/guides/meilleure-application-journal-pensees-recurrentes`.
2. Creer `/guides/journal-guide-charge-mentale`.
3. Renforcer `/guides/private-diary-vs-notes-app` avec des criteres de choix et un prompt plus specifique.
4. Ajouter un bloc "Criteres de choix" optionnel au template guide.
5. Ajouter un bloc "A lire ensuite" pour mailler les pages informationnelles vers les pages commerciales.
6. Mettre a jour sitemap tests, tests Knowledge Hub et `public/llms.txt`.

Objectif du lot:

- capter les requetes plus proches de l'essai produit;
- relier les intentions "je veux comprendre ma pensee" aux intentions "je cherche un outil";
- renforcer le cluster francophone autour de pensees recurrentes, charge mentale, journal prive et ecriture guidee;
- convertir vers `/sanctuary/write?initial=...` sans promesse medicale ni posture therapeutique.
