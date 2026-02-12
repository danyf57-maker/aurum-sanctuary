# Templates d'Emails Aurum

Ce dossier contient les templates d'emails personnalisés pour Firebase Authentication.

## 📁 Fichiers

- **`verification-email.html`** : Template HTML complet pour l'email de vérification
- **`CONFIGURATION.md`** : Guide détaillé de configuration Firebase

## 🚀 Quick Start

1. **Lisez `CONFIGURATION.md`** pour le guide complet
2. **Allez dans [Firebase Console](https://console.firebase.google.com)**
3. **Authentication → Templates → Email address verification**
4. **Configurez l'Action URL** : `https://aurumdiary.com/auth/action`
5. **Collez le template** depuis `verification-email.html`

## 🎨 Charte Graphique Appliquée

- **Couleur principale** : `#C5A059` (or)
- **Background** : `#F9F7F2` (beige/crème)
- **Texte** : `#2A2A2A` (gris foncé)
- **Footer** : `#1c1917` (noir chaud)

## ⚠️ Important

Le handler d'actions personnalisé `/auth/action` doit être déployé avant d'activer les nouveaux templates.

```bash
npm run build
firebase deploy --only hosting
```
