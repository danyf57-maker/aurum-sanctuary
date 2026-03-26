# Aurum Sanctuary

A private journaling and reflection app with AI-powered insights.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **AI**: DeepSeek plus Genkit-based flows
- **Payments**: Stripe
- **Analytics**: PostHog
- **Hosting**: Vercel (Next.js), Firebase (Cloud Functions)

## Key Features

- **Journal Protection**: Client-side AES-256-GCM storage protection
- **Mirror Chat**: AI-powered reflective questioning (Vercel Edge Runtime)
- **Weekly Insights**: Automated emotional pattern analysis
- **Privacy-First**: Minimal logging, explicit caveats on current storage protection
- **Subscription Model**: Free tier + Pro ($9.99/month)

## Project Structure

```
aurum-sanctuary/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/       # Marketing/public routes
│   │   ├── (app)/             # Authenticated app routes
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   └── features/          # Feature-specific components
│   ├── lib/
│   │   ├── firebase/          # Firebase client & admin SDK
│   │   ├── crypto/            # Client-side storage protection helpers
│   │   ├── ai/                # AI service configuration
│   │   ├── stripe/            # Stripe integration
│   │   ├── logger/            # Safe logging utilities
│   │   └── schemas/           # Zod validation schemas
│   └── store/                 # Zustand stores
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       ├── updateDerivedMemory.ts
│       ├── generateInsight.ts
│       └── deleteUserAccount.ts
├── _bmad-output/
│   ├── epics/                 # Epic & story definitions
│   └── planning-artifacts/    # Architecture, PRD, UX docs
└── docs/                      # Additional documentation

```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Firebase CLI
- Vercel CLI (optional)

### Installation

```bash
# Install dependencies and create .env.local if missing
make bootstrap

# Review environment safety before using real credentials
make guard-env

# Run the local verification harness
make verify

# Start development server
make dev
```

**For detailed setup instructions, see [docs/development-setup.md](docs/development-setup.md)**

### Environment Variables

See `.env.example` for required variables:

- Firebase config (client & admin)
- DeepSeek API key
- Stripe keys
- Upstash Redis credentials
- PostHog API key

## Development

```bash
# Bootstrap from zero
make bootstrap

# Environment safety checks
make guard-env

# Fast checks
make lint
make typecheck
make test

# Runtime smoke validation
make smoke

# Full local verification harness
make verify
```

`make verify` runs environment checks, client/server boundary checks, ESLint, TypeScript, tests, Next.js build, Cloud Functions build, and a local smoke run against the built app.

## Architecture Decisions

See `_bmad-output/planning-artifacts/architecture.md` for detailed architecture documentation.

### Current Caveats

- Current journal storage protection is client-side AES-256-GCM with a deterministic UID-derived key.
- This should not be described as end-to-end encryption, zero-knowledge storage, or admin-blind architecture.
- Some AI and server-side features process submitted content operationally to return the requested functionality.

## Privacy & Security

- Client-side AES-256-GCM storage protection for supported journal flows
- No claim of end-to-end or zero-knowledge encryption in the current implementation
- No PII in logs or analytics
- Firestore Rules enforce access control
- Safe logging patterns (`logger.errorSafe`)
- CI checks for prohibited privacy terms

## License

MIT

## Contact

For questions or support, contact: [contact@aurumsanctuary.com]
