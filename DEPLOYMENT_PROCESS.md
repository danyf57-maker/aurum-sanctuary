# 🚀 Process de Déploiement - Aurum Sanctuary

**Date**: 13 février 2026
**Setup**: Next.js 14 SSR + Firebase App Hosting
**URL prod**: https://aurum-diary-prod.web.app

---

## ⚠️ RÈGLE ABSOLUE

**Pas de modification de code sans accord explicite du user.**

Si tu veux modifier du code, demande d'abord. Toujours.

---

## 🎯 Process unique (à suivre exactement)

### Avant de déployer

```bash
# 1. Vérifier la branche
git branch --show-current
# Doit afficher: main

# 2. Vérifier l'état
git status
# Doit afficher: nothing to commit, working tree clean

# 3. Vérifier les types
npm run typecheck
# Doit terminer sans erreur

# 4. Tester le build
npm run build
# Doit terminer sans erreur

# 5. Vérifier le projet Firebase
firebase use prod

# 6. Déployer
firebase deploy
```

### Après le déploiement

Ouvrir https://aurum-diary-prod.web.app et tester **3 points** :

1. ✅ **Connexion** - Login avec email/password fonctionne
2. ✅ **Écrire/Sauvegarder** - Créer une entrée et la sauvegarder
3. ✅ **Magazine** - Ouvrir le magazine et voir les entrées

**Si un des 3 points échoue → STOP et corriger avant de continuer.**

---

## 🔒 Sécurité : ce qui DOIT rester

Ces éléments sont critiques et ne doivent JAMAIS être supprimés :

### next.config.js
```javascript
// ✅ PAS DE output: 'export'
// ✅ GARDER: serverActions: { bodySizeLimit: '2mb' }
// ✅ GARDER: images.remotePatterns pour firebasestorage
// ✅ GARDER: tous les headers de sécurité
```

### Encryption
```
✅ src/lib/crypto/encryption.ts - Ne jamais supprimer
✅ src/hooks/useEncryption.ts - Ne jamais supprimer
✅ Firestore stocke encryptedContent + iv - Ne jamais changer
```

### Rate Limiting
```
✅ src/lib/rate-limit/index.ts - Ne jamais supprimer
✅ Variables UPSTASH_REDIS_* dans .env.local
```

---

## 🚨 Si ça casse en prod

```bash
# 1. Rollback immédiat
git checkout v2.0.0-encryption-stable
firebase use prod
firebase deploy
# OU si problème seulement sur le hosting:
# firebase deploy --only hosting

# 2. Vérifier
open https://aurum-diary-prod.web.app

# 3. Revenir sur main
git checkout main
```

---

## 📋 Checklist rapide

Avant CHAQUE déploiement :

```
[ ] git branch --show-current → main
[ ] git status clean
[ ] npm run typecheck OK
[ ] npm run build OK
[ ] firebase use prod
[ ] Code non modifié SANS accord user
```

Après CHAQUE déploiement :

```
[ ] Connexion fonctionne
[ ] Écrire/Sauvegarder fonctionne
[ ] Magazine fonctionne
```

---

## 🎯 Port local

```bash
npm run dev
# Ouvre http://localhost:9002
```

---

**Process unique pour éviter les bugs. À suivre exactement.**
