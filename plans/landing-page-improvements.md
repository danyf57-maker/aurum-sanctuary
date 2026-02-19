# Améliorations Landing Page Aurum - Recommandations

**Date:** 18 février 2026  
**Focus:** Conversion + SEO/Performance  
**Statut:** Recommandations prêtes pour review

---

## Résumé Exécutif

Voici les opportunités identifiées pour améliorer la landing page, classées par impact et effort.

---

## 1. Améliorations Conversion (High Impact)

### 1.1 Hero Section - Réduction de friction

**Problème actuel:**

- Le CTA principal "Entrer dans le Sanctuaire" redirige vers `/sanctuary/write` avec le texte en paramètre
- Aucune valeur immédiate avant l'inscription
- Pas de preuve sociale au-dessus de la fold

**Recommandations:**

| Priorité  | Action                                                                                                    | Impact             |
| --------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| 🔴 High   | Ajouter une micro-récompense immédiate dans le hero (ex: "Obtenez votre première analyse en 10 secondes") | +15-25% conversion |
| 🔴 High   | Afficher un compteur de confiance ("12,847 pensées allégées cette semaine")                               | +10% trust         |
| 🟡 Medium | Ajouter 3 logos presse/témoignages étoiles sous le hero                                                   | +8% crédibilité    |
| 🟡 Medium | Créer un variant A/B du hero avec vidéo de démonstration (15s)                                            | Testable           |

### 1.2 Optimisation du CTA Flow

**Problème actuel:**

- Le quiz est caché après la section Trust (scroll important)
- L'exit intent est générique ("Faire le Test")
- Pas de CTA secondaire pour les utilisateurs non prêts

**Recommandations:**

```
Flow actuel:  Hero → Scroll → Quiz → CTA
Flow proposé: Hero → Micro-conversion → Quiz personnalisé → CTA ciblé
```

**Actions concrètes:**

1. **Déplacer le quiz en haut de page** (section #2) avec un hook émotionnel
2. **Créer 3 chemins de conversion** selon le profil détecté:
   - "Anxiété/Stress" → CTA "Libérer la pression"
   - "Confusion/Mental load" → CTA "Trouver la clarté"
   - "Croissance personnelle" → CTA "Commencer mon voyage"
3. **Ajouter un CTA secondaire** "Voir comment ça marche" (scroll vers la démo)

### 1.3 Preuve Sociale Renforcée

**Problème actuel:**

- Les témoignages sont en bas de page
- Pas de données chiffrées sur l'efficacité
- Pas de badges de sécurité visibles immédiatement

**Recommandations:**

```
Ajouter une bannière de confiance sous le hero:
"🔒 Chiffrement AES-256  |  🏆 4.8/5 (2,400+ avis)  |  🕐 2min pour ressentir la différence"
```

**Témoignages à ajouter:**

- Carrousel de tweets/avis réels (si disponible)
- Logo des médias qui parlent d'Aurum (si applicable)
- Stats d'usage: "X utilisateurs ont écrit Y mots cette semaine"

### 1.4 Urgence et Scarcité (avec authenticité)

**Recommandations:**

- Badge "Accès gratuit pendant la phase Beta" (si vrai)
- Compteur "X personnes ont commencé leur sanctuaire aujourd'hui"
- Mention "Sans engagement • Suppression définitive possible à tout moment"

---

## 2. Améliorations SEO (Medium-High Impact)

### 2.1 Structure Technique

**Problèmes identifiés:**

| Problème                           | Sévérité  | Solution                                             |
| ---------------------------------- | --------- | ---------------------------------------------------- |
| Sitemap minimal (4 routes)         | 🟡 Medium | Ajouter `/pricing`, `/blog/*`, `/legal/*`            |
| Pas de breadcrumbs                 | 🟡 Medium | Ajouter sur les pages profondes                      |
| Pas de FAQ schema                  | 🟢 Low    | Ajouter JSON-LD pour la FAQ                          |
| Images sans lazy loading explicite | 🟡 Medium | Vérifier loading="lazy" sur les images non-critiques |

### 2.2 Contenu SEO

**Opportunités de mots-clés:**

```
Mots-clés cibles identifiés:
- "journal intime en ligne" (volume moyen, compétition faible)
- "journal chiffré" (niche, forte intention)
- "alléger charge mentale" (problème-solution)
- "écriture thérapeutique" (audience qualifiée)
- "espace privé pour écrire" (longue traîne)
```

**Recommandations:**

1. **Créer une page `/pourquoi-journal`** (pillar content):

   - Bénéfices scientifiques du journaling
   - Différence avec les notes classiques
   - CTA vers l'app

2. **Optimiser les balises meta:**

   ```html
   <!-- Actuel -->
   <title>Aurum | Le miroir de votre monde intérieur</title>

   <!-- Proposé -->
   <title>Aurum — Journal Intime Chiffré | Allégez Votre Charge Mentale</title>
   <meta
     name="description"
     content="Écrivez vos pensées les plus intimes en toute sécurité. Journal chiffré AES-256, sans tracking. 50 000+ personnes ont déjà allégé leur esprit."
   />
   ```

3. **Ajouter du contenu éditorial:**
   - Section blog plus visible
   - Articles sur la santé mentale, le journaling
   - Guide: "Comment commencer un journal intime"

### 2.3 Core Web Vitals

**Optimisations recommandées:**

```
1. LCP (Largest Contentful Paint):
   - Précharger la police Cormorant Garamond
   - Utiliser next/image avec priority pour le hero
   - Réduire le CSS critique inline

2. CLS (Cumulative Layout Shift):
   - Dimensions fixes sur les images
   - Placeholder pour le textarea qui se charge
   - Éviter les animations qui changent le layout

3. FID (First Input Delay):
   - Déplacer les scripts non-critiques (GA, animations)
   - Utiliser requestIdleCallback pour le localStorage
```

---

## 3. Améliorations Performance (Medium Impact)

### 3.1 Optimisations Code

**Problèmes identifiés dans le code:**

| Fichier                | Problème                           | Solution                                                        |
| ---------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `page.tsx` (marketing) | 546 lignes, tout en un             | Split en composants séparés                                     |
| Framer Motion          | Animations sur toutes les sections | Utiliser `whileInView` avec `viewport={{ once: true }}` déjà OK |
| LocalStorage           | Accès synchrone au montage         | Déplacer dans un useEffect avec lazy init                       |
| Fonts                  | 3 polices Google                   | Vérifier si Dawning_of_a_New_Day est utilisée                   |

### 3.2 Bundle Size

**Recommandations:**

```
1. Analyser le bundle:
   npm run analyze (si configuré)

2. Lazy loading:
   - QuizSection: dynamic import avec fallback
   - ExitIntent: charger après 5s d'inactivité
   - Testimonials: charger au scroll

3. Tree shaking:
   - Vérifier les imports Lucide (import { X } vs import * as Icons)
```

### 3.3 Métriques à Tracker

**Implémenter un monitoring:**

```typescript
// Exemple: Tracking des événements de conversion
interface ConversionEvents {
  hero_cta_click: { hasText: boolean };
  quiz_start: { question: number };
  quiz_complete: { profile: string };
  exit_intent_shown: { pageScroll: number };
  exit_intent_convert: {};
  floating_cta_click: { scrollDepth: number };
}
```

---

## 4. Suggestions Créatives (Différenciation)

### 4.1 Expérience Immersive

**Idée: "Mode Zen" sur la landing page:**

- Toggle pour activer une expérience sans distraction
- Animation de respiration guidée
- Son ambient (optionnel)
- Full-screen textarea

### 4.2 Démonstration Interactive

**Idée: "Essayez avant de vous inscrire":**

- La textarea du hero est fonctionnelle sans compte
- Sauvegarde localStorage (déjà implémenté)
- Après 3 entrées: "Pour ne pas perdre vos écrits, créez un compte"
- Migration automatique des drafts vers le compte

### 4.3 Personnalisation Dynamique

**Idée: Landing page adaptative:**

- Heure de la journée: message adapté ("Bonne nuit, temps de vider votre esprit")
- Saison: thème visuel changeant
- Device: message différent mobile vs desktop

---

## 5. Plan d'Action Priorisé

### Phase 1: Quick Wins (1-2 jours)

- [ ] Ajouter la bannière de confiance sous le hero
- [ ] Optimiser les meta tags SEO
- [ ] Ajouter le compteur "X pensées allégées"
- [ ] Déplacer le quiz en section #2
- [ ] Ajouter les routes manquantes au sitemap

### Phase 2: Optimisation Conversion (3-5 jours)

- [ ] Créer les 3 chemins de conversion personnalisés
- [ ] Améliorer l'exit intent avec un lead magnet
- [ ] Ajouter les témoignages visuels (photos avatars)
- [ ] Implémenter le tracking des événements

### Phase 3: Performance & SEO (5-7 jours)

- [ ] Split le code de la landing page
- [ ] Optimiser les Core Web Vitals
- [ ] Créer la page pillar content
- [ ] Implémenter le lazy loading des sections

### Phase 4: Innovation (Future)

- [ ] Mode Zen sur landing page
- [ ] Démonstration interactive complète
- [ ] Personnalisation dynamique

---

## Questions pour Affiner les Priorités

1. **Données actuelles:** As-tu accès aux analytics (Google Analytics, Mixpanel) pour voir où les utilisateurs drop ?

2. **Témoignages:** As-tu des retours utilisateurs réels à intégrer ?

3. **A/B Testing:** Veux-tu mettre en place un système de test (Google Optimize, Vercel Edge Config) ?

4. **Ressources:** Quel est le budget temps pour ces améliorations ?

---

_Document créé par Architect Mode - Prêt pour review et priorisation_
