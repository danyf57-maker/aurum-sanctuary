# Aurum - Integration Skills (Fevrier 2026)

## Objectif
Documenter l'integration des skills dans Aurum, avec une contrainte produit forte:
- Les utilisateurs ne doivent pas voir les coulisses (aucune mention de skill en UI).

## Portee de cette livraison
- Routage d'intention cote serveur dans `POST /api/reflect`.
- Branchement du skill `psychologist-analyst` sur l'intention `analysis`.
- Conservation d'une experience utilisateur unique "Aurum", sans exposition technique.

## Verification du skill source
- Repo verifie: `https://github.com/rysweet/amplihack`
- Copie locale comparee avec le repo:
  - `SKILL.md`: identique
  - `QUICK_REFERENCE.md`: identique
  - `tests/quiz.md`: identique

Conclusion: le skill local est coherent avec la source verifiee.

## Architecture retenue

### 1) Routage par intention (backend)
Fichier: `src/app/api/reflect/route.ts`

Intentions actuelles:
- `reflection`
- `conversation`
- `analysis`
- `action`

Detection:
- heuristiques textuelles simples (keywords) pour selectionner l'intention.
- fallback par defaut: `reflection`.

### 2) Skill mappe sur l'intention `analysis`
Fichier: `src/lib/skills/psychologist-analyst.ts`

- Ajout d'un identifiant versionne:
  - `psychologist-analyst@1.0.0`
- Ajout d'un prompt system dedie (cadre psychologique descriptif, non clinique).

Dans `route.ts`:
- `ANALYSIS_SYSTEM_PROMPT` utilise le prompt du skill.
- `getSkillIdForIntent('analysis')` retourne ce skill.

### 3) Transparence totale pour l'utilisateur final
Decision produit:
- Aucun affichage de skill en frontend.
- Aucun libelle "mode" ou "intent" en UI.
- Experience conservee: uniquement "Aurum".

Les metadonnees techniques restent internes serveur/logs.

## Fichiers modifies
- `src/app/api/reflect/route.ts`
- `src/lib/skills/psychologist-analyst.ts` (nouveau)

## Prerequis environnement
- `DEEPSEEK_API_KEY` doit etre une vraie cle (pas une valeur mock).
- Firebase Auth/Admin doit etre operationnel pour `verifyIdToken`.

## Validation realisee
- `npm run typecheck`: OK

## Garde-fous
- Le mode `analysis` reste non diagnostique et non medicalisant.
- En cas d'echec skill/intention, fallback implicite sur le flux standard Aurum.

## Prochaines etapes recommandees
1. Remplacer la detection heuristique par une classification plus robuste (toujours server-side).
2. Externaliser la table `intent -> skill` dans une config versionnee.
3. Ajouter des tests d'integration API pour verifier le routing d'intention.
