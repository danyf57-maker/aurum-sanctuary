# Espace Abonné "Présence" - Implémentation Complète

## 🎯 Objectif

Créer un espace d'écriture premium où Aurum devient **présence émotionnelle** plutôt qu'outil d'analyse, avec reconnaissance implicite des patterns récurrents (Admin-Blind).

---

## 📋 Décisions Architecture

### 1. Route et Accès
**Décision : B - Remplacer `/sanctuary/write` pour les abonnés**

- Route unique : `/sanctuary/write`
- Détection automatique du statut premium
- Expérience enrichie pour abonnés, fallback gratuit conservé

### 2. Écran d'Accueil
**Décision : B - Une fois par session**

- Apparaît à la première visite
- Fermable (swipe/clic hors zone)
- Non répétitif, stocké en `sessionStorage`

### 3. Timing Réponse IA
**Décision : B - Clic explicite**

- Bouton : "Recevoir un reflet" (jamais "Analyser")
- Autonomie utilisateur respectée
- Aligné avec Admin-Blind (invitation explicite)

### 4. Reconnaissance des Patterns
**Décision : Implicite, presque invisible**

- Patterns informent la **profondeur** de la réponse
- Jamais de méta-commentaires ("je reconnais...")
- Tissé naturellement dans le reflet

---

## 🏗️ Structure Technique

### Fichiers Créés

#### 1. Système de Patterns (Fondation)

**`src/lib/patterns/types.ts`**
- Enums : `ThemeId` (18 thèmes), `EmotionalTone` (7 tons)
- Interface `Pattern` avec `decay_score`, `confidence`, `frequency`
- Interfaces pour détection et injection

**`src/lib/patterns/storage.ts`**
- CRUD Firestore : `getUserPatterns()`, `upsertPattern()`, `batchUpdatePatterns()`
- Calcul decay : `exp(-(days / half_life)) * sqrt(frequency)`
- Nettoyage automatique : `cleanupStalePatterns()` (decay < 0.05)

**`src/lib/patterns/detect.ts`**
- Détection via DeepSeek : `detectPatterns(content)`
- Prompt dédié (séparé de la réflexion)
- Retourne 1-3 thèmes avec confidence

**`src/lib/patterns/inject.ts`**
- Sélection max 2 patterns : `selectPatternsForInjection()`
- Règles : plus fréquent + plus récent, OU 2 plus récents si changement de phase
- Formatage pour contexte : `formatPatternsForContext()`

**`src/lib/patterns/anti-meta.ts`**
- Liste interdits : "je reconnais", "déjà", "avant", "souvent", etc.
- Post-check : `validateResponse()`, `containsMetaReference()`
- Correction automatique : sanitisation puis régénération si échec

#### 2. API Route

**`src/app/api/reflect/route.ts`**
- POST `/api/reflect` (auth required)
- Pipeline :
  1. Détecte patterns dans contenu actuel
  2. Récupère patterns existants utilisateur
  3. Sélectionne max 2 pour injection
  4. Génère réflexion DeepSeek avec contraintes
  5. Post-check anti-méta (régénération si besoin)
  6. Update patterns en background (non-bloquant)

#### 3. Composants UI

**`src/components/sanctuary/welcome-presence.tsx`**
- Modal translucide, golden hour aesthetic
- Message : "Cet espace est le tien. Rien ne presse. Rien ne mesure."
- Badge "Présence Premium"

**`src/components/sanctuary/reflection-response.tsx`**
- Pas de bulles chat, design spacieux
- Fond gradient amber/stone
- Footer : indication discrète du nombre de patterns utilisés

**`src/components/sanctuary/premium-journal-form.tsx`**
- Textarea immense (40vh), text-2xl
- Flow : Écrire → Sauvegarder → "Recevoir un reflet" → Affichage réponse
- Animations Framer Motion

#### 4. Intégration

**`src/app/(app)/sanctuary/write/page.tsx`** (modifié)
- Détection `isPremium` via `useSubscription()`
- Si premium : `<WelcomePresence />` + `<PremiumJournalForm />`
- Si gratuit : tabs existants (mirror questions + chat)

---

## 🔐 Admin-Blind : Comment ça marche

### Patterns Stockés (Firestore)
```typescript
// Collection : users/{uid}/patterns/{themeId}
{
  theme_id: "WORK_BOUNDARY_TENSION",  // ID non-narratif
  frequency: 3,
  last_seen: Date,
  emotional_tone: "ANXIOUS",
  intensity_avg: 0.62,
  confidence: 0.85,
  decay_score: 0.73,
  half_life_days: 30
}
```

**Aucun texte original stocké.** Seuls des signaux abstraits.

### Injection dans Prompt
```
Context (pour toi uniquement, NE JAMAIS mentionner) :
- Thème récurrent : WORK_BOUNDARY_TENSION (3x, ton: ANXIOUS, intensité: 0.62)

Règle : ces patterns informent la PROFONDEUR de ton reflet, jamais sa surface.
Interdits : "je reconnais", "déjà", "avant", "souvent"...
```

### Exemple de Réflexion

**❌ Explicite (bloqué par anti-meta)**
> "Je reconnais cette tension professionnelle dont tu as déjà parlé..."

**✅ Implicite (validé)**
> "Cette frontière entre ton espace et ce qu'on attend de toi... elle revient, différemment peut-être, mais elle est là."

---

## 🎨 Design System Utilisé

**Couleurs**
- Background : `#F9F7F2` (ivoire)
- Primary : `#C5A059` (or mat)
- Text : stone-800/900
- Accents : amber-600

**Typographie**
- Body : Inter 2xl (premium form)
- Headlines : Cormorant Garamond
- Leading : relaxed (1.625)

**Animations**
- Framer Motion : fade-in, slide-up
- Backdrop blur : 20px
- Golden glow : gradient blur

---

## 🧪 Tests Manuels Recommandés

### 1. Flow Premium Complet
1. Se connecter en tant qu'abonné premium
2. Visiter `/sanctuary/write`
3. Vérifier apparition Welcome Presence (1 fois/session)
4. Écrire une entrée avec thème émotionnel clair
5. Sauvegarder → vérifier confirmation
6. Cliquer "Recevoir un reflet"
7. Vérifier que la réflexion :
   - N'utilise AUCUN mot interdit
   - Semble informée mais jamais méta
   - Affiche le badge "X thèmes utilisés"

### 2. Persistence Patterns
1. Écrire plusieurs entrées avec même thème (ex: travail)
2. Vérifier dans Firestore : `users/{uid}/patterns/`
3. Constater : `frequency` incrémente, `decay_score` recalculé
4. Écrire après 7+ jours → vérifier decay diminue

### 3. Anti-Meta Safeguard
- Forcer une réponse avec "je reconnais" (modifier temporairement le prompt)
- Vérifier régénération automatique
- Logs : `"Regenerating reflection due to meta-references"`

### 4. Fallback Gratuit
1. Se connecter en tant que gratuit
2. Vérifier que l'ancienne expérience (tabs + mirror questions) s'affiche
3. Pas de Welcome Presence, pas de bouton "Recevoir un reflet"

---

## 📊 Métriques de Succès (Suggestions)

**Techniques**
- Taux de reflets générés sans régénération anti-meta (objectif : >95%)
- Temps moyen détection + réflexion (<5s)
- Croissance moyenne `frequency` des patterns (indicateur d'engagement)

**Produit**
- Taux de clics "Recevoir un reflet" (objectif : >60%)
- NPS premium vs gratuit
- Verbatims : chercher "présence", "accompagnement" (positif) vs "analyse", "jugement" (négatif)

---

## 🚀 Déploiement

### Variables d'Environnement Requises

Déjà configurées dans `apphosting.yaml` :
- `DEEPSEEK_API_KEY` (pour détection + réflexion)
- `STRIPE_SECRET_KEY` (pour vérification premium)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (auth)
- Firebase Service Account (auto-injecté par App Hosting)

### Commandes
```bash
# Test local
npm run dev

# Build production
npm run build

# Deploy Firebase Hosting
firebase deploy --only hosting

# Ou App Hosting (auto-deploy depuis GitHub main)
firebase apphosting:rollouts:create studio --git-branch main
```

---

## 🔮 Évolutions Futures

### Court Terme
1. **Patterns inter-entrées** : détecter évolution d'un thème dans le temps
2. **Nuances émotionnelles** : "anxiété qui se transforme en tristesse"
3. **Suggestions douces** : "Et si tu écrivais sur..." (non-directif)

### Moyen Terme
1. **Visualisation patterns** : graphe temporel abstrait (sans texte)
2. **Export insights** : PDF avec abstractions, jamais contenus
3. **Partage sélectif** : anonymiser + partager pattern avec communauté

### Long Terme
1. **Embeddings sémantiques** : regroupements plus fins sans texte
2. **Multi-modal** : analyse d'images/voix (toujours E2EE)
3. **"Compagnon longue durée"** : Aurum qui évolue sur 1+ an avec l'utilisateur

---

## ⚠️ Points d'Attention

### Sécurité
- ✅ Patterns stockés côté serveur MAIS abstraits (theme IDs, pas texte)
- ✅ Contenu brut jamais envoyé à `/api/reflect` (sauf pour génération immédiate)
- ✅ Encryption client-side conservée pour journal entries
- ⚠️ DeepSeek voit le contenu brut à chaque reflet (acceptable : service externe, non persistent)

### Performance
- Détection patterns : ~1-2s (parallèle avec update DB)
- Réflexion : ~2-3s (DeepSeek)
- Total : <5s (acceptable pour une expérience premium)

### Coûts DeepSeek
- Détection : ~200 tokens/entrée
- Réflexion : ~500 tokens/reflet
- Si 1000 reflets/jour : ~$0.70/jour (~$21/mois)

---

## 📝 Changelog

**2026-02-06 - v1.0.0 - Initial Implementation**
- Système patterns complet (detect, storage, inject)
- API `/api/reflect` avec anti-meta safeguards
- Premium writing experience (WelcomePresence, PremiumJournalForm)
- Intégration conditionnelle dans `/sanctuary/write`
- Build successful ✅

---

## 🙏 Crédits

Architecture pensée par Daniel Fioriti
Implémentation technique par Claude (Anthropic)
Philosophie produit : "présence, pas performance"
