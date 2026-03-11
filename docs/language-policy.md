# Aurum Language Policy

## Product locales

The official Aurum product interface is available in:

- `en`
- `fr`

This includes UI, pricing, onboarding, legal pages, and lifecycle copy unless a surface is explicitly documented otherwise.

## Reflection locales

Aurum reflections can reply in the user's writing language when it is one of the officially supported reflection languages:

- `en`
- `fr`
- `es`
- `it`
- `de`
- `pt`

## Runtime rules

1. The user's writing language takes priority over the app locale.
2. The app locale is only a fallback when language detection is ambiguous.
3. Aurum must never mention the detected language in the reply.
4. Aurum must never mix languages in a single reply unless the user explicitly asks for it.
5. A language is considered supported only if detection and output quality are both covered by tests.

## Source of truth

- Product locale policy lives in [src/lib/language-policy.ts](/tmp/aurum-lang-policy-YAP8EH/src/lib/language-policy.ts)
- Product locale normalization lives in [src/lib/locale.ts](/tmp/aurum-lang-policy-YAP8EH/src/lib/locale.ts)
- Reflection language detection and strict prompt instructions live in [src/lib/ai/language.ts](/tmp/aurum-lang-policy-YAP8EH/src/lib/ai/language.ts)
