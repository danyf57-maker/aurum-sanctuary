# 🚀 Aurum Sanctuary - Guide Développeur

## 📋 Vue d'ensemble

**Aurum** est une application de journaling privé avec chiffrement client-side, insights IA et design élégant.

- **Tech Stack** : Next.js 14, Firebase (Auth, Firestore, Hosting), TypeScript, Tailwind CSS
- **Repository** : https://github.com/danyf57-maker/aurum-sanctuary
- **Production** : https://aurum-diary-prod.web.app
- **Firebase Project** : aurum-diary-prod

---

## 🤝 Transmettre le projet à un développeur

### Ce que vous devez faire

#### 1. **Donner accès GitHub**

1. Allez sur https://github.com/danyf57-maker/aurum-sanctuary/settings/access
2. Cliquez sur **Invite a collaborator**
3. Entrez l'email ou username GitHub du développeur
4. Choisissez le rôle : **Write** (pour push) ou **Admin** (accès complet)

#### 2. **Donner accès Firebase**

1. Allez sur https://console.firebase.google.com/u/0/project/aurum-diary-prod/settings/iam
2. Cliquez sur **Add member**
3. Entrez l'email Google du développeur
4. Choisissez le rôle : **Editor** (recommandé) ou **Owner** (accès complet)
5. Cliquez sur **Add**

#### 3. **Partager les variables d'environnement**

⚠️ **IMPORTANT** : Ne jamais envoyer les secrets par email ou Slack non chiffré !

**Options sécurisées :**
- 📦 **1Password** / **LastPass** : Partagez un coffre sécurisé
- 🔐 **Bitwarden** : Partagez un dossier de mots de passe
- 💬 **Signal** : Message chiffré de bout en bout
- 🔑 **Keybase** : Partage de fichiers chiffré

**Fichier à partager :** `.env.local` (à la racine du projet)

Contenu minimum requis :
```env
DEEPSEEK_API_KEY=sk-...
FIREBASE_SERVICE_ACCOUNT_KEY_B64=ewogICJ0eXBlIjo...
UPSTASH_REDIS_REST_TOKEN="AYx4AAIncD..."
STRIPE_SECRET_KEY=sk_test_...
```

#### 4. **Envoyer la documentation**

Envoyez au développeur :
```
📧 Objet : Accès Aurum Sanctuary

Salut [Nom],

Tu as maintenant accès au projet Aurum Sanctuary :

📂 Repository GitHub : https://github.com/danyf57-maker/aurum-sanctuary
🔥 Firebase Console : https://console.firebase.google.com/u/0/project/aurum-diary-prod
🌐 Production : https://aurum-diary-prod.web.app

📖 Documentation complète : Voir HANDOVER.md dans le repo

Les variables d'environnement (.env.local) sont partagées via [1Password/Signal/etc.].

Pour démarrer :
1. Clone le repo : git clone https://github.com/danyf57-maker/aurum-sanctuary.git
2. Lis HANDOVER.md (tout est dedans)
3. Setup en 15 min max

N'hésite pas si tu as des questions !
```

#### 5. **Walkthrough optionnel (recommandé)**

📞 **Call de 30 min** pour présenter :
- Architecture du projet (5 min)
- Démo locale (5 min)
- Workflow de déploiement (5 min)
- Questions & réponses (15 min)

### ✅ Checklist de transmission

- [ ] Accès GitHub donné (collaborateur)
- [ ] Accès Firebase donné (Editor)
- [ ] Variables `.env.local` partagées (sécurisé)
- [ ] Email de bienvenue envoyé avec liens
- [ ] (Optionnel) Call de walkthrough planifié

**Une fois fait, le dev peut commencer seul en suivant ce guide !**

---

## 🛠️ Setup développement local

### 1. Cloner le repository

```bash
git clone https://github.com/danyf57-maker/aurum-sanctuary.git
cd aurum-sanctuary
```

### 2. Installer les dépendances

```bash
# Next.js
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 3. Configuration Firebase

Vous aurez besoin d'accès au projet Firebase **aurum-diary-prod**.

**Obtenir les credentials :**
1. Allez sur [Firebase Console](https://console.firebase.google.com/u/0/project/aurum-diary-prod)
2. Project Settings → Service Accounts → Generate new private key
3. Téléchargez le JSON

**Variables d'environnement :**

Créez `.env.local` à la racine :

```env
# Core
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002

# DeepSeek AI (demander la clé)
DEEPSEEK_API_KEY=sk-...

# Firebase Web Client (public - safe)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBQhFZfS6CmlmcYKTtdo21H0VrCxp7pgjc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aurum-diary-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aurum-diary-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aurum-diary-prod.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=441444254589
NEXT_PUBLIC_FIREBASE_APP_ID=1:441444254589:web:cc735132643a90fb8a8214

# Firebase Admin SDK (server-only)
# Base64 du service account JSON téléchargé
FIREBASE_SERVICE_ACCOUNT_KEY_B64=ewogICJ0eXBlIjo...

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://distinct-tapir-35960.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AYx4AAIncD..."

# Stripe (Test keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_... # Après stripe listen
```

### 4. Lancer en local

```bash
# Dev server (port 9002)
npm run dev

# Ouvrir
open http://localhost:9002
```

---

## 🔥 Firebase CLI

### Installation

```bash
npm install -g firebase-tools
firebase login
```

### Commandes principales

```bash
# Sélectionner le projet
firebase use aurum-diary-prod

# Déployer hosting
firebase deploy --only hosting

# Déployer functions
firebase deploy --only functions

# Déployer tout
firebase deploy

# Logs functions
firebase functions:log

# Emulateurs (dev local)
firebase emulators:start
```

---

## 📧 Configuration Emails Firebase

**⚠️ IMPORTANT** : Les templates d'emails doivent être configurés manuellement dans Firebase Console.

### Guide rapide (5 min)

📖 Voir : `email-templates/GUIDE-RAPIDE.md`

**Étapes :**
1. Aller sur https://console.firebase.google.com/u/0/project/aurum-diary-prod/authentication/emails
2. Configurer **Sender name** : `Aurum`
3. Personnaliser **Email address verification** avec `email-templates/verification-email-firebase.html`
4. Configurer **Action URL** : `https://aurum-diary-prod.web.app/auth/action`

### Guide complet

📖 Voir : `email-templates/CONFIGURATION-FIREBASE-CONSOLE.md`

---

## 🏗️ Architecture

### Structure du projet

```
aurum-sanctuary/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Routes authentifiées
│   │   │   ├── dashboard/
│   │   │   ├── sanctuary/     # Journaling (write, magazine)
│   │   │   ├── insights/
│   │   │   └── settings/
│   │   ├── (marketing)/       # Landing page
│   │   ├── auth/
│   │   │   └── action/        # Handler emails Firebase
│   │   ├── api/               # API routes
│   │   │   ├── analyze/       # Analyse IA (DeepSeek)
│   │   │   ├── mirror/        # Mirror Chat
│   │   │   └── stripe/        # Webhooks Stripe
│   │   └── actions.ts         # Server Actions
│   ├── components/            # Composants React
│   │   ├── ui/               # shadcn/ui
│   │   └── sanctuary/        # Composants métier
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── web-client.ts # Client SDK
│   │   │   └── admin.ts      # Admin SDK (server)
│   │   ├── ai/               # DeepSeek integration
│   │   └── crypto/           # Chiffrement client
│   └── providers/            # React Context
│       └── auth-provider.tsx
├── functions/                 # Cloud Functions
│   └── src/
│       ├── admin.ts          # Firebase Admin centralisé
│       ├── onUserCreate.ts   # Trigger: nouveau user
│       ├── onEntryCreate.ts  # Trigger: nouvelle entrée
│       ├── generateInsight.ts # Scheduled: insights hebdo
│       └── deleteUserAccount.ts # Callable: suppression compte
├── email-templates/          # Templates emails
│   ├── GUIDE-RAPIDE.md
│   ├── CONFIGURATION-FIREBASE-CONSOLE.md
│   └── verification-email-firebase.html
├── public/                   # Assets statiques
├── firebase.json            # Config Firebase
├── firestore.rules          # Règles de sécurité Firestore
└── package.json
```

### Services Firebase utilisés

| Service | Usage | Config |
|---------|-------|--------|
| **Authentication** | Email/Password | Templates personnalisés |
| **Firestore** | Base de données | `firestore.rules` |
| **Hosting** | CDN + Next.js | `firebase.json` |
| **Cloud Functions** | Backend serverless | `functions/` |
| **Storage** | Images (future) | - |

---

## 🚀 Workflow de déploiement

### 1. Développement local

```bash
# Créer une branche
git checkout -b feature/ma-feature

# Développer
npm run dev

# Tester
npm run build  # Vérifier que le build passe
```

### 2. Commit et push

```bash
git add .
git commit -m "feat: ma nouvelle feature"
git push origin feature/ma-feature
```

### 3. Déploiement production

```bash
# Merger dans main
git checkout main
git merge feature/ma-feature

# Build
npm run build

# Déployer Firebase
firebase deploy --only hosting

# Push GitHub
git push origin main
```

**⚠️ IMPORTANT** : Toujours build localement avant de déployer pour détecter les erreurs.

---

## 🐛 Résolution de problèmes

### Build Next.js échoue

```bash
# Nettoyer le cache
rm -rf .next node_modules
npm install
npm run build
```

### useSearchParams() error

Wrapper le composant dans `<Suspense>` :

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <YourComponent />
    </Suspense>
  );
}
```

### Firebase deploy échoue

```bash
# Vérifier le projet actif
firebase use

# Réauthentifier
firebase login --reauth

# Vérifier les permissions
# Vous devez être Owner ou Editor du projet
```

### Emails Firebase pas personnalisés

→ Les templates doivent être configurés **manuellement** dans Firebase Console.
→ Voir `email-templates/GUIDE-RAPIDE.md`

---

## 📊 Monitoring & Logs

### Firebase Console

- **Functions logs** : https://console.firebase.google.com/u/0/project/aurum-diary-prod/functions
- **Hosting** : https://console.firebase.google.com/u/0/project/aurum-diary-prod/hosting
- **Auth users** : https://console.firebase.google.com/u/0/project/aurum-diary-prod/authentication/users
- **Firestore data** : https://console.firebase.google.com/u/0/project/aurum-diary-prod/firestore

### Logs CLI

```bash
# Functions logs (temps réel)
firebase functions:log --only ssraurumdiaryprod

# Logs des dernières 24h
firebase functions:log --since 24h
```

---

## 🔑 Accès requis

Pour développer sur le projet, vous avez besoin de :

1. ✅ **Accès GitHub** : Membre du repo `danyf57-maker/aurum-sanctuary`
2. ✅ **Accès Firebase** : Editor ou Owner sur `aurum-diary-prod`
3. ✅ **Variables d'environnement** : `.env.local` complet
4. ✅ **DeepSeek API Key** : Pour l'analyse IA
5. ✅ **Stripe Test Keys** : Pour les paiements (dev)

---

## 📞 Contacts

- **Project Owner** : Daniel Fioriti
- **Firebase Project** : aurum-diary-prod
- **GitHub** : https://github.com/danyf57-maker/aurum-sanctuary

---

## 🎯 Prochaines tâches

### Emails personnalisés
- [ ] Configurer les templates dans Firebase Console
- [ ] Changer Action URL en production : `https://aurum-diary-prod.web.app/auth/action`
- [ ] Tester le flow complet (signup → email → verify)

### Tests
- [ ] Ajouter tests unitaires (Jest)
- [ ] Ajouter tests e2e (Playwright)
- [ ] CI/CD avec GitHub Actions

### Sécurité
- [ ] Audit des règles Firestore
- [ ] Rate limiting sur les API routes
- [ ] CSP headers

---

## ✅ Checklist pour reprendre le projet

- [ ] Cloner le repo GitHub
- [ ] Installer les dépendances (`npm install`)
- [ ] Créer `.env.local` avec toutes les variables
- [ ] Lancer en local (`npm run dev`)
- [ ] Vérifier que http://localhost:9002 fonctionne
- [ ] Tester le build (`npm run build`)
- [ ] Se connecter à Firebase CLI (`firebase login`)
- [ ] Vérifier accès Firebase Console
- [ ] Lire `email-templates/GUIDE-RAPIDE.md`

---

**🎉 Tout est prêt !** Un développeur avec ce guide peut reprendre le projet sans problème.

**Questions ?** Consultez les docs :
- Next.js : https://nextjs.org/docs
- Firebase : https://firebase.google.com/docs
- Aurum emails : `email-templates/CONFIGURATION-FIREBASE-CONSOLE.md`
