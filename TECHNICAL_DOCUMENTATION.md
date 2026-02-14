# Aurum Sanctuary — Documentation Technique Complète

> Dernière mise à jour : 14 février 2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Structure du projet](#3-structure-du-projet)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Routes API](#5-routes-api)
6. [Pages](#6-pages)
7. [Base de données (Firestore)](#7-base-de-données-firestore)
8. [Authentification](#8-authentification)
9. [Intégration IA (DeepSeek)](#9-intégration-ia-deepseek)
10. [Système de patterns](#10-système-de-patterns)
11. [Chiffrement côté client](#11-chiffrement-côté-client)
12. [PWA](#12-pwa)
13. [Paiements (Stripe)](#13-paiements-stripe)
14. [Rate Limiting](#14-rate-limiting)
15. [Déploiement](#15-déploiement)
16. [Développement local](#16-développement-local)

---

## 1. Vue d'ensemble

**Aurum Sanctuary** est une application de journaling intime avec IA, axée sur la santé mentale et le bien-être. Principes architecturaux :

- **Admin-blind** : chiffrement AES-256-GCM côté client, le serveur ne peut jamais lire le contenu
- **IA psychodynamique** : réflexions profondes via DeepSeek, pas de coaching ni de thérapie
- **Streaming SSE** : réponses IA en temps réel, token par token
- **Patterns implicites** : détection de thèmes émotionnels, injection dans le contexte IA sans jamais les mentionner
- **Privacy-first** : pas de PII dans les logs, Firestore rules owner-only

**URL production** : `https://aurumdiary.com`
**GitHub** : `danyf57-maker/aurum-sanctuary` (branche `main`)

---

## 2. Stack technique

| Catégorie | Technologie |
|---|---|
| Framework | Next.js 14 (App Router, Turbopack) |
| Runtime | Node.js + Edge (pour /api/mirror) |
| Langage | TypeScript |
| UI | Radix UI + Tailwind CSS + Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Backend | Firebase (Auth, Firestore, Cloud Functions) |
| IA | DeepSeek API (deepseek-chat, OpenAI-compatible) |
| Paiements | Stripe |
| Rate Limiting | Upstash Redis |
| Analytics | PostHog + Google Analytics |
| PWA | @ducanh2912/next-pwa |
| Chiffrement | Web Crypto API (AES-256-GCM) |
| Charts | Recharts |

### Dépendances clés (package.json)

```
next: 14.2.18 | react: 18.3.1 | typescript: 5.x
firebase: 11.9.1 | firebase-admin: 12.2.0
openai: 4.52.7 | genkit: 1.20.0
stripe: 16.12.0 | @upstash/redis: 1.36.1
bip39: 3.1.0 | zxcvbn: 4.4.2
```

### Scripts

```bash
npm run dev          # Démarre sur port 9002
npm run build        # Build production (NODE_ENV=production)
npm run start        # Lance le serveur production
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

---

## 3. Structure du projet

```
src/
├── app/
│   ├── (app)/                    # Routes protégées (layout avec sidebar)
│   │   ├── dashboard/page.tsx    # Tableau de bord
│   │   ├── sanctuary/
│   │   │   ├── page.tsx          # Historique du journal
│   │   │   ├── write/page.tsx    # Écrire une entrée
│   │   │   └── magazine/
│   │   │       ├── page.tsx      # Vue magazine
│   │   │       └── [entryId]/    # Entrée individuelle
│   │   ├── insights/page.tsx     # Insights IA
│   │   └── settings/page.tsx     # Paramètres
│   ├── (marketing)/page.tsx      # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── api/
│   │   ├── reflect/route.ts      # Réflexion IA (SSE streaming)
│   │   ├── mirror/route.ts       # Chat miroir (SSE, Edge)
│   │   ├── analyze/route.ts      # Analyse sentiment/mood
│   │   ├── analyze-patterns/route.ts
│   │   ├── generate-digest/route.ts
│   │   ├── magazine/backfill/route.ts
│   │   ├── auth/session/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── stripe/create-checkout-session/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── track/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # Composants Radix UI
│   ├── sanctuary/                # Journal, magazine, réflexions
│   ├── dashboard/                # Clarity score, insights
│   ├── stats/                    # Heatmap, charts, mood trends
│   ├── auth/                     # Boutons auth, modals
│   ├── layout/                   # Header, sidebar, bottom nav
│   ├── features/                 # MirrorChat
│   ├── chat/                     # AurumChat
│   ├── landing/                  # Hero sections
│   └── paywall/                  # PaywallModal
├── lib/
│   ├── firebase/
│   │   ├── admin.ts              # Firebase Admin SDK
│   │   ├── config.ts             # Firebase Client SDK
│   │   ├── auth.ts               # Hooks et fonctions auth
│   │   ├── firestore.ts          # Requêtes Firestore client
│   │   └── edge.ts               # Utilitaires Edge runtime
│   ├── deepseek/
│   │   ├── adapter.ts            # Appels API DeepSeek
│   │   ├── prompts.ts            # MIRROR_SYSTEM_PROMPT
│   │   └── insights.ts           # Génération d'insights
│   ├── crypto/
│   │   └── encryption.ts         # AES-256-GCM (Web Crypto)
│   ├── patterns/
│   │   ├── detect.ts             # Détection de thèmes
│   │   ├── inject.ts             # Injection dans le contexte IA
│   │   └── anti-meta.ts          # Filtrage anti-méta-référence
│   ├── skills/
│   │   └── psychologist-analyst.ts
│   ├── rate-limit/index.ts       # Presets rate limiting
│   ├── ratelimit.ts              # Upstash Redis rate limiter
│   ├── redis/client.ts
│   ├── stripe/server.ts
│   ├── stripe/client.ts
│   ├── logger/safe.ts            # Logging sans PII
│   ├── logger/cloud.ts           # Google Cloud Logging
│   ├── audit.ts                  # Audit trail Firestore
│   ├── schemas/derivedMemory.ts  # Zod schema DerivedMemoryLite
│   ├── types.ts                  # Types TypeScript
│   └── utils.ts                  # cn(), utilitaires
├── providers/
│   └── auth-provider.tsx         # AuthContext + cookie sync
└── hooks/                        # Custom React hooks
```

---

## 4. Variables d'environnement

### Firebase Client (publiques)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase Admin (serveur)

```env
FIREBASE_SERVICE_ACCOUNT_KEY=    # JSON string ou base64
```

### DeepSeek IA

```env
DEEPSEEK_API_KEY=                # Secret Manager en prod
```

### Stripe

```env
STRIPE_SECRET_KEY=               # Secret Manager en prod
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=
```

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Analytics

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_GA_ID=
GA_MEASUREMENT_PROTOCOL_API_SECRET=
```

### Autres

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_URL=http://localhost:9002
```

---

## 5. Routes API

### POST /api/reflect — Réflexion IA (SSE streaming)

Le cœur de l'IA d'Aurum. Analyse le contenu, détecte l'intention, injecte les patterns et streame la réponse.

**Paramètres** :
- `content` : texte du journal
- `idToken` : token Firebase
- `entryId` (optionnel) : pour la conversation
- `userMessage` (optionnel) : message de suivi

**Intentions détectées automatiquement** :
- `reflection` (défaut) — observation psychodynamique
- `conversation` — dialogue de suivi
- `analysis` — analyse profonde (skill psychologist-analyst)
- `action` — passage à l'action

**Réponse SSE** :
```
data: {"token": "Il"}
data: {"token": " y a"}
data: {"token": " quelque chose"}
...
data: {"replace": "texte corrigé"}     # si anti-méta déclenché
data: {"done": true, "intent": "reflection", "patterns_detected": 2, ...}
```

**Tâches en arrière-plan** (après le stream) :
- Stockage des patterns détectés dans Firestore
- Persistance des tours de conversation
- Nettoyage des patterns périmés (decay_score < 0.05)

### POST /api/mirror — Chat miroir (Edge, SSE)

Chat d'écoute réflective, streaming via Edge runtime.

**Paramètres** :
- `text` : message utilisateur
- `derivedMemoryLite` : contexte (stats, émotions)

**Rate limit** : 20 req/min via Upstash Redis

### POST /api/analyze — Analyse sentiment/mood

**Paramètres** : `content`
**Réponse** : `{ sentiment, mood, insight }`
**Timeout** : 15s

### POST /api/analyze-patterns — Analyse thématique

**Paramètres** : `entries` (max 30), `userId`
**Réponse** : themes, writingTimes, sentimentTrend, suggestions
**Fallback** : analyse client-side si DeepSeek indisponible

### POST /api/generate-digest — Digest hebdomadaire

**Paramètres** : `entries`, `userId`
**Réponse** : markdown formaté (français)

### POST /api/magazine/backfill — Génération magazine

Génère les issues magazine à partir des entrées existantes.
**Auth** : cookie session requis

### POST /api/auth/session — Création cookie session

**Paramètres** : `idToken`
**Cookie** : `__session`, HttpOnly, Secure, 14 jours

### POST /api/auth/logout — Déconnexion

Supprime le cookie `__session`

### POST /api/stripe/create-checkout-session

Crée une session Stripe Checkout.
**Auth** : Firebase ID token

### POST /api/stripe/webhook

Gère les événements Stripe (subscription.created/updated/deleted, payment events).
**Sécurité** : vérification signature webhook

### POST /api/track — Analytics serveur

Envoie des événements GA4 via Measurement Protocol.

---

## 6. Pages

| Route | Description | Protégée |
|---|---|---|
| `/` | Landing page | Non |
| `/login` | Connexion (email/password + Google) | Non |
| `/signup` | Inscription + vérification email | Non |
| `/dashboard` | Tableau de bord (clarity score, stats, heatmap) | Oui |
| `/sanctuary` | Historique du journal + charts | Oui |
| `/sanctuary/write` | Écrire une entrée (formulaire premium) | Oui |
| `/sanctuary/magazine` | Vue magazine des entrées | Oui |
| `/sanctuary/magazine/[entryId]` | Entrée magazine individuelle | Oui |
| `/insights` | Insights et patterns IA | Oui |
| `/settings` | Paramètres utilisateur | Oui |
| `/account/profile` | Profil utilisateur | Oui |
| `/account/data` | Export/suppression de données | Oui |
| `/pricing` | Plans d'abonnement | Non |
| `/blog` | Articles de blog publics | Non |
| `/blog/[slug]` | Article de blog individuel | Non |
| `/legal/privacy` | Politique de confidentialité | Non |
| `/legal/terms` | Conditions d'utilisation | Non |
| `/offline` | Page fallback PWA hors-ligne | Non |
| `/admin` | Dashboard admin | Oui |

---

## 7. Base de données (Firestore)

### Collections et documents

#### `users/{userId}`

```typescript
{
  email: string
  displayName: string
  photoURL: string
  createdAt: Timestamp
  encryptionEnabled: boolean
  subscriptionStatus: string
  stripeCustomerId: string
  subscriptionId: string
  subscriptionPriceId: string
  subscriptionCurrentPeriodEnd: Timestamp
  updatedAt: Timestamp
}
```

#### `users/{userId}/entries/{entryId}`

```typescript
{
  content: string              // texte en clair ou placeholder
  encryptedContent: string     // base64 (si chiffré)
  title: string
  tags: string[]
  mood: string
  sentiment: string
  insight: string
  images: { url: string }[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `users/{userId}/entries/{entryId}/aurumConversation/{turnId}`

```typescript
{
  role: "user" | "aurum"
  text: string
  createdAt: Timestamp
  intent: string
  skillId?: string
}
```

#### `users/{userId}/magazineIssues/{issueId}`

```typescript
{
  entryId: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  tags: string[]
  mood: string | null
  sentiment: string | null
  createdAt: Timestamp
  publishedAt: Timestamp
  updatedAt: Timestamp
}
```

#### `users/{userId}/patterns/{themeId}`

```typescript
{
  theme_id: ThemeId            // enum (ex: WORK_BOUNDARY_TENSION)
  frequency: number
  last_seen: Timestamp
  first_seen: Timestamp
  emotional_tone: EmotionalTone // ANXIOUS | SAD | CALM | JOYFUL | CONFUSED | ANGRY | NEUTRAL
  intensity_avg: number        // 0-1
  confidence: number           // 0-1
  decay_score: number          // 0-1
  half_life_days: number       // défaut: 30
}
```

#### Autres sous-collections

- `users/{userId}/insights/{insightId}` — Insights générés (lecture seule)
- `users/{userId}/collections/{collectionId}` — Groupements d'entrées
- `users/{userId}/derivedMemory/{docId}` — Stats dérivées (serveur)
- `users/{userId}/settings/legal` — Acceptation CGU
- `users/{userId}/settings/preferences` — Préférences
- `users/{userId}/payments/{paymentId}` — Historique paiements

#### Collections racine

- `publicPosts/{postId}` — Articles de blog publics
- `rateLimits/{userId}` — Données rate limiting
- `auditLogs/{logId}` — Audit trail

### Firestore Security Rules

Modèle **owner-only** : chaque utilisateur ne peut lire/écrire que ses propres données.

```
users/{userId}          → isOwner(userId)
users/{userId}/entries  → isOwner(userId)
users/{userId}/magazineIssues → read: isOwner, write: false (serveur)
users/{userId}/insights → read: isOwner, write: false (serveur)
publicPosts             → read: all, write: false
```

---

## 8. Authentification

### Flux d'inscription

1. Email/password avec validation Zod (8+ chars, majuscule, minuscule, chiffre)
2. Ou Google OAuth (`signInWithPopup`)
3. Email de vérification envoyé
4. Redirection vers `/login?check_email=1`
5. Après vérification, connexion possible

### Flux de connexion

1. Firebase authentifie (email/password ou Google)
2. Vérification que l'email est confirmé
3. Échange ID token → cookie session via `POST /api/auth/session`
4. Cookie `__session` (14 jours, HttpOnly, Secure, SameSite=lax)
5. Redirection vers `/dashboard`

### Persistance de session

- **Client** : Firebase Auth persiste dans le navigateur
- **Serveur** : cookie `__session` (14 jours)
- **Refresh** : à chaque `onAuthStateChanged` (y compris rechargement de page), le cookie est re-synchronisé avec retry (max 1 retry avec force refresh du token)
- **Déconnexion** : `POST /api/auth/logout` supprime le cookie

### Code clé : auth-provider.tsx

```typescript
const syncCookie = async (attempt = 0): Promise<void> => {
  const token = await firebaseUser.getIdToken(attempt > 0);
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });
  if (!res.ok && attempt < 1) return syncCookie(attempt + 1);
};
await syncCookie();
```

---

## 9. Intégration IA (DeepSeek)

### Adaptateur (`lib/deepseek/adapter.ts`)

- **Endpoint** : `https://api.deepseek.com/v1/chat/completions`
- **Modèle** : `deepseek-chat`
- **Timeout par défaut** : 5s
- **Max tokens** : 500
- **Température** : 0.7
- **Streaming** : activé

Fonctions :
- `callDeepSeek()` : appel simple
- `callDeepSeekWithRetry()` : retry avec backoff exponentiel (max 2)
- `parseDeepSeekStream()` : parsing du flux SSE

### System prompts

#### REFLECTION_SYSTEM_PROMPT (route.ts)

Style psychodynamique, chaleureux et direct. Aurum observe les tensions internes, les mécanismes de défense, les liens avec le non-dit. 5-8 phrases. Tutoiement/vouvoiement adaptatif.

#### CONVERSATION_SYSTEM_PROMPT (route.ts)

Continuité du dialogue, même profondeur. 4-7 phrases.

#### ACTION_SYSTEM_PROMPT (route.ts)

Propositions concrètes avec le regard psychodynamique. 2-4 phrases.

#### PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT (psychologist-analyst.ts)

Analyse profonde, nomme les tensions et protections. 5-8 phrases.

#### MIRROR_SYSTEM_PROMPT (prompts.ts)

Chat d'écoute réflective. Ne donne jamais de conseils, pose des questions ouvertes. En français.

### Consommation SSE côté client

```typescript
const reader = response.body.getReader();
let fullText = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const data = JSON.parse(line.slice(6));
    if (data.token) { fullText += data.token; onToken(fullText); }
    else if (data.replace) { fullText = data.replace; onToken(fullText); }
  }
}
```

---

## 10. Système de patterns

### Thèmes détectés (ThemeId)

**Travail** : WORK_BOUNDARY_TENSION, WORK_PERFORMANCE_PRESSURE, WORK_PURPOSE_QUESTIONING
**Soi** : SELF_WORTH_QUESTIONING, SELF_AUTHENTICITY_SEARCH, SELF_CHANGE_RESISTANCE
**Relations** : RELATIONSHIP_DISTANCE, RELATIONSHIP_EXPECTATION_MISMATCH, RELATIONSHIP_VULNERABILITY_FEAR
**Émotions** : ANXIETY_FUTURE, ANXIETY_CONTROL_LOSS, SADNESS_LOSS, SADNESS_UNMET_NEED, JOY_CONNECTION, JOY_ACCOMPLISHMENT
**Existentiel** : MEANING_SEARCH, TIME_PASSAGE_AWARENESS, TRANSITION_UNCERTAINTY

### Tons émotionnels (EmotionalTone)

ANXIOUS, SAD, CALM, JOYFUL, CONFUSED, ANGRY, NEUTRAL

### Flux de détection

1. DeepSeek analyse le contenu avec un schéma JSON strict
2. Retourne les thèmes avec confidence (0-1) et intensity (0-1)
3. Filtre les détections faibles (confidence < 0.5)
4. Max 3 thèmes par entrée

### Injection dans le contexte IA

- Max 2 patterns injectés
- Priorité par `decay_score` (récence × fréquence)
- Si changement de phase émotionnelle → 2 plus récents
- Sinon : plus fréquent ET plus récent
- Le contexte est **implicite** : jamais mentionné explicitement

### Garde-fous anti-méta

Mots interdits dans les réponses : "je reconnais", "je me souviens", "déjà", "avant", "souvent", "d'habitude", "encore", "récurrent"...

Si détectés : remplacement par des alternatives neutres ("je reconnais" → "je sens", "souvent" → "parfois").

---

## 11. Chiffrement côté client

### Algorithme

- **AES-256-GCM** via Web Crypto API
- **Dérivation de clé** : SHA-256(Firebase UID + salt)
- **IV** : 12 octets aléatoires par chiffrement

### Format stocké

```typescript
{
  ciphertext: string  // base64
  iv: string          // base64
  version: number     // 1
}
```

### Flux

1. Utilisateur s'authentifie → Firebase UID
2. Clé dérivée du UID + salt
3. Contenu chiffré **dans le navigateur** avant écriture Firestore
4. Contenu déchiffré **dans le navigateur** après lecture Firestore
5. Le serveur ne voit jamais le texte en clair

### Fonctions clés (`lib/crypto/encryption.ts`)

- `generateEncryptionKey()` — Génère une CryptoKey
- `deriveKeyFromUID(uid, salt)` — Dérive une clé du UID
- `encrypt(plaintext, key)` — Retourne {ciphertext, iv, version}
- `decrypt(encryptedData, key)` — Retourne le texte en clair
- `exportKey(key)` / `importKey(keyData)` — Sérialisation

---

## 12. PWA

### Configuration

**manifest.json** :
- Nom : "Aurum Sanctuary"
- Display : standalone
- Couleurs : `#1c1917` (stone-950)
- Icônes : 192×192 et 512×512

**Service Worker** : géré par `@ducanh2912/next-pwa`, auto-généré au build.

**next.config.ts** :
```javascript
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
});
```

### Installation mobile

**iPhone** : Safari → Partager → "Sur l'écran d'accueil"
**Android** : Chrome → Menu ⋮ → "Installer l'application"

### Headers de sécurité (next.config.ts)

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 13. Paiements (Stripe)

### Flux d'abonnement

1. Utilisateur clique "S'abonner"
2. `POST /api/stripe/create-checkout-session` crée une session Checkout
3. Redirection vers Stripe
4. Après paiement → webhook met à jour Firestore

### Webhook events gérés

- `customer.subscription.created/updated/deleted`
- `invoice.payment_succeeded/failed`
- `checkout.session.completed`

### Données Firestore mises à jour

```
users/{userId}.subscriptionStatus
users/{userId}.stripeCustomerId
users/{userId}.subscriptionId
users/{userId}/payments/{paymentId}
```

---

## 14. Rate Limiting

Via **Upstash Redis** (`@upstash/redis`).

### Presets

- `/api/reflect` : custom par utilisateur
- `/api/mirror` : 20 req/min
- `/api/analyze-patterns` : custom preset
- `/api/generate-digest` : custom preset

### Implémentation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});
```

---

## 15. Déploiement

### Production (Firebase App Hosting)

**IMPORTANT** : le déploiement se fait via **git push**, PAS via `firebase deploy --only hosting`.

```bash
git push origin main
# → Firebase App Hosting build automatique
# → Déploie sur aurumdiary.com
```

`firebase deploy --only hosting` déploie sur le mauvais domaine (`aurum-diary-prod.web.app`).

### Configuration (apphosting.yaml)

```yaml
maxInstances: 1

env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: "..."
  # ... autres NEXT_PUBLIC_*

  - variable: DEEPSEEK_API_KEY
    secret: DEEPSEEK_API_KEY      # Secret Manager

  - variable: STRIPE_SECRET_KEY
    secret: STRIPE_SECRET_KEY     # Secret Manager
```

### Firestore Rules

```bash
firebase deploy --only firestore
```

### GitHub Actions

- **CI** (`.github/workflows/ci.yml`) : build check sur push/PR
- **Firestore** (`.github/workflows/deploy-firestore.yml`) : déploie rules + indexes
- **Functions** (`.github/workflows/deploy-functions.yml`) : Cloud Functions
- **Privacy** (`.github/workflows/privacy-checks.yml`) : vérifie l'absence de termes privacy
- **Preview** (`.github/workflows/firebase-preview.yml`) : preview sur PR

---

## 16. Développement local

```bash
# Installation
npm install

# Démarrage (port 9002)
npm run dev

# Vérification types
npm run typecheck

# Build production
npm run build

# Linting
npm run lint
```

### Variables d'environnement locales

Créer `.env.local` avec toutes les variables listées en section 4.

### Logging

- `logger.errorSafe()`, `logger.infoSafe()`, `logger.warnSafe()` — jamais de PII
- Audit trail dans `auditLogs` Firestore
- Cloud Logging en production (Google Cloud)
