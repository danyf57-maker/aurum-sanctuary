# Guide de Configuration de l'Authentification Firebase

## 🚨 Problème Actuel

**Erreur** : `Firebase: Error (auth/operation-not-allowed)`

**Cause** : La méthode d'authentification Google n'est pas activée dans Firebase Console.

---

## ✅ Solution 1 : Activer Google Sign-In (Recommandé)

### Étapes :

1. **Allez sur** : [Firebase Authentication - Providers](https://console.firebase.google.com/project/studio-7696616694-2c1ae/authentication/providers)

2. **Cliquez sur "Google"** dans la liste des fournisseurs

3. **Activez le toggle "Enable"**

4. **Configurez** :
   - **Project support email** : `danyf57@gmail.com`
   - Laissez les autres champs par défaut

5. **Cliquez "Save"**

6. **Rafraîchissez votre application** : [http://localhost:9002](http://localhost:9002)

7. **Réessayez de vous connecter**

---

## ✅ Solution 2 : Utiliser Email/Password

Si vous préférez ne pas utiliser Google :

### Étapes :

1. **Même page** : [Firebase Authentication - Providers](https://console.firebase.google.com/project/studio-7696616694-2c1ae/authentication/providers)

2. **Cliquez sur "Email/Password"**

3. **Activez "Email/Password"** (pas "Email link")

4. **Cliquez "Save"**

5. **Créez un utilisateur manuellement** :
   - Allez dans l'onglet **"Users"**
   - Cliquez **"Add user"**
   - Email : `test@example.com`
   - Password : `Test123456!`
   - Cliquez **"Add user"**

6. **Modifiez le code de l'application** pour ajouter un formulaire email/password

---

## 🎯 Recommandation

**Utilisez Solution 1 (Google Sign-In)** car :
- ✅ Plus simple pour l'utilisateur
- ✅ Plus sécurisé (pas de mot de passe à gérer)
- ✅ Déjà intégré dans votre application

---

## 📸 Capture d'Écran de l'Erreur

![Erreur de connexion](file:///Users/danielfioriti/.gemini/antigravity/brain/6e929b28-5cac-44bd-8f64-24b66e69ef64/uploaded_media_1769769481885.png)

**Message** : "Firebase: Error (auth/operation-not-allowed)."

---

## ✅ Vérification

Après avoir activé Google Sign-In, vous devriez voir :
- ✅ Le bouton "Se connecter avec Google" fonctionne
- ✅ Une popup Google s'ouvre pour la connexion
- ✅ Vous êtes redirigé vers l'application après connexion

---

## 🆘 Si Ça Ne Marche Toujours Pas

Vérifiez que :
1. Vous avez bien cliqué "Save" dans Firebase Console
2. Vous avez rafraîchi la page de l'application (Cmd+R)
3. Le serveur dev tourne toujours (`npm run dev`)

Si le problème persiste, partagez une nouvelle capture d'écran de l'erreur.
