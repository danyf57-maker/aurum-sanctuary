## Summary

- 
- 

## Validation

- [ ] `make verify`
- [ ] Domain-specific manual smoke checks if behavior changed

## Risk Check

- [ ] No secrets or private content added to logs
- [ ] No CI-only workaround added without a local equivalent
- [ ] Relevant `AGENTS.md` or docs updated for auth, billing, i18n, infra, or functions changes

## Review Lenses

- [ ] Auth / session continuity
- [ ] Billing / Stripe server-side enforcement
- [ ] i18n parity and EN/FR surface consistency
- [ ] Infra / workflow safety
