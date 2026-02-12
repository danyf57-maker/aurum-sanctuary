# 📧 Configuration Firebase Console - Emails Personnalisés Aurum

## 🎯 Objectif
Remplacer les emails génériques Firebase par des emails personnalisés en français avec la charte Aurum.

## 📋 Checklist rapide

- [ ] Configurer le nom de l'expéditeur : **Aurum**
- [ ] Configurer la langue : **Français**
- [ ] Personnaliser le template HTML
- [ ] Configurer l'URL d'action personnalisée
- [ ] Tester avec un nouveau compte

---

## 🚀 Configuration Étape par Étape

### Étape 1 : Accéder aux Templates

1. Allez sur [Firebase Console](https://console.firebase.google.com/u/0/project/aurum-diary-prod/authentication/emails)
2. Cliquez sur **Authentication** dans le menu gauche
3. Cliquez sur l'onglet **Templates** (ou **Modèles**)

### Étape 2 : Configurer l'expéditeur

1. Cherchez **"From" name and address** (ou **Nom et adresse de l'expéditeur**)
2. Cliquez sur l'icône **crayon** ✏️
3. **Sender name** : `Aurum`
4. **Sender email** : `noreply@aurum-diary-prod.firebaseapp.com` (ne pas changer)
5. Cliquez sur **Save** / **Enregistrer**

**Résultat attendu :**
```
De: Aurum <noreply@aurum-diary-prod.firebaseapp.com>
```

### Étape 3 : Configurer la langue

1. Cherchez **Application language** (ou **Langue de l'application**)
2. Sélectionnez **Français** dans le menu déroulant
3. Cliquez sur **Save** / **Enregistrer**

### Étape 4 : Personnaliser le template de vérification d'email

1. Trouvez **Email address verification** (Vérification de l'adresse email)
2. Cliquez sur l'icône **crayon** ✏️ à droite

#### 4.1 Configurer l'objet de l'email

Dans le champ **Email subject** / **Objet de l'email** :
```
Vérifiez votre email - Bienvenue sur Aurum ✨
```

#### 4.2 Activer le mode HTML

1. Cliquez sur **"Edit template"** ou **"Modifier le modèle"**
2. Si disponible, activez le **mode HTML** ou **HTML editor**

#### 4.3 Coller le template HTML

1. **Ouvrez le fichier** : `email-templates/verification-email-firebase.html`
2. **Copiez tout le contenu** (Cmd+A puis Cmd+C)
3. **Collez dans Firebase Console** (Cmd+V)
4. Vérifiez que Firebase affiche un aperçu correct

**Variables Firebase :**
- `%LINK%` → Lien de vérification (remplacé automatiquement)
- `%DISPLAY_NAME%` → Nom de l'utilisateur
- `%EMAIL%` → Email de l'utilisateur (si besoin)

#### 4.4 Configurer l'URL d'action (IMPORTANT)

En bas du formulaire, trouvez **Customize action URL** :

**Pour le développement local :**
```
http://localhost:9002/auth/action
```

**Pour la production :**
```
https://aurumdiary.com/auth/action
```

⚠️ **Note :** Utilisez l'URL de développement d'abord pour tester, puis changez pour la production après déploiement.

5. Cliquez sur **Save** / **Enregistrer**

### Étape 5 : Configurer le template de réinitialisation de mot de passe (Optionnel)

Répétez l'Étape 4 pour **Password reset** :

**Objet :**
```
Réinitialisez votre mot de passe Aurum 🔒
```

**Template HTML :**
Modifiez `verification-email-firebase.html` :
- Titre : "Réinitialiser votre mot de passe"
- Message : "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :"
- Bouton : "Réinitialiser mon mot de passe"

---

## 🧪 Test complet

### Test 1 : Créer un nouveau compte

1. Ouvrez http://localhost:9002/signup
2. Créez un compte avec un email de test
3. **Vérifiez votre boîte email**

**Email attendu :**
- ✅ Expéditeur : **Aurum** `<noreply@aurum-diary-prod.firebaseapp.com>`
- ✅ Objet : **Vérifiez votre email - Bienvenue sur Aurum ✨**
- ✅ Contenu : Design Aurum (header doré, bouton or, footer noir)
- ✅ Texte en français
- ✅ Bouton "Vérifier mon email"

### Test 2 : Vérifier le lien

1. Cliquez sur **"Vérifier mon email"** dans l'email
2. Vous devriez être redirigé vers : `http://localhost:9002/auth/action?mode=verifyEmail&oobCode=...`
3. La page doit afficher :
   - ✅ Design Aurum (couleurs, logo)
   - ✅ Message : "Votre email a été vérifié avec succès !"
   - ✅ Icône de succès (checkmark vert)
   - ✅ Redirection automatique vers `/login` après 3 secondes

### Test 3 : Vérifier la connexion

1. Allez sur http://localhost:9002/login
2. Connectez-vous avec le compte vérifié
3. ✅ Vous devriez accéder au dashboard

---

## 🐛 Dépannage

### Problème 1 : L'email est toujours en anglais

**Solution :**
- Vérifiez que la langue est bien configurée sur **Français** dans Firebase Console
- Videz le cache du navigateur et réessayez
- Attendez 5-10 minutes pour la propagation des changements

### Problème 2 : Le design n'apparaît pas

**Solution :**
- Vérifiez que vous avez bien collé le HTML complet (avec les balises `<style>`)
- Firebase peut limiter certains styles CSS. Utilisez `verification-email-firebase.html` qui est optimisé
- Certains clients email (Gmail, Outlook) peuvent supprimer certains styles

### Problème 3 : L'expéditeur n'affiche pas "Aurum"

**Solution :**
- Assurez-vous d'avoir configuré le **Sender name** dans Firebase Console
- Vérifiez votre client email (certains affichent uniquement l'email)
- Gmail peut mettre quelques heures à mettre à jour le nom de l'expéditeur

### Problème 4 : Le lien redirige vers firebase.app au lieu de /auth/action

**Solution :**
- Vérifiez que l'URL d'action personnalisée est bien configurée
- Redémarrez votre serveur dev : `npm run dev`
- Vérifiez que le provider utilise bien `handleCodeInApp: false`

### Problème 5 : Variables non remplacées (%LINK%, %DISPLAY_NAME%)

**Solution :**
- Ces variables sont remplacées par Firebase automatiquement
- Si elles apparaissent dans l'email, vérifiez la syntaxe : `%VARIABLE%` (en majuscules)
- Rechargez le template dans Firebase Console

---

## 📸 Captures d'écran de référence

### Ce que vous devriez voir dans Firebase Console :

```
Authentication > Templates

┌─────────────────────────────────────────────────┐
│ From name and address                           │
│ Sender name: Aurum                      [Edit] │
│ Sender email: noreply@aurum-diary-prod...      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Email address verification             [Edit]   │
│ Subject: Vérifiez votre email - Bienvenue...   │
│ [Preview] [Send test email]                    │
└─────────────────────────────────────────────────┘
```

---

## ✅ Validation finale

Avant de déployer en production, vérifiez :

- [ ] Email de vérification en français avec design Aurum
- [ ] Expéditeur affiché comme "Aurum"
- [ ] Lien de vérification redirige vers `/auth/action`
- [ ] Page de vérification avec design Aurum
- [ ] Redirection automatique après succès
- [ ] Flow complet fonctionne (signup → email → verify → login)

---

## 🚢 Déploiement en production

Une fois tout testé en local :

1. **Déployez le code Next.js :**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

2. **Changez l'URL d'action dans Firebase Console :**
   - De : `http://localhost:9002/auth/action`
   - À : `https://aurumdiary.com/auth/action`

3. **Testez en production** avec un nouvel email

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs : `firebase functions:log`
2. Testez le HTML sur [HTML Email Check](https://www.htmlemailcheck.com/)
3. Consultez la doc Firebase : [Customize Email Actions](https://firebase.google.com/docs/auth/custom-email-handler)

---

**🎉 Félicitations !** Vos emails Firebase sont maintenant personnalisés avec la charte Aurum !
