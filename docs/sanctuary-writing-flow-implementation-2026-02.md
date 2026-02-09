# Aurum Sanctuary - Documentation des changements (Fevrier 2026)

## Objectif
Documenter les evolutions implementees sur le flux d'ecriture, la connexion Google, l'upload d'images et la vue Magazine.

## Resume des changements
- Auth Google maintenue et rebranchee dans le parcours d'ecriture.
- Espace d'ecriture unifie: plus de distinction premium/free dans l'experience utilisateur.
- Upload image ajoute dans l'editeur (drag and drop + bouton de selection).
- Sauvegarde des metadonnees image avec les entrees de journal.
- Creation d'une vue `Magazine` a partir des entrees sauvegardees.
- Ajout des regles Firebase Storage dans le repo.
- Renforcement des messages d'erreur utilisateur pour auth/session/upload.

## Fichiers modifies
- `src/components/sanctuary/premium-journal-form.tsx`
- `src/app/actions.ts`
- `src/app/(app)/sanctuary/write/page.tsx`
- `src/app/(app)/sanctuary/magazine/page.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/header.tsx`
- `firebase.json`
- `storage.rules`

## Detail technique

### 1) Espace d'ecriture unifie
- La route `sanctuary/write` utilise le formulaire premium comme experience principale.
- Le formulaire gere un `draftContent` local et un `draftImages` local.
- Focus mode actif pendant la saisie pour attenuer les elements secondaires.

### 2) Upload d'images dans l'editeur
- Ajout du drag and drop dans la zone de texte.
- Ajout d'un fallback bouton `Ajouter une image` (input file cache).
- Ajout d'un bouton `Supprimer` par image avant sauvegarde.
- Ajout d'une legende editable par image.
- Les erreurs Firebase Storage sont traduites en messages utilisateur plus clairs (`unauthorized`, `unauthenticated`, `quota-exceeded`, `retry-limit-exceeded`).

Important:
- Le markdown image n'est plus injecte dans la zone de texte.
- L'image est geree comme media attache (preview + metadata), pour garder le texte propre.

### 3) Sauvegarde serveur des images
- `saveJournalEntry` accepte un champ `images` (JSON string).
- Validation serveur du schema image (id/url/path/caption/name).
- Sauvegarde des images dans le document d'entree.

### 4) Vue Magazine
- Nouvelle page `sanctuary/magazine` avec grille de cartes.
- Chaque carte affiche:
  - image de couverture,
  - titre,
  - extrait.
- Fallback resilients:
  - si erreur de requete Firestore, la page retourne une liste vide au lieu d'un ecran blanc.

### 5) Firebase Storage
- `firebase.json` declare maintenant la section:
  - `"storage": { "rules": "storage.rules" }`
- Nouveau fichier `storage.rules`:
  - autorise lecture/ecriture uniquement pour le proprietaire sur `journal_media/{userId}/...`
  - refus par defaut partout ailleurs.

## Prerequis environnement
- `.env.local` doit contenir une config Firebase Web valide:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Mise en service locale (checklist)
1. Initialiser Firebase Storage dans la console projet (bouton `Get started`).
2. Deployer les regles Storage:
```bash
firebase deploy --only storage
```
3. Lancer l'app:
```bash
npm run dev
```
4. Tester:
- `http://localhost:9002/sanctuary/write`
- ajouter une image (drag/drop ou bouton)
- sauvegarder l'entree
- verifier `http://localhost:9002/sanctuary/magazine`

## Verification effectuee
- `npm run typecheck` passe apres modifications.

## Incidents traites pendant l'implementation
- Erreur `EADDRINUSE` sur port `9002`: un autre process Next etait deja actif.
- Erreurs 500 et pages blanches: routes dependantes d'etats auth/storage incomplets.
- Message "Token invalide": session Firebase expiree/invalide; message utilisateur clarifie.
- Upload image bloque: Firebase Storage non initialise puis regles manquantes.

## Limitations actuelles
- Upload d'image non chiffre (prototype volontaire).
- La suppression d'image dans le formulaire retire l'image de l'entree en cours, mais ne supprime pas l'objet deja uploade du bucket.
- La vue Magazine est une projection simplifiee (cover + extrait), sans edition detaillee.

## Prochaines ameliorations recommandees
1. Suppression physique du fichier Storage lors de `Supprimer` (ou nettoyage asynchrone).
2. Chiffrement media cote client/serveur selon la strategie securite.
3. Vue detail d'un numero Magazine avec edition du titre et de la legende.
4. Observabilite (logs structurés + dashboard erreurs Storage/Auth).
