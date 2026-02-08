# MISSION : Implémentation des Passkeys (WebAuthn)
**Statut** : 🟡 En Cours (Infrastructure Terminée)
**Priorité** : CRITIQUE (UX & Sécurité)
**Cible** : Claude Sonnet 4.5

---

## ✅ Implémentation Terminée

### Fichiers Créés
| Fichier | Rôle |
|---------|------|
| `src/lib/crypto/key-wrapping.ts` | AES-GCM key wrapping + HKDF pour PRF |
| `src/lib/crypto/webauthn.ts` | Client WebAuthn avec PRF extension |
| `src/app/actions/passkey-actions.ts` | Server actions (registration, authentication, management) |
| `src/hooks/usePasskey.ts` | Hook React pour setup/unlock/recovery |
| `src/components/crypto/PasskeySetupModal.tsx` | UI d'activation biométrique |
| `src/components/crypto/PasskeyUnlockModal.tsx` | UI de déverrouillage + recovery |

### Fichiers Modifiés
| Fichier | Modification |
|---------|--------------|
| `src/app/actions/auth.ts` | Ajout `getAuthedUserEmail()` |
| `.env.local` | Ajout `WEBAUTHN_RP_ID` et `WEBAUTHN_ORIGIN` |

### Dépendances Ajoutées
```
@simplewebauthn/browser
@simplewebauthn/server
```

### Architecture v3 (Passkeys)
```
┌─────────────────────────────────────────────────────────┐
│  SETUP                                                  │
├─────────────────────────────────────────────────────────┤
│  1. generateMasterKey() → random AES-256               │
│  2. WebAuthn.create() + PRF extension                   │
│  3. PRF output → HKDF → wrapping key                    │
│  4. wrapMasterKey(masterKey, wrappingKey)               │
│  5. BIP39 phrase → deriveKey → wrapForRecovery          │
│  6. Store: { credentialId, wrappedMasterKey } → Server  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  UNLOCK                                                 │
├─────────────────────────────────────────────────────────┤
│  1. WebAuthn.get() + PRF extension                      │
│  2. PRF output → HKDF → unwrapping key                  │
│  3. unwrapMasterKey() → masterKey                       │
│  4. sessionStorage ← masterKey                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔜 Prochaines Étapes (Intégration UI)

1. **Intégrer dans Settings** : Ajouter un toggle "Activer Face ID / Touch ID" dans `/settings`
2. **Modifier le flow d'unlock** : Détecter v3 et afficher `PasskeyUnlockModal` au lieu de `PassphraseUnlockModal`
3. **Migration v2 → v3** : Permettre aux utilisateurs existants d'activer les passkeys sans perdre leurs données
4. **Tests E2E** : Playwright avec mock WebAuthn

---

## 🎯 Objectif
Remplacer (ou compléter) le système de passphrase BIP39 actuel par une authentification biométrique (Passkeys/WebAuthn). L'objectif est d'atteindre une friction "Zero-Touch" pour l'utilisateur tout en garantissant que la clé de chiffrement ne quitte jamais l'enclave sécurisée de l'appareil.

## 🛠️ Spécifications Techniques

### 1. Stockage de la Clé Maître
*   ✅ Clé AES-256-GCM générée aléatoirement
*   ✅ Wrapping via PRF extension (HKDF derivation)
*   ✅ Stockée chiffrée dans Firestore

### 2. Flux Utilisateur (User Journey)
*   ✅ **Inscription** : Modal "Activer l'accès biométrique (FaceID/TouchID)"
*   ✅ **Connexion** : Popup système pour biométrie
*   ✅ **Fallback** : BIP39 (12 mots) pour récupération

### 3. Architecture Admin-Blind
*   ✅ Serveur ne voit jamais la clé déchiffrée
*   ✅ SimpleWebAuthn pour cérémonies WebAuthn

## 🚨 Sécurité (Rappel des Fails d'audit)
*   **Zéro Plaintext** : Interdiction formelle d'envoyer le contenu vers `/api/analyze` ou tout autre endpoint avant chiffrement.
*   **Client-Side Only** : Le déchiffrement pour l'affichage du journal doit se faire exclusivement dans le navigateur de l'utilisateur.

## 🏁 Décisions du Chef de Projet (PM)

Suite aux questions de Codex, voici les directives fermes :

1.  **PRF Extension** : **OUI**. Nous ciblons la pointe de la technologie pour le Sanctuaire. Supporte l'extension PRF pour Safari/iOS 17+/macOS 14+. Si le navigateur ne supporte pas PRF, affiche un message clair et redirige vers le fallback BIP39.
2.  **Fallback vs Migration** : **HYBRIDE**. La passphrase BIP39 (12 mots) reste la clé de voûte (Master Key). Le Passkey sert de "déverrouillage rapide" (wrapping de la Master Key). On ne remplace pas le BIP39, on le rend "invisible" au quotidien.
3.  **Multi-device** : On laisse faire l'OS (iCloud Keychain / Google Password Manager). Pas de développement spécifique pour la synchro, le standard Passkey s'en charge.
