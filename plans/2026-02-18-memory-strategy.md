# Strategie Memoire Longue - Aurum

Date: 18/02/2026  
Statut: cadrage valide, implementation a planifier

## Objectif
Permettre a Aurum d'analyser l'historique complet d'un client pour produire des reflets plus profonds, plus coherents dans le temps, et plus utiles a la prise de decision personnelle.

## Principe produit
La "memoire" ne doit pas etre un bloc opaque.  
L'utilisateur doit comprendre ce qui est retenu, pourquoi, et pouvoir corriger/supprimer.

## Architecture cible (V1 -> V2)
1. Memoire brute
- Historique integral des entrees (source de verite).

2. Memoire semantique
- Embeddings par entree.
- Recherche des ecrits les plus pertinents par theme/question.

3. Memoire synthetique
- Resumes hebdo/mensuels/trimestriels.
- Extraction des motifs recurrents + signaux faibles.

4. Profil evolutif
- Variables stables: clarte, charge mentale, ruminations, energie, declencheurs.
- Mise a jour progressive avec score de confiance.

## UX cible
- "Ce que Aurum a compris de toi" (editable par l'utilisateur).
- Timeline des tendances (hausse/baisse, rechute, progression).
- Controles: oublier un theme, supprimer une periode, reset memoire.

## Privacy / confiance
- Opt-in explicite pour la memoire profonde.
- Journal transparent des donnees utilisees.
- Suppression selective + suppression totale a 1 clic.

## Indicateurs de succes
- Hausse du taux de seconde session.
- Hausse du taux d'entree hebdomadaire.
- Baisse du temps pour produire un reflet utile.
- Satisfaction percue des analyses (feedback explicite).

## Plan implementation propose
Sprint 1
- Schema Firestore pour memoire semantique + resume hebdo.
- Pipeline server pour alimenter les resumes et signaux.
- API lecture "context pack" pour l'IA.

Sprint 2
- UI "Memoire Aurum" (resume + tendances + controle utilisateur).
- Re-evaluation scoring lead avec signaux de profondeur.
- Tableau admin: adoption de la memoire et impact retention.

## Prerequis techniques
- Definir cout max IA par utilisateur/mois.
- Definir retention policy par type de memoire.
- Instrumenter des evenements dedies a la memoire (opt-in, consultation, edition, suppression).
