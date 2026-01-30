# Development Environment Setup

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 10+
- **Git**: Latest version
- **VSCode**: Latest version (recommended)
- **Firebase CLI**: `npm install -g firebase-tools`

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd aurum-sanctuary
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Fill in your Firebase config
# See docs/firebase-setup.md for details
```

### 4. Install VSCode Extensions

VSCode will prompt you to install recommended extensions on first open.

**Required Extensions:**
- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- TypeScript (ms-vscode.vscode-typescript-next)
- Firebase Explorer (firebase.vscode-firebase-explorer)
- Code Spell Checker (streetsidesoftware.code-spell-checker)

---

## Development Workflow

### Start Development Server

```bash
npm run dev
# Server runs on http://localhost:9002
```

### Run Type Checking

```bash
npm run typecheck
```

### Run Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

---

## Cloud Functions Development

### Build Functions

```bash
cd functions
npm run build
```

### Run Functions Locally (Emulator)

```bash
# From root directory
firebase emulators:start --only functions,firestore

# Or from functions directory
npm run serve
```

### Deploy Functions

```bash
# From root directory
firebase deploy --only functions

# Or from functions directory
npm run deploy
```

---

## Firebase Emulator

### Start All Emulators

```bash
firebase emulators:start
```

### Start Specific Emulators

```bash
# Firestore + Functions
firebase emulators:start --only firestore,functions

# Auth + Firestore
firebase emulators:start --only auth,firestore
```

### Emulator UI

Access at: http://localhost:4000

---

## Code Quality

### Format Code (Prettier)

VSCode auto-formats on save (configured in `.vscode/settings.json`).

Manual formatting:
```bash
npx prettier --write .
```

### Fix ESLint Issues

VSCode auto-fixes on save.

Manual fix:
```bash
npm run lint -- --fix
```

---

## Testing

### Unit Tests (TODO)

```bash
npm run test
```

### E2E Tests (TODO)

```bash
npm run test:e2e
```

---

## Git Workflow

### Branch Naming

- `feature/<story-id>-<description>` (e.g., `feature/STORY-2.1-firebase-auth`)
- `fix/<issue-description>` (e.g., `fix/login-redirect`)
- `docs/<description>` (e.g., `docs/update-readme`)

### Commit Messages

Follow conventional commits:
- `feat: Add Google OAuth login`
- `fix: Resolve entry encryption bug`
- `docs: Update Firebase setup guide`
- `chore: Update dependencies`

### Pull Request Workflow

1. Create feature branch
2. Make changes
3. Run `npm run typecheck` and `npm run lint`
4. Commit changes
5. Push to GitHub
6. Create Pull Request
7. Wait for CI checks to pass
8. Request review
9. Merge to `main`

---

## Troubleshooting

### "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Firebase not initialized" errors

```bash
# Check .env.local has all required variables
# Restart dev server
```

### TypeScript errors in VSCode

```bash
# Reload VSCode TypeScript server
# CMD+Shift+P → "TypeScript: Restart TS Server"
```

### Emulator connection errors

```bash
# Check emulator is running
firebase emulators:start

# Check ports are not in use (4000, 5001, 8080, 9099)
```

---

## VSCode Settings

### Format on Save

Enabled by default (`.vscode/settings.json`).

### ESLint Auto-Fix

Enabled on save (`.vscode/settings.json`).

### TypeScript Workspace SDK

Uses workspace TypeScript version (not VSCode's built-in).

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run typecheck        # Type check
npm run lint             # Lint code

# Firebase
firebase login           # Login to Firebase
firebase projects:list   # List projects
firebase use <project>   # Switch project
firebase deploy          # Deploy all
firebase emulators:start # Start emulators

# Cloud Functions
cd functions && npm run build  # Build functions
firebase deploy --only functions  # Deploy functions
firebase functions:log   # View function logs
```

---

## Next Steps

After environment setup:
1. ✅ STORY-1.7 complete
2. ✅ Epic 1 complete
3. → Epic 2: Authentication & Onboarding
