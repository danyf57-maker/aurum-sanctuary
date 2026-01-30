---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-aurum-sanctuary-2026-01-29.md', 'docs/blueprint.md']
workflowType: 'prd'
classification:
  projectType: web_app
  domain: healthcare
  complexity: high
  projectContext: brownfield
---

# Product Requirements Document - Aurum Sanctuary

**Author:** Omni (Collaborative Agent) & User
**Date:** 2026-01-29
**Version:** 1.0 (Final Polish)
**Status:** Ready for Implementation

---

## 1. Executive Summary

**Aurum Sanctuary** is a digital refuge designed to offer inner clarity to introspective individuals feeling lost in their emotions. More than a journal, it is an "Emotional Memory System" that uses AI to reveal patterns and create continuity in the user's lived experience, while guaranteeing absolute psychological safety. It does not seek to "fix" or "diagnose," but to illuminate the emotional fog to allow for soothing micro-realizations.

### Core Value Proposition
*   **The Problem:** Users write and feel a lot but lack a "map" to connect the dots, leading to chronic emotional fatigue.
*   **The Solution:** A "Mirror AI" that reflects patterns (not advice) and an asynchronous "Insight Engine" that turns scattered entries into a coherent narrative.
*   **Differentiation:** "Sanctuary" positioning (Private, Quiet, Non-Urgent) vs "Therapist" (CBT Chatbots) or "Tools" (Trackers).

---

## 2. Identity & Design System

The visual identity must embody the "Sanctuary" feeling: valuable, calm, grounded.

### Color Palette ("The Refuge")
*   🌟 **Aurum Gold** (Primary): `#D4AF37` - Evokes value, light, and preciousness (kintsugi metaphor).
*   📜 **Vellum Beige** (Background): `#F5F5DC` - Reduces eye strain, mimics high-quality paper, calming.
*   🍂 **Sienna Earth** (Accent): `#8B4513` - Grounding, stability, used for text and heavy elements.

### Typography
*   **Headlines (Elegance)**: `Literata` (Serif) - For insights and major headings. Literary feel.
*   **Body (Clarity)**: `Inter` (Sans-serif) - For the editor and UI elements. Legible and modern.

### UI Principles
*   **No Visage**: No avatars or human faces for the AI. It is an "atmosphere," not a person.
*   **Visual Silence**: No red badges, no unsolicited popups. The interface waits for the user.

---

## 3. Success Criteria

### User Success
*   **Aha! Moment**: Alma receives a relevant, non-obvious insight (pattern revelation) within the first 7 days.
*   **Safety & Trust**: User engages in re-reading previous entries (Appropriation) and does not mass-delete data (Fear).
*   **Clarity**: Qualitative feedback confirms feeling "less lost" or having a "better map".

### Business Success
*   **Monetization**: >5% conversion rate from free/trial to paid subscription.
*   **Retention**: High retention at M+3 (>20%), valuing "resilient return" over "daily addiction".
*   **Traction**: 1,000 active beta users to validate the model.

### Measurable Outcomes (V1)
*   30% of new users reach the "Aha! Moment" (Week 1 Insight).
*   <1% Churn due to "trust issues" or "feeling judged".

---

## 4. User Journeys

### J1: The "Heart" Journey (Seeking Clarity)
*   **Situation**: Sunday night, diffuse anxiety.
*   **Action**: Alma opens Aurum. The "Sanctuary" is quiet. She writes freely (brain dump).
*   **Pivot**: The Mirror Chat intervenes *only* on a long pause/pattern. Question: "You mention X often..." (Hypothetical).
*   **Resolution**: She closes the app feeling "unburdened". No tasks left behind.

### J2: The "Aha!" Journey (The Revelation)
*   **Situation**: Notification (Day 7): "A weekly mirror is available."
*   **Action**: Alma reads the Insight. It is descriptive ("We observe that..."), not causal.
*   **Climax**: She recognizes a pattern she hadn't seen. "That's true."
*   **Conversion**: The Paywall appears *after* value delivery. She subscribes for the continuity.

### J3: The Admin Journey (Invisible Safety)
*   **Situation**: User reports a bug or requests deletion.
*   **Constraint**: Admin accesses dashboard but sees **NO decrypted text**.
*   **Resolution**: "Nuclear Delete" executed. Compliance respected.

---

## 5. Functional Requirements (The Contract)

### 🔐 1. Authentication & Onboarding
*   **FR1**: User can sign up/login via Google Auth or Email/Password.
*   **FR2**: User must explicitly accept Terms of Service and Medical Disclaimer before accessing the app.
*   **FR3**: Anonymous users (no account) cannot create entries (online-only V1 constraint).

### ✍️ 2. Core Journaling
*   **FR4**: User can create text entries with no character limit.
*   **FR5**: Interface must auto-save drafts locally (Encrypted Session/LocalStorage) to prevent data loss on network drop. Drafts are purged upon successful sync.
*   **FR6**: User can view a visual "Timeline" of past entries.
*   **FR19 (Error Handling)**: In case of network/AI failure, system displays a neutral, non-anxious error message without blocking writing.

### 🪞 3. Mirror Engine (Chat)
*   **FR7**: System detects periods of inactivity (silence) during writing.
*   **FR8**: System generates "Reflective Questions" based on immediate context.
*   **FR9**: Mirror Chat is always active (background listening) but remains visually minimized by default. It cannot be fully disabled, ensuring the "Mirror" core value.
*   **FR22**: System displays a "Typing Indicator" immediately (<400ms) when the AI is processing, to maintain presence.

### 🧠 4. Insight Engine (Aha!)
*   **FR10**: System generates a "Weekly Insight" summary every 7 days (based on user registration day) if sufficient data exists.
*   **FR11**: User receives a notification (Push/In-App) when Insight is ready.
*   **FR17**: User can toggle Insight notifications in Settings.
*   **FR12**: Access to Insight content is gated by subscription status.

### 💳 5. Payment & Subscription
*   **FR15**: User can subscribe to a paid plan via payment provider (e.g., Stripe).
*   **FR16**: System manages subscription status (active, expired, trial) and enforces gates in real-time.

### ⚙️ 6. Settings & Compliance
*   **FR18**: User has a "Settings" screen to manage: Notifications, Terms/Disclaimer, Account Deletion, and **Privacy Explained** (transparency page showing data flow).

### 🛡️ 7. Admin & Privacy
*   **FR13**: Admin can perform a "Nuclear Delete" of an account, wiping all Firestore entries.
*   **FR14**: Admin dashboard must NOT display decrypted user entry content.

### 📊 8. Analytics & Business Intelligence
*   **FR20 (Server-Side Tracking)**: System implements Server-Side Event Tracking (Next.js API) for Funnels/Retention. 
    *   **Constraint**: Analytics events MUST NEVER contain user entry text, PII, or semantic embeddings.
*   **FR21 (Business Pulse)**: Admin Panel includes a "Pulse" view with aggregated anonymous metrics (DAU, Conversion, Churn).

---

## 6. Non-Functional Requirements (Quality)

### Security & Privacy (Critical)
*   **Encryption**: At rest (Firestore Rules) and in transit (TLS 1.3).
*   **Admin-Blind Privacy**: No human admin can view raw journal text (enforced by E2EE + process isolation).
*   **Right to be Forgotten**: Physical purge of data within 30 days of deletion.
*   **Privacy Standard**: Architecture designed for "Medical-Grade Privacy" with Admin-Blind guarantees, adhering to strict data sovereignty principles without claiming certification.

### Performance (Presence)
*   **Response Latency**: Target <1200ms for full response, but **Typing Indicator must appear <400ms** to maintain urgency/presence.
*   **TTI (Time to Interactive)**: <1.5s on 4G.

### Reliability
*   **No Data Loss**: Local drafts saved every 2s/keystroke and persisted until sync confirmation.

### Accessibility
*   **Standards**: WCAG 2.1 Level AA.
*   **Comfort**: Strict contrast ratios for "Vellum" theme to prevent eye strain.

---

## 7. Product Scope & Roadmap

### Phase 1: MVP "Compact" (The Base)
*   **Focus**: Proven Value, Monetization, Safety.
*   **Features**: Auth, Journaling, Mirror Chat, Weekly Insight, Paywall, PWA (Online), SEO Blog (Brand/Authority/AI-discoverability, not traffic-first).
*   **Tech**: Next.js (App Router), Firestore, Stripe, DeepSeek.

### Phase 2: Growth (The Scale)
*   **Focus**: Retention, Friction Reduction.
*   **Features**: PWA Offline Mode (Sync), Auto-Tagging, CSV/PDF Export.

### Phase 3: Expansion (The Vision)
*   **Focus**: Holistic Companion.
*   **Features**: HealthKit Integration (Bio-markers), Voice Journaling, Multilingual.

---

## 8. Technical Architecture Specs

*   **Framework**: Next.js (App Router) Monorepo.
    *   `/app/(public)`: Landing + Blog (SEO/SSR).
    *   `/app/(protected)`: App (CSR/Auth Guard).
*   **Database**: Firebase Firestore.
*   **Auth**: Firebase Auth.
*   **Payments**: Stripe.
*   **Analytics**: PostHog (Server-Side Proxy).
*   **AI**: **DeepSeek LLM** via Edge/Server Functions (latency-optimized).

---

## 9. Innovation & Domain Logic

*   **Mirror Chat Logic**: "Reflective Listening Agent". Never gives advice. Uses questions to deepen the user's thought process.
*   **Slow Tech**: Asynchronous "Aha" delivered weekly to create ritual and avoid "notification fatigue".
*   **Privacy-First Domain**: Architecture designed for "Medical-Grade Privacy" (Segmentation of Identity vs Content), adhering to strict data sovereignty principles, even if not certified Day 1.

---

## 10. Free → Paid Conversion Logic (V1)

### Principe directeur
La conversion vers le payant repose sur une **révélation de valeur**, jamais sur la rétention artificielle, la pression émotionnelle ou la peur de perdre.
L’utilisateur paie **après avoir compris**, non pour débloquer une promesse.

### 10.1 Périmètre Gratuit (Free / Trial)
Un utilisateur non payant peut :
*   Créer un nombre illimité d’entrées textuelles
*   Accéder au **Sanctuaire** et à la Timeline de ses écrits
*   Utiliser le **Mirror Chat** (toujours actif, non intrusif)
*   Bénéficier de **l’autosauvegarde locale**
*   Recevoir un **aperçu / teaser** de l’Insight Hebdomadaire

Objectif du mode gratuit :
👉 Permettre l’expression libre et installer la confiance, sans frustration artificielle.

### 10.2 Périmètre Payant (Subscription)
L’abonnement débloque :
*   L’accès **complet** au contenu de l’Insight Hebdomadaire
*   La **continuité des Insights dans le temps** (historique consultable)
*   Une lecture plus approfondie des **récurrences et motifs émotionnels**
*   La persistance de la “mémoire émotionnelle” construite par Aurum

L’abonnement **n’ajoute pas** :
*   de diagnostic
*   de promesse thérapeutique
*   de fonctionnalités intrusives ou addictives

Il renforce uniquement la **valeur de continuité et de clarté**.

### 10.3 Moment de Conversion (Trigger)
La proposition d’abonnement intervient **uniquement** :
*   après la lecture d’un Insight réel (valeur déjà délivrée)
*   jamais avant l’écriture
*   jamais en interruption d’un moment émotionnel

Le paywall s’affiche :
*   **après** l’Insight (ou son teaser significatif)
*   dans un état calme, sans urgence artificielle

### 10.4 Logique du Paywall
Le message de conversion repose sur :
*   la continuité (“voir ces motifs dans le temps”)
*   la cohérence (“construire une carte plus claire”)
*   la mémoire (“ne pas laisser ces révélations se perdre”)

Le paywall :
*   n’utilise aucun vocabulaire médical
*   n’exploite pas la peur ou la vulnérabilité
*   propose un choix explicite : s’abonner maintenant ou plus tard

### 10.5 Règles UX non négociables
*   Aucun contenu déjà révélé n’est retiré après coup
*   Aucun rappel culpabilisant n’est envoyé
*   Le refus de paiement n’altère pas l’expérience d’écriture
*   Le retour ultérieur vers le paywall reste possible, sans pression

### 10.6 Objectif Business V1
*   Conversion cible : **5–8 %** des utilisateurs actifs
*   Indicateur clé : conversion **post-Aha**, pas volume de sessions
*   Succès = relation longue, pas usage intensif

### Règle finale
> L’utilisateur ne paie pas pour aller mieux.
> Il paie pour **continuer à voir clair**.
