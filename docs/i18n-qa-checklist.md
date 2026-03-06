# I18n QA Checklist (FR/EN)

## Routing rules (must pass)
- `/` serves EN by default.
- `/fr` and `/fr/...` serve FR.
- `/en` and `/en/...` redirect to non-prefixed EN routes.
- If cookie `aurum-locale=fr`, non-prefixed routes redirect to `/fr/...`.
- If cookie `aurum-locale=en`, FR routes do not force EN automatically unless explicit switch/query (`?lang=en`).

## Locale detection order (must pass)
- Priority 1: explicit `?lang=`.
- Priority 2: locale in URL path (`/fr/...`).
- Priority 3: persisted cookie `aurum-locale`.
- Priority 4: country header (`FR -> fr`, others -> en).
- Priority 5: `Accept-Language` header.

## UX checks
- Language switcher updates URL structure correctly:
- FR switch from `/pricing` -> `/fr/pricing`.
- EN switch from `/fr/pricing` -> `/pricing`.
- Selected language persists after refresh and new navigation.
- No mixed-language blocks on first page load.

## SEO checks
- `<html lang>` matches route locale.
- FR pages expose FR metadata (title/description/OG/Twitter).
- EN pages expose EN metadata.
- Canonical for EN uses non-prefixed URL.

## Auth & transactional copy checks
- Login/signup/reset pages show consistent locale.
- Reset password and verification emails use user locale.
- Error toasts/messages are localized.

## Regression smoke checks
- Marketing pages: landing, pricing, guides, legal pages.
- App pages: dashboard, write, magazine, insights, settings.
- Payment flow entry points remain functional in both locales.

## Minimal automated run
1. Start app: `npm run dev`
2. Run: `npm run test:e2e:i18n`
3. Ensure all checks are `OK`.
