# 🚀 Guide Rapide - 5 minutes pour configurer vos emails Aurum

## 📍 Lien direct Firebase Console
👉 https://console.firebase.google.com/u/0/project/aurum-diary-prod/authentication/emails

---

## ✅ 3 ÉTAPES ESSENTIELLES

### 🎯 ÉTAPE 1 : Nom de l'expéditeur (2 min)

1. Trouvez **"From name and address"**
2. Cliquez sur le **crayon** ✏️
3. **Sender name** : `Aurum`
4. **Enregistrer**

**Résultat :** De: **Aurum** <noreply@...> au lieu de noreply@...

---

### 🎨 ÉTAPE 2 : Template en français (2 min)

1. Trouvez **"Email address verification"**
2. Cliquez sur le **crayon** ✏️
3. **Objet** : `Vérifiez votre email - Bienvenue sur Aurum ✨`
4. Cliquez sur **"Edit template"**
5. **Copiez-collez** le contenu de `verification-email-firebase.html`
6. **Enregistrer**

---

### 🔗 ÉTAPE 3 : URL d'action personnalisée (1 min)

Dans le même formulaire (Email address verification), **en bas** :

1. Trouvez **"Customize action URL"**
2. Entrez : `http://localhost:9002/auth/action`
3. **Enregistrer**

---

## 🧪 TEST IMMÉDIAT

1. Allez sur http://localhost:9002/signup
2. Créez un compte avec un email test
3. Vérifiez votre boîte email

**Vous devriez recevoir :**
- ✅ Expéditeur : **Aurum**
- ✅ Objet en français
- ✅ Design doré/beige avec logo AURUM
- ✅ Bouton "Vérifier mon email"

---

## 🐛 Si ça ne marche pas

**Email toujours en anglais ?**
→ Dans Firebase Console : **Settings** → **Application language** → **Français**

**Design pas appliqué ?**
→ Vérifiez que vous avez collé **tout le HTML** (avec `<style>`)

**Expéditeur pas "Aurum" ?**
→ Attendez 5-10 minutes, Gmail met du temps à mettre à jour

---

## 📸 Ce que vous devriez voir

### Dans Firebase Console :
```
✓ Sender name: Aurum
✓ Email subject: Vérifiez votre email - Bienvenue sur Aurum ✨
✓ Action URL: http://localhost:9002/auth/action
```

### Dans votre email :
```
De: Aurum <noreply@aurum-diary-prod.firebaseapp.com>
Objet: Vérifiez votre email - Bienvenue sur Aurum ✨

[HEADER DORÉ AVEC LOGO AURUM]
Bienvenue dans votre sanctuaire ✨
[BOUTON OR "Vérifier mon email"]
[FOOTER NOIR]
```

---

## ⏭️ Après le test

Si tout fonctionne :
1. ✅ Commitez les changements : `git add . && git commit`
2. ✅ Déployez : `firebase deploy --only hosting`
3. ✅ Changez l'URL d'action pour la prod : `https://aurumdiary.com/auth/action`

---

**📖 Guide complet :** Voir `CONFIGURATION-FIREBASE-CONSOLE.md`
