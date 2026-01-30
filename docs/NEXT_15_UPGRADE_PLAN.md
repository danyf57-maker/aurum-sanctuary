# Next.js 15 Upgrade Plan

## 🎯 Objective
Upgrade from Next.js 14.2.18 to Next.js 15.x after Epic 3 validation is complete.

---

## ⏰ Timeline

**Current Status**: Next.js 14.2.18 (stable)  
**Upgrade Target**: Post-Epic 3 completion  
**Estimated Effort**: 1-2 days

---

## ✅ Prerequisites (Must Complete First)

- [x] Fix cross-runtime imports (completed)
- [x] Refactor Firebase Admin SDK API (completed)
- [x] Add server-only tripwires (completed)
- [ ] **Validate Epic 3 E2E** (journaling + sentiment analysis)
- [ ] **Verify Firestore persistence** works correctly
- [ ] **Test insights generation** with real data

---

## 🚧 Known Blockers

### 1. **@genkit-ai/next Peer Dependency**
```json
"peerDependencies": {
  "next": "^15.0.0"
}
```

**Current State**: We're on Next 14, but `@genkit-ai/next` expects Next 15.

**Resolution Options**:
1. **Remove `@genkit-ai/next`** if not actively used
2. **Wait for compatibility patch** from Genkit team
3. **Use `--legacy-peer-deps`** (not recommended for prod)

**Action**: Audit usage of `@genkit-ai/next` before upgrade.

---

### 2. **React 19 Compatibility**

Next.js 15 requires React 19, which may have breaking changes:
- Server Components API changes
- `use client` directive behavior
- Suspense boundary handling

**Action**: Test all pages after upgrade, especially:
- `/sanctuary/write` (form handling)
- `/sanctuary` (timeline with Suspense)
- `/admin` (dashboard charts)

---

## 📋 Upgrade Checklist

### Phase 1: Preparation (Before Upgrade)

- [ ] Create feature branch: `next-15-upgrade`
- [ ] Audit `@genkit-ai/next` usage
  ```bash
  grep -r "@genkit-ai/next" src/
  ```
- [ ] Document all current features working in Next 14
- [ ] Run full E2E test suite and capture baseline
- [ ] Backup current `package-lock.json`

---

### Phase 2: Dependency Upgrade

- [ ] Update `package.json`:
  ```json
  {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
  ```
- [ ] Remove `@genkit-ai/next` if unused
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Check for deprecation warnings

---

### Phase 3: Configuration Updates

- [ ] Review `next.config.js` for Next 15 changes
- [ ] Enable Turbopack (optional):
  ```json
  "scripts": {
    "dev": "next dev --turbopack -p 9002"
  }
  ```
- [ ] Update middleware if needed (Edge Runtime changes)
- [ ] Check App Router conventions (may have changed)

---

### Phase 4: Code Migration

- [ ] Update Server Actions syntax if changed
- [ ] Review `use client` boundaries
- [ ] Test dynamic imports and lazy loading
- [ ] Verify Image component still works
- [ ] Check Font optimization

---

### Phase 5: Testing

#### Build & Compile
- [ ] `npm run build` succeeds without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors

#### E2E Testing
- [ ] Login flow works
- [ ] Journal entry creation succeeds
- [ ] Sentiment analysis completes
- [ ] Timeline displays entries
- [ ] Admin dashboard renders
- [ ] Blog posts display correctly

#### Performance
- [ ] Dev server startup time (should be faster with Turbopack)
- [ ] Hot reload speed
- [ ] Production build size

---

### Phase 6: Deployment

- [ ] Test on staging environment
- [ ] Verify environment variables work
- [ ] Check Vercel/deployment platform compatibility
- [ ] Monitor error logs for 24h
- [ ] Rollback plan ready

---

## 🎁 Expected Benefits

### Performance
- ✅ **Faster dev server** with Turbopack
- ✅ **Improved HMR** (Hot Module Replacement)
- ✅ **Better build times**

### Features
- ✅ **Enhanced Server Actions**
- ✅ **Improved streaming**
- ✅ **Better error handling**
- ✅ **React 19 features** (use hook, etc.)

### Developer Experience
- ✅ **Better TypeScript support**
- ✅ **Improved error messages**
- ✅ **Modern React patterns**

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes in Server Actions | High | Test all actions before merge |
| React 19 incompatibilities | Medium | Gradual migration, feature flags |
| Third-party package issues | Medium | Audit dependencies, use `--legacy-peer-deps` |
| Production deployment issues | High | Deploy to staging first, rollback ready |

---

## 🔄 Rollback Plan

If upgrade fails:
1. `git checkout main`
2. `npm install` (restore old dependencies)
3. `rm -rf .next`
4. `npm run dev`

---

## 📊 Success Criteria

Upgrade is successful when:
- ✅ All E2E tests pass
- ✅ No TypeScript/ESLint errors
- ✅ Dev server starts in <3s
- ✅ Production build succeeds
- ✅ No runtime errors in staging
- ✅ Performance metrics maintained or improved

---

## 📅 Proposed Schedule

**Week 1** (Current):
- Complete Epic 3 validation
- Verify journaling works E2E

**Week 2**:
- Create upgrade branch
- Perform dependency audit
- Test upgrade in isolation

**Week 3**:
- Full migration and testing
- Staging deployment
- Production deployment (if stable)

---

## 📚 References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)
