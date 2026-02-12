# Configuration des Emails Firebase pour Aurum

Ce guide explique comment configurer les templates d'emails Firebase pour qu'ils correspondent à la charte graphique d'Aurum.

## 🎯 Objectif

Remplacer les emails génériques de Firebase par des emails personnalisés avec :
- Charte graphique Aurum (couleurs or/beige)
- Typographies élégantes
- Branding cohérent
- Handler d'actions personnalisé

## 📧 Template créé

Le fichier `verification-email.html` contient le template HTML personnalisé pour l'email de vérification.

**Caractéristiques :**
- Header avec gradient doré (#C5A059)
- Logo AURUM avec typographie Cormorant Garamond
- Background crème (#F9F7F2)
- Bouton CTA avec ombre et effet hover
- Footer sombre avec liens utiles
- Responsive (mobile-friendly)

## 🔧 Configuration Firebase

### Étape 1 : Configurer le handler d'actions personnalisé

1. Allez dans [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet : **aurum-diary-prod**
3. Allez dans **Authentication** → **Templates**
4. Pour chaque template (Verification Email, Password Reset, etc.) :
   - Cliquez sur l'icône crayon pour éditer
   - Dans la section **Customize action URL**, entrez :
     ```
     https://aurumdiary.com/auth/action
     ```
   - Ou pour le développement local :
     ```
     http://localhost:9002/auth/action
     ```

### Étape 2 : Personnaliser le template d'email

#### Option A : Via la Console Firebase (Recommandé)

1. Dans **Authentication** → **Templates** → **Email address verification**
2. Cliquez sur l'icône crayon
3. Personnalisez le template :

**Objet :** `Vérifiez votre email - Bienvenue sur Aurum ✨`

**Corps de l'email :**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background-color: #f5f5f4; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #C5A059 0%, #D4B068 100%); padding: 40px 20px; text-align: center; }
    .logo { font-size: 36px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: 2px; }
    .content { padding: 48px 32px; background: #F9F7F2; }
    .greeting { font-size: 24px; color: #2A2A2A; margin-bottom: 24px; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #C5A059 0%, #D4B068 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background: #1c1917; padding: 32px; text-align: center; color: #a8a29e; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">AURUM</h1>
    </div>
    <div class="content">
      <h2 class="greeting">Bienvenue dans votre sanctuaire ✨</h2>
      <p>Merci de vous être inscrit sur <strong>Aurum</strong>. Pour commencer, veuillez vérifier votre email :</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="%LINK%" class="button">Vérifier mon email</a>
      </p>
      <p style="font-size: 14px; color: #71717a;">Ce lien expire dans 24 heures.</p>
    </div>
    <div class="footer">
      <p><strong>Aurum</strong> - Votre sanctuaire numérique</p>
      <p><a href="https://aurumdiary.com" style="color: #C5A059;">aurumdiary.com</a></p>
    </div>
  </div>
</body>
</html>
```

**Note :** Firebase remplacera automatiquement `%LINK%` par le lien de vérification.

#### Option B : Copier le template complet

Copiez le contenu de `verification-email.html` dans la console Firebase (peut nécessiter quelques ajustements selon les limitations de Firebase).

### Étape 3 : Configurer l'expéditeur

1. Dans **Authentication** → **Templates** → **Sender name**
2. Changez de : `noreply@aurum-diary-prod.firebaseapp.com`
3. À : **Aurum** `<noreply@aurum-diary-prod.firebaseapp.com>`

### Étape 4 : Tester

1. Créez un nouveau compte sur http://localhost:9002/signup
2. Vérifiez l'email reçu
3. Cliquez sur le lien de vérification
4. Vérifiez que vous êtes redirigé vers `/auth/action` avec le nouveau design

## 🎨 Templates pour les autres emails

### Password Reset Email

**Objet :** `Réinitialisez votre mot de passe Aurum 🔒`

Utilisez le même template HTML en modifiant :
- Le titre : "Réinitialiser votre mot de passe"
- Le message : "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :"
- Le bouton : "Réinitialiser mon mot de passe"

### Email Change Verification

**Objet :** `Confirmez votre nouvelle adresse email`

Même template avec :
- Le titre : "Confirmer votre nouvel email"
- Le message adapté

## 🚀 Déploiement

Une fois la configuration terminée en local, déployez les changements :

```bash
# Build Next.js avec la nouvelle page /auth/action
npm run build

# Déployer sur Firebase Hosting
firebase deploy --only hosting
```

## 📝 Notes importantes

1. **Variable %LINK%** : Firebase remplace automatiquement cette variable par le lien d'action
2. **Variables supplémentaires disponibles** :
   - `%EMAIL%` : L'adresse email de l'utilisateur
   - `%NEW_EMAIL%` : La nouvelle adresse (pour changement d'email)
   - `%DISPLAY_NAME%` : Le nom d'affichage
3. **Limitations Firebase** :
   - Certaines balises HTML avancées peuvent ne pas être supportées
   - Les styles inline sont recommandés
   - Testez sur différents clients email (Gmail, Outlook, Apple Mail)

## 🔍 Debug

Si les emails ne s'affichent pas correctement :

1. Vérifiez les logs Firebase Functions : `firebase functions:log`
2. Testez le template HTML sur [Litmus](https://www.litmus.com/) ou [Email on Acid](https://www.emailonacid.com/)
3. Vérifiez que le handler `/auth/action` fonctionne correctement

## ✅ Checklist

- [ ] Page `/auth/action` créée et fonctionnelle
- [ ] Action URL configurée dans Firebase Console
- [ ] Template d'email personnalisé dans Firebase Console
- [ ] Sender name configuré : "Aurum"
- [ ] Test complet du flow d'inscription
- [ ] Test sur mobile et desktop
- [ ] Déploiement en production
