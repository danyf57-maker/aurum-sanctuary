# Messages Guardrails

Translations are part of the product surface, not a follow-up task.

## Rules

- Keep `messages/en.json` and `messages/fr.json` in key parity.
- Preserve placeholder names exactly across locales (`{count}`, `{email}`, etc.).
- Do not merge copy changes without running `npm run test:e2e:i18n`.
- Favor product-category clarity over poetic ambiguity: private, guided, pattern-aware, emotionally clear.

## When Editing Copy

- Update both locales in the same change unless the task explicitly targets one locale.
- Avoid reintroducing stress-relief or therapy framing unless it is legally required copy.
- Check public metadata, legal pages, and in-product empty states together when changing category language.
