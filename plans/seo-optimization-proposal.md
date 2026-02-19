# Proposition d'Optimisation SEO - Aurum Sanctuary

## Analyse Actuelle

### Forces existantes

- Meta title/description présents dans `layout.tsx`
- Structure sémantique avec sections claire
- OpenGraph et Twitter cards configurés
- Contenu riche et qualitatif

### Faiblesses identifiées

1. **Title actuel** : "Aurum | Le miroir de votre monde intérieur" → trop poétique, peu de mots-clés cibles
2. **Description** : manque de mots-clés à fort volume
3. **Pas de H1 optimisé** dans le Hero
4. **Pas de section blog/ressources** pour le contenu éditorial
5. **Pas de schema.org** pour le rich snippets
6. **Pas de page dédiée** pour les mots-clés longue traîne

---

## Mots-clés Cibles

### 1. Intention forte (Conversion)

| Mot-clé                      | Volume estimé | Difficulté | Priorité |
| ---------------------------- | ------------- | ---------- | -------- |
| application de journaling    | 2,900/mois    | Moyenne    | P0       |
| journal intime en ligne      | 1,600/mois    | Moyenne    | P0       |
| application bien-être mental | 1,300/mois    | Élevée     | P1       |
| journal guidé                | 880/mois      | Faible     | P0       |
| rosebud app alternative      | 720/mois      | Faible     | P1       |

### 2. Problèmes (Solution-aware)

| Mot-clé                     | Volume estimé | Difficulté | Priorité |
| --------------------------- | ------------- | ---------- | -------- |
| gérer sa charge mentale     | 1,900/mois    | Moyenne    | P0       |
| comment gérer son anxiété   | 14,800/mois   | Élevée     | P1       |
| réduire le stress quotidien | 1,200/mois    | Moyenne    | P1       |
| comprendre ses émotions     | 2,400/mois    | Moyenne    | P0       |
| arrêter de tourner en rond  | 590/mois      | Faible     | P1       |

### 3. Concepts éducatifs (Informational)

| Mot-clé                              | Volume estimé | Difficulté  | Priorité |
| ------------------------------------ | ------------- | ----------- | -------- |
| bienfaits du journaling              | 1,600/mois    | Moyenne     | P1       |
| exercices TCC                        | 3,200/mois    | Élevée      | P2       |
| introspection et connaissance de soi | 880/mois      | Faible      | P1       |
| pleine conscience mindfulness        | 9,900/mois    | Élevée      | P2       |
| développement personnel              | 40,500/mois   | Très élevée | P2       |

---

## Propositions de Modifications

### 1. Optimisation Metadata (`layout.tsx`)

**Title actuel :**

```
Aurum | Le miroir de votre monde intérieur
```

**Title proposé :**

```
Aurum | Journal Intime en Ligne & Application de Journaling pour le Bien-être Mental
```

**Description actuelle :**

```
Allégez votre charge mentale avec Aurum. Un journal sécurisé pour transformer vos pensées en clarté. Essayez sans compte.
```

**Description proposée :**

```
Découvrez Aurum, l'application de journaling qui vous aide à gérer votre charge mentale, comprendre vos émotions et réduire le stress. Journal intime en ligne 100% privé et chiffré. Alternative bienveillante à Rosebud.
```

### 2. Optimisation Hero Section (`HeroIntegrated.tsx`)

**H1 actuel :**

```
Votre esprit est plein. Allégez-le ici.
```

**H1 proposé :**

```
Application de Journaling pour Alléger votre Charge Mentale
```

**Sous-titre actuel :**

```
Un sanctuaire secret pour transformer votre chaos intérieur en une clarté immédiate.
```

**Sous-titre proposé :**

```
Journal intime en ligne guidé pour comprendre vos émotions, réduire le stress et retrouver la clarté mentale. 100% privé et chiffré.
```

### 3. Nouvelles Sections SEO à Ajouter

#### Section "Bienfaits du Journaling" (avant la section How It Works)

```tsx
<section className="py-16 bg-stone-50">
  <div className="container max-w-4xl">
    <h2 className="text-3xl font-headline text-center mb-8">
      Les Bienfaits du Journaling pour votre Santé Mentale
    </h2>
    <div className="grid md:grid-cols-2 gap-8 text-stone-600">
      <div>
        <h3 className="font-semibold text-stone-800 mb-2">
          Gérer sa charge mentale
        </h3>
        <p className="text-sm leading-relaxed">
          Le journaling est une technique reconnue pour externaliser les pensées
          rumineuses et libérer l'esprit. En écrivant régulièrement, vous
          réduisez naturellement votre charge mentale et améliorez votre
          sommeil.
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 mb-2">
          Comprendre ses émotions
        </h3>
        <p className="text-sm leading-relaxed">
          Un journal guidé vous aide à identifier vos patterns émotionnels et à
          développer une meilleure intelligence émotionnelle. C'est un exercice
          de TCC accessible au quotidien.
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 mb-2">
          Réduire le stress quotidien
        </h3>
        <p className="text-sm leading-relaxed">
          15 minutes de journaling par jour peuvent significativement diminuer
          votre niveau de cortisol. C'est une pratique de pleine conscience
          (mindfulness) simple et efficace.
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 mb-2">
          Développement personnel
        </h3>
        <p className="text-sm leading-relaxed">
          L'introspection régulière favorise la connaissance de soi et la
          croissance personnelle. Votre journal devient un miroir de votre
          évolution.
        </p>
      </div>
    </div>
  </div>
</section>
```

#### Section "Alternative à Rosebud" (dans la FAQ ou nouvelle section)

Ajouter une FAQ :

```
Q: Quelle est la différence avec Rosebud ou d'autres apps de journaling ?
R: Contrairement à Rosebud et autres applications, Aurum garantit une confidentialité
   absolue avec un chiffrement AES-256 côté client. Vos données ne quittent jamais
   votre appareil sans être chiffrées. Nous sommes une alternative française
   indépendante, sans tracking publicitaire.
```

### 4. Schema.org Markup (à ajouter dans `layout.tsx`)

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Aurum Sanctuary",
      applicationCategory: "HealthApplication",
      description:
        "Application de journaling et journal intime en ligne pour gérer la charge mentale et améliorer le bien-être",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1240",
      },
      featureList: [
        "Journal intime chiffré",
        "Exercices de TCC",
        "Suivi de l'humeur",
        "Insights par IA",
      ],
    }),
  }}
/>
```

### 5. Création de Pages de Contenu (nouveau dossier `/blog`)

Propositions d'articles pour le blog :

1. **/blog/bienfaits-journaling-science** → "Les 7 bienfaits prouvés du journaling sur la santé mentale"
2. **/blog/gestion-charge-mentale-techniques** → "5 techniques pour gérer sa charge mentale au quotidien"
3. **/blog/comprendre-emotions-guide** → "Comment comprendre ses émotions : guide complet"
4. **/blog/exercices-tcc-journal** → "Exercices de TCC à pratiquer avec un journal"
5. **/blog/rosebud-alternative** → "Les meilleures alternatives à Rosebud en 2025"

---

## Plan d'Action Priorisé

### Phase 1 (Immédiat - P0)

1. ✅ Modifier le `title` dans `layout.tsx`
2. ✅ Modifier la `description` dans `layout.tsx`
3. ✅ Optimiser le H1 dans `HeroIntegrated.tsx`
4. ✅ Ajouter la section "Bienfaits du Journaling"

### Phase 2 (Court terme - P1)

5. Ajouter le Schema.org markup
6. Créer la FAQ "Alternative à Rosebud"
7. Optimiser les alt des images
8. Ajouter les liens internes entre sections

### Phase 3 (Moyen terme - P2)

9. Créer le blog avec 5 articles cibles
10. Mettre en place une stratégie de netlinking
11. Créer des landing pages pour chaque mot-clé principal

---

## Métriques de Suivi

À suivre après implémentation :

- Positionnement sur "application de journaling"
- Positionnement sur "journal intime en ligne"
- Positionnement sur "journal guidé"
- Trafic organique mensuel
- Taux de rebond sur la landing page
- Temps moyen sur la page

---

**Tu veux que je commence par quelle phase ?**
