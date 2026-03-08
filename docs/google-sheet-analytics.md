# Google Sheet Analytics Setup

Ce document decrit le cockpit Google Sheets recommande pour suivre Aurum sans outil BI lourd.

## Onglets

### 1. Email Funnel

Source:
- `/api/admin/analytics/email-funnel?format=csv`

Colonnes:
- `email_id`
- `sent`
- `opened`
- `clicked`
- `returned`
- `wrote`
- `trial_started`
- `subscribed`
- `purchases`
- `open_rate`
- `click_rate`
- `return_rate`
- `write_rate`
- `trial_rate`
- `subscribe_rate`
- `subscribe_after_write_rate`

Usage:
- savoir quel email fait revenir dans Aurum
- savoir quel email fait ecrire
- savoir quel email fait demarrer un trial ou convertir

### 2. Reminder Funnel

Source:
- `/api/admin/analytics/reminder-funnel?format=csv`

Colonnes:
- `date`
- `notifications_sent`
- `test_notifications_sent`
- `device_registrations`
- `device_unregistrations`
- `gentle_sent`
- `clarity_sent`
- `pressure_release_sent`
- `routine_sent`
- `active_devices_snapshot`

Usage:
- suivre l'adoption des rappels programmables
- comparer les tons utilises
- voir la progression du parc de devices actifs

### 3. Revenue Summary

Source:
- `/api/admin/analytics/revenue-summary?format=csv`

Colonnes:
- `date`
- `checkout_starts`
- `trials_started`
- `subscriptions_started`
- `purchases`
- `revenue_eur`
- `trial_to_paid_rate`
- `checkout_to_paid_rate`
- `active_monthly_snapshot`
- `active_yearly_snapshot`

Usage:
- suivre la conversion trial -> paid
- suivre la conversion checkout -> paid
- suivre la base active mensuelle vs annuelle

### 4. Weekly Notes

Colonnes libres recommandees:
- `week`
- `best_email`
- `best_reminder_tone`
- `main_drop_off`
- `decision`
- `owner`
- `notes`

Usage:
- noter les hypotheses et decisions chaque semaine

## Auth Google Apps Script

Les exports peuvent etre proteges soit par:
- session admin Aurum (navigateur)
- secret `ANALYTICS_EXPORT_SECRET`

Pour Apps Script, utiliser le header HTTP:

`x-analytics-export-secret: <ANALYTICS_EXPORT_SECRET>`

## Frequence

Recommande:
- refresh quotidien a 07:00 Europe/Paris

## Decision produit

Le KPI central reste:

`combien reviennent ecrire, et combien s'abonnent ensuite`

Le Sheet sert a lire, comparer, et decider. La source de verite reste Firestore / analyticsEvents.
