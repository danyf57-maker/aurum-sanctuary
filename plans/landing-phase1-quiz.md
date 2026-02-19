# Phase 1 - Quiz de Profil (Style DISC sans mentionner DISC)

## Concept

Un quiz de 4 questions pour découvrir le "profil de réflexion" de l'utilisateur. Les résultats sont révélés APRÈS création/connexion au compte.

## Architecture

### 1. Quiz Landing Page (4 questions)

**Stockage:** LocalStorage (answers + timestamp)
**Redirection:** Après la dernière question → `/signup?quiz=complete`

### 2. Questions (style conversationnel, pas technique)

**Question 1 - Contexte émotionnel actuel:**
"Quand vous pensez à votre journée, qu'est-ce qui ressort le plus ?"

- A) J'ai beaucoup de choses à faire et je veux avancer vite
- B) J'ai besoin de connecter avec les autres et partager
- C) Je cherche la tranquillité et l'harmonie
- D) J'analyse les situations avant d'agir

**Question 2 - Réaction au stress:**
"Face à une situation difficile, votre première réaction est de :"

- A) Prendre le problème en main et trouver une solution
- B) En parler pour voir différentes perspectives
- C) Retrouver mon calme avant de réagir
- D) Comprendre tous les détails avant de décider

**Question 3 - Style d'écriture préféré:**
"Si vous ouvriez votre journal maintenant, vous écririez sur :"

- A) Vos objectifs et ce que vous voulez accomplir
- B) Vos interactions et ce qui vous a touché émotionnellement
- C) Votre besoin de paix et de stabilité
- D) Vos réflexions profondes et analyses

**Question 4 - Besoin principal:**
"Ce que vous cherchez avant tout en ce moment :"

- A) Du momentum et de l'action
- B) De la connexion et de l'inspiration
- C) De la sécurité et du réconfort
- D) De la clarté et de la structure

### 3. Mapping des réponses → Profil

| Profil            | Caractéristiques              | Archetype      | Description                                                                                                    |
| ----------------- | ----------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| **A majoritaire** | Action, décision, résultats   | Le Pionnier    | "Vous avancez vite et aimez voir des résultats concrets. Votre journal vous aidera à canaliser cette énergie." |
| **B majoritaire** | Interaction, émotion, partage | Le Connecteur  | "Vous êtes guidé par les relations et les émotions. Votre journal sera votre espace d'expression authentique." |
| **C majoritaire** | Harmonie, stabilité, patience | L'Ancre        | "Vous cherchez la paix et la constance. Votre journal vous offrira un refuge stable pour vous retrouver."      |
| **D majoritaire** | Analyse, précision, réflexion | L'Architecte   | "Vous aimez comprendre avant d'agir. Votre journal deviendra votre laboratoire d'idées."                       |
| **Mixte**         | Équilibré                     | L'Équilibriste | "Vous combinez plusieurs forces. Votre journal s'adaptera à votre complexité."                                 |

### 4. Flow Utilisateur

```
Landing Page
    ↓
Hero Section (textarea + CTA principal)
    ↓
[NOUVEAU] Quiz Section
    - Question 1/4 → localStorage
    - Question 2/4 → localStorage
    - Question 3/4 → localStorage
    - Question 4/4 → localStorage
    ↓
Écran de transition: "Votre profil est prêt"
    ↓
CTA: "Créer mon compte pour découvrir mon profil"
    ↓
Redirection: /signup?quiz=complete&profile=calculé
    ↓
Signup/Login
    ↓
Dashboard avec résultat du profil affiché
```

### 5. Design - Charte Graphique Aurum

**Couleurs:**

- Fond: `bg-stone-50` ou `bg-white`
- Texte: `text-stone-900` / `text-stone-600`
- Accent: `text-primary` (#D4AF37 - doré)
- Bordures: `border-stone-200`

**Typographie:**

- Titres: `font-headline` (Cormorant Garamond)
- Corps: `font-body` (Inter)

**Composants:**

- Cards avec `rounded-3xl` ou `rounded-[2.5rem]`
- Boutons: `rounded-2xl` ou `rounded-full`
- Animations: Framer Motion (comme existant)

### 6. Implémentation Technique

**Fichiers à créer/modifier:**

```
src/
  components/
    landing/
      ProfileQuiz.tsx       # Composant quiz complet
      QuizQuestion.tsx      # Question individuelle
      QuizResult.tsx        # Écran résultat (avant signup)
  app/
    (marketing)/
      page.tsx              # Ajouter le quiz en section #2
    signup/
      page.tsx              # Détecter ?quiz=complete et afficher teaser
```

**LocalStorage Schema:**

```typescript
interface QuizData {
  answers: string[]; // ['A', 'B', 'C', 'A']
  completedAt: string; // ISO timestamp
  profile: string | null; // Calculé après Q4
}
```

### 7. Affichage du Résultat (Post-Auth)

Après connexion/création de compte:

1. Récupérer les données du quiz depuis localStorage
2. Afficher un modal ou une section "Votre profil de réflexion"
3. Proposer de sauvegarder le profil dans Firestore (`users/{uid}/profile`)
4. CTA: "Commencer mon premier journal" → `/sanctuary/write`

### 8. Points d'attention

- **Pas de mention de DISC** dans l'UI ni le copy
- **Pas de stockage serveur** avant authentification
- **Expiration** des données quiz après 24h (optionnel)
- **Responsive** mobile-first
- **Accessible** (keyboard navigation, ARIA labels)

---

## Intégration avec la Landing Page

Le quiz remplace la section "Cultivez votre clarté" actuelle (section #2) ou est inséré juste après le hero.

**Hook de transition:**
"Découvrez votre façon naturelle de réfléchir en 4 questions"
"Votre profil personnalisé vous attend"

---

_Document pour Phase 1 - Conversion optimisée_
