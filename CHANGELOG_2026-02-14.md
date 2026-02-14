# Changelog - 14 février 2026

## Résumé

Reorganisation complète de l'interface utilisateur, correction des bugs Firebase et amélioration de l'affichage des entrées journal.

---

## 🐛 Corrections de bugs

### Firestore - Connexion restaurée

**Problème** : Le fichier `src/lib/firebase/firestore.ts` était mocké (bypass pour CI/CD), empêchant le chargement des données.

**Solution** :

- Restauré l'import de `firestore` depuis `web-client.ts`
- Réimplémenté les fonctions `getUserProfile()`, `getEntries()`, `getUniqueTags()`, `getPublicPosts()`, `getPublicPostBySlug()`
- Ajouté la gestion d'erreur avec fallback

**Fichiers modifiés** :

- `src/lib/firebase/firestore.ts`

### Magazine - Erreur `toMillis()` sur undefined

**Problème** : La page Magazine crashait avec `TypeError: Cannot read properties of undefined (reading 'toMillis')`.

**Cause** : La fonction `parseCreatedAt()` extrayait la méthode `toDate` puis l'appelait séparément, perdant le contexte `this`.

**Solution** :

- Appel direct de `toDate()` sur l'objet pour préserver le contexte
- Ajout de `try/catch` avec log de warning
- Vérification optionnelle `?.toDate?.()` dans `storage.ts`

**Fichiers modifiés** :

- `src/app/(app)/sanctuary/magazine/page.tsx`
- `src/lib/patterns/storage.ts`

---

## ✨ Nouvelles fonctionnalités

### Journal - Affichage mode Magazine

**Page** : `/sanctuary` (Journal)

**Nouveautés** :

- Affichage des entrées en mode magazine avec image à la une
- Date complète affichée (jour + heure)
- Style carte magazine avec bordures colorées selon l'humeur
- Titre généré depuis les 8 premiers mots du contenu
- Extrait du contenu (150 caractères)
- Badge de sentiment (Positif/Négatif/Neutre)
- Tags (max 3 affichés)
- Animations Framer Motion

**Composant créé** :

- `src/components/journal/journal-magazine-card.tsx`

### Journal - Échanges Aurum

**Page** : `/sanctuary` (Journal)

**Nouveautés** :

- Affichage des réflexions/réponses d'Aurum sous chaque post
- Récupération des conversations depuis Firestore (`aurumConversation`)
- Composant `AurumExchangePreview` pour afficher la dernière réponse
- Composant `EntryWithExchange` combinant entrée et échanges

**Fichiers modifiés** :

- `src/app/(app)/sanctuary/page.tsx`
- `src/lib/types.ts` (ajout champ `images`)

---

## 🔄 Reorganisation des menus

### Structure avant

| Menu          | Sous-titre | Contenu         |
| ------------- | ---------- | --------------- |
| Écrire        | ÉCRITURE   | Page d'écriture |
| Journal       | MAGAZINE   | Stats + posts   |
| (pas de menu) | -          | -               |

### Structure après

| Menu     | Sous-titre | Contenu                | Route                 |
| -------- | ---------- | ---------------------- | --------------------- |
| Écrire   | -          | Page d'écriture        | `/sanctuary/write`    |
| Journal  | -          | Posts + échanges Aurum | `/sanctuary`          |
| Magazine | -          | Stats uniquement       | `/sanctuary/magazine` |

### Changements techniques

**Sidebar** (`src/components/layout/app-sidebar.tsx`) :

- Suppression des sous-titres "ÉCRITURE" et "MAGAZINE"
- Ajout du menu "Magazine" avec icône `BarChart3`
- Mise à jour des liens de navigation

**Page Magazine** (`src/app/(app)/sanctuary/magazine/page.tsx`) :

- Suppression de l'affichage des posts/entrées
- Conservation des stats (MagazineStats, MoodChart, CollectionManager, InsightsPanel, WritingPrompt, MagazineThemePicker)
- Ajout d'un message informatif avec lien vers le Journal

---

## 📝 Commits

```
6de3570 fix: remove posts from Magazine, keep only stats. Posts now in Journal
56db58d feat: reorganize menus - Journal with Aurum exchanges, Magazine for stats
7115149 fix: corrige l'erreur toMillis() sur undefined dans parseCreatedAt et storage.ts
dac1940 Add debug logging to diagnose toMillis error in Magazine
2dd01cf fix(magazine): handle undefined createdAt in pagination cursor
e71e46b fix: stabilize magazine page fetch loop + add error logging
```

---

## 🚀 Déploiement

### Firebase Hosting (classique)

- URL : https://aurum-diary-prod.web.app
- Déployé : ✅

### Firebase App Hosting

- URL : https://aurum-sanctuary--aurum-diary-prod.us-east4.hosted.app
- Statut : En attente de build automatique depuis GitHub

---

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers

- `src/components/journal/journal-magazine-card.tsx`
- `CHANGELOG_2026-02-14.md`

### Fichiers modifiés

- `src/lib/firebase/firestore.ts`
- `src/app/(app)/sanctuary/magazine/page.tsx`
- `src/app/(app)/sanctuary/page.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/lib/types.ts`
- `src/lib/patterns/storage.ts`

---

## 🔧 Notes techniques

### Type JournalEntry mis à jour

```typescript
interface JournalEntry {
  // ... champs existants
  images?: { url: string; caption?: string }[]; // Nouveau
}
```

### Dépendances

- Build validé avec succès
- Pas de nouvelles dépendances ajoutées

---

## 🎯 Prochaines étapes suggérées

1. **Vérifier le déploiement Firebase App Hosting** - Le build devrait se lancer automatiquement
2. **Tester l'affichage des échanges Aurum** - S'assurer que les conversations s'affichent correctement
3. **Vérifier la navigation** - Confirmer que les 3 menus fonctionnent correctement
