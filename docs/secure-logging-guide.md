# Guide du Logging Sécurisé - Aurum Sanctuary

## 🎯 Objectif

Ce document explique comment logger de manière sécurisée dans Aurum Sanctuary pour **protéger les données sensibles** des utilisateurs et respecter notre architecture **Admin-Blind**.

---

## ⚠️ Règle d'Or

> **TOUJOURS utiliser `logger.*Safe` au lieu de `console.*`**

❌ **NE JAMAIS FAIRE** :
```typescript
console.log("User data:", userData);
console.error("Error:", error);
console.warn("Token:", token);
```

✅ **FAIRE** :
```typescript
import { logger } from '@/lib/logger/safe';

logger.infoSafe("User data loaded");
logger.errorSafe("Error loading data", error);
logger.warnSafe("Token validation failed");
```

---

## 📚 Pourquoi C'est Important

### 1. **Protection des Données Utilisateurs**

Les logs sont stockés dans Firebase Cloud Logging, Vercel, ou d'autres services tiers. Si vous utilisez `console.*`, vous risquez d'exposer :

- 📝 **Contenu des journaux** (données hautement sensibles)
- 🔑 **Tokens d'authentification** (accès aux comptes)
- 📧 **Emails et informations personnelles** (violation RGPD)
- 🔐 **Clés de chiffrement** (compromet toute la sécurité)

### 2. **Architecture Admin-Blind**

Notre promesse : **Les administrateurs ne peuvent JAMAIS voir le contenu des journaux utilisateurs.**

Si vous loggez du contenu déchiffré avec `console.log`, vous **cassez cette promesse**.

### 3. **Conformité RGPD**

Le RGPD impose de ne pas stocker de données personnelles sans consentement explicite. Les logs sont considérés comme du stockage.

---

## 🛠️ Comment Utiliser le Logger Sécurisé

### Import

```typescript
import { logger } from '@/lib/logger/safe';
```

### Méthodes Disponibles

| Méthode | Usage | Niveau |
|---------|-------|--------|
| `logger.errorSafe(message, error?, context?)` | Erreurs critiques | ERROR |
| `logger.warnSafe(message, context?)` | Avertissements | WARN |
| `logger.infoSafe(message, context?)` | Informations | INFO |

---

## 📖 Exemples d'Utilisation

### 1. **Logger une Erreur Simple**

```typescript
try {
  await createEntry(content);
} catch (error) {
  logger.errorSafe("Failed to create entry", error);
  // Le logger va automatiquement censurer les données sensibles dans l'erreur
}
```

### 2. **Logger avec Contexte**

```typescript
try {
  const user = await fetchUser(userId);
} catch (error) {
  logger.errorSafe("Failed to fetch user", error, {
    // userId sera hashé automatiquement (hash_a3f5b2c8)
    userId: userId,

    // Données non sensibles OK
    attemptCount: 3,
    timestamp: Date.now()
  });
}
```

### 3. **Logger des Informations**

```typescript
// ✅ BON - Pas de données sensibles
logger.infoSafe("User logged in successfully", {
  timestamp: new Date().toISOString()
});

// ❌ MAUVAIS - Contient un email
console.log("User logged in:", userEmail);
```

### 4. **Logger des Warnings**

```typescript
if (!apiKey) {
  logger.warnSafe("API key missing, using fallback");
}
```

---

## 🔒 Champs Automatiquement Censurés

Le logger va **automatiquement remplacer par `[REDACTED]`** ces champs :

### Authentification & Tokens
- `password`
- `token`, `idToken`, `accessToken`, `refreshToken`
- `apiKey`, `api_key`, `secret`, `secretKey`
- `privateKey`, `private_key`

### Clés de Chiffrement
- `contentKey`, `encryptionKey`, `wrappedContentKey`
- `draftKey`, `iv`, `salt`

### Contenu Utilisateur
- `content`, `entryText`
- `encryptedContent`, `decryptedContent`
- `plaintext`, `message`
- `insight`, `insightText`

### Informations Personnelles (PII)
- `email`, `phone`, `phoneNumber`
- `address`, `ssn`
- `creditCard`, `cardNumber`, `cvv`

### Identifiants
- `userId` → Devient `hash_a3f5b2c8` (hashé)
- `uid` → Devient `hash_a3f5b2c8` (hashé)

### Paiements
- `stripeToken`, `paymentMethod`, `cardDetails`

### Firebase & Sessions
- `serviceAccount`, `serviceAccountKey`
- `firebaseToken`, `sessionId`
- `cookie`, `cookies`

**📋 Liste complète** : Voir [src/lib/logger/safe.ts](../src/lib/logger/safe.ts) ligne 19-80

---

## 🎨 Exemples Réels du Projet

### Exemple 1 : Déchiffrement d'Entrée

```typescript
// ❌ AVANT (dangereux)
try {
  const content = await decryptEntry(encryptedData, key);
} catch (error) {
  console.error(`Failed to decrypt entry ${doc.id}`, error);
  // Risque : peut logger le contenu chiffré ou la clé
}

// ✅ APRÈS (sécurisé)
try {
  const content = await decryptEntry(encryptedData, key);
} catch (error) {
  logger.errorSafe("Failed to decrypt entry", error, {
    entryId: doc.id
  });
  // Le logger censure automatiquement les clés et contenus
}
```

### Exemple 2 : Vérification de Token

```typescript
// ❌ AVANT (dangereux)
try {
  const decodedToken = await auth().verifyIdToken(token);
  return decodedToken.uid;
} catch (error) {
  console.error("Error verifying ID token:", error);
  // Risque : peut logger le token en clair
  return null;
}

// ✅ APRÈS (sécurisé)
try {
  const decodedToken = await auth().verifyIdToken(token);
  return decodedToken.uid;
} catch (error) {
  logger.errorSafe("Error verifying ID token", error);
  // Le token sera automatiquement [REDACTED]
  return null;
}
```

### Exemple 3 : Export de Données

```typescript
// ❌ AVANT (dangereux)
try {
  const exportData = await getUserData(userId);
  return { data: exportData, error: null };
} catch (error) {
  console.error("Error exporting user data:", error);
  // Risque : peut logger des données personnelles
  return { data: null, error: "Erreur" };
}

// ✅ APRÈS (sécurisé)
try {
  const exportData = await getUserData(userId);
  return { data: exportData, error: null };
} catch (error) {
  logger.errorSafe("Error exporting user data", error);
  // Les données sensibles sont censurées
  return { data: null, error: "Erreur" };
}
```

---

## ✅ Checklist pour Code Review

Avant de créer une Pull Request, vérifiez :

- [ ] Aucun `console.log` dans le code (sauf cas exceptionnels documentés)
- [ ] Aucun `console.error` dans le code
- [ ] Aucun `console.warn` dans le code (sauf logs de build/dev)
- [ ] Tous les logs utilisent `logger.*Safe`
- [ ] Aucun `JSON.stringify` d'objets contenant des données sensibles
- [ ] Aucun template string avec des données sensibles (`` `User: ${email}` ``)

---

## 🚫 Cas Particuliers

### 1. **Logs de Développement**

Pour du debugging temporaire en **local uniquement** :

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[DEV ONLY]', debugData);
}
```

⚠️ **ATTENTION** : Ne jamais commit ce code en production !

### 2. **Logs de Build**

Les `console.warn` dans les fichiers de configuration (admin.ts, server-config.ts) sont acceptables car ils concernent uniquement l'environnement de build, pas les données utilisateur.

```typescript
// ✅ OK - Log de build
console.warn("Firebase Admin failed to initialize (build mode)");
```

### 3. **Logs Analytics**

Pour les analytics, utilisez les outils dédiés (PostHog, Google Analytics) au lieu de logs :

```typescript
// ❌ MAUVAIS
console.log("User clicked button:", userId);

// ✅ BON
trackEvent('button_clicked', {
  // PostHog anonymise automatiquement
});
```

---

## 🔧 Configuration ESLint (Optionnel)

Pour détecter automatiquement les `console.*` :

```json
// .eslintrc.json
{
  "rules": {
    "no-console": ["error", {
      "allow": ["warn"] // Uniquement console.warn autorisé
    }]
  }
}
```

---

## 📞 Questions Fréquentes

### Q: Puis-je logger des IDs utilisateur ?

**R:** Oui, le logger va automatiquement les hasher :
```typescript
logger.errorSafe("User not found", null, { userId: "abc123" });
// Log: { userId: "hash_a3f5b2c8" }
```

### Q: Comment logger sans aucune donnée ?

**R:** Utilisez uniquement le message :
```typescript
logger.errorSafe("Database connection failed");
```

### Q: Que faire si j'ai vraiment besoin de logger une valeur sensible pour débugger ?

**R:**
1. Utilisez un flag `DEBUG` local uniquement
2. Loggez uniquement les premiers caractères : `email.substring(0, 3) + "***"`
3. **NE JAMAIS** commit ce code

### Q: Le logger ralentit-il l'application ?

**R:** Non, l'overhead est négligeable (~1ms par log). La sécurité est prioritaire.

---

## 🎓 Résumé

| Situation | Action |
|-----------|--------|
| Erreur technique | `logger.errorSafe(message, error)` |
| Warning | `logger.warnSafe(message)` |
| Info | `logger.infoSafe(message)` |
| Debug local | `if (DEV) console.log(...)` (temporaire) |
| Données sensibles | **JAMAIS** logger directement |

---

## 📚 Ressources

- Code source : [src/lib/logger/safe.ts](../src/lib/logger/safe.ts)
- Liste des corrections : [docs/secure-logging-audit.md](./secure-logging-audit.md) (si disponible)
- Architecture : [_bmad-output/planning-artifacts/architecture.md](../_bmad-output/planning-artifacts/architecture.md)

---

## 🤝 Contribution

Si vous découvrez un champ sensible qui n'est pas censuré, ajoutez-le dans `SENSITIVE_FIELDS` ([src/lib/logger/safe.ts](../src/lib/logger/safe.ts) ligne 19) et créez une PR.

---

**Dernière mise à jour** : Février 2026
**Maintenu par** : L'équipe Aurum Sanctuary

---

> 💡 **Rappel** : La sécurité des données utilisateurs est notre priorité #1. En cas de doute, demandez une review !
